## 本项目

计划/实现方案前请阅读以下文档

1. 需求文档: [Requirements](./docs/Requirements.md)
2. 技术文档: [Tech](./docs/Tech.md)
3. 参考文档: [Reference](./docs/Reference.md)
4. UI原型: [UI](./UI)
5. 开发计划: [DevelopmentPlan](./docs/DevelopmentPlan.md)

### UI设计

UI设计过程中产生的文件可以放入UI/<tool>\_<seq>文件夹中, 比如说UI/claude_1, 可避免重复创建覆盖已有内容。

### 开发服务器

- 启动方式见 [.claude/launch.json](./.claude/launch.json)（`web`: `pnpm dev`；`ui`: 原型静态服务）。`web` 开启了 `autoPort`，3000 被占用时会自动换端口，不要在启动命令里写死端口
- 处理完成后（验证结束、提交之后）必须关闭自己启动的开发服务器 / 预览会话（如 `preview_stop`），不要让它在后台继续占用端口，以免影响后续处理
- 只关闭自己启动的服务器，不要结束其他会话正在使用的进程
