// 星图的节点与连线（viewBox 0 0 620 580）。首页星图与分享图共用，放在无 'use client' 的模块里
export interface StarNode {
  id: 'about' | 'projects' | 'writing' | 'toolkit' | 'contact';
  mag: string;
  x: number;
  y: number;
}

export const STAR_NODES: StarNode[] = [
  { id: 'about', mag: '1.4', x: 150, y: 128 },
  { id: 'projects', mag: '0.8', x: 420, y: 90 },
  { id: 'writing', mag: '1.9', x: 512, y: 330 },
  { id: 'toolkit', mag: '2.3', x: 300, y: 450 },
  { id: 'contact', mag: '1.1', x: 92, y: 338 },
];

export const STAR_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 3],
];
