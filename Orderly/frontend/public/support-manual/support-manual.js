const chapters = [
  {
    href: '01-overview.html',
    title: 'Getting Started',
    icon: '🏠',
    sections: [
      'The Support Dashboard',
      'Pick Up Where You Left Off',
      'New Tickets and Assigned to Me',
      'Setting Your Status',
      'Team Presence',
    ],
  },
  {
    href: '02-tickets.html',
    title: 'Managing Tickets',
    icon: '🎫',
    sections: [
      'Browsing All Tickets',
      'Filtering by Status and Priority',
      'Submitting a Ticket',
    ],
  },
  {
    href: '03-ticket-detail.html',
    title: 'Working a Ticket',
    icon: '🔍',
    sections: [
      'Ticket Header and Metadata',
      'Description and Attachment',
      'Updating a Ticket',
      'Case Notes',
      'Progress Log',
      'Assignment History',
      'Downloading as Markdown',
    ],
  },
  {
    href: '04-accounts.html',
    title: 'User Accounts',
    icon: '👥',
    sections: [
      'The Accounts Dashboard',
      'Managing Accounts by Role',
      'Creating a New Account',
      'Editing an Account',
      'Deactivating and Reactivating',
      'Deleting an Account',
      'Deleted Accounts Log',
    ],
  },
  {
    href: '05-team-tools.html',
    title: 'Team and Tools',
    icon: '🛠️',
    sections: [
      'Support Team Roster',
      'Knowledge Base',
      'Announcements',
      'Backlog',
      'Feature Requests',
    ],
  },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebar   = document.querySelector('.sidebar');
  const container = document.querySelector('.container');
  if (!sidebar) return;

  const currentPage = window.location.pathname.split('/').pop();

  if (container) {
    container.querySelectorAll('h2, h3').forEach(h => {
      h.id = slugify(h.textContent);
    });
  }

  const brand = document.createElement('div');
  brand.className = 'sidebar-brand';

  const brandName = document.createElement('h1');
  brandName.className = 'sidebar-orderly-head';
  brandName.textContent = 'Orderly';

  const brandTagline = document.createElement('p');
  brandTagline.className = 'sidebar-orderly-tagline';
  brandTagline.innerHTML = 'Support&nbsp;Guide';

  brand.appendChild(brandName);
  brand.appendChild(brandTagline);
  sidebar.appendChild(brand);

  const chList = document.createElement('ul');
  chList.className = 'sidebar-chapters';

  chapters.forEach(ch => {
    const isCurrent = ch.href === currentPage;

    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = ch.href;
    if (isCurrent) a.classList.add('current-chapter');

    const arrow = document.createElement('span');
    arrow.className = 'ch-arrow';
    arrow.textContent = '▶';

    const icon = document.createElement('span');
    icon.className = 'ch-icon';
    icon.textContent = ch.icon;

    const title = document.createElement('span');
    title.className = 'ch-title';
    title.textContent = ch.title.toUpperCase();

    a.appendChild(arrow);
    a.appendChild(icon);
    a.appendChild(title);
    li.appendChild(a);

    if (ch.sections.length > 0) {
      const secList = document.createElement('ul');
      secList.className = 'sidebar-sections';

      ch.sections.forEach(sec => {
        const slug = slugify(sec);
        const secLi = document.createElement('li');
        const secA  = document.createElement('a');
        secA.href = isCurrent ? '#' + slug : ch.href + '#' + slug;
        secA.textContent = sec;
        secLi.appendChild(secA);
        secList.appendChild(secLi);
      });

      li.appendChild(secList);
    }

    chList.appendChild(li);
  });

  sidebar.appendChild(chList);

  const backToTop = document.createElement('a');
  backToTop.href = '#';
  backToTop.className = 'sidebar-back-to-top';
  backToTop.textContent = '↑ Back to top';
  sidebar.appendChild(backToTop);

  if (!container) return;
  const headings = Array.from(container.querySelectorAll('h2'));
  if (headings.length === 0) return;

  function updateActiveLink() {
    const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20;
    let active = nearBottom
      ? headings[headings.length - 1]
      : headings[0];

    if (!nearBottom) {
      const threshold = window.scrollY + 160;
      for (const h of headings) {
        const absTop = h.getBoundingClientRect().top + window.scrollY;
        if (absTop <= threshold) active = h;
      }
    }

    chList.querySelectorAll('.sidebar-sections a').forEach(a => a.classList.remove('active'));
    const link = chList.querySelector(`.sidebar-sections a[href="#${active.id}"]`);
    if (link) link.classList.add('active');
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  const overlay = document.createElement('div');
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });
});
