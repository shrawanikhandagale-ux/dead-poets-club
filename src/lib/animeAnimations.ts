import anime from 'animejs';

/**
 * Triggers an organic ink-burst / quill splatter particle animation at a click position
 */
export const triggerInkSplatter = (x: number, y: number) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  document.body.appendChild(container);

  const particleCount = 14;
  const colors = ['#784743', '#D3A66D', '#2B2620', '#8E9C82'];

  for (let i = 0; i < particleCount; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 8 + 4;
    dot.style.position = 'absolute';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    dot.style.opacity = '0.85';
    container.appendChild(dot);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 30;

    anime({
      targets: dot,
      translateX: Math.cos(angle) * distance,
      translateY: Math.sin(angle) * distance + 20, // gravity drift
      scale: [1, 0],
      opacity: [0.85, 0],
      easing: 'easeOutCirc',
      duration: Math.random() * 600 + 400,
      complete: () => {
        if (i === particleCount - 1 && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      },
    });
  }
};

/**
 * Animates hand-drawn SVG underlines or flourishes
 */
export const animateSvgStroke = (svgPathElement: SVGPathElement) => {
  anime({
    targets: svgPathElement,
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutSine',
    duration: 900,
  });
};

/**
 * Wax Seal stamp tactile micro-bounce
 */
export const animateWaxSealPress = (target: HTMLElement | null) => {
  if (!target) return;
  anime({
    targets: target,
    scale: [
      { value: 0.92, duration: 120, easing: 'easeOutQuad' },
      { value: 1.05, duration: 180, easing: 'easeOutElastic(1, .5)' },
      { value: 1, duration: 150, easing: 'easeOutQuad' },
    ],
  });
};
