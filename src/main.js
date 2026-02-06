import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // --- Scroll Reveal Animation with Stagger ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add staggered delay for smoother reveals
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 50);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = window.innerWidth <= 768 ? 80 : 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Header Background on Scroll ---
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
      } else {
        header.style.background = 'rgba(255, 255, 255, 0.7)';
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      }
    });
  }

  // --- 3D Tilt Effect for Service Cards ---
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // --- Feature Items Hover Effect ---
  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-5px) scale(1.02)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0) scale(1)';
    });
  });

  // --- Tracking Input Logic ---
  const trackBtn = document.getElementById('hero-track-btn');
  const trackInput = document.getElementById('hero-track-input');
  const resultContainer = document.getElementById('tracking-result');

  if (trackBtn && trackInput) {
    trackBtn.addEventListener('click', () => {
      handleTracking();
    });

    trackInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleTracking();
      }
    });

    // Add focus effects
    trackInput.addEventListener('focus', () => {
      trackInput.parentElement.style.boxShadow = '0 16px 48px rgba(0, 58, 143, 0.15)';
    });

    trackInput.addEventListener('blur', () => {
      trackInput.parentElement.style.boxShadow = '';
    });
  }

  async function handleTracking() {
    const trackingId = trackInput.value.trim();
    if (!trackingId) {
      trackInput.focus();
      return;
    }

    if (!resultContainer) return;

    // UI Reset
    trackBtn.disabled = true;
    trackBtn.textContent = 'Loading...';
    resultContainer.classList.add('active');
    resultContainer.innerHTML = '<div class="loader"></div>';

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracking_id: trackingId })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      updateTrackingUI(data);

    } catch (error) {
      console.error(error);
      resultContainer.innerHTML = `
        <div class="tracking-error">
          Unable to fetch details.<br>
          <span style="font-size: 0.85rem; font-weight: 400;">Please check the ID or try again later.</span>
        </div>`;
    } finally {
      trackBtn.disabled = false;
      trackBtn.textContent = 'Track';
    }
  }

  function updateTrackingUI(data) {
    if (!data || !data.status) {
      resultContainer.innerHTML = `<div class="tracking-error">No status found for this ID.</div>`;
      return;
    }

    const { status, latest_event } = data;
    const activity = latest_event?.activity || status;
    const location = latest_event?.location || '';
    const timestamp = latest_event?.timestamp || '';

    resultContainer.innerHTML = `
      <div>
        <span class="tracking-status-badge">${status}</span>
        <div class="tracking-event">
          <div class="tracking-location">${activity}</div>
          ${location ? `<div style="font-size: 0.95rem; margin-bottom: 4px; color: #475569;">${location}</div>` : ''}
          ${timestamp ? `<div class="tracking-event-time">${timestamp}</div>` : ''}
        </div>
      </div>
    `;
  }

  // --- FAQ Accordion Logic ---
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentNode;

      // Close other items with animation
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
    });
  });

  // --- Active Navigation Highlighting ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav);

  // --- Update Year ---
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- WhatsApp FAB Pulse Animation ---
  const whatsappFab = document.querySelector('.whatsapp-fab');
  if (whatsappFab) {
    setInterval(() => {
      const circle = whatsappFab.querySelector('.fab-circle');
      if (circle) {
        circle.style.transform = 'scale(1.1)';
        setTimeout(() => {
          circle.style.transform = 'scale(1)';
        }, 200);
      }
    }, 3000);
  }
});
