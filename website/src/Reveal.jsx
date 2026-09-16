import React, { useLayoutEffect, useRef } from 'react';

// Animate semantic elements directly so layout and keyboard order stay unchanged.
export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let observer,completion;
    function settle() {
      clearTimeout(completion);
      if (element.dataset.reveal === 'visible') element.dataset.reveal = 'settled';
    }
    function finished(event) {
      if (event.target === element && event.animationName === 'reveal-enter') settle();
    }
    function focused() {
      clearTimeout(completion);
      if (element.dataset.reveal !== 'static') element.dataset.reveal = 'settled';
    }
    function configure() {
      observer?.disconnect();
      clearTimeout(completion);
      element.dataset.reveal = 'static';
      // A card/portrait already moving as one object must not move its image twice.
      if (element.parentElement?.closest('.reveal')) return;
      if (preference?.matches || !window.IntersectionObserver) return;
      element.dataset.reveal = 'pending';
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (element.dataset.reveal !== 'pending') continue;
            element.dataset.reveal = 'visible';
            completion = setTimeout(settle, Math.max(0, Number(delay) || 0) + 760);
          }
          // Reset only after leaving entirely, not while hovering around a threshold.
          else { clearTimeout(completion); element.dataset.reveal = 'pending'; }
        }
      }, { threshold: 0 });
      observer.observe(element);
    }
    configure();
    element.addEventListener('animationend', finished);
    element.addEventListener('focusin', focused);
    preference?.addEventListener('change', configure);
    return () => { clearTimeout(completion); observer?.disconnect(); element.removeEventListener('animationend', finished); element.removeEventListener('focusin', focused); preference?.removeEventListener('change', configure); };
  }, [delay]);
  return <Tag ref={ref} className={`reveal ${className}`} style={{ ...style, '--reveal-delay': `${delay}ms` }} {...props}>{children}</Tag>;
}
