const SVG_ICONS = {
  github:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  twitter:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
};

const STAT_ICONS = {
  'Years Experience':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  'Projects Delivered':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  'Happy Clients':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  Technologies:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
};

function renderAbout(data) {
  const bio = document.getElementById('about-bio');
  if (bio) bio.textContent = data.about.bio;

  const skills = document.getElementById('about-skills');
  if (skills) {
    skills.innerHTML = data.about.skills
      .map(
        (cat) => `
      <div class="skill-category" role="listitem" data-animate="fade-up">
        <h3>${cat.category}</h3>
        <div class="skill-category__items">
          ${cat.items.map((item) => `<span class="tech-badge">${item}</span>`).join('')}
        </div>
      </div>
    `
      )
      .join('');
  }
}

function renderExperience(data) {
  const timeline = document.getElementById('experience-timeline');
  if (!timeline) return;

  timeline.innerHTML = data.experience
    .map(
      (exp) => `
    <li class="timeline__item" data-animate="fade-up">
      <div class="timeline__dot"></div>
      <h3 class="timeline__role">${exp.role}</h3>
      <p class="timeline__company">${exp.company}</p>
      <p class="timeline__period">${exp.period}</p>
      <p class="timeline__description">${exp.description}</p>
      <ul class="timeline__highlights">
        ${exp.highlights.map((h) => `<li>${h}</li>`).join('')}
      </ul>
    </li>
  `
    )
    .join('');
}

function renderStats(data) {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;

  grid.innerHTML = data.personal.stats
    .map(
      (stat) => `
    <div class="stat-card" data-animate="fade-up">
      <div class="stat-card__icon">${STAT_ICONS[stat.label] || ''}</div>
      <div class="stat-card__value" data-count="${stat.value}">0${stat.suffix}</div>
      <div class="stat-card__label">${stat.label}</div>
    </div>
  `
    )
    .join('');

  animateCounters();
}

function animateCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          const suffix = el.textContent.replace('0', '').trim() || '';
          let current = 0;
          const increment = Math.ceil(target / 60);
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = current + suffix;
          }, 25);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat-card__value[data-count]').forEach((el) => observer.observe(el));
}

function projectSelector() {
  return {
    selectedCategory: '',
    subChoices: [],
    imageUrl: null,
    projects: {},
    updateSubChoices() {
      if (this.selectedCategory) {
        this.subChoices = this.projects[this.selectedCategory] || [];
        const placeholder = document.getElementById('upload-placeholder');
        if (placeholder) {
          placeholder.style.display = this.imageUrl ? 'none' : 'block';
        }
      } else {
        this.subChoices = [];
      }
    },
    previewImage(event) {
      const file = event.target.files?.[0];
      if (file) {
        this.imageUrl = URL.createObjectURL(file);
        const placeholder = document.getElementById('upload-placeholder');
        if (placeholder) placeholder.style.display = 'none';
      }
    },
  };
}

function renderProjects(data) {
  const grid = document.getElementById('projects-grid');
  const filters = document.getElementById('project-filters');
  if (!grid) return;

  grid.innerHTML = data.projects.map((p) => ProjectRenderer.renderCard(p)).join('');

  if (filters && data.projects.length) {
    ProjectRenderer.buildFilters(data.projects, filters);
  }
}

