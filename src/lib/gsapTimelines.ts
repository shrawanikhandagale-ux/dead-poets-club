import gsap from 'gsap';

export const playHeroEntrance = (
  containerSelector: string,
  elements: { title?: string; subtitle?: string; actions?: string; badges?: string }
) => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });

  if (elements.badges) {
    tl.fromTo(
      elements.badges,
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.6 }
    );
  }

  if (elements.title) {
    tl.fromTo(
      elements.title,
      { opacity: 0, y: 25, letterSpacing: '0.08em' },
      { opacity: 1, y: 0, letterSpacing: '0.02em', duration: 0.8 },
      '-=0.3'
    );
  }

  if (elements.subtitle) {
    tl.fromTo(
      elements.subtitle,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7 },
      '-=0.4'
    );
  }

  if (elements.actions) {
    tl.fromTo(
      elements.actions,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6 },
      '-=0.3'
    );
  }

  return tl;
};

export const staggerCardsEntrance = (cardSelector: string) => {
  gsap.fromTo(
    cardSelector,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
    }
  );
};
