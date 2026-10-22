import { ImageResponse } from 'next/og';
import { routing } from '@/i18n/routing';
import { STAR_EDGES, STAR_NODES } from '@/lib/data/starmap';
import { OG_ALT, OG_SIZE } from '@/lib/seo';

// 构建时为每种语言生成一张
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 社交分享图：左侧站名与身份，右侧星图。每种语言预渲染一张，所有页面共用。
// next/og 自带的字体只有拉丁字符，图上文字统一用英文，避免中文显示成方块
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = 'image/png';

const INK = '#070B14', LINE = '#1E2E4A', GLOW = '#63D2E8', DIM = '#92A8C9', TEXT = '#EBF0F8';

// 星图缩放进右侧 560×520 的区域
const SX = 0.86, OX = 600, OY = 60;
const px = (x: number) => OX + x * SX;
const py = (y: number) => OY + y * SX;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: INK, position: 'relative' }}>
        <svg width={1200} height={630} viewBox="0 0 1200 630" style={{ position: 'absolute', top: 0, left: 0 }}>
          <rect x={px(28)} y={py(28)} width={564 * SX} height={500 * SX} fill="none" stroke={LINE} />
          {STAR_EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={px(STAR_NODES[a].x)}
              y1={py(STAR_NODES[a].y)}
              x2={px(STAR_NODES[b].x)}
              y2={py(STAR_NODES[b].y)}
              stroke={GLOW}
              strokeOpacity={0.4}
              strokeWidth={1.4}
            />
          ))}
          {STAR_NODES.map((n) => (
            <circle key={`h${n.id}`} cx={px(n.x)} cy={py(n.y)} r={18} fill={GLOW} fillOpacity={0.12} />
          ))}
          {STAR_NODES.map((n) => (
            <circle key={n.id} cx={px(n.x)} cy={py(n.y)} r={5} fill={TEXT} />
          ))}
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 80px', width: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', color: DIM, fontSize: 22, letterSpacing: 2 }}>
            Observatory
          </div>
          <div style={{ marginTop: 28, color: TEXT, fontSize: 76, lineHeight: 1.05 }}>Guo Yi</div>
          <div style={{ marginTop: 22, color: DIM, fontSize: 29, lineHeight: 1.45 }}>
            Full-stack developer building web applications, business systems, and mobile apps.
          </div>
          <div style={{ marginTop: 38, color: GLOW, fontSize: 21, letterSpacing: 0.5 }}>
            TypeScript / Next.js / Java / PHP / C++
          </div>
        </div>
      </div>
    ),
    size
  );
}
