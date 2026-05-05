const chapters = [
  {
    href: '01-introduction.html',
    title: 'Introduction',
    icon: 'ℹ️',
    sections: [
      'What is Orderly',
      'Who This Manual is For',
    ],
  },
  {
    href: '02-getting-started.html',
    title: 'Getting Started',
    icon: '🚀',
    sections: [
      'Receiving Your Credentials',
      'Logging In',
      'The Admin Dashboard',
      'Navigation Layout',
    ],
  },
  {
    href: '03-settings.html',
    title: 'Settings',
    icon: '⚙️',
    sections: [
      'Business Information',
      'Storefront Appearance',
      'Your Account',
    ],
  },
  {
    href: '04-suppliers.html',
    title: 'Suppliers',
    icon: '🤝',
    sections: [
      'Viewing the Supplier Directory',
      'Adding a Supplier',
      'Editing a Supplier',
      'Assigning Suppliers to Inventory Items',
    ],
  },
  {
    href: '05-categories.html',
    title: 'Categories',
    icon: '🗂️',
    sections: [
      'Creating a Category',
      'Editing a Category',
      'Assigning Products to Categories',
      'Deleting a Category',
    ],
  },
  {
    href: '06-catalog.html',
    title: 'Product Catalog',
    icon: '📦',
    sections: [
      'Browsing the Catalog',
      'Adding a New Product',
      'Editing a Product',
      'Variants and SKUs',
      'Modifier Groups and Options',
      'Deleting a Product',
    ],
  },
  {
    href: '07-inventory.html',
    title: 'Inventory',
    icon: '🏪',
    sections: [
      'Viewing Inventory Levels',
      'Stock Quantities and Reorder Levels',
      'The Low-Stock Alert View',
      'Linking Inventory Items to Products',
    ],
  },
  {
    href: '08-reports.html',
    title: 'Reports',
    icon: '📈',
    sections: [
      'The Reports Dashboard',
      'Sales Summary',
      'Product Performance',
      'Filtering by Date Range',
    ],
  },
  {
    href: '09-exporting.html',
    title: 'Exporting Data',
    icon: '📤',
    sections: [
      'Exporting Orders to CSV',
      'Exporting Products to CSV',
      'Exporting Inventory to CSV',
    ],
  },
  {
    href: '10-support.html',
    title: 'Support',
    icon: '🆘',
    sections: [],
    description: 'Information on getting support and contacting Orderly.',
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

  // Assign ids to headings on the current page
  if (container) {
    container.querySelectorAll('h2, h3').forEach(h => {
      h.id = slugify(h.textContent);
    });
  }

  // Brand logo
  const brand = document.createElement('div');
  brand.className = 'sidebar-brand';

  const brandName = document.createElement('h1');
  brandName.className = 'sidebar-orderly-head';
  brandName.textContent = 'Orderly';

  const brandTagline = document.createElement('p');
  brandTagline.className = 'sidebar-orderly-tagline';
  brandTagline.innerHTML = 'User&nbsp;Manual';

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

    // Section links always visible
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
    } else if (ch.description) {
      const desc = document.createElement('p');
      desc.className = 'sidebar-chapter-desc';
      desc.textContent = ch.description;
      li.appendChild(desc);
    }

    chList.appendChild(li);
  });

  sidebar.appendChild(chList);

  const backToTop = document.createElement('a');
  backToTop.href = '#';
  backToTop.className = 'sidebar-back-to-top';
  backToTop.textContent = '↑ Back to top';
  sidebar.appendChild(backToTop);

  // Highlight active section on scroll (current page only)
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

  // Lightbox
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
