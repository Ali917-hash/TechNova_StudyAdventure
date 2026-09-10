// /* Mobile Menu Toggle */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    // 1. Toggle Menu on Button Click
    menuBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Stop any default button behavior
      navLinks.classList.toggle('active');
      
      // Optional: Change icon from ☰ to X
      if (navLinks.classList.contains('active')) {
          menuBtn.innerHTML = '✕'; // Show X
      } else {
          menuBtn.innerHTML = '&#9776;'; // Show Hamburger
      }
    });

    // 2. Close menu when a link is clicked (Good UX)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.innerHTML = '&#9776;'; // Reset icon to Hamburger
      });
    });
  }

  /* Scroll Reveal Animation (Kept from your original code) */
  const cards = document.querySelectorAll('.project-card, .story-card');
  const observerOptions = { threshold: 0.1 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
  });
});