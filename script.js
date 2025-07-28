// Lọc sản phẩm theo tag và làm nổi bật mục đang chọn
document.querySelectorAll('.category-item').forEach(function(item) {
  item.addEventListener('click', function() {
    var tag = this.getAttribute('data-tag');
    document.querySelectorAll('.category-item').forEach(function(i){
      i.classList.remove('selected');
    });
    this.classList.add('selected');
    document.querySelectorAll('.pro').forEach(function(pro) {
      var span = pro.querySelector('.desc span');
      if (tag === 'all' || (span && span.textContent.trim() === tag)) {
        pro.style.display = '';
      } else {
        pro.style.display = 'none';
      }
    });
  });
});
// Đặt mặc định là 'Tất cả' được chọn
var defaultCat = document.querySelector('.category-item[data-tag="all"]');
if(defaultCat) defaultCat.classList.add('selected');

// Kiểm tra trạng thái đăng nhập và hiển thị thông tin user
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email-text');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    
    if (token && email && authLinks && userInfo && userEmail) {
        // User đã đăng nhập
        authLinks.style.display = 'none';
        userInfo.style.display = 'block';
        userEmail.textContent = email;
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = email;
        }
        
        // Kiểm tra role admin và hiển thị Admin Panel link
        const userRole = localStorage.getItem('userRole');
        const adminLink = document.querySelector('.admin-link');
        if (adminLink) {
            if (userRole === 'admin') {
                adminLink.style.display = 'flex';
            } else {
                adminLink.style.display = 'none';
            }
        }
    } else if (authLinks && userInfo) {
        // User chưa đăng nhập - chỉ hiển thị link đăng nhập
        authLinks.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userRole');
    localStorage.removeItem('showWelcome');
    
    // Reload trang để cập nhật UI
    window.location.reload();
}

// Chạy kiểm tra auth khi trang load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupUserDropdown();
    if (document.getElementById('featured-products-container')) {
        loadFeaturedProducts();
    }
});

// Setup user dropdown functionality
function setupUserDropdown() {
    const userDropdown = document.querySelector('.user-dropdown');
    const dropdownToggle = document.querySelector('.user-dropdown-toggle');
    
    if (userDropdown && dropdownToggle) {
        // Toggle dropdown khi click
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('active');
        });
        
        // Đóng dropdown khi click outside
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Đóng dropdown khi click vào item
        const dropdownItems = userDropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                userDropdown.classList.remove('active');
            });
        });
    }
}

// Event chuyển hướng cho nút Shop now trên trang chủ
var shopNowBtn = document.getElementById('shop-now-btn');
if (shopNowBtn) {
  shopNowBtn.addEventListener('click', function() {
    window.location.href = 'shop.html';
  });
}

// Add to Cart & Badge update
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function updateCartBadge() {
  var cart = getCart();
  var total = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
  var badges = document.querySelectorAll('.cart-badge');
  badges.forEach(function(badge) { badge.textContent = total; });
}
function addToCart(product) {
  var cart = getCart();
  var found = cart.find(function(item) { return item.name === product.name; });
  if (found) {
    found.quantity += 1;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  setCart(cart);
  updateCartBadge();
}
// Gán event cho tất cả nút add-to-cart-btn (shop + chi tiết)
document.querySelectorAll('.add-to-cart-btn').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    // Kiểm tra đăng nhập
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      var loginModal = document.getElementById('login-modal');
      if (loginModal) loginModal.style.display = 'block';
      return;
    }
    // Lấy select size (nằm cùng cha với nút hoặc tìm gần nhất)
    var sizeSelect = btn.parentElement.querySelector('select');
    var size = sizeSelect ? sizeSelect.value : null;
    if (!size || size === 'Chọn size') {
      alert('Vui lòng chọn size trước khi thêm vào giỏ hàng!');
      if (sizeSelect) sizeSelect.focus();
      return;
    }
    var name = btn.getAttribute('data-name');
    var price = parseFloat(btn.getAttribute('data-price'));
    var image = btn.getAttribute('data-image');
    var qtyInput = btn.parentElement.querySelector('#product-qty') || document.getElementById('product-qty');
    var qty = qtyInput ? parseInt(qtyInput.value) : 1;
    if (qty < 1 || isNaN(qty)) qty = 1;
    var cart = getCart();
    // Tìm theo name + size để không cộng dồn nhầm size khác nhau
    var found = cart.find(function(item) { return item.name === name && item.size === size; });
    if (found) {
      found.quantity += qty;
    } else {
      cart.push({ name: name, price: price, image: image, quantity: qty, size: size });
    }
    setCart(cart);
    updateCartBadge();
    alert('Đã thêm vào giỏ hàng!');
  });
});
updateCartBadge();

