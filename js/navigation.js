function initNavigation() {
  const header = document.getElementById('header');
  const navToggle = document.querySelector('.nav__toggle');
  const navList = document.getElementById('nav-menu');
  const overlay = document.getElementById('mobile-overlay');
  const themeToggle = document.getElementById('theme-toggle');
  const backToTop = document.getElementById('back-to-top');
  const scrollProgress = document.getElementById('scroll-progress');
  const navLinks = document.querySelectorAll('.nav__link');

  // Theme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute(
    'data-theme',
    savedTheme || (prefersDark ? 'dark' : 'light')
  );

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    // Add rotation animation
    const icon = themeToggle.querySelector(next === 'dark' ? '.moon-icon' : '.sun-icon');
    if (icon) {
      icon.style.animation = 'none';
      icon.offsetHeight;
      icon.style.animation =
        next === 'dark'
          ? 'rotate-moon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'rotate-sun 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  });

  // Mobile menu
  function openMenu() {
    navList.classList.add('open');
    overlay.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navList.classList.remove('open');
    overlay.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navList.classList.contains('open')) closeMenu();
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Scroll effects
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

        scrollProgress.style.width = progress + '%';
        header.classList.toggle('scrolled', scrollY > 50);
        backToTop.classList.toggle('visible', scrollY > 500);

        // Active nav link
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        sections.forEach((section) => {
          const top = section.offsetTop - 100;
          if (scrollY >= top) current = section.getAttribute('id');
        });

        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === '#' + current);
        });

        ticking = false;
      });
      ticking = true;
    }
  });

  // Back to top
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Share button
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            text: document.querySelector('meta[name="description"]')?.content || 'Check out my portfolio!',
            url: window.location.href,
          });
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Link copied to clipboard!');
        }).catch(err => {
          console.error('Could not copy text: ', err);
        });
      }
    });
  }
}
