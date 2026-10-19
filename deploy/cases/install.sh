#!/usr/bin/env bash
# 在服务器上以 root 运行：bash install.sh <slug> <port> <bundle.tar.gz>
# 把一个项目案例（Next.js standalone 包）发布到 https://www.wycgi.cn/cases/<slug>
# 首次运行创建用户、systemd 实例和 nginx 配置；之后只发布新版本，健康检查失败自动回滚
set -euo pipefail

slug="${1:?Usage: install.sh <slug> <port> <bundle.tar.gz>}"
port="${2:?Missing port}"
bundle="${3:?Missing bundle}"
[[ "$slug" =~ ^[a-z0-9][a-z0-9-]{0,31}$ ]] || { echo 'Invalid slug.' >&2; exit 1; }
[[ "$port" =~ ^3[2-9][0-9]{2}$ ]] || { echo 'Port must be 3200-3999.' >&2; exit 1; }
[[ "$EUID" == 0 ]] || { echo 'Run as root.' >&2; exit 1; }

source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root=/www/wwwroot/cases
case_dir="$root/$slug"
base_path="/cases/$slug"
unit="case@$slug.service"
nginx_target="/www/server/panel/vhost/nginx/extension/www.wycgi.cn/case-$slug.conf"
[[ -x /www/server/nodejs/v24.21.0/bin/node ]]

# 端口不能被其他进程（或其他案例）占用
if ss -ltnH "sport = :$port" | grep -q . && ! systemctl is-active --quiet "$unit"; then
  echo "Port $port is already in use." >&2
  exit 1
fi

if ! id cases > /dev/null 2>&1; then
  useradd --system --user-group --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin cases
fi
install -d -m 755 -o root -g root "$root"
install -d -m 755 -o cases -g cases "$case_dir" "$case_dir/releases"
printf 'PORT=%s\n' "$port" > "$case_dir/env"
chmod 644 "$case_dir/env"
install -m 644 -o root -g root "$source_dir/case@.service" /etc/systemd/system/case@.service
systemctl daemon-reload
systemctl enable "$unit" > /dev/null 2>&1

release_dir="$case_dir/releases/$(date +%Y%m%d%H%M%S)"
mkdir -p "$release_dir"
tar -xzf "$bundle" -C "$release_dir" --no-same-owner
if [[ ! -f "$release_dir/server.js" ]]; then
  echo 'server.js missing in bundle.' >&2
  rm -rf -- "$release_dir"
  exit 1
fi
chown -R cases:cases "$release_dir"
chmod -R u+rwX,go+rX "$release_dir"

previous="$(readlink "$case_dir/current" || true)"
ln -sfn "$release_dir" "$case_dir/current"
systemctl restart "$unit"

healthy=0
for attempt in $(seq 1 30); do
  if curl --silent --fail --max-time 3 "http://127.0.0.1:$port$base_path" > /dev/null; then
    healthy=1
    break
  fi
  sleep 1
done
if [[ "$healthy" != 1 ]]; then
  echo 'Health check failed; restoring previous release.' >&2
  if [[ -n "$previous" ]]; then
    ln -sfn "$previous" "$case_dir/current"
    systemctl restart "$unit" || true
  else
    rm -f "$case_dir/current"
    systemctl stop "$unit" || true
  fi
  rm -rf -- "$release_dir"
  exit 1
fi

# Next.js basePath 不带尾斜杠，nginx 只做反代，不额外加重定向
nginx_conf="$(mktemp)"
cat > "$nginx_conf" <<NGINX
# 项目案例演示：$base_path
location ~ ^$base_path(/|\$) {
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Connection "";
    proxy_pass http://127.0.0.1:$port;
}
NGINX
if ! cmp -s "$nginx_conf" "$nginx_target"; then
  backup="$(mktemp)"
  [[ -e "$nginx_target" ]] && cp "$nginx_target" "$backup"
  install -m 644 "$nginx_conf" "$nginx_target"
  if ! nginx -t 2> /dev/null; then
    if [[ -s "$backup" ]]; then cp "$backup" "$nginx_target"; else rm -f "$nginx_target"; fi
    rm -f "$backup" "$nginx_conf"
    nginx -t
    exit 1
  fi
  rm -f "$backup"
  nginx -s reload
fi
rm -f "$nginx_conf"

# 只保留最近 3 个版本
ls -1dt "$case_dir"/releases/*/ | tail -n +4 | xargs -r rm -rf --
echo "Case '$slug' deployed: $release_dir"
