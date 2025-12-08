"use client";

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  className?: string;
  text?: string;
  accent?: string;
};

export default function AnimatedBadge({ className = '', text = 'coming', accent = 'soon' }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <p
      ref={ref}
      className={`${className}`}
      style={{
        transition: 'transform 600ms ease, opacity 600ms ease',
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        opacity: visible ? 1 : 0,
      }}
    >
      <span>{text}</span>
      <span className={`text-gradient ml-1 ${visible ? 'animate-pulse' : ''}`}> {accent}</span>
    </p>
  );
}
