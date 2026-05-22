document.addEventListener('DOMContentLoaded', () => {
  const sidebar   = document.querySelector('.sidebar');
  const container = document.querySelector('.container');
  if (!sidebar || !container) return;

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  const headings = Array.from(container.querySelectorAll('h2'));
  headings.forEach(h => { h.id = slugify(h.textContent); });

  // Brand
  const brand = document.createElement('div');
  brand.className = 'sidebar-brand';
  const brandName = document.createElement('h1');
  brandName.className = 'sidebar-orderly-head';
  brandName.textContent = 'Orderly';
  const brandTagline = document.createElement('p');
  brandTagline.className = 'sidebar-orderly-tagline';
  brandTagline.innerHTML = 'Support Team<br>Manual';
  brand.appendChild(brandName);
  brand.appendChild(brandTagline);
  sidebar.appendChild(brand);

  // TOC
  const chList = document.createElement('ul');
  chList.className = 'sidebar-chapters';

  headings.forEach(h => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href   = '#' + h.id;

    const arrow = document.createElement('span');
    arrow.className   = 'ch-arrow';
    arrow.textContent = '▶';

    const icon = document.createElement('span');
    icon.className   = 'ch-icon';
    icon.textContent = h.dataset.icon || '';

    const title = document.createElement('span');
    title.className   = 'ch-title';
    title.textContent = h.textContent.toUpperCase();

    a.appendChild(arrow);
    a.appendChild(icon);
    a.appendChild(title);
    li.appendChild(a);
    chList.appendChild(li);
  });

  sidebar.appendChild(chList);

  const backToTop = document.createElement('a');
  backToTop.href      = '#';
  backToTop.className = 'sidebar-back-to-top';
  backToTop.textContent = '↑ Back to top';
  sidebar.appendChild(backToTop);

  // Scroll highlight
  function updateActive() {
    const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20;
    let active = nearBottom ? headings[headings.length - 1] : headings[0];
    if (!nearBottom) {
      const threshold = window.scrollY + 160;
      for (const h of headings) {
        if (h.getBoundingClientRect().top + window.scrollY <= threshold) active = h;
      }
    }
    chList.querySelectorAll('a').forEach(a => a.classList.remove('current-chapter'));
    const link = chList.querySelector(`a[href="#${active.id}"]`);
    if (link) link.classList.add('current-chapter');
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // Lightbox
  const overlay    = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  const lightboxImg = document.createElement('img');
  overlay.appendChild(lightboxImg);
  document.body.appendChild(overlay);

  document.querySelectorAll('.img-wrap img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      overlay.classList.add('open');
    });
  });

  overlay.addEventListener('click', () => overlay.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('open'); });
});
