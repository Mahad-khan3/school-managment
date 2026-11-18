import { useEffect, useRef } from 'react';

const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const {
      threshold = 0.15,
      rootMargin = '0px 0px -50px 0px'
    } = optionsRef.current;

    const children = element.querySelectorAll(
      '.scroll-hidden, .scroll-hidden-left, .scroll-hidden-right, .scroll-hidden-scale'
    );

    if (!children.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.classList.contains('scroll-hidden')) {
              el.classList.add('scroll-visible');
            } else if (el.classList.contains('scroll-hidden-left')) {
              el.classList.add('scroll-visible-left');
            } else if (el.classList.contains('scroll-hidden-right')) {
              el.classList.add('scroll-visible-right');
            } else if (el.classList.contains('scroll-hidden-scale')) {
              el.classList.add('scroll-visible-scale');
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin }
    );

    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
};

export default useScrollReveal;
