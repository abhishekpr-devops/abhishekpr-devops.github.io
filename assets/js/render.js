/* Renders content.json into the page. No hardcoded content in HTML. */
(async function () {
  let data;
  try {
    const res = await fetch('content.json?v=' + Date.now());
    data = await res.json();
  } catch (e) {
    console.error('Failed to load content.json', e);
    return;
  }

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  document.title = data.seo.title;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) descMeta.setAttribute('content', data.seo.description);

  const nameEl = $('#heroName');
  if (nameEl) nameEl.textContent = data.identity.name;

  const roleEl = $('#heroRole');
  if (roleEl) {
    roleEl.innerHTML = data.identity.role.replace(
      data.identity.roleHighlight,
      `<span class="hl">${esc(data.identity.roleHighlight)}</span>`
    );
    roleEl.dataset.text = data.identity.role;
  }

  const taglineEl = $('#heroTagline');
  if (taglineEl) taglineEl.textContent = data.identity.tagline;

  const currentlyEl = $('#currently');
  if (currentlyEl) currentlyEl.textContent = data.identity.currently;

  const introText = $('#scrambleParagraph');
  if (introText) {
    introText.textContent = data.intro || '';
    introText.setAttribute('data-scramble', data.intro || '');
  }

  const ctaResume = $('#ctaResume');
  if (ctaResume) ctaResume.href = data.identity.resumePage;

  const ctaGithub = $('#ctaGithub');
  if (ctaGithub) ctaGithub.href = data.identity.github;

  const ctaLinkedin = $('#ctaLinkedin');
  if (ctaLinkedin) ctaLinkedin.href = data.identity.linkedin;

  const aboutText = $('#aboutText');
  if (aboutText) aboutText.innerHTML = data.about;

  const skillsGrid = $('#skillsGrid');
  if (skillsGrid) {
    skillsGrid.innerHTML = data.skills.map(group => `
      <div class="skill-card">
        <h3>${esc(group.category)}</h3>
        <div class="skill-tags">
          ${group.items.map(i => `<span class="tag">${esc(i)}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  const projectsList = $('#projectsList');
  if (projectsList) {
    projectsList.innerHTML = data.projects.map(p => `
      <article class="project-card">
        <div class="project-head">
          <h3 class="project-title">${esc(p.title)}</h3>
          <span class="project-status">✓ ${esc(p.status)}</span>
        </div>
        <p class="project-desc">${esc(p.description)}</p>
        <ul class="project-features">
          ${p.features.map(f => `<li>${esc(f)}</li>`).join('')}
        </ul>
        ${p.takeaway ? `<p class="project-lesson"><strong>Key takeaway:</strong> ${esc(p.takeaway)}</p>` : ''}
        <div class="project-footer">
          <div class="stack-tags">
            ${p.stack.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
          </div>
          <a class="project-link" href="${esc(p.repo)}" target="_blank" rel="noopener">View Repo →</a>
        </div>
      </article>
    `).join('');
  }

  const educationList = $('#educationList');
  if (educationList) {
    educationList.innerHTML = data.education.map(e => `
      <div class="info-item">
        <div class="title">${esc(e.degree)}</div>
        <div class="meta">${esc(e.institution)}<br>${esc(e.years)}</div>
      </div>
    `).join('');
  }

  const certsList = $('#certsList');
  if (certsList) {
    certsList.innerHTML = data.certifications.map(c => `
      <div class="info-item">
        <div class="title">${esc(c.name)}</div>
        <div class="meta">${esc(c.issuer)} · ${esc(c.year)}</div>
      </div>
    `).join('');
  }

  const contactHeading = $('#contactHeading');
  if (contactHeading) contactHeading.textContent = data.contact.heading;

  const contactMessage = $('#contactMessage');
  if (contactMessage) contactMessage.textContent = data.contact.message;

  const contactEmail = $('#contactEmail');
  if (contactEmail) {
    contactEmail.href = 'mailto:' + data.identity.email;
    contactEmail.textContent = '✉ ' + data.identity.email;
  }

  const contactLinkedin = $('#contactLinkedin');
  if (contactLinkedin) contactLinkedin.href = data.identity.linkedin;

  const contactGithub = $('#contactGithub');
  if (contactGithub) contactGithub.href = data.identity.github;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  window.dispatchEvent(new Event('content-ready'));
})();
