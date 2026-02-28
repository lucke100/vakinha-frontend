/* ===== VAKINHA CLONE - SCRIPT.JS ===== */

// ==================== FAQ TOGGLE (global) ====================
function toggleFaq(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const isOpen = item.classList.toggle('open');
  // Close other items
  document.querySelectorAll('.faq-item').forEach(function (el) {
    if (el !== item) el.classList.remove('open');
  });
}


document.addEventListener('DOMContentLoaded', function () {

  // ==================== HAMBURGER MENU ====================
  const hamburgerBtn = document.getElementById('btn-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });
    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburgerBtn.classList.remove('open');
      }
    });
  }

  // ==================== DROPDOWNS ====================
  const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
  dropdownItems.forEach(function (item) {
    const btn = item.querySelector('.nav-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const wasOpen = item.classList.contains('open');
      // Close all dropdowns
      dropdownItems.forEach(d => d.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
  document.addEventListener('click', function () {
    dropdownItems.forEach(d => d.classList.remove('open'));
  });

  // ==================== TABS ====================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const content = document.getElementById('tab-content-' + target);
      if (content) content.classList.add('active');
    });
  });

  // ==================== SHARE MODAL ====================
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('btn-modal-close');

  function openShareModal() {
    if (modalOverlay) {
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeShareModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    const copyFeedback = document.getElementById('copy-feedback');
    if (copyFeedback) copyFeedback.style.display = 'none';
  }

  // Share button triggers
  const shareButtons = [
    document.getElementById('btn-compartilhar'),
    document.getElementById('btn-compartilhar-mobile'),
    document.getElementById('mobile-bottom-compartilhar'),
  ];
  shareButtons.forEach(function (btn) {
    if (btn) btn.addEventListener('click', openShareModal);
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeShareModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeShareModal();
    });
  }

  // Escape key to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeShareModal();
  });

  // ==================== COPY LINK IN MODAL ====================
  const shareCopyLink = document.getElementById('share-copy-link');
  const copyFeedback = document.getElementById('copy-feedback');

  if (shareCopyLink) {
    shareCopyLink.addEventListener('click', function () {
      const url = 'https://www.vakinha.com.br/vaquinha/ajuda-humanitaria-zona-da-mata-mg';
      copyToClipboard(url, function () {
        if (copyFeedback) {
          copyFeedback.style.display = 'block';
          setTimeout(() => { copyFeedback.style.display = 'none'; }, 3000);
        }
      });
    });
  }

  // ==================== COPY PIX KEY ====================
  const pixKey = '5971177@vakinha.com.br';

  const pixCopyBtns = [
    document.getElementById('btn-copiar-pix-top'),
    document.getElementById('btn-copiar-pix-card'),
  ];
  pixCopyBtns.forEach(function (btn) {
    if (btn) {
      btn.addEventListener('click', function () {
        copyToClipboard(pixKey, function () {
          showToast('Chave PIX copiada!');
        });
      });
    }
  });

  // ==================== HEART BUTTONS ====================
  // Image heart button
  const imgHeartBtn = document.getElementById('btn-heart-image');
  if (imgHeartBtn) {
    imgHeartBtn.addEventListener('click', function () {
      imgHeartBtn.classList.toggle('liked');
      showToast(imgHeartBtn.classList.contains('liked') ? 'Você curtiu esta vaquinha! ♥' : 'Curtida removida');
    });
  }

  // Campaign card heart buttons
  const heartBtns = document.querySelectorAll('.card-heart-btn');
  heartBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      btn.classList.toggle('liked');
    });
  });

  // Campaign cards click (navigate)
  const campaignCards = document.querySelectorAll('.campaign-card');
  campaignCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.card-heart-btn')) return;
      // Navigate to vakinha main site
      window.open('https://www.vakinha.com.br/vaquinhas/explore', '_blank');
    });
  });

  // ==================== ANIMATE PROGRESS BARS ====================
  function animateProgressBars() {
    document.querySelectorAll('.progress-bar, .card-bar').forEach(function (bar) {
      const targetWidth = bar.style.width;
      bar.style.width = '0%';
      setTimeout(function () {
        bar.style.width = targetWidth;
      }, 300);
    });
  }
  animateProgressBars();

  // ==================== COUNTER ANIMATION ====================
  function animateCounter(el, target) {
    if (!el) return;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;
    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString('pt-BR');
    }, step);
  }

  // Animate stats
  setTimeout(function () {
    animateCounter(document.getElementById('stat-coracoes'), 35606);
    animateCounter(document.getElementById('stat-apoiadores'), 46167);
    animateCounter(document.getElementById('stat-coracoes-mobile'), 35962);
    animateCounter(document.getElementById('stat-apoiadores-mobile'), 46613);
  }, 400);

  // ==================== VER TUDO LINK ====================
  const verTudoLink = document.getElementById('link-ver-tudo');
  if (verTudoLink) {
    verTudoLink.addEventListener('click', function (e) {
      e.preventDefault();
      const sobreTab = document.getElementById('tab-sobre');
      if (sobreTab) sobreTab.click();
      const sobreContent = document.getElementById('sobre-content');
      if (sobreContent) {
        sobreContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ==================== VER SELOS LINK ====================
  const verSelosLink = document.getElementById('link-ver-selos');
  if (verSelosLink) {
    verSelosLink.addEventListener('click', function (e) {
      e.preventDefault();
      const selosTab = document.getElementById('tab-selos');
      if (selosTab) {
        selosTab.click();
        selosTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ==================== STICKY HEADER SHADOW ====================
  const header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    if (header) {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
      } else {
        header.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
      }
    }
  });

  // ==================== SEARCH BTN ====================


  // ==================== HELPERS ====================
  function copyToClipboard(text, callback) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        if (callback) callback();
      }).catch(function () {
        fallbackCopy(text, callback);
      });
    } else {
      fallbackCopy(text, callback);
    }
  }

  function fallbackCopy(text, callback) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {
      console.error('Copy failed', e);
    }
    document.body.removeChild(ta);
  }

  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3000);
  }

  // ==================== CAMPAIGN CARD IMAGES FALLBACK ====================
  // Generate colored placeholder images if images are missing
  const cardImages = [
    { id: 'card-img-1', bg: '#1a6932', text: 'SOS\nMINAS', textColor: '#fff' },
    { id: 'card-img-2', bg: '#00695c', text: 'SOS\nUBÁ', textColor: '#fff' },
    { id: 'card-img-3', bg: '#795548', text: 'AJUDA\nROGÉRIA', textColor: '#fff' },
    { id: 'card-img-4', bg: '#37474f', text: 'FLÁVIO\nJUNINHO', textColor: '#fff' },
  ];

  cardImages.forEach(function (item) {
    const img = document.getElementById(item.id);
    if (!img) return;
    img.addEventListener('error', function () {
      // Replace with SVG canvas
      const parent = img.parentElement;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', '0 0 320 200');
      svg.style.cssText = 'position:absolute;inset:0;display:block;';
      svg.innerHTML = `
        <rect width="320" height="200" fill="${item.bg}"/>
        <text x="160" y="95" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="22" fill="${item.textColor}">${item.text.split('\n')[0]}</text>
        <text x="160" y="122" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="22" fill="${item.textColor}">${item.text.split('\n')[1] || ''}</text>
      `;
      parent.style.position = 'relative';
      parent.style.backgroundColor = item.bg;
      img.style.display = 'none';
      parent.appendChild(svg);
    });

    // Trigger error handler if src invalid
    if (img.complete && img.naturalHeight === 0) {
      img.dispatchEvent(new Event('error'));
    }
  });

  // Campaign hero image fallback
  const heroImg = document.getElementById('campaign-image');
  if (heroImg) {
    heroImg.addEventListener('error', function () {
      const parent = heroImg.parentElement;
      parent.style.background = 'linear-gradient(135deg, #5d4037 0%, #3e2723 50%, #1a237e 100%)';
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;text-align:center;padding:20px;';
      overlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" style="margin-bottom:12px"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p style="font-size:14px;opacity:0.7;font-family:Nunito,sans-serif;line-height:1.4">Zona da Mata - MG<br>Chuvas / Emergência</p>';
      heroImg.style.display = 'none';
      parent.appendChild(overlay);
    });
    if (heroImg.complete && heroImg.naturalHeight === 0) {
      heroImg.dispatchEvent(new Event('error'));
    }
  }


  // ==================== BARRA DE PESQUISA INLINE ====================
  const searchOverlay = document.getElementById('search-bar-overlay');
  const searchInput = document.getElementById('search-bar-input');
  const searchCloseBtn = document.getElementById('search-bar-close');
  const searchLupaMobile = document.getElementById('btn-buscar-mobile');
  const searchLupaDesk = document.getElementById('btn-buscar-header');

  // Backdrop semitransparente
  let backdrop = document.getElementById('search-backdrop');
  if (!backdrop && searchOverlay) {
    backdrop = document.createElement('div');
    backdrop.id = 'search-backdrop';
    backdrop.className = 'search-overlay-backdrop';
    document.body.appendChild(backdrop);
  }

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('visible');
    if (searchLupaMobile) searchLupaMobile.classList.add('active');
    // Fecha menu hamburger se estiver aberto
    if (mobileMenu) mobileMenu.classList.remove('open');
    setTimeout(function () {
      if (searchInput) searchInput.focus();
    }, 150);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('visible');
    if (searchLupaMobile) searchLupaMobile.classList.remove('active');
    if (searchInput) searchInput.value = '';
  }

  // Abre ao clicar na lupa mobile
  if (searchLupaMobile) {
    searchLupaMobile.addEventListener('click', function (e) {
      e.stopPropagation();
      if (searchOverlay && searchOverlay.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    });
  }

  // Abre ao clicar na lupa desktop
  if (searchLupaDesk) {
    searchLupaDesk.addEventListener('click', function (e) {
      e.stopPropagation();
      if (searchOverlay && searchOverlay.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    });
  }

  // Fecha ao clicar no X
  if (searchCloseBtn) {
    searchCloseBtn.addEventListener('click', function () { closeSearch(); });
  }

  // Fecha ao clicar no backdrop
  if (backdrop) {
    backdrop.addEventListener('click', function () { closeSearch(); });
  }

  // Tecla Esc fecha; Enter redireciona
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSearch();
      } else if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = 'https://www.vakinha.com.br/vaquinhas?q=' + encodeURIComponent(query);
        }
      }
    });
  }

  console.log('Vakinha Clone - Loaded successfully');
});
