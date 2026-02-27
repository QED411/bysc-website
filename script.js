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

  // ---- Photo Upload ----
  const photoInput = document.getElementById('photoInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadPrompt = document.getElementById('uploadPrompt');
  const uploadPreview = document.getElementById('uploadPreview');
  const previewImages = document.getElementById('previewImages');
  const cancelUploadBtn = document.getElementById('cancelUploadBtn');
  const postPhotoBtn = document.getElementById('postPhotoBtn');
  const photoCaption = document.getElementById('photoCaption');
  const photoAuthor = document.getElementById('photoAuthor');
  const photoFeed = document.getElementById('photoFeed');
  const photoUploadArea = document.getElementById('photoUploadArea');

  let selectedFiles = [];

  uploadBtn.addEventListener('click', () => photoInput.click());

  photoInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) showPreview();
  });

  // Drag & drop
  photoUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    photoUploadArea.classList.add('drag-over');
  });

  photoUploadArea.addEventListener('dragleave', () => {
    photoUploadArea.classList.remove('drag-over');
  });

  photoUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    photoUploadArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      selectedFiles = files;
      showPreview();
    }
  });

  function showPreview() {
    previewImages.innerHTML = '';
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        previewImages.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
    uploadPrompt.hidden = true;
    uploadPreview.hidden = false;
  }

  cancelUploadBtn.addEventListener('click', resetUpload);

  function resetUpload() {
    selectedFiles = [];
    photoInput.value = '';
    previewImages.innerHTML = '';
    photoCaption.value = '';
    photoAuthor.value = '';
    uploadPreview.hidden = true;
    uploadPrompt.hidden = false;
  }

  postPhotoBtn.addEventListener('click', () => {
    if (selectedFiles.length === 0) return;

    const caption = photoCaption.value.trim() || 'Go Briarcliff!';
    const author = photoAuthor.value.trim() || 'BYSC Parent';
    const initials = author.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const post = createPhotoPost(e.target.result, caption, author, initials);
        photoFeed.insertBefore(post, photoFeed.firstChild);
        post.style.animation = 'fadeInUp 0.4s ease';
      };
      reader.readAsDataURL(file);
    });

    resetUpload();
    showToast('Photo posted to the community feed!');
  });

  function createPhotoPost(imageSrc, caption, author, initials) {
    const post = document.createElement('div');
    post.className = 'photo-post';

    const avatarColors = ['#244d82', '#1b3a66', '#e06d2e', '#0b1a2e', '#2e6399'];
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    post.innerHTML = `
      <div class="post-header">
        <div class="post-avatar" style="background: ${color}">${initials}</div>
        <div class="post-meta">
          <strong>${escapeHtml(author)}</strong>
          <span>Just now</span>
        </div>
      </div>
      <div class="post-image">
        <img src="${imageSrc}" alt="Community photo">
      </div>
      <div class="post-caption">
        <p><strong>${escapeHtml(author)}</strong> ${escapeHtml(caption)}</p>
      </div>
      <div class="post-actions">
        <button class="post-action-btn" onclick="this.classList.toggle('liked')">
          <i class="fas fa-heart"></i> <span>0</span>
        </button>
        <button class="post-action-btn">
          <i class="fas fa-comment"></i> <span>0</span>
        </button>
        <button class="post-action-btn">
          <i class="fas fa-share"></i> Share
        </button>
      </div>
    `;

    return post;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Subscribe Form ----
  const subscribeForm = document.getElementById('subscribeForm');
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thanks for subscribing! You\'ll receive updates soon.');
    subscribeForm.reset();
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
      '.quick-link-card, .program-card, .feed-card, .gear-item, .field-card, .accordion-item, .faq-column-title'
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
  .quick-link-card,
  .program-card,
  .feed-card,
  .gear-item,
  .field-card,
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
