export default function Identity() {
  return (
    <div className="ident max-w-[46ch]">
      <div className="coord text-[11.5px] text-dim tracking-[0.12em] flex items-center gap-2.5 mb-7">
        N 31°14′ · E 121°28′ · 本地时 UTC+8
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="portrait w-[76px] h-[76px] rounded-full mb-6 bg-gradient-to-br from-[#2A3C5C] to-[#0E1726] border border-line grid place-items-center font-serif text-[30px] text-glow shadow-[0_0_0_6px_rgba(99,210,232,0.05)]">
        GY
      </div>

      <h1 className="font-serif font-medium text-[clamp(38px,4.4vw,60px)] leading-[1.08] tracking-tight mb-1.5">
        郭 洋
      </h1>

      <p className="role font-serif italic text-[clamp(19px,1.7vw,23px)] text-glow mb-6 font-normal">
        全栈工程师 · 偏爱把复杂系统做薄
      </p>

      <p className="bio text-[15px] leading-[1.85] text-dim mb-3.5">
        我用 <strong className="text-[var(--text)] font-medium">TypeScript、Next.js 和 PostgreSQL</strong>{' '}
        把想法做成能跑在生产环境里的东西。过去几年主要在做内容系统、权限模型和一些需要真扛住流量的后端服务。
      </p>

      <p className="bio text-[15px] leading-[1.85] text-dim mb-3.5">
        喜欢在交付之前把边界情况想清楚，也喜欢在页面上留一点只有自己知道为什么的小机关。
      </p>

      <div className="status mt-8 p-3.5 border border-line border-l-2 border-l-glow rounded-r-sm bg-panel text-[13px] leading-[1.7] text-dim">
        <b className="block text-[var(--text)] font-medium mb-1 text-[13.5px]">
          正在找新机会，也接外包
        </b>
        <span>
          目前接受远程全职与中小型项目承接。右侧星图里任选一颗，或者直接从联系页找我。
        </span>
      </div>
    </div>
  );
}
