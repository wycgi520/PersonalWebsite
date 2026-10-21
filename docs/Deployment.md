# GitHub Actions 部署到本服务器

## 写作互动服务初始化（2026-10-21）

新增真实互动后，首次部署前必须准备 PostgreSQL（仅本机监听）和独立数据库角色。站点正文构建不需要数据库，互动和站长登录在运行时需要数据库。

1. 安装服务器 PostgreSQL 和匹配版本的客户端工具，创建 `personalwebsite` 数据库及受限的同名登录角色。不要将数据库端口公开；数据库角色拥有该数据库及迁移所需 schema 权限即可。
2. 创建 `/www/wwwroot/personalwebsite-app/shared`，所有者为 `personalwebsite`，权限 0700。创建 `runtime.env`，权限 0600，由部署用户读取，填写以下配置。该文件同时被 Bash 和 systemd 读取，使用单引号包住含特殊字符的值，不使用命令替换。

```dotenv
DATABASE_URL='postgresql://personalwebsite:URL编码后的密码@127.0.0.1:5432/personalwebsite'
BETTER_AUTH_URL='https://www.wycgi.cn'
BETTER_AUTH_SECRET='至少32字符的随机密钥'
NEXT_PUBLIC_SITE_URL='https://www.wycgi.cn'
TRUST_PROXY=1
```

`TRUST_PROXY=1` 仅适用于 Node 绑定 loopback、Nginx 覆盖 `X-Real-IP` 的本仓库配置。不能信任客户端自带的 IP 头。

3. 更新并安装仓库中的 `receive.sh`（保持现有受限 SSH 和所有者/权限配置）和 systemd service；执行 `systemctl daemon-reload`。接收器在切换 `current` 前运行新增 release 中的 `operations/migrate.cjs migrate deploy`。运行时密钥不打包进 release。
4. 发布完成后，以 `personalwebsite` 用户在 current 目录初始化站长。密码通过环境变量传入；交互输入时不回显且不写入命令行参数。

```bash
set -a
source /www/wwwroot/personalwebsite-app/shared/runtime.env
set +a
cd /www/wwwroot/personalwebsite-app/current
read -rsp 'Admin password (12+ characters): ' ADMIN_PASSWORD
export ADMIN_PASSWORD
/www/server/nodejs/v24.21.0/bin/node operations/admin.cjs create your-email@example.com
unset ADMIN_PASSWORD
```

重置时将 `create` 替换为 `reset-password`；会撤销该管理员现有会话。访问 `/zh/admin/login` 审核评论，没有公共注册入口。

### 本地开发

复制 `.env.example` 为 `.env.local`，按实际数据库及开发服务器自动分配的端口修改 URL。Next.js 读取 `.env.local`；Prisma CLI 和管理脚本需通过 Node `--env-file` 显式加载：

```bash
pnpm db:generate
node --env-file=.env.local node_modules/prisma/build/index.js migrate deploy
node --env-file=.env.local --import tsx scripts/admin.ts create your-email@example.com
pnpm dev
```

创建管理员前仍需通过环境变量设置 ADMIN_PASSWORD。不要将真实配置写入仓库；新增草稿和发布规则见 `content/writing/README.md`。

### 备份、清理与恢复演练

- 将 `deploy/writing-backup.sh` 安装到 shared，所有者 `personalwebsite`，权限 0700；安装 `personalwebsite-backup.service` 和 `.timer` 至 `/etc/systemd/system/`，执行 `systemctl daemon-reload`、`systemctl enable --now personalwebsite-backup.timer`。首次手动运行 service 并检查日志。
- 每日服务器本地时间 03:00 执行 `pg_dump -Fc`，备份在 shared/backups，写完后原子重命名，保留最近七份。定期复制至服务器外安全存储。
- 恢复演练使用独立空测试数据库（不得直接覆盖生产）：`pg_restore --dbname="$RESTORE_DATABASE_URL" --no-owner --no-privileges 选定备份.dump`。核对点赞、评论、审核记录数量及登录/审核流程后销毁测试数据库。生产恢复应先停写、备份当前状态，再按演练步骤执行。
- 定期删除已过期的 `RateLimit` 行，SQL 为 `DELETE FROM "RateLimit" WHERE "expiresAt" < now()`；不删除点赞或评论。登录限流由 Better Auth 管理。
- 发布健康检查新增 `/api/health/writing`。数据库故障不得影响静态正文阅读；互动显示错误和重试。迁移失败会停止发布；发布失败切回旧代码，不自动撤销数据库迁移。
- 当前仓库交付不表示已经操作生产数据库、配置服务器 timer 或完成线上恢复演练。

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
