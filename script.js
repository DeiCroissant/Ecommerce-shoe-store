// ==== CART CLIENT-SIDE ====
// --- SHOP PAGE: Add to cart ---
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let idx = cart.findIndex(item => item.id === product.id);
  if (idx > -1) {
    cart[idx].quantity += product.quantity;
  } else {
    cart.push(product);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert('Đã thêm vào giỏ hàng!');
}

// Gắn sự kiện cho nút giỏ hàng ở shop.html và các trang có .pro
function setupAddToCartButtons() {
  document.querySelectorAll('.fa-cart-plus, .fa-shopping-cart.cart, .ri-shopping-cart-line.cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      // Check login status
      let user = getUserInfo && getUserInfo();
      if (!user) {
        // Show login/register modal
        let modal = document.getElementById('login-modal');
        if (modal) modal.style.display = 'block';
        alert('Vui lòng đăng nhập hoặc đăng ký để thêm sản phẩm vào giỏ hàng!');
        return;
      }
      let pro = this.closest('.pro');
      if (!pro) return;
      let name = pro.querySelector('.desc h5') ? pro.querySelector('.desc h5').innerText : '';
      let price = pro.querySelector('.desc h4') ? parseFloat(pro.querySelector('.desc h4').innerText.replace(/[^\d.]/g, '')) : 0;
      let image = pro.querySelector('img') ? pro.querySelector('img').getAttribute('src') : '';
      let id = name + price + image;
      addToCart({id, name, price, image, quantity: 1});
    });
  });
}

// --- Hiển thị số lượng sản phẩm trên icon giỏ hàng ---
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let count = cart.reduce((sum, item) => sum + item.quantity, 0);
  // Tìm tất cả icon giỏ hàng trên trang
  document.querySelectorAll('.fa-bag-shopping, .fa-shopping-cart, .fa-cart-plus').forEach(icon => {
    let badge = icon.parentElement.querySelector('.cart-count');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-count';
      badge.style.cssText = 'position:absolute;top:-8px;right:-10px;background:#f37021;color:#fff;border-radius:50%;padding:2px 7px;font-size:12px;line-height:1;';
      icon.parentElement.style.position = 'relative';
      icon.parentElement.appendChild(badge);
    }
    badge.innerText = count > 0 ? count : '';
  });
}

