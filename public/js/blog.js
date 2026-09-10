// Trimmed site-wide script: mobile menu, smooth scroll, reveal, counters, stats
document.addEventListener('DOMContentLoaded', () => {
  // MOBILE MENU (guarded)
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
    });

      document.querySelectorAll('#nav-links a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          menuBtn.innerHTML = '☰';
        });
      });
    }
  });
