// cart.js
// Cart functions for E-commerce Shoe Store

// Add product to cart
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

// Setup add to cart buttons
function setupAddToCartButtons() {
  document.querySelectorAll('.fa-cart-plus, .fa-shopping-cart.cart, .ri-shopping-cart-line.cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      let user = getUserInfo && getUserInfo();
      if (!user) {
        let modal = document.getElementById('login-modal');
        if (modal) modal.style.display = 'block';
        alert('Vui lòng đăng nhập hoặc đăng ký để thêm sản phẩm vào giỏ hàng!');
        return;
      }
      let pro = this.closest('.pro');
      if (!pro) return;
      let name = pro.querySelector('.desc h5') ? pro.querySelector('.desc h5').innerText : '';
      let price = pro.querySelector('.desc h4') ? parseFloat(pro.querySelector('.desc h4').innerText.replace(/[^.]/g, '')) : 0;
      let image = pro.querySelector('img') ? pro.querySelector('img').getAttribute('src') : '';
      let id = name + price + image;
      addToCart({id, name, price, image, quantity: 1});
    });
  });
}

// Update cart count on icon
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let count = cart.reduce((sum, item) => sum + item.quantity, 0);
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

// Render cart page
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
  let subEl = document.querySelector('#subtotal table tr:nth-child(1) td:last-child');
  let totalEl = document.querySelector('#subtotal table tr:nth-child(3) td:last-child');
  let couponVal = getCouponValue();
  let total = subtotal * (1 - couponVal);
  if (subEl) subEl.innerText = `$ ${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.innerText = `$ ${total.toFixed(2)}`;
  updateCartCount();
}

// Get coupon value
function getCouponValue() {
  let code = localStorage.getItem('coupon') || '';
  if (code === 'SALE10') return 0.10;
  if (code === 'SALE20') return 0.20;
  return 0;
}

// Cart page event listeners
if (window.location.pathname.includes('cart.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    renderCart();
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

// Export functions if using module
export { addToCart, setupAddToCartButtons, updateCartCount, renderCart, getCouponValue }; 