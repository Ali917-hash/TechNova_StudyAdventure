/* Mobile Menu Toggle */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when a link is clicked
    document.querySelectorAll('#nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.innerHTML = '☰';
      });
    });
  }
});

/* Intersection Observer for Scroll Animations */
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-active');
    }
  });
}, observerOptions);

// Animate cards, story sections, and value items on scroll
document.querySelectorAll('.card, .story-section, .value-item').forEach(el => {
  el.classList.add('reveal-hidden');
  observer.observe(el);
});