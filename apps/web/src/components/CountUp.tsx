"use client";

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  end: number;
  decimals?: number;
  duration?: number; // ms
  suffix?: React.ReactNode;
  className?: string;
};

export default function CountUp({ end, decimals = 0, duration = 1500, suffix, className }: Props) {
  const [value, setValue] = useState<number>(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const from = 0;
            const to = end;

            const step = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const current = from + (to - from) * progress;
              setValue(Number(current.toFixed(decimals)));
              if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.4 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration, decimals]);

  return (
    <div ref={ref} className={className}>
      {value.toFixed(decimals)}{typeof suffix === 'string' ? <span className="text-gradient">{suffix}</span> : suffix}
    </div>
  );
}
