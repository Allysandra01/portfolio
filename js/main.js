(function() {
  function getSocialIcon(name) {
    var icons = {
      github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
      twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>',
      dribbble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 0-14.36 7.55"/><path d="M8.09 2.12c3.42 6.47 8.63 10.87 15.66 11.25"/></svg>'
    };
    return icons[name.toLowerCase()] || '';
  }

  function getStatIcon(type) {
    var icons = {
      code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
      users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
    };
    return icons[type] || icons.layers;
  }

  function renderAbout(data) {
    var aboutSkills = document.getElementById('about-skills');
    if (!aboutSkills || !data.skills) return;

    var skillIcons = ['code', 'terminal', 'tools', 'flask'];
    aboutSkills.innerHTML = data.skills.map(function(group, i) {
      return '<div class="skill-group">' +
        '<div class="skill-group__header">' +
          '<svg class="skill-group__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            (i === 0 ? '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' :
             i === 1 ? '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>' :
             i === 2 ? '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' :
             '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>') +
          '</svg>' +
          '<h3 class="skill-group__title">' + group.category + '</h3>' +
        '</div>' +
        '<div class="skill-group__list">' +
          group.items.map(function(item) {
            return '<span class="tech-badge">' + item + '</span>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');

    var aboutBio = document.getElementById('about-bio');
    if (aboutBio && data.personal.bio) {
      aboutBio.textContent = data.personal.bio;
    }
  }

  function renderExperience(data) {
    var timeline = document.getElementById('experience-timeline');
    if (!timeline || !data.experience) return;

    timeline.innerHTML = data.experience.map(function(item) {
      var initial = item.company.charAt(0);
      return '<li class="timeline__item">' +
        '<span class="timeline__period">' + item.period + '</span>' +
        '<div class="timeline__company-line">' +
          '<div class="timeline__company-initial">' + initial + '</div>' +
          '<div>' +
            '<h3 class="timeline__role">' + item.role + '</h3>' +
            '<p class="timeline__company">' + item.company + ' \u2014 ' + item.location + '</p>' +
          '</div>' +
        '</div>' +
        '<ul class="timeline__achievements">' +
          item.achievements.map(function(a) {
            return '<li>' + a + '</li>';
          }).join('') +
        '</ul>' +
        (item.tech ? '<div class="timeline__tech">' +
          item.tech.map(function(t) {
            return '<span class="tech-badge">' + t + '</span>';
          }).join('') +
        '</div>' : '') +
      '</li>';
    }).join('');
  }

  function renderStats(data) {
    var container = document.getElementById('stats-grid');
    if (!container || !data.personal.stats) return;

    container.innerHTML = data.personal.stats.map(function(stat) {
      return '<div class="stat-card" data-animate="scale-up">' +
        '<div class="stat-card__icon">' + getStatIcon(stat.icon) + '</div>' +
        '<div class="stat-card__value"><span class="stat-number" data-target="' + stat.value + '">0</span>' + (stat.suffix || '') + '</div>' +
        '<p class="stat-card__label">' + stat.label + '</p>' +
      '</div>';
    }).join('');
  }

  function animateCounters() {
    var counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseInt(el.getAttribute('data-target'));
            var duration = 2000;
            var start = performance.now();

            function update(now) {
              var elapsed = now - start;
              var progress = Math.min(elapsed / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.floor(eased * target);
              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                el.textContent = target;
              }
            }

            requestAnimationFrame(update);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(function(c) { observer.observe(c); });
    }
  }

  function renderTestimonials(data) {
    var container = document.getElementById('testimonials-grid');
    if (!container || !data.testimonials) return;

    container.innerHTML = data.testimonials.map(function(t) {
      var initial = t.name.charAt(0);
      return '<article class="testimonial-card" data-animate="fade-up">' +
        '<svg class="testimonial-card__quote-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z"/></svg>' +
        '<p class="testimonial-card__text">"' + t.quote + '"</p>' +
        '<div class="testimonial-card__author">' +
          '<div class="testimonial-card__avatar">' + initial + '</div>' +
          '<div>' +
            '<p class="testimonial-card__name">' + t.name + '</p>' +
            '<p class="testimonial-card__role">' + t.role + '</p>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function renderContact(data) {
    var socialContainer = document.getElementById('contact-social');
    if (!socialContainer || !data.personal.social) return;

    var labels = { github: 'GitHub', linkedin: 'LinkedIn', twitter: 'Twitter', dribbble: 'Dribbble' };
    var social = data.personal.social;
    socialContainer.innerHTML = Object.keys(social).map(function(key) {
      return '<a href="' + social[key] + '" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="' + labels[key] || key + '">' +
        getSocialIcon(key) +
        '<span class="social-link__tooltip">' + (labels[key] || key) + '</span>' +
      '</a>';
    }).join('');
  }

  function renderFooter(data) {
    var footerYear = document.querySelector('.footer__copyright');
    if (footerYear) {
      footerYear.innerHTML = '&copy; ' + new Date().getFullYear() + ' ' + data.personal.name + '. All rights reserved.';
    }

    var resumeLink = document.getElementById('resume-link');
    if (resumeLink && data.personal.resume) {
      resumeLink.setAttribute('href', data.personal.resume);
      resumeLink.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align:middle;margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Resume';
    }
  }

  function generateStructuredData(data) {
    var script = document.getElementById('structured-data');
    if (!script) return;

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': data.personal.name,
      'jobTitle': data.personal.title,
      'email': data.personal.email,
      'url': window.location.origin,
      'sameAs': [],
      'knowsAbout': [],
      'worksFor': []
    };

    if (data.personal.social) {
      schema.sameAs = Object.values(data.personal.social);
    }

    if (data.skills) {
      data.skills.forEach(function(group) {
        group.items.forEach(function(skill) {
          schema.knowsAbout.push(skill);
        });
      });
    }

    if (data.experience) {
      schema.worksFor = data.experience.map(function(e) {
        return { '@type': 'Organization', 'name': e.company };
      });
    }

    script.textContent = JSON.stringify(schema);
  }

  function startTypewriter(text, element, speed) {
    if (!element) return;
    speed = speed || 40;
    var i = 0;
    element.textContent = '';
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  function renderHero(data) {
    var heroDesc = document.getElementById('hero-description');
    var heroBadge = document.querySelector('.hero__badge');

    if (heroBadge && data.personal.title) {
      heroBadge.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg> ' + data.personal.title;
    }

    var typewriterEl = document.getElementById('typewriter-text');
    if (typewriterEl && data.personal.title) {
      var text = data.personal.title + ' specializing in React, TypeScript, and modern CSS. ' +
        (data.experience ? data.experience.length : '5') + '+ years of experience crafting responsive, accessible interfaces.';
      startTypewriter(text, typewriterEl);
    }
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var fields = {
      name: { validate: function(v) { return v.trim().length >= 2; } },
      email: { validate: function(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
      message: { validate: function(v) { return v.trim().length >= 10; } }
    };

    Object.keys(fields).forEach(function(id) {
      var input = document.getElementById(id);
      if (!input) return;

      input.addEventListener('blur', function() {
        var group = this.closest('.form__group');
        var valid = fields[id].validate(this.value);
        group.classList.toggle('has-error', !valid && this.value.length > 0);
      });

      input.addEventListener('input', function() {
        var group = this.closest('.form__group');
        if (group.classList.contains('has-error')) {
          group.classList.remove('has-error');
        }
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var isValid = true;
      Object.keys(fields).forEach(function(id) {
        var input = document.getElementById(id);
        var group = input.closest('.form__group');
        var valid = fields[id].validate(input.value);
        group.classList.toggle('has-error', !valid);
        if (!valid) isValid = false;
      });

      if (!isValid) return;

      var submitWrap = form.querySelector('.form__submit-wrap');
      var banner = document.getElementById('form-banner');
      submitWrap.classList.add('is-loading');
      banner.classList.remove('is-visible', 'form__banner--success', 'form__banner--error');

      var formData = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(function(res) {
        if (res.ok) return res.json();
        throw new Error('Network error');
      })
      .then(function() {
        submitWrap.classList.remove('is-loading');
        banner.className = 'form__banner form__banner--success is-visible';
        banner.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Message sent successfully! I\'ll get back to you soon.';
        form.reset();
      })
      .catch(function() {
        submitWrap.classList.remove('is-loading');
        banner.className = 'form__banner form__banner--error is-visible';
        banner.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Oops! Something went wrong. Please email me directly at alex@example.com.';
      });
    });
  }

  function init() {
    fetch('data/portfolio.json')
      .then(function(response) {
        if (!response.ok) throw new Error('Failed to load data');
        return response.json();
      })
      .then(function(data) {
        renderHero(data);
        renderAbout(data);
        renderExperience(data);
        renderStats(data);
        renderTestimonials(data);
        renderContact(data);
        renderFooter(data);
        generateStructuredData(data);

        if (window.ProjectRenderer && data.projects) {
          window.ProjectRenderer.init(data.projects);
        }

        animateCounters();
        initForm();
      })
      .catch(function(error) {
        console.error('Failed to load portfolio data:', error);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
