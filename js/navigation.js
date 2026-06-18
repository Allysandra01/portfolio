(function() {
  var header = document.querySelector('.header');
  var toggle = document.querySelector('.nav__toggle');
  var navList = document.querySelector('.nav__list');
  var overlay = document.getElementById('mobile-overlay');
  var navLinks = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('section[id]');
  var backToTop = document.getElementById('back-to-top');
  var scrollProgress = document.getElementById('scroll-progress');
  var themeToggle = document.getElementById('theme-toggle');
  var html = document.documentElement;

  function getTheme() {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  if (themeToggle) {
    setTheme(getTheme());
    themeToggle.addEventListener('click', function() {
      var current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  if (toggle && navList) {
    toggle.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      navList.classList.toggle('is-open');
      if (overlay) overlay.classList.toggle('is-visible');
    });

    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-visible');
      });
    });

    if (overlay) {
      overlay.addEventListener('click', function() {
        toggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
        overlay.classList.remove('is-visible');
      });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (sections.length && navLinks.length) {
    function updateActiveLink() {
      var scrollPos = window.scrollY + 100;
      var currentId = '';

      sections.forEach(function(section) {
        var top = section.offsetTop - 100;
        var bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          currentId = section.id;
        }
      });

      navLinks.forEach(function(link) {
        link.classList.remove('is-active');
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('is-active');
        }
      });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  if (backToTop) {
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function updateScrollProgress() {
    if (!scrollProgress) return;
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
  }

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 300) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  }

  function onScroll() {
    updateScrollProgress();
    updateHeaderState();
    updateBackToTop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