// Cart page render & update
function renderCart() {
  var cart = getCart();
  var tbody = document.getElementById('cart-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  var subtotal = 0;
  cart.forEach(function(item, idx) {
    var tr = document.createElement('tr');
    var itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    tr.innerHTML = `
      <td><a href="#" class="remove-cart-item" data-idx="${idx}"><i class="far fa-times-circle"></i></a></td>
      <td><img src="${item.image}" alt=""></td>
      <td>${item.name}<br><span style='font-size:13px;color:#555;'>Size: ${item.size || ''}</span></td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input type="number" min="1" value="${item.quantity}" class="cart-qty" data-idx="${idx}"></td>
      <td>$${itemTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('cart-subtotal').textContent = '$ ' + subtotal.toFixed(2);
  document.getElementById('cart-total').innerHTML = '<strong>$ ' + subtotal.toFixed(2) + '</strong>';
  updateCartBadge();
  // Gán event xóa
  document.querySelectorAll('.remove-cart-item').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var idx = parseInt(btn.getAttribute('data-idx'));
      var cart = getCart();
      cart.splice(idx, 1);
      setCart(cart);
      renderCart();
    });
  });
  // Gán event thay đổi số lượng
  document.querySelectorAll('.cart-qty').forEach(function(input) {
    input.addEventListener('change', function() {
      var idx = parseInt(input.getAttribute('data-idx'));
      var val = parseInt(input.value);
      if (val < 1) val = 1;
      var cart = getCart();
      cart[idx].quantity = val;
      setCart(cart);
      renderCart();
    });
  });
}
if (document.getElementById('cart-body')) {
  document.addEventListener('DOMContentLoaded', renderCart);
}

// Hamburger menu toggle
var hamburger = document.getElementById('hamburger');
var navbar = document.getElementById('navbar');
if (hamburger && navbar) {
  hamburger.addEventListener('click', function() {
    navbar.classList.toggle('open');
  });
}
// Back-to-top button
var backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });
  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
// Smooth scroll to anchor
if ('scrollBehavior' in document.documentElement.style) {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products-container');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;width:100%">Đang tải sản phẩm...</div>';
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
            if (data.products.length === 0) {
                container.innerHTML = '<div style="text-align:center;width:100%">Chưa có sản phẩm nào</div>';
                return;
            }
            container.innerHTML = data.products.map(product => {
                let imgSrc = product.mainImage
                    ? (product.mainImage.startsWith('products/') ? `/${product.mainImage}` : `/products/${product.mainImage}`)
                    : 'products/f1.jpg';
                return `
                <div class="pro" onclick="window.location.href='sproduct_detail.html?id=${product._id}'">
                    <img src="${imgSrc}" alt="${product.name}">
                    <div class="desc">
                        <h5>${product.name}</h5>
                        <div class="star">
                            ${'<i class=\'fas fa-star\'></i>'.repeat(product.rating || 0)}
                            ${'<i class=\'far fa-star\'></i>'.repeat(5 - (product.rating || 0))}
                        </div>
                    </div>
                    <div class="pro-bottom">
                        <h4>${product.price ? product.price.toLocaleString('vi-VN') + '₫' : '0₫'}</h4>
                        <a href="sproduct_detail.html?id=${product._id}" onclick="event.stopPropagation()"><i class="ri-shopping-cart-line cart"></i></a>
                    </div>
                </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<div style="text-align:center;width:100%">Không thể tải sản phẩm!</div>';
        }
    } catch (error) {
        container.innerHTML = '<div style="text-align:center;width:100%">Lỗi kết nối server!</div>';
    }
}
