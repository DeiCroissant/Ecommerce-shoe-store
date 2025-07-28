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
    // Hỗ trợ cả productId và id cho tương thích cũ/mới
    const id = item.productId || item.id;
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="#" class="remove-item" data-id="${id}"><i class="far fa-times-circle"></i></a></td>
      <td><img src="${item.image}" alt=""></td>
      <td>${item.name}</td>
      <td>${item.price.toLocaleString('vi-VN')}₫</td>
      <td><input type="number" min="1" value="${item.quantity}" class="cart-qty" data-id="${id}"></td>
      <td>${(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
    `;
    tbody.appendChild(tr);
    subtotal += item.price * item.quantity;
  });
  let subEl = document.querySelector('#subtotal table tr:nth-child(1) td:last-child');
  let totalEl = document.querySelector('#subtotal table tr:nth-child(3) td:last-child');
  let discount = parseFloat(localStorage.getItem('coupon_discount') || '0');
  let code = localStorage.getItem('coupon') || '';
  let discountAmount = subtotal * (discount / 100);
  // Đảm bảo tổng tiền không âm
  let total = Math.max(0, subtotal - discountAmount);
  if (subEl) subEl.innerText = `${subtotal.toLocaleString('vi-VN')}₫`;
  if (totalEl) totalEl.innerText = `${total.toLocaleString('vi-VN')}₫`;
  // Hiển thị dòng giảm giá nếu có mã
  let table = document.querySelector('#subtotal table');
  if (table) {
    let discountRow = table.querySelector('.discount-row');
    if (discount > 0) {
      if (!discountRow) {
        discountRow = document.createElement('tr');
        discountRow.className = 'discount-row';
        // Đảm bảo hiển thị số tiền giảm giá chính xác
        let actualDiscount = Math.min(discountAmount, subtotal); // Không giảm quá subtotal
        discountRow.innerHTML = `<td>Giảm giá (${code})</td><td id="discount-amount">-${actualDiscount.toLocaleString('vi-VN')}₫</td>`;
        table.appendChild(discountRow);
      } else {
        let actualDiscount = Math.min(discountAmount, subtotal);
        discountRow.querySelector('#discount-amount').innerText = `-${actualDiscount.toLocaleString('vi-VN')}₫`;
        discountRow.cells[0].innerText = `Giảm giá (${code})`;
      }
    } else if (discountRow) {
      discountRow.remove();
    }
  }
  updateCartBadge();
  let removeCouponBtn = document.getElementById('remove-coupon-btn');
  if (removeCouponBtn) {
    if (localStorage.getItem('coupon')) {
      removeCouponBtn.style.display = 'inline-block';
    } else {
      removeCouponBtn.style.display = 'none';
    }
  }
}

// Update cart badge
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) badge.textContent = totalItems;
}

// Get coupon value
function getCouponValue() {
  let code = localStorage.getItem('coupon') || '';
  if (code === 'SALE10') return 0.10;
  if (code === 'SALE20') return 0.20;
  return 0;
}

// Áp dụng mã giảm giá
async function applyCoupon() {
  let code = document.querySelector('#coupon input').value.trim();
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!code) return;
  if (!cart.length) {
    showError('Bạn cần có sản phẩm trong giỏ hàng mới được áp mã giảm giá!');
    return;
  }
  try {
    let res = await fetch(`http://localhost:3000/api/coupons/validate?code=${encodeURIComponent(code)}`);
    let data = await res.json();
    console.log('Apply coupon:', code, data);
    if (data.success) {
      localStorage.setItem('coupon', code);
      localStorage.setItem('coupon_discount', data.discount);
      console.log('Áp mã thành công:', data.discount + '%');
      showSuccess(`Chúc mừng! Bạn đã áp dụng mã giảm giá ${data.discount}% thành công!`);
    } else {
      localStorage.removeItem('coupon');
      localStorage.removeItem('coupon_discount');
      console.log('Áp mã thất bại:', data.error);
      showError(data.error || 'Mã không hợp lệ!');
    }
    renderCart();
  } catch (err) {
    showError('Lỗi kết nối server!');
  }
}

// Lưu địa chỉ giao hàng
function saveShippingAddress() {
  const addressData = {
    fullname: document.getElementById('fullname').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    district: document.getElementById('district').value,
    note: document.getElementById('note').value
  };
  localStorage.setItem('shipping_address', JSON.stringify(addressData));
}

// Load địa chỉ giao hàng
function loadShippingAddress() {
  const savedAddress = localStorage.getItem('shipping_address');
  if (savedAddress) {
    const addressData = JSON.parse(savedAddress);
    document.getElementById('fullname').value = addressData.fullname || '';
    document.getElementById('phone').value = addressData.phone || '';
    document.getElementById('address').value = addressData.address || '';
    document.getElementById('city').value = addressData.city || '';
    document.getElementById('district').value = addressData.district || '';
    document.getElementById('note').value = addressData.note || '';
  }
}

// Auto-save địa chỉ khi người dùng nhập
function setupAddressAutoSave() {
  const addressFields = ['fullname', 'phone', 'address', 'city', 'district', 'note'];
  addressFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', saveShippingAddress);
      field.addEventListener('change', saveShippingAddress);
    }
  });
}

// Xử lý thanh toán
async function processCheckout() {
  // Kiểm tra đăng nhập
  const token = localStorage.getItem('token');
  if (!token) {
    showError('Vui lòng đăng nhập để thanh toán!');
    return;
  }

  // Kiểm tra giỏ hàng
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) {
    showError('Giỏ hàng trống!');
    return;
  }

  // Kiểm tra thông tin địa chỉ
  const fullname = document.getElementById('fullname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const district = document.getElementById('district').value.trim();

  if (!fullname || !phone || !address || !city || !district) {
    showError('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng!');
    return;
  }

  // Tính tổng tiền
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = parseFloat(localStorage.getItem('coupon_discount') || '0');
  const discountAmount = subtotal * (discount / 100);
  const total = Math.max(0, subtotal - discountAmount);

  // Chuẩn bị dữ liệu đơn hàng
  const orderData = {
    items: cart,
    total: total,
    shipping_address: {
      fullname: fullname,
      phone: phone,
      address: address,
      city: city,
      district: district,
      note: document.getElementById('note').value.trim()
    },
    coupon_code: localStorage.getItem('coupon') || '',
    discount_amount: discountAmount
  };

  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    if (result.success) {
      // Xóa giỏ hàng và mã giảm giá
      localStorage.removeItem('cart');
      localStorage.removeItem('coupon');
      localStorage.removeItem('coupon_discount');
      
      showSuccess(`Đặt hàng thành công! Mã đơn hàng: ${result.order_id}`);
      
      // Chuyển về trang chủ sau 2 giây
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } else {
      showError(result.error || 'Có lỗi xảy ra khi đặt hàng!');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showError('Lỗi kết nối server!');
  }
}

// Cart page event listeners
if (window.location.pathname.includes('cart.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    loadShippingAddress(); // Load địa chỉ đã lưu
    setupAddressAutoSave(); // Setup auto-save
    
    // Event delegation trên #cart để không bị mất khi render lại
    document.querySelector('#cart').addEventListener('click', function(e) {
      if (e.target.closest('.remove-item')) {
        e.preventDefault();
        const id = e.target.closest('.remove-item').getAttribute('data-id');
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('Xóa id:', id, cart.map(i => i.productId || i.id));
        cart = cart.filter(item => String(item.productId || item.id) !== String(id));
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
      }
    });
    document.querySelector('#cart').addEventListener('change', function(e) {
      if (e.target.classList.contains('cart-qty')) {
        const id = e.target.getAttribute('data-id');
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        let item = cart.find(i => (i.productId || i.id) === id);
        let qty = parseInt(e.target.value);
        if (item && qty > 0) {
          item.quantity = qty;
          localStorage.setItem('cart', JSON.stringify(cart));
          renderCart();
        }
      }
    });
    // Đảm bảo nút Apply gọi đúng hàm
    let couponBtn = document.querySelector('#coupon button');
    if (couponBtn) {
      couponBtn.onclick = applyCoupon;
    }
    let removeCouponBtn = document.getElementById('remove-coupon-btn');
    if (removeCouponBtn) {
      removeCouponBtn.onclick = function() {
        localStorage.removeItem('coupon');
        localStorage.removeItem('coupon_discount');
        showSuccess('Đã xóa mã giảm giá!');
        renderCart();
        // Ẩn nút sau khi xóa
        removeCouponBtn.style.display = 'none';
        document.querySelector('#coupon input').value = '';
      };
    }
    
    // Xử lý nút Proceed to Checkout
    let checkoutBtn = document.querySelector('#subtotal button');
    if (checkoutBtn) {
      checkoutBtn.onclick = processCheckout;
    }
  });
}

// Hiển thị thông báo đẹp
function showSuccess(msg) {
  let div = document.getElementById('success-message');
  if (!div) {
    div = document.createElement('div');
    div.id = 'success-message';
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 9999;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      font-weight: bold;
      display: none;
    `;
    document.body.appendChild(div);
  }
  div.textContent = msg;
  div.style.display = 'block';
  setTimeout(() => { div.style.display = 'none'; }, 3000);
}

function showError(msg) {
  let div = document.getElementById('error-message');
  if (!div) {
    div = document.createElement('div');
    div.id = 'error-message';
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 9999;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      font-weight: bold;
      display: none;
    `;
    document.body.appendChild(div);
  }
  div.textContent = msg;
  div.style.display = 'block';
  setTimeout(() => { div.style.display = 'none'; }, 4000);
} 