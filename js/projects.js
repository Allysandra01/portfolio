const ProjectRenderer = {
  icon: {
    external:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    repo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
  },

  renderCard(project) {
    const imageContent = project.image
      ? `<img src="${project.image}" alt="${project.title}" loading="lazy">`
      : `<div class="project-card__image--placeholder" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:rgba(255,255,255,0.4);">${project.title.charAt(0)}</div>`;

    return `
      <article class="project-card" role="listitem" data-tags="${project.tags.join(',')}">
        <div class="project-card__image">
          ${imageContent}
          ${project.featured ? '<span class="project-card__badge">Featured</span>' : ''}
        </div>
        <div class="project-card__body">
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__desc">${project.description}</p>
          <div class="project-card__tags">
            ${project.tags.map((tag) => `<span class="tech-badge">${tag}</span>`).join('')}
          </div>
          <div class="project-card__links">
            ${project.liveUrl ? `<a href="${project.liveUrl}" class="project-card__link" target="_blank" rel="noopener">Live Demo ${this.icon.external}</a>` : ''}
            ${project.repoUrl ? `<a href="${project.repoUrl}" class="project-card__link" target="_blank" rel="noopener">Source ${this.icon.repo}</a>` : ''}
          </div>
        </div>
      </article>`;
  },

  buildFilters(projects, container) {
    const allTags = [...new Set(projects.flatMap((p) => p.tags))].sort();
    container.innerHTML =
      `<button class="filter-btn" aria-pressed="true">All</button>` +
      allTags
        .map((tag) => `<button class="filter-btn" aria-pressed="false">${tag}</button>`)
        .join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      container
        .querySelectorAll('.filter-btn')
        .forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.textContent;
      document.querySelectorAll('.project-card').forEach((card) => {
        const tags = card.dataset.tags;
        const show = filter === 'All' || tags.includes(filter);
        card.style.display = show ? '' : 'none';
      });
    });
  },
};

window.ProjectRenderer = ProjectRenderer;
