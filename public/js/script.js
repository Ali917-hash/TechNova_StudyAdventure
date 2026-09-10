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

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // SCROLL REVEAL
  function reveal() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add('active');
    });
  }
  window.addEventListener('scroll', reveal);
  reveal();

  // SIMPLE COUNTERS
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    if (!counter.dataset.target) return;
    let update = () => {
      const target = +counter.dataset.target;
      const value = +counter.innerText || 0;
      const step = Math.max(1, Math.ceil(target / 40));
      if (value < target) {
        counter.innerText = value + step;
        setTimeout(update, 40);
      } else {
        counter.innerText = target;
      }
    };
    update();
  });

  // STATS BAR (animate when visible)
  const stats = document.querySelectorAll('.stat-number');
  if (stats.length) {
    const speed = 200;
    const animateCount = (el) => {
      const target = +el.getAttribute('data-target');
      const count = +el.innerText.replace(/[^0-9]/g, '') || 0;
      const inc = Math.max(1, target / speed);
      if (count < target) {
        el.innerText = Math.ceil(count + inc);
        setTimeout(() => animateCount(el), 1);
      } else {
        if (target === 10000) el.innerText = '10k+';
        else if (target === 95) el.innerText = '95%';
        else el.innerText = target + '+';
      }
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 1.0 });

    stats.forEach(stat => observer.observe(stat));
  }

});