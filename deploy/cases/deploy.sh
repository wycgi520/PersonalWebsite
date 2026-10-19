#!/usr/bin/env bash
# 一键构建并部署项目案例演示站。
#
#   bash deploy/cases/deploy.sh            # 部署 cases.conf 里的全部案例
#   bash deploy/cases/deploy.sh deals      # 只部署指定案例
#
# 配置放在 project_cases/cases.conf（不入库），格式：
#   ssh root@<server>                       # 部署目标（ssh 参数）
#   case <slug> <port>                      # 源码在 project_cases/<slug>/web，上线地址 /cases/<slug>
#
# 可选 project_cases/leakcheck.txt（不入库）：每行一个禁止出现在构建产物里的词（如客户真实名称、域名）。
set -euo pipefail

repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cases_dir="$repo/project_cases"
conf="$cases_dir/cases.conf"
leak_words="$cases_dir/leakcheck.txt"
site=https://www.wycgi.cn

[[ -f "$conf" ]] || { echo "Missing $conf" >&2; exit 1; }
ssh_target="$(awk '$1 == "ssh" {print $2; exit}' "$conf")"
[[ -n "$ssh_target" ]] || { echo 'cases.conf: missing "ssh <target>" line.' >&2; exit 1; }
ssh_opts=(-o BatchMode=yes -o ConnectTimeout=15)

mapfile -t entries < <(awk '$1 == "case" {print $2, $3}' "$conf")
(( ${#entries[@]} )) || { echo 'cases.conf: no "case" entries.' >&2; exit 1; }

# 构建产物里不应出现的内容：禁用词 + 本机项目绝对路径
patterns=()
if [[ -f "$leak_words" ]]; then
  while IFS= read -r word; do
    word="${word%$'\r'}"
    [[ -n "$word" && "$word" != \#* ]] && patterns+=("$word")
  done < "$leak_words"
fi

deploy_case() {
  local slug="$1" port="$2"
  local src="$cases_dir/$slug/web"
  local base_path="/cases/$slug"
  [[ -f "$src/package.json" ]] || { echo "[$slug] $src not found" >&2; return 1; }
  echo "==> [$slug] build ($base_path)"

  # 只传 slug：Git Bash 会把以 / 开头的环境变量改写成 Windows 路径
  (
    set -e
    cd "$src"
    [[ -d node_modules ]] || npm ci --no-audit --no-fund --legacy-peer-deps
    rm -rf .next
    CASE_SLUG="$slug" NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build
  ) || { echo "[$slug] build failed" >&2; return 1; }
  [[ -f "$src/.next/standalone/server.js" ]] || { echo "[$slug] standalone output missing" >&2; return 1; }

  local stage
  stage="$(mktemp -d)"
  trap 'rm -rf "$stage" "$stage.tar.gz"' RETURN
  cp -a "$src/.next/standalone/." "$stage/" &&
    cp -a "$src/.next/static" "$stage/.next/static" &&
    cp -a "$src/public" "$stage/public" || return 1
  rm -rf "$stage/.next/cache"
  # standalone 会写入构建机的绝对路径，运行时用不到，替换掉
  local f
  for f in "$stage/.next/required-server-files.json" "$stage/server.js"; do
    [[ -f "$f" ]] && node -e '
      const fs = require("fs");
      const file = process.argv[1];
      const s = fs.readFileSync(file, "utf8").replace(/"appDir":"[^"]*"/g, "\"appDir\":\".\"");
      fs.writeFileSync(file, s);
    ' "$f"
  done
  printf '{"name":"case-%s","private":true}\n' "$slug" > "$stage/package.json"

  echo "==> [$slug] leak check"
  local leaked=0 p
  local local_paths=("$src" "$(cd "$src" && pwd -W 2>/dev/null || true)")
  for p in "${patterns[@]}" "${local_paths[@]}"; do
    [[ -z "$p" ]] && continue
    if grep -rIl -i -F -- "$p" "$stage" > /dev/null 2>&1; then
      echo "  found \"$p\" in:" >&2
      grep -rIl -i -F -- "$p" "$stage" | sed "s#^$stage#  #" | head -5 >&2
      leaked=1
    fi
  done
  (( leaked == 0 )) || { echo "[$slug] leak check failed; nothing deployed." >&2; return 1; }

  local bundle="$stage.tar.gz"
  tar --hard-dereference -czf "$bundle" -C "$stage" . || return 1
  echo "==> [$slug] upload $(du -h "$bundle" | cut -f1)"
  local remote="/root/case-deploy/$slug"
  ssh "${ssh_opts[@]}" "$ssh_target" "mkdir -p '$remote'" || return 1
  scp -q "${ssh_opts[@]}" "$repo/deploy/cases/install.sh" "$repo/deploy/cases/case@.service" "$bundle" "$ssh_target:$remote/" || return 1
  ssh "${ssh_opts[@]}" "$ssh_target" \
    "bash '$remote/install.sh' '$slug' '$port' '$remote/$(basename "$bundle")'; status=\$?; rm -f '$remote/'*.tar.gz; exit \$status" || return 1

  # nginx reload 是异步的，公网检查留几秒余量
  local code attempt
  for attempt in 1 2 3 4 5 6; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$site$base_path")"
    [[ "$code" == 200 ]] && break
    sleep 2
  done
  [[ "$code" == 200 ]] || { echo "[$slug] $site$base_path returned $code" >&2; return 1; }
  echo "==> [$slug] live at $site$base_path"
}

failed=()
for entry in "${entries[@]}"; do
  read -r slug port <<< "$entry"
  if [[ $# -gt 0 ]] && [[ ! " $* " =~ " $slug " ]]; then
    continue
  fi
  deploy_case "$slug" "$port" || failed+=("$slug")
done

if (( ${#failed[@]} )); then
  echo "Failed: ${failed[*]}" >&2
  exit 1
fi
echo 'All done.'
