import React, { useEffect, useRef, useState } from 'react';
import { Sparkle } from '@phosphor-icons/react';

// Fixed, deliberately composed positions keep the text corridor clear and avoid
// reshuffling the lights when unrelated UI (such as the header) updates.
const lights = [
  [10,76], [27,85], [42,82], [58,91], [74,84], [91,88], [17,93], [84,78],
  [6,58], [94,52], [32,94], [64,84], [50,87], [80,91], [22,80], [96,79],
  [8,88], [38,84], [69,94], [93,62], [10,65], [54,83], [76,86], [93,95],
];

export function Fireflies() {
  const layer = useRef(null);
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const element = layer.current;
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let inView = !window.IntersectionObserver;
    function update() {
      element.dataset.active = String(enabled && inView && !document.hidden && !preference?.matches);
    }
    const observer = window.IntersectionObserver ? new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      update();
    }) : null;
    observer?.observe(element);
    document.addEventListener('visibilitychange', update);
    preference?.addEventListener('change', update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', update);
      preference?.removeEventListener('change', update);
    };
  }, [enabled]);

  return <>
    <div ref={layer} className="fireflies" aria-hidden="true" data-enabled={enabled}>
      {lights.map(([x,y], index) => <span key={index} className={`firefly ${index % 6 === 0 ? 'firefly-near' : ''}`} style={{
        left: `${x}%`, top: `${y}%`,
        '--flight': `${16 + index % 7 * 2}s`,
        '--phase': `${-index * 2.37}s`,
        '--glimmer': `${4.8 + index % 5 * .73}s`,
        '--dx': `${index % 2 ? -54 : 64}px`,
        '--dy': `${-(24 + index % 4 * 8)}px`,
        '--size': `${index % 6 === 0 ? 6.5 : 3.2 + index % 3 * .75}px`,
        '--mobile-y': `${81 + index % 4 * 4}%`,
      }}><i /></span>)}
    </div>
    <button className="fireflies-toggle" onClick={() => setEnabled(value => !value)} aria-label={enabled ? '반딧불 끄기' : '반딧불 켜기'}>
      <Sparkle size={15} aria-hidden="true" />반딧불 {enabled ? '끄기' : '켜기'}
    </button>
  </>;
}
