(function() {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-animate]').forEach(function(el) {
      el.classList.add('is-visible');
    });
    // Expose no-op refresh
    window.ScrollAnimator = { refresh: function() {
      document.querySelectorAll('[data-animate]').forEach(function(el) {
        el.classList.add('is-visible');
      });
    }};
    return;
  }

  var observer;

  function createObserver() {
    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-delay');
          if (delay) {
            // Honour delay attribute without doubling up CSS transition-delay
            setTimeout(function() {
              entry.target.classList.add('is-visible');
            }, 0);
          } else {
            entry.target.classList.add('is-visible');
          }
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.08
    });
  }

  function observe(elements) {
    elements.forEach(function(el) {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  }

  if ('IntersectionObserver' in window) {
    createObserver();
    observe(document.querySelectorAll('[data-animate]'));
  } else {
    document.querySelectorAll('[data-animate]').forEach(function(el) {
      el.classList.add('is-visible');
    });
  }

  // Public API — called after dynamic content is injected
  window.ScrollAnimator = {
    refresh: function() {
      if (observer) {
        observe(document.querySelectorAll('[data-animate]'));
      } else {
        document.querySelectorAll('[data-animate]').forEach(function(el) {
          el.classList.add('is-visible');
        });
      }
    }
  };
})();
