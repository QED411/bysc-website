/* ============================================
   BYSC - Briarcliff Youth Soccer Club
   Site JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Sticky Navbar Shadow ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // ---- Mobile Nav Toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });

  // ---- FAQ Accordion ----
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isActive = item.classList.contains('active');

      item.closest('.accordion').querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.accordion-body').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ---- Toast Notifications ----
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ---- Scroll-triggered Animations ----
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(
      '.program-card, .feed-card, .accordion-item, .faq-column-title'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = `${index * 0.05}s`;
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  };

  animateOnScroll();

  // ---- Duplicate ticker for seamless loop ----
  const ticker = document.querySelector('.ticker');
  if (ticker) {
    ticker.innerHTML += ticker.innerHTML;
  }
});

/* ---- CSS for fade-in animation (injected) ---- */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-in {
    animation: fadeInUp 0.5s ease forwards;
  }
  .program-card,
  .feed-card,
  .accordion-item,
  .faq-column-title {
    opacity: 0;
    transform: translateY(20px);
  }
  .animate-in {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