// --- CART PAGE: Render, update, remove, coupon ---
function renderCart() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let tbody = document.querySelector('#cart tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let subtotal = 0;
  cart.forEach((item, idx) => {
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="#" class="remove-item" data-id="${item.id}"><i class="far fa-times-circle"></i></a></td>
      <td><img src="${item.image}" alt=""></td>
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input type="number" min="1" value="${item.quantity}" class="cart-qty" data-id="${item.id}"></td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
    subtotal += item.price * item.quantity;
  });
  // Update subtotal, total
  let subEl = document.querySelector('#subtotal table tr:nth-child(1) td:last-child');
  let totalEl = document.querySelector('#subtotal table tr:nth-child(3) td:last-child');
  let couponVal = getCouponValue();
  let total = subtotal * (1 - couponVal);
  if (subEl) subEl.innerText = `$ ${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `$ ${total.toFixed(2)}`;
  updateCartCount();
}

function getCouponValue() {
  let code = localStorage.getItem('coupon') || '';
  if (code === 'SALE10') return 0.10;
  if (code === 'SALE20') return 0.20;
  return 0;
}

// Xử lý sự kiện trên cart.html
if (window.location.pathname.includes('cart.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    // Xóa sản phẩm
    document.querySelector('#cart tbody').addEventListener('click', function(e) {
      if (e.target.closest('.remove-item')) {
        e.preventDefault();
        let id = e.target.closest('.remove-item').dataset.id;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      }
    });
    // Sửa số lượng
    document.querySelector('#cart tbody').addEventListener('input', function(e) {
      if (e.target.classList.contains('cart-qty')) {
        let id = e.target.dataset.id;
        let qty = parseInt(e.target.value);
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        let idx = cart.findIndex(item => item.id === id);
        if (idx > -1 && qty > 0) {
          cart[idx].quantity = qty;
          localStorage.setItem('cart', JSON.stringify(cart));
          renderCart();
        }
      }
    });
    // Áp dụng coupon
    let couponBtn = document.querySelector('#coupon button');
    if (couponBtn) {
      couponBtn.onclick = function() {
        let code = document.querySelector('#coupon input').value.trim();
        if (code === 'SALE10' || code === 'SALE20') {
          localStorage.setItem('coupon', code);
          alert('Áp dụng mã thành công!');
        } else {
          localStorage.removeItem('coupon');
          alert('Mã không hợp lệ!');
        }
        renderCart();
      };
    }
  });
}

// --- USER LOGIN DEMO ---
function saveUserInfo(email) {
  localStorage.setItem('user', JSON.stringify({email: email}));
}
function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch { return null; }
}
function showUserName() {
  let user = getUserInfo();
  let loginBtn = document.getElementById('login-btn');
  if (user && loginBtn) {
    // Hiển thị email và nút đăng xuất
    loginBtn.innerHTML = `<i class=\"fa fa-user\"></i> ${user.email} <span id=\"logout-btn\" style=\"margin-left:12px;cursor:pointer;color:#f37021;font-weight:bold;\">Đăng xuất</span>`;
    // Gắn sự kiện đăng xuất
    let logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = function(e) {
        e.stopPropagation();
        localStorage.removeItem('user');
        // Đặt lại nút về Đăng nhập
        loginBtn.innerHTML = '<i class="fa fa-user"></i> Đăng nhập';
        // Reload để cập nhật giao diện nếu cần
        // location.reload(); // Nếu muốn reload trang
      };
    }
  } else if (loginBtn) {
    loginBtn.innerHTML = '<i class="fa fa-user"></i> Đăng nhập';
  }
}
// Gắn sự kiện cho form đăng nhập (nếu có)
document.addEventListener('DOMContentLoaded', function() {
  // Gắn nút add to cart
  setupAddToCartButtons();
  // Hiển thị số lượng sản phẩm trên icon giỏ hàng
  updateCartCount();
  // Hiển thị tên user nếu đã đăng nhập
  showUserName();
  // Gắn sự kiện cho nút Shop now chuyển hướng sang shop.html
  var shopNowBtn = document.querySelector('#hero button');
  if (shopNowBtn) {
    shopNowBtn.addEventListener('click', function() {
      window.location.href = 'shop.html';
    });
  }
  // Lưu user khi đăng nhập (demo)
  let loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      let email = loginForm.querySelector('input[type=email]').value;
      saveUserInfo(email);
      showUserName();
      document.getElementById('login-modal').style.display = 'none';
      alert('Đăng nhập thành công!');
    };
  }
  // Lưu user khi đăng ký (tự động đăng nhập luôn)
  let registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.onsubmit = function(e) {
      e.preventDefault();
      let email = registerForm.querySelector('input[type=email]').value;
      saveUserInfo(email);
      showUserName();
      document.getElementById('login-modal').style.display = 'none';
      alert('Đăng ký thành công!');
    };
  }
  // Gắn sự kiện chuyển tab cho modal đăng nhập/đăng ký
  var tabBtns = document.querySelectorAll('.tab button.tablinks');
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function(evt) {
      var tabName = btn.getAttribute('data-tab');
      var tabcontent = document.getElementsByClassName('tabcontent');
      for (var i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = 'none';
      var tablinks = document.getElementsByClassName('tablinks');
      for (var i = 0; i < tablinks.length; i++) tablinks[i].classList.remove('active');
      document.getElementById(tabName).style.display = 'block';
      btn.classList.add('active');
    });
  });
  // Gắn sự kiện cho nút Add To Cart ở trang sproduct.html
  var addToCartBtn = document.querySelector('.single-pro-details button.normal');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Check login status
      let user = getUserInfo && getUserInfo();
      if (!user) {
        let modal = document.getElementById('login-modal');
        if (modal) modal.style.display = 'block';
        alert('Vui lòng đăng nhập hoặc đăng ký để thêm sản phẩm vào giỏ hàng!');
        return;
      }
      // Validate chọn size
      let proDetails = document.querySelector('.single-pro-details');
      let sizeSelect = proDetails.querySelector('select');
      let size = sizeSelect ? sizeSelect.value : '';
      if (!size || size === 'Chọn size' || size === 'Select Size') {
        alert('Vui lòng chọn size trước khi thêm vào giỏ hàng!');
        sizeSelect && sizeSelect.focus();
        return;
      }
      // Lấy thông tin sản phẩm chi tiết
      let name = proDetails.querySelector('h4') ? proDetails.querySelector('h4').innerText : '';
      let price = proDetails.querySelector('h2') ? parseFloat(proDetails.querySelector('h2').innerText.replace(/[^\d.]/g, '')) : 0;
      let image = document.getElementById('MainImg') ? document.getElementById('MainImg').getAttribute('src') : '';
      let qtyInput = proDetails.querySelector('input[type=number]');
      let quantity = qtyInput ? parseInt(qtyInput.value) : 1;
      let id = name + price + image + size;
      addToCart({id, name, price, image, quantity, size});
    });
  }
  // Hamburger menu cho mobile
  var hamburger = document.getElementById('hamburger');
  var navbar = document.getElementById('navbar');
  if (hamburger && navbar) {
    hamburger.addEventListener('click', function() {
      navbar.classList.toggle('open');
    });
  }
  // Back-to-top button
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // Smooth scroll tới anchor
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
