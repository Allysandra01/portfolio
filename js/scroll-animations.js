function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.classList.add('animated');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay) || 0;

          setTimeout(() => {
            el.classList.add('animated');
          }, delay);

          observer.unobserve(el);
        }
      });
    },
    { rootMargin: '-40px', threshold: 0.1 }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));

  // Parallax on scroll
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          parallaxEls.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax) || 0.1;
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const offset = (center - viewportCenter) * speed;
            el.style.transform = `translateY(${offset * -1}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }
}
