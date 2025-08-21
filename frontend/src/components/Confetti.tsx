import { useEffect, useRef } from 'react';

export default function Confetti({ fire }: { fire: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fire || !ref.current) return;
    const el = ref.current;
    el.classList.remove('confetti');
    // trigger reflow
    void el.offsetWidth;
    el.classList.add('confetti');
  }, [fire]);
  return <div ref={ref} className="confetti-container" aria-hidden />;
}

