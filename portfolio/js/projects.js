(function() {
  var projectsData = [];

  function getIcon(type) {
    var icons = {
      github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
      demo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
    };
    return icons[type] || '';
  }

  function getInitials(title) {
    return title.charAt(0);
  }

  function renderProjectCard(project) {
    var isFeatured = project.featured;
    var initial = getInitials(project.title);
    var imageHtml = '';

    if (project.image) {
      imageHtml = '<img class="project-card__image" src="' + project.image + '" alt="' + project.title + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=project-card__placeholder>' + initial + '</div>\'">';
    } else {
      imageHtml = '<div class="project-card__placeholder">' + initial + '</div>';
    }

    var overlayHtml = '';
    if (project.longDescription || project.links.demo || project.links.github) {
      var overlayLinks = '';
      if (project.links.demo) overlayLinks += '<a href="' + project.links.demo + '" class="project-card__overlay-link" target="_blank" rel="noopener">' + getIcon('demo') + ' Live Demo</a>';
      if (project.links.github) overlayLinks += '<a href="' + project.links.github + '" class="project-card__overlay-link" target="_blank" rel="noopener">' + getIcon('github') + ' Source</a>';

      overlayHtml = '<div class="project-card__overlay">' +
        (project.longDescription ? '<p class="project-card__overlay-desc">' + project.longDescription + '</p>' : '') +
        (overlayLinks ? '<div class="project-card__overlay-links">' + overlayLinks + '</div>' : '') +
      '</div>';
    }

    var featuredBadge = isFeatured ? '<span class="project-card__featured-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>Featured</span>' : '';

    var categoryAttr = project.tags.join(' ');

    return '<article class="project-card' + (isFeatured ? ' project-card--featured' : '') + '" data-category="' + categoryAttr + '">' +
      '<div class="project-card__image-wrap">' +
        imageHtml +
        overlayHtml +
        featuredBadge +
      '</div>' +
      '<div class="project-card__body">' +
        '<div class="project-card__tags">' +
          project.tags.map(function(tag) {
            return '<span class="project-card__tag">' + tag + '</span>';
          }).join('') +
        '</div>' +
        '<h3 class="project-card__title">' + project.title + '</h3>' +
        '<p class="project-card__description">' + project.description + '</p>' +
        '<div class="project-card__links">' +
          (project.links.demo ? '<a href="' + project.links.demo + '" class="project-card__link" target="_blank" rel="noopener noreferrer">' + getIcon('demo') + ' Live Demo</a>' : '') +
          (project.links.github ? '<a href="' + project.links.github + '" class="project-card__link" target="_blank" rel="noopener noreferrer">' + getIcon('github') + ' Source</a>' : '') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderProjects(projects) {
    var container = document.getElementById('projects-grid');
    if (!container) return;
    container.innerHTML = projects.map(renderProjectCard).join('');
  }

  function initFilters() {
    var filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons.length) return;

    filterButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterButtons.forEach(function(b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('is-active');
        this.setAttribute('aria-pressed', 'true');

        var filter = this.getAttribute('data-filter');
        var cards = document.querySelectorAll('.project-card');

        cards.forEach(function(card) {
          if (filter === 'all') {
            card.classList.remove('is-hidden');
            card.style.position = '';
            card.style.visibility = '';
          } else {
            var categories = card.getAttribute('data-category') || '';
            if (categories.indexOf(filter) !== -1) {
              card.classList.remove('is-hidden');
              card.style.position = '';
              card.style.visibility = '';
            } else {
              card.classList.add('is-hidden');
              card.style.position = 'absolute';
              card.style.visibility = 'hidden';
            }
          }
        });
      });
    });
  }

  function buildFilters(projects) {
    var filterContainer = document.getElementById('project-filters');
    if (!filterContainer) return;

    var tagSet = new Set();
    projects.forEach(function(p) {
      p.tags.forEach(function(t) { tagSet.add(t); });
    });

    var sortedTags = Array.from(tagSet).sort();

    var html = '<button class="filter-btn is-active" data-filter="all" aria-pressed="true">All</button>';
    sortedTags.forEach(function(tag) {
      html += '<button class="filter-btn" data-filter="' + tag + '" aria-pressed="false">' + tag + '</button>';
    });

    filterContainer.innerHTML = html;
    initFilters();
  }

  function init(projects) {
    projectsData = projects;
    if (!projectsData || !projectsData.length) return;
    buildFilters(projectsData);
    renderProjects(projectsData);
  }

  window.ProjectRenderer = { init: init };
})();
