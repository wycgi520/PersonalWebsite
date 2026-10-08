'use client';

import { useEffect, useState } from 'react';

// 首屏直出不播放进场动画（避免拖慢首次绘制）；之后每次路由切换 template 重新挂载，播放一次
let hydrated = false;

export default function SceneTemplate({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => hydrated);

  useEffect(() => {
    hydrated = true;
  }, []);

  if (!animate) return <>{children}</>;

  return (
    <>
      {/* 光扫放在动画容器外：filter/transform 会让 fixed 定位相对容器而非视口 */}
      <div className="scene-warp" aria-hidden="true" />
      <div className="scene-enter">{children}</div>
    </>
  );
}
