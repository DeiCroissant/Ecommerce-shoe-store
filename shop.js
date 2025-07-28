// Shop JavaScript
let products = [];
let categories = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadCategories();
    loadProducts();
    setupEventListeners();
});

// Kiểm tra trạng thái đăng nhập
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email-text');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    
    if (token && email && authLinks && userInfo && userEmail) {
        authLinks.style.display = 'none';
        userInfo.style.display = 'block';
        userEmail.textContent = email;
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = email;
        }
        
        // Kiểm tra role admin
        const userRole = localStorage.getItem('userRole');
        const adminLink = document.querySelector('.admin-link');
        if (adminLink && userRole === 'admin') {
            adminLink.style.display = 'flex';
        }
    } else if (authLinks && userInfo) {
        authLinks.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category filter clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('category-item')) {
            const category = e.target.getAttribute('data-tag');
            filterByCategory(category);

            // Xóa active ở tất cả các nút
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            // Thêm active cho nút vừa click
            e.target.classList.add('active');
        }
    });

    // Xử lý nút 'Tất cả'
    const allBtn = document.getElementById('all-category-btn');
    if (allBtn) {
        allBtn.addEventListener('click', function() {
            filterByCategory('all');
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            allBtn.classList.add('active');
        });
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/categories');
        
        if (response.ok) {
            const data = await response.json();
            categories = data.categories || [];
            displayCategories();
        } else {
            console.error('Failed to load categories');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display categories
function displayCategories() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    // Nút tất cả
    const allLi = document.createElement('li');
    allLi.className = 'category-item active';
    allLi.setAttribute('data-tag', 'all');
    allLi.id = 'all-category-btn';
    allLi.textContent = 'Tất cả';
    categoryList.appendChild(allLi);
    // Các danh mục khác
    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.setAttribute('data-tag', category._id); // SỬA Ở ĐÂY: dùng _id thay vì name
        li.textContent = category.name;
        categoryList.appendChild(li);
    });
}

// Load products
async function loadProducts() {
    showLoading(true);
    
    try {
        const response = await fetch('http://localhost:3000/api/products');
        
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            displayProducts();
        } else {
            console.error('Failed to load products');
            showError('Không thể tải sản phẩm!');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Lỗi kết nối server!');
    } finally {
        showLoading(false);
    }
}

// Display products
function displayProducts(filteredProducts = null) {
    const container = document.getElementById('products-container');
    const productsToShow = filteredProducts || products;
    
    if (productsToShow.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-box" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                <p>Không có sản phẩm nào</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = productsToShow.map(product => {
        let imgSrc = product.mainImage
            ? (product.mainImage.startsWith('products/') ? `/${product.mainImage}` : `/products/${product.mainImage}`)
            : 'products/f1.jpg';
        return `
        <div class="pro" onclick="viewProduct('${product._id}')">
            <img src="${imgSrc}" alt="${product.name}">
            <div class="desc">
                <span>${product.category || 'Chưa phân loại'}</span>
                <h5>${product.name}</h5>
                <div class="star">
                    ${'<i class="fas fa-star"></i>'.repeat(product.rating || 0)}
                    ${'<i class="far fa-star"></i>'.repeat(5 - (product.rating || 0))}
                </div>
            </div>
            <div class="pro-bottom">
                <h4>${product.price ? product.price.toLocaleString('vi-VN') + '₫' : '0₫'}</h4>
                <a href="#" class="add-to-cart-btn" onclick="addToCart(event, '${product._id}', '${product.name}', ${product.price}, '${imgSrc}')">
                    <i class="ri-shopping-cart-line cart"></i>
                </a>
            </div>
        </div>
        `;
    }).join('');
}

// Filter by category
function filterByCategory(category) {
    // Update active category
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentCategory = category;
    
    if (category === 'all') {
        displayProducts();
    } else {
        const filteredProducts = products.filter(product => 
            product.category === category
        );
        displayProducts(filteredProducts);
    }
}

// View product detail
function viewProduct(productId) {
    window.location.href = `sproduct_detail.html?id=${productId}`;
}

// Add to cart
function addToCart(event, productId, name, price, image) {
    event.preventDefault();
    event.stopPropagation();
    
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadge();
    
    // Show success message
    showSuccess('Đã thêm sản phẩm vào giỏ hàng!');
}

// Update cart badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

// Utility functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('products-container');
    
    if (show) {
        loading.style.display = 'block';
        container.style.display = 'none';
    } else {
        loading.style.display = 'none';
        container.style.display = 'grid';
    }
}

function showError(message) {
    // Create error message element if it doesn't exist
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px;
            border: 1px solid #f5c6cb;
            text-align: center;
        `;
        document.querySelector('.main-content').insertBefore(errorDiv, document.querySelector('.pro-container'));
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    // Create success message element if it doesn't exist
    let successDiv = document.getElementById('success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px;
            border: 1px solid #c3e6cb;
            text-align: center;
        `;
        document.querySelector('.main-content').insertBefore(successDiv, document.querySelector('.pro-container'));
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userRole');
    localStorage.removeItem('showWelcome');
    
    window.location.href = 'login.html';
} 