# GitHub Actions 部署到本服务器

## 架构

- `main` 分支推送或 Actions 手动运行 → Ubuntu 24.04 / Node.js 24 / pnpm 10.34.6 构建。
- `output: 'standalone'` 生成包含运行依赖的服务，再打包 `public` 和 `.next/static`。
- GitHub 经 SSH 发送压缩包；服务器只允许固定部署命令，不允许交互 shell、端口转发或任意 sudo。
- systemd 以非 root 用户 `personalwebsite` 在 `127.0.0.1:3100` 运行，宝塔 Nginx 保留 HTTPS 配置。
- `/roguelife/`、`/sbit/`、`/legal/` 和证书验证目录继续由旧站提供，不删除或覆盖旧站文件。
- 校验 SHA-256，验证归档路径，串行部署，原子切换 `current` 链接；健康检查失败自动切回上一版。
- 单实例重启会有短暂中断，不是零停机部署。历史版本保留在 `releases`，需要定期清理不再使用的版本。

## 服务器初始化

本配置针对已有宝塔站点 `www.wycgi.cn` 和 Node.js 路径
`/www/server/nodejs/v24.21.0/bin/node`。升级 Node.js 后需同步更新 service 中的 `ExecStart`。

```bash
cd /www/wwwroot/PersonalWebsite
sudo bash deploy/setup-server.sh
```

初始化只创建部署用户、受限密钥、systemd 服务和精准 sudo 权限，不切换 Nginx。
部署目录：`/www/wwwroot/personalwebsite-app`，密钥目录：`/www/wwwroot/.personalwebsite-deploy`。
不要把私钥加入仓库或粘贴到聊天中。

## GitHub 配置

在仓库 Settings → Environments 创建 `production`，仅允许 `main` 分支部署。
在该环境下添加以下 Secrets（也可使用仓库 Actions Secrets）：

| 名称 | 内容 |
| --- | --- |
| `DEPLOY_HOST` | 本服务器公网 IPv4 或可连接的域名，如 `www.wycgi.cn`（不能含协议） |
| `DEPLOY_PORT` | 服务器实际 SSH 端口，不是网站端口 |
| `DEPLOY_SSH_KEY` | `/www/wwwroot/.personalwebsite-deploy/id_ed25519` 完整私钥文本 |
| `DEPLOY_KNOWN_HOSTS` | `/www/wwwroot/.personalwebsite-deploy/known_hosts` 完整文本（使用 `www.wycgi.cn` 时） |

服务器查看 SSH 监听端口：`sudo sshd -T | grep '^port '`。
在服务器上生成主机验证行（替换为 Secrets 中相同的主机名和端口）：

```bash
host=www.wycgi.cn
port=22
printf '[%s]:%s %s\n' "$host" "$port" "$(cat /etc/ssh/ssh_host_ed25519_key.pub)"
```

22 端口还需使用不带端口前缀的主机名，建议两行都保存：

```bash
printf '%s %s\n' "$host" "$(cat /etc/ssh/ssh_host_ed25519_key.pub)"
```

安全组、防火墙需允许 GitHub 托管 runner 连接 SSH 端口。不要禁用主机密钥校验；
如果不允许来自公网的 SSH，应改用专用网络或受控 runner，不要为方便将所有仓库作业放到生产 root 环境运行。

本项目已有 `lint: next lint`，而锁文件为 Next.js 15；工作流以 `next build` 自带的类型和 lint 检查为准，
不另行调用已废弃的 `next lint` 命令。Actions 固定在完整提交 SHA：checkout v6、setup-node v6。

## 第一次上线

将新增部署文件、`next.config.js`、`package.json` 和 `.gitignore` 提交并推送到 `main`。
这会自动构建部署；也可以在 Actions → Build and deploy → Run workflow 中手动运行。
构建成功但 SSH 部署失败通常意味着 Secrets、SSH 端口或安全组未配置好。

服务首版健康后，才开启反向代理：

```bash
cd /www/wwwroot/PersonalWebsite
sudo bash deploy/setup-server.sh --activate-nginx
```

之后的部署不需要改动或重载 Nginx。构建时的正式域名已设置为 `https://www.wycgi.cn`，
用于 canonical、sitemap、Open Graph。更换域名需修改 workflow 中的 `NEXT_PUBLIC_SITE_URL` 并重新构建。

## 运维与回退

```bash
sudo systemctl status personalwebsite.service
sudo journalctl -u personalwebsite.service -n 100 --no-pager
readlink /www/wwwroot/personalwebsite-app/current
ls -lt /www/wwwroot/personalwebsite-app/releases
```

手动回退：确认目标历史版本目录存在并包含 `server.js`，以 root 执行：

```bash
release=/www/wwwroot/personalwebsite-app/releases/替换为历史版本目录名
test -f "$release/server.js"
ln -s "$release" /www/wwwroot/personalwebsite-app/current.rollback
mv -Tf /www/wwwroot/personalwebsite-app/current.rollback /www/wwwroot/personalwebsite-app/current
systemctl restart personalwebsite.service
curl --fail http://127.0.0.1:3100/zh > /dev/null
```

恢复旧静态主页：移走新增的
`/www/server/panel/vhost/nginx/extension/www.wycgi.cn/personalwebsite.conf`，
运行 `nginx -t` 和 `nginx -s reload`；原 `/www/wwwroot/www.wycgi.cn` 的文件均保留。
