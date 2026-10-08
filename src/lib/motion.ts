/*
 * 动态效果偏好：默认跟随系统的"减少动态效果"，导航栏开关可手动覆盖。
 * 选择存在 localStorage，写到 <html data-motion="full|reduced">：
 * - CSS 据此放行或压住动画（globals.css 末尾）
 * - 画布动画（星空、星图、篝火）通过 prefersReducedMotion() / onMotionChange() 读取
 */
export type MotionPref = 'full' | 'reduced';

export const MOTION_KEY = 'gy-motion';
const QUERY = '(prefers-reduced-motion: reduce)';
const EVENT = 'gy-motion-change';

// 首屏解析 <body> 时同步执行，绘制前写好 data-motion，避免动画先播一下再停
export const MOTION_SCRIPT = `(function(){try{var m=localStorage.getItem('${MOTION_KEY}');if(m==='full'||m==='reduced')document.documentElement.setAttribute('data-motion',m)}catch(e){}})()`;

/** 用户手动选择；未选择时为 null（跟随系统） */
function storedPref(): MotionPref | null {
  const v = document.documentElement.dataset.motion;
  return v === 'full' || v === 'reduced' ? v : null;
}

/** 当前是否应减少动态效果：手动选择优先，否则跟随系统 */
export function prefersReducedMotion(): boolean {
  const p = storedPref();
  return p ? p === 'reduced' : matchMedia(QUERY).matches;
}

export function setMotionPref(pref: MotionPref) {
  document.documentElement.dataset.motion = pref;
  try {
    localStorage.setItem(MOTION_KEY, pref);
  } catch {
    // 存储不可用时只在本次访问生效
  }
  window.dispatchEvent(new Event(EVENT));
}

/** 系统设置或手动开关变化时回调；返回取消订阅函数 */
export function onMotionChange(cb: () => void): () => void {
  const mq = matchMedia(QUERY);
  mq.addEventListener('change', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    mq.removeEventListener('change', cb);
    window.removeEventListener(EVENT, cb);
  };
}