function getCollaboratorImageUrl(collaborator) {
  const name = collaborator.name || collaborator.initials || 'Collaborator';
  if (collaborator.image && collaborator.image.trim()) {
    return collaborator.image;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1C4D8D&color=fff&size=256&rounded=true`;
}

const PROJECT_SELECTION_IMAGES = {
  'Layout Designing': './css/images/ally2.jpg',
  'UI/UX Web': './css/images/allyyy.png',
  'Video Editing': './css/images/ally2.jpg',
  'Music Production': './css/images/allyyy.png',
  'Writing Story': './css/images/ally2.jpg',
  'Web Development': './css/images/allyyy.png',
  'Application Development': './css/images/ally2.jpg',
};

function getProjectSelectionImage(choice, category) {
  return PROJECT_SELECTION_IMAGES[category] || './css/images/ally2.jpg';
}

function renderProjectSelection(data) {
  const tabs = document.getElementById('project-selection-tabs');
  const options = document.getElementById('project-selection-options');
  const current = document.getElementById('project-selection-current');
  if (!tabs || !options || !current || !data.projectSelection) return;

  const selector = projectSelector();
  selector.projects = data.projectSelection.projects;
  const categories = Object.keys(selector.projects);
  if (!categories.length) return;

  tabs.innerHTML = categories
    .map(
      (category, index) => `
        <button class="project-selection__tab" type="button" role="tab" aria-selected="${index === 0}"
          data-index="${index}">${category}</button>
      `
    )
    .join('');

  function showCategory(index) {
    const category = categories[index];
    if (!category) return;

    selector.selectedCategory = category;
    selector.updateSubChoices();
    current.textContent = category;
    options.innerHTML = selector.subChoices
      .map((choice) => {
        const imageUrl = getProjectSelectionImage(choice, category);
        return `
          <button type="button" class="project-selection__choice" data-choice="${choice}">
            <span class="project-selection__choice-media">
              <img src="${imageUrl}" alt="${choice}" loading="lazy" />
            </span>
            <span class="project-selection__choice-title">${choice}</span>
          </button>
        `;
      })
      .join('');

    tabs.querySelectorAll('.project-selection__tab').forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.classList.toggle('project-selection__tab--active', selected);
    });
  }

  showCategory(0);

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('.project-selection__tab');
    if (!button) return;
    showCategory(Number(button.dataset.index));
  });

  options.addEventListener('click', (event) => {
    const choiceButton = event.target.closest('.project-selection__choice');
    if (!choiceButton) return;
    options.querySelectorAll('.project-selection__choice').forEach((btn) => btn.classList.remove('project-selection__choice--active'));
    choiceButton.classList.add('project-selection__choice--active');
  });
}

function renderTestimonials(data) {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  grid.innerHTML = data.testimonials
    .map(
      (t) => `
    <div class="testimonial-card" data-animate="fade-up">
      <p class="testimonial-card__quote">${t.quote}</p>
      <p class="testimonial-card__author">${t.author}</p>
      <p class="testimonial-card__role">${t.role}</p>
    </div>
  `
    )
    .join('');
}

function renderCollaborators(data) {
  const grid = document.getElementById('collaborators-grid');
  if (!grid || !Array.isArray(data.collaborators)) return;

  const uploader = `
      <article class="uploader-card" data-animate="fade-up">
        <div class="uploader-card__preview" id="collaborator-photo-preview" aria-hidden="true">
          <span id="upload-placeholder" class="uploader-card__placeholder">+</span>
        </div>
        <div class="uploader-card__content">
          <h3 class="collaborator-card__name">Upload a photo</h3>
          <p class="collaborator-card__note">Choose an image to preview a collaborator picture inside the card.</p>
          <label class="upload-button">
            <input type="file" id="collaborator-photo-input" accept="image/*" />
            Add Photo
          </label>
        </div>
      </article>
    `;

  grid.innerHTML = uploader +
    data.collaborators
      .map(
        (collaborator) => {
          const name = collaborator.name || collaborator.initials || 'Collaborator';
          const imageUrl = getCollaboratorImageUrl(collaborator);
          return `
      <article class="collaborator-card" data-animate="fade-up">
        <div class="collaborator-card__photo">
          <img src="${imageUrl}" alt="${name}" loading="lazy" />
        </div>
        <h3 class="collaborator-card__name">${name}</h3>
      </article>
    `;
        }
      )
      .join('');

  const fileInput = document.getElementById('collaborator-photo-input');
  const preview = document.getElementById('collaborator-photo-preview');
  if (fileInput && preview) {
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        preview.style.backgroundImage = '';
        preview.querySelector('.uploader-card__placeholder').style.opacity = '1';
        return;
      }

      const url = URL.createObjectURL(file);
      preview.style.backgroundImage = `url('${url}')`;
      preview.style.backgroundSize = 'cover';
      preview.style.backgroundPosition = 'center';
      const placeholder = preview.querySelector('.uploader-card__placeholder');
      if (placeholder) placeholder.style.opacity = '0';
    });
  }
}

function renderContact(data) {
  const social = document.getElementById('contact-social');
  if (!social) return;

  social.innerHTML = data.personal.social
    .map(
      (s) => `
    <a href="${s.url}" class="social-link" target="_blank" rel="noopener" aria-label="${s.label}" role="listitem">
      ${SVG_ICONS[s.icon] || ''}
    </a>
  `
    )
    .join('');

  const copyright = document.querySelector('.footer__copyright');
  if (copyright) {
    copyright.innerHTML = `&copy; ${new Date().getFullYear()} ${data.personal.name}. All rights reserved.`;
  }
}

function renderHero(data) {
  const badge = document.querySelector('.hero__badge');
  if (badge) {
    const svg = badge.querySelector('svg');
    badge.textContent = '';
    if (svg) badge.appendChild(svg);
    badge.appendChild(document.createTextNode(' ' + data.personal.title));
  }

  const title = document.getElementById('hero-title');
  if (title) {
    const words = data.personal.tagline.split(' ');
    const mid = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, mid).join(' ');
    const secondHalf = words.slice(mid).join(' ');
    title.innerHTML = `${firstHalf} <span class="highlight">${secondHalf}</span>`;
  }

  startTypewriter(data.personal.tagline);
}

function startTypewriter(text) {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  let i = 0;
  const speed = 40;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  setTimeout(type, 1000);
}

function generateStructuredData(data) {
  const script = document.getElementById('structured-data');
  if (!script) return;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.personal.name,
    jobTitle: data.personal.title,
    email: data.personal.email,
    sameAs: data.personal.social.map((s) => s.url),
  };

  script.textContent = JSON.stringify(jsonLd);
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    const fields = form.querySelectorAll('.form__group');
    fields.forEach((group) => {
      const input = group.querySelector('input, textarea');
      if (input && !input.checkValidity()) {
        group.classList.add('error');
        valid = false;
      } else if (group) {
        group.classList.remove('error');
      }
    });

    if (!valid) return;

    form.classList.add('sending');
    const banner = document.getElementById('form-banner');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.reset();
        banner.className = 'form__banner success';
        banner.textContent = 'Message sent successfully!';
      } else {
        throw new Error('Failed');
      }
    } catch {
      banner.className = 'form__banner error';
      banner.textContent = 'Something went wrong. Please try again.';
    } finally {
      form.classList.remove('sending');
    }
  });

  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.form__group')?.classList.remove('error');
    });
  });
}

function initCardMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.project-card, .testimonial-card, .collaborator-card, .skill-category');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * 10;
      const ry = (x - 0.5) * 10;
      const tx = (x - 0.5) * 8;
      const ty = (y - 0.5) * 8;
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
      card.style.setProperty('--tx', `${tx}px`);
      card.style.setProperty('--ty', `${ty}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--tx', '0px');
      card.style.setProperty('--ty', '0px');
    });
  });
}

// Mouse-tracking hero gradient
function initHeroParallax() {
  const hero = document.getElementById('hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    hero.style.setProperty('--mouse-x', x);
    hero.style.setProperty('--mouse-y', y);
  });
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data/portfolio.json');
    const data = await res.json();

    renderHero(data);
    renderAbout(data);
    renderExperience(data);
    renderStats(data);
    renderProjects(data);
    renderTestimonials(data);
    renderCollaborators(data);
    renderProjectSelection(data);
    renderContact(data);
    generateStructuredData(data);
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  }

  initNavigation();
  initScrollAnimations();
  initContactForm();
  initCardMotion();
  initHeroParallax();
});
