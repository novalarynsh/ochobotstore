/* =============================================
   IoT STORE — JAVASCRIPT
   Handles: dark mode, nav, product filter,
   tabs, gallery, qty, cart toast, FAQ, forms
   ============================================= */

/* ─── DARK / LIGHT MODE ─── */
(function () {
  const saved = localStorage.getItem('iotstore-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
})();

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('iotstore-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('.theme-icon');
  icons.forEach(icon => {
    icon.textContent = theme === 'dark' ? '☀' : '🌙';
  });
}

/* ─── MOBILE NAV ─── */
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  nav.classList.toggle('open');
}

// Close mobile nav when a link is clicked
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });
});

/* ─── PRODUCT FILTER ─── */
function filterProducts(category, btn) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide cards
  const cards = document.querySelectorAll('.product-card');
  let visible = 0;
  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    const show = category === 'semua' || cat === category;
    if (show) {
      card.classList.remove('hidden');
      card.style.animation = 'none';
      requestAnimationFrame(() => {
        card.style.animation = 'fadeInUp 0.4s ease both';
      });
      visible++;
    } else {
      card.classList.add('hidden');
    }
  });
}

/* ─── PRODUCT DETAIL: TABS ─── */
function switchTab(id, btn) {
  // Deactivate all tabs
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  // Activate selected
  btn.classList.add('active');
  const panel = document.getElementById('tab-' + id);
  if (panel) {
    panel.classList.add('active');
    panel.style.animation = 'fadeInUp 0.3s ease';
  }
}

