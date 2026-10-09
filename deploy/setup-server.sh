#!/usr/bin/env bash
set -euo pipefail

source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
app_dir=/www/wwwroot/personalwebsite-app
secret_dir=/www/wwwroot/.personalwebsite-deploy
nginx_target=/www/server/panel/vhost/nginx/extension/www.wycgi.cn/personalwebsite.conf

[[ "$EUID" == 0 ]] || { echo 'Run as root.' >&2; exit 1; }

if [[ "${1:-}" == --activate-nginx ]]; then
  curl --silent --fail --max-time 5 http://127.0.0.1:3100/zh > /dev/null
  [[ ! -e "$nginx_target" ]] || { echo 'Nginx deployment config already exists.' >&2; exit 1; }
  install -d -m 755 "$(dirname "$nginx_target")"
  install -m 644 "$source_dir/nginx.conf" "$nginx_target"
  if ! nginx -t; then
    rm -f "$nginx_target"
    exit 1
  fi
  if ! nginx -s reload; then
    rm -f "$nginx_target"
    nginx -s reload || true
    exit 1
  fi
  for attempt in $(seq 1 30); do
    if curl --resolve www.wycgi.cn:443:127.0.0.1 --silent --fail --max-time 3 https://www.wycgi.cn/zh > /dev/null; then
      echo 'Nginx now proxies the personal website; existing sub-sites are preserved.'
      exit 0
    fi
    sleep 1
  done
  rm -f "$nginx_target"
  nginx -s reload
  echo 'HTTPS health check failed; restored the static site.' >&2
  exit 1
fi

for tool in python3 curl flock sudo ssh-keygen visudo timeout; do
  command -v "$tool" > /dev/null
done
[[ -x /www/server/nodejs/v24.21.0/bin/node ]]
[[ -x /usr/bin/systemctl ]]
if ! id personalwebsite > /dev/null 2>&1; then
  useradd --system --user-group --create-home --home-dir /var/lib/personalwebsite --shell /bin/bash personalwebsite
fi
install -d -m 755 -o root -g root /var/lib/personalwebsite
install -d -m 755 -o root -g root /var/lib/personalwebsite/.ssh
install -d -m 755 -o personalwebsite -g personalwebsite "$app_dir" "$app_dir/releases"
install -d -m 700 -o root -g root "$secret_dir"
if [[ ! -e "$secret_dir/id_ed25519" ]]; then
  ssh-keygen -q -t ed25519 -N '' -C github-actions-personalwebsite -f "$secret_dir/id_ed25519"
fi
public_key="$(cat "$secret_dir/id_ed25519.pub")"
ssh_port="$(/usr/sbin/sshd -T | awk '$1 == "port" {print $2; exit}')"
host_key="$(cat /etc/ssh/ssh_host_ed25519_key.pub)"
printf '[www.wycgi.cn]:%s %s\nwww.wycgi.cn %s\n' "$ssh_port" "$host_key" "$host_key" > "$secret_dir/known_hosts"
chmod 600 "$secret_dir/known_hosts"
printf 'restrict,command="/usr/local/bin/personalwebsite-receive" %s\n' "$public_key" > /var/lib/personalwebsite/.ssh/authorized_keys
chmod 644 /var/lib/personalwebsite/.ssh/authorized_keys
chown root:root /var/lib/personalwebsite/.ssh/authorized_keys
install -m 755 -o root -g root "$source_dir/receive.sh" /usr/local/bin/personalwebsite-receive
install -m 644 -o root -g root "$source_dir/personalwebsite.service" /etc/systemd/system/personalwebsite.service
sudoers_tmp="$(mktemp)"
trap 'rm -f "$sudoers_tmp"' EXIT
printf 'personalwebsite ALL=(root) NOPASSWD: /usr/bin/systemctl restart personalwebsite.service\n' > "$sudoers_tmp"
visudo -cf "$sudoers_tmp"
install -m 440 -o root -g root "$sudoers_tmp" /etc/sudoers.d/personalwebsite
systemctl daemon-reload
systemctl enable personalwebsite.service
echo "Server prepared. Deployment key is stored privately at $secret_dir/id_ed25519."
