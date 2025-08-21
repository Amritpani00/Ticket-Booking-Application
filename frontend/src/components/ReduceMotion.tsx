export function setReduceMotion(enabled: boolean) {
  try {
    if (enabled) document.body.classList.add('reduce-motion');
    else document.body.classList.remove('reduce-motion');
    localStorage.setItem('reduceMotion', enabled ? '1' : '0');
  } catch {}
}

export function initReduceMotionFromStorage() {
  try {
    const v = localStorage.getItem('reduceMotion');
    setReduceMotion(v === '1');
  } catch {}
}