/* ─── PRODUCT DETAIL: IMAGE GALLERY ─── */
function changeImg(thumb) {
  const mainImg = document.getElementById('mainImg');
  if (!mainImg) return;

  mainImg.style.opacity = '0';
  setTimeout(() => {
    mainImg.src = thumb.src;
    mainImg.style.opacity = '1';
  }, 200);

  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

// Smooth opacity transition for main image
document.addEventListener('DOMContentLoaded', () => {
  const mainImg = document.getElementById('mainImg');
  if (mainImg) {
    mainImg.style.transition = 'opacity 0.2s ease';
  }
});

/* ─── CART & ORDERS STORAGE ─── */
function getCart() {
  return JSON.parse(localStorage.getItem('iotstore-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('iotstore-cart', JSON.stringify(cart));
}

function getOrders() {
  return JSON.parse(localStorage.getItem('iotstore-orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('iotstore-orders', JSON.stringify(orders));
}

function createOrder(productName, price, qty) {
  const orders = getOrders();
  const orderId = 'ORD' + Date.now().toString().slice(-6);
  const timestamp = new Date().toLocaleString('id-ID');
  const total = parseInt(price) * qty;
  
  const order = {
    id: orderId,
    date: timestamp,
    items: [{
      name: productName,
      price: parseInt(price),
      quantity: parseInt(qty)
    }],
    total: total
  };
  
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

/* ─── PRODUCT DETAIL: QUANTITY ─── */
function changeQty(delta) {
  const input = document.getElementById('qty');
  if (!input) return;
  const newVal = Math.max(1, Math.min(99, parseInt(input.value) + delta));
  input.value = newVal;
}

/* ─── PRODUCT DETAIL: ADD TO CART ─── */
function addToCart(btnEl) {
  const qtyInput = document.getElementById('qty');
  const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
  let productName = 'Produk';
  if (window.productData && window.productData.name) {
    productName = window.productData.name;
  } else {
    const detailTitle = document.querySelector('.detail-title');
    if (detailTitle && detailTitle.textContent) {
      productName = detailTitle.textContent;
    }
  }
  
  // Add to cart storage
  const cart = getCart();
  const cartItem = {
    name: productName,
    price: window.productData && window.productData.price ? window.productData.price : 0,
    quantity: qty
  };
  cart.push(cartItem);
  saveCart(cart);
  
  showToast(`✓ ${qty}x ${productName} ditambahkan ke keranjang!`, 'cartToast');

  // Animate button
  if (btnEl) {
    btnEl.textContent = '✓ Ditambahkan!';
    btnEl.style.background = '#00cc6a';
    setTimeout(() => {
      btnEl.innerHTML = '🛒 Tambah ke Keranjang';
      btnEl.style.background = '';
    }, 2000);
  }
}

function buyNow(btnEl) {
  const qtyInput = document.getElementById('qty');
  const qty = qtyInput ? Math.max(1, Math.min(99, parseInt(qtyInput.value, 10) || 1)) : 1;

  let productName = 'Produk';
  if (btnEl && btnEl.dataset && btnEl.dataset.product) {
    productName = btnEl.dataset.product;
  } else if (window.productData && window.productData.name) {
    productName = window.productData.name;
  } else {
    const detailTitle = document.querySelector('.detail-title');
    if (detailTitle && detailTitle.textContent) {
      productName = detailTitle.textContent.trim();
    }
  }

  let priceStr = '0';
  if (btnEl && btnEl.dataset && btnEl.dataset.price) {
    priceStr = btnEl.dataset.price;
  } else if (window.productData && window.productData.price) {
    priceStr = window.productData.price;
  } else {
    const detailPrice = document.querySelector('.detail-price');
    if (detailPrice && detailPrice.textContent) {
      priceStr = detailPrice.textContent;
    }
  }

  const price = parseInt(priceStr.toString().replace(/\D/g, ''), 10) || 0;

  if (price === 0) {
    showToast('❌ Data produk tidak lengkap!', 'cartToast');
    return;
  }

  const order = createOrder(productName, price, qty);
  showToast(`✅ Pesanan berhasil dibuat! Order ID: ${order.id} | Total: Rp ${order.total.toLocaleString('id-ID')}`, 'cartToast');

  if (btnEl) {
    const originalText = btnEl.innerHTML;
    btnEl.innerHTML = '✓ Pesanan Dibuat!';
    btnEl.style.background = '#00cc6a';
    btnEl.style.color = '#000';
    setTimeout(() => {
      btnEl.innerHTML = originalText;
      btnEl.style.background = '';
      btnEl.style.color = '';
    }, 3000);
  }

  if (qtyInput) qtyInput.value = 1;
}

/* ─── TOAST NOTIFICATION ─── */
function showToast(message, id) {
  let toast = document.getElementById(id || 'cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = id || 'cartToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ─── CONTACT FORM ─── */
function submitForm(event) {
  event.preventDefault();

  const btn = document.querySelector('#contactForm button[type="submit"]');
  const submitText = document.getElementById('submitText');

  // Loading state
  if (btn && submitText) {
    submitText.textContent = 'Mengirim...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }

  // Simulate sending
  setTimeout(() => {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';
    showToast('✓ Pesan berhasil terkirim!', 'formToast');
  }, 1500);
}

function resetForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn = document.querySelector('#contactForm button[type="submit"]');
  const submitText = document.getElementById('submitText');

  if (form) {
    form.reset();
    form.style.display = 'flex';
  }
  if (success) success.style.display = 'none';
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
  if (submitText) submitText.textContent = 'Kirim Pesan →';
}

/* ─── FAQ ACCORDION ─── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const arrow = btn.querySelector('.faq-arrow');
  const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';

  // Close all others
  document.querySelectorAll('.faq-item').forEach(i => {
    const a = i.querySelector('.faq-a');
    const ar = i.querySelector('.faq-arrow');
    a.style.maxHeight = '0px';
    if (ar) ar.style.transform = 'rotate(0deg)';
    i.style.borderColor = '';
  });

  // Toggle current
  if (!isOpen) {
    answer.style.maxHeight = answer.scrollHeight + 'px';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    item.style.borderColor = 'var(--accent)';
  }
}

/* ─── NEWSLETTER SUBSCRIBE ─── */
document.addEventListener('DOMContentLoaded', () => {
  const newsletterBtn = document.querySelector('.newsletter-form button');
  const newsletterInput = document.querySelector('.newsletter-form input');
  if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterInput.value.trim();
      if (!email || !email.includes('@')) {
        newsletterInput.style.borderColor = '#ff4444';
        setTimeout(() => newsletterInput.style.borderColor = '', 2000);
        return;
      }
      newsletterBtn.textContent = '✓ Terdaftar!';
      newsletterBtn.style.background = '#00cc6a';
      newsletterInput.value = '';
      setTimeout(() => {
        newsletterBtn.textContent = 'Subscribe';
        newsletterBtn.style.background = '';
      }, 3000);
    });
  }
});

/* ─── SCROLL REVEAL (Intersection Observer) ─── */
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll(
    '.feat-card, .product-card, .why-card, .value-card, .team-card, .story-stat, .vismis-card, .contact-card'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.5s ease both';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(t => {
    t.style.opacity = '0';
    observer.observe(t);
  });
});

/* ─── NAVBAR SCROLL SHADOW ─── */
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 32px rgba(0,0,0,0.4)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});
