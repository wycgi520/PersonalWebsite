'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Node {
  id: string;
  zh: string;
  en: string;
  mag: string;
  x: number;
  y: number;
  r: number;
  phase: number;
}

const NODES: Node[] = [
  { id: 'about', zh: '关于', en: 'About', mag: '1.4', x: 150, y: 128, r: 20, phase: 0 },
  { id: 'projects', zh: '项目', en: 'Projects', mag: '0.8', x: 420, y: 90, r: 26, phase: 0 },
  { id: 'writing', zh: '写作', en: 'Writing', mag: '1.9', x: 512, y: 330, r: 18, phase: 0 },
  { id: 'toolkit', zh: '工具箱', en: 'Toolkit', mag: '2.3', x: 300, y: 450, r: 22, phase: 0 },
  { id: 'contact', zh: '联系', en: 'Contact', mag: '1.1', x: 92, y: 338, r: 16, phase: 0 },
];

const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [0, 3],
];

export default function StarMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const nodesRef = useRef<Node[]>(
    NODES.map((n) => ({ ...n, phase: Math.random() * 6.28 }))
  );

  useEffect(() => {
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (RM) return;

    let rafId: number;

    const animate = (t: number) => {
      const nodes = nodesRef.current;
      const svg = svgRef.current;
      if (!svg) return;

      nodes.forEach((node, i) => {
        const dx =
          Math.sin(t / 4200 + node.phase) * 9 + Math.cos(t / 7100 + node.phase) * 4;
        const dy =
          Math.cos(t / 3700 + node.phase * 1.7) * 8 +
          Math.sin(t / 8300 + node.phase) * 3;

        const nodeGroup = svg.querySelector(`#node-${i}`) as SVGGElement;
        if (nodeGroup) {
          nodeGroup.setAttribute(
            'transform',
            `translate(${(node.x + dx).toFixed(2)},${(node.y + dy).toFixed(2)})`
          );
        }

        // Update edges
        EDGES.forEach((edge, edgeIndex) => {
          if (edge.includes(i)) {
            const [aIdx, bIdx] = edge;
            const a = nodes[aIdx];
            const b = nodes[bIdx];
            const adx =
              Math.sin(t / 4200 + a.phase) * 9 + Math.cos(t / 7100 + a.phase) * 4;
            const ady =
              Math.cos(t / 3700 + a.phase * 1.7) * 8 +
              Math.sin(t / 8300 + a.phase) * 3;
            const bdx =
              Math.sin(t / 4200 + b.phase) * 9 + Math.cos(t / 7100 + b.phase) * 4;
            const bdy =
              Math.cos(t / 3700 + b.phase * 1.7) * 8 +
              Math.sin(t / 8300 + b.phase) * 3;

            const line = svg.querySelector(`#edge-${edgeIndex}`) as SVGLineElement;
            if (line) {
              line.setAttribute('x1', (a.x + adx).toString());
              line.setAttribute('y1', (a.y + ady).toString());
              line.setAttribute('x2', (b.x + bdx).toString());
              line.setAttribute('y2', (b.y + bdy).toString());
            }
          }
        });
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleNodeClick = (id: string) => {
    router.push(`/${id}`);
  };

  return (
    <div className="chart relative aspect-[1/0.92] max-h-[72vh] mx-auto w-full">
      <svg
        ref={svgRef}
        id="atlas"
        viewBox="0 0 620 580"
        role="group"
        aria-label="星座图导航"
        className="w-full h-full overflow-visible block"
      >
        <defs>
          <radialGradient id="hg">
            <stop offset="0%" stopColor="var(--glow)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Grid and frame */}
        <g id="gridlayer">
          <rect x="28" y="28" width="564" height="500" className="cgrid" />
          {Array.from({ length: 5 }, (_, i) => {
            const x = 28 + (564 * (i + 1)) / 6;
            return (
              <line
                key={`vgrid-${i}`}
                x1={x}
                y1="28"
                x2={x}
                y2="528"
                stroke="var(--grid)"
                strokeWidth="0.6"
                fill="none"
              />
            );
          })}
          {Array.from({ length: 4 }, (_, i) => {
            const y = 28 + (500 * (i + 1)) / 5;
            return (
              <line
                key={`hgrid-${i}`}
                x1="28"
                y1={y}
                x2="592"
                y2={y}
                stroke="var(--grid)"
                strokeWidth="0.6"
                fill="none"
              />
            );
          })}
          <rect
            x="28"
            y="28"
            width="564"
            height="500"
            stroke="var(--line)"
            strokeWidth="1"
            fill="none"
          />
        </g>

        {/* Edges */}
        <g id="edgelayer">
          {EDGES.map((edge, i) => {
            const [a, b] = edge.map((idx) => NODES[idx]);
            const isHot =
              hoveredIndex !== null &&
              (edge[0] === hoveredIndex || edge[1] === hoveredIndex);
            return (
              <line
                key={`edge-${i}`}
                id={`edge-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--glow)"
                strokeWidth="0.9"
                opacity={isHot ? 0.75 : 0.26}
                fill="none"
                className="transition-opacity duration-400"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g id="nodelayer">
          {NODES.map((node, i) => (
            <g
              key={node.id}
              id={`node-${i}`}
              className="node cursor-pointer"
              tabIndex={0}
              role="link"
              aria-label={node.zh}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNodeClick(node.id);
                }
              }}
            >
              <circle
                className="halo transition-opacity duration-450"
                r="34"
                fill="url(#hg)"
                opacity={hoveredIndex === i ? 0.22 : 0}
              />
              <circle
                className="ring transition-all duration-400"
                r="13"
                fill="none"
                stroke="var(--glow)"
                strokeWidth="0.8"
                opacity={hoveredIndex === i ? 0.6 : 0}
              />
              <circle
                className="star transition-all duration-300"
                r={hoveredIndex === i ? 5.4 : 4.2}
                fill={hoveredIndex === i ? 'var(--glow)' : 'var(--text)'}
              />
              <text
                className="lbl font-serif text-[17px] tracking-wide transition-colors duration-300"
                x="20"
                y="5"
                fill={hoveredIndex === i ? 'var(--glow)' : 'var(--text)'}
              >
                {node.zh}
              </text>
              <text
                className="sub font-sans text-[9.5px] tracking-wider"
                x="20"
                y="20"
                fill="var(--dim)"
              >
                mag {node.mag}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className="plate absolute left-0 bottom-[-6px] text-[10.5px] text-dim tracking-wider font-sans">
        观星台导航图
      </div>
    </div>
  );
}
