// Product Detail JavaScript
let currentProduct = null;
let selectedSize = null;
let currentQuantity = 1;
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadProductDetail();
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
    // Quantity input change
    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            if (value < 1) {
                this.value = 1;
                currentQuantity = 1;
            } else if (value > 10) {
                this.value = 10;
                currentQuantity = 10;
            } else {
                currentQuantity = value;
            }
        });
    }
}

// Load product detail
async function loadProductDetail() {
    showLoading(true);
    hideMessages();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError('Không tìm thấy ID sản phẩm!');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        
        if (response.ok) {
            const data = await response.json();
            currentProduct = data.product;
            displayProductDetail();
        } else {
            showError('Không thể tải thông tin sản phẩm!');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Lỗi kết nối server!');
    } finally {
        showLoading(false);
    }
}

// Display product detail
function displayProductDetail() {
    if (!currentProduct) return;
    
    console.log('Current product data:', currentProduct); // Debug log
    
    // Update product info
    document.getElementById('product-name').textContent = currentProduct.name;
    document.getElementById('product-price').textContent = '$' + currentProduct.price?.toLocaleString();
    document.getElementById('product-description').textContent = currentProduct.description || 'Mô tả sản phẩm sẽ được hiển thị ở đây...';
    
    // Update rating
    const rating = currentProduct.rating || 0;
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    document.getElementById('product-stars').textContent = stars;
    document.getElementById('rating-text').textContent = `(${rating}/5)`;
    
    // Display images
    displayImages();
    
    // Display size options
    displaySizeOptions();
    
    // Show product detail
    document.getElementById('product-detail').style.display = 'block';
}

// Display images
function displayImages() {
    const mainImage = document.getElementById('main-image');
    const thumbnailContainer = document.getElementById('thumbnail-images');
    
    // Get all images (main + detail images)
    const allImages = [currentProduct.mainImage, ...(currentProduct.detailImages || [])].filter(img => img);
    console.log('Product images:', allImages); // Debug log
    
    // Đảm bảo đường dẫn ảnh đúng - sử dụng đường dẫn tương đối
    const allImagesFixed = allImages.map(img => img.startsWith('products/') ? `/${img}` : `/products/${img}`);
    console.log('Fixed image paths:', allImagesFixed); // Debug log
    
    if (allImagesFixed.length === 0) {
        console.log('No product images found, using default images'); // Debug log
        // Use default image - sử dụng ảnh có sẵn trong thư mục products
        mainImage.src = '/products/logo-van-lang-896x1024-1-1200x1371.png';
        thumbnailContainer.innerHTML = `
            <img src="/products/logo-van-lang-896x1024-1-1200x1371.png" class="thumbnail active" onclick="changeMainImage(0)">
            <img src="/products/chatbot-tren-zalo.jpg" class="thumbnail" onclick="changeMainImage(1)">
            <img src="/products/ung-dung-hoc-tieng-anh-tren-may-tinh-duolingo.jpg" class="thumbnail" onclick="changeMainImage(2)">
            <img src="/products/facebookclone.jpg" class="thumbnail" onclick="changeMainImage(3)">
        `;
        return;
    }
    
    console.log('Using product images:', allImagesFixed); // Debug log
    
    console.log('Setting main image to:', allImagesFixed[0]); // Debug log
    // Set main image
    mainImage.src = allImagesFixed[0];
    
    // Create thumbnails
    thumbnailContainer.innerHTML = allImagesFixed.map((img, index) => `
        <img src="${img}" class="thumbnail ${index === 0 ? 'active' : ''}" 
             onclick="changeMainImage(${index})" alt="Product ${index + 1}">
    `).join('');
}

// Change main image
function changeMainImage(index) {
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const allImages = [currentProduct.mainImage, ...(currentProduct.detailImages || [])].filter(img => img);
    
    if (allImages.length === 0) {
        // Use default images - sử dụng ảnh có sẵn trong thư mục products
        const defaultImages = [
            '/products/logo-van-lang-896x1024-1-1200x1371.png',
            '/products/chatbot-tren-zalo.jpg',
            '/products/ung-dung-hoc-tieng-anh-tren-may-tinh-duolingo.jpg',
            '/products/facebookclone.jpg'
        ];
        mainImage.src = defaultImages[index];
    } else {
        // Xử lý đường dẫn ảnh đúng - sử dụng đường dẫn tương đối
        const imgSrc = allImages[index].startsWith('products/') ? `/${allImages[index]}` : `/products/${allImages[index]}`;
        mainImage.src = imgSrc;
    }
    
    // Update active thumbnail
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    currentImageIndex = index;
}

// Display size options
function displaySizeOptions() {
    const sizeContainer = document.getElementById('size-options');
    const availableSizes = currentProduct.sizes || [];
    
    const allSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
    
    sizeContainer.innerHTML = allSizes.map(size => {
        const isAvailable = availableSizes.includes(size);
        return `
            <div class="size-option ${isAvailable ? '' : 'disabled'}" 
                 onclick="${isAvailable ? `selectSize('${size}')` : ''}">
                ${size}
            </div>
        `;
    }).join('');
}

// Select size
function selectSize(size) {
    // Remove previous selection
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked size
    event.target.classList.add('selected');
    selectedSize = size;
    
    // Enable add to cart button
    updateAddToCartButton();
}

// Quantity controls
function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quantity-input').value = currentQuantity;
    }
}

function increaseQuantity() {
    if (currentQuantity < 10) {
        currentQuantity++;
        document.getElementById('quantity-input').value = currentQuantity;
    }
}

// Update add to cart button
function updateAddToCartButton() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    if (selectedSize) {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add To Cart';
    } else {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Chọn size trước';
    }
}

// Add to cart
function addToCart() {
    if (!selectedSize) {
        showError('Vui lòng chọn size!');
        return;
    }
    
    if (!currentProduct) {
        showError('Không tìm thấy thông tin sản phẩm!');
        return;
    }
    
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => 
        item.productId === currentProduct._id && item.size === selectedSize
    );
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            productId: currentProduct._id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.mainImage,
            size: selectedSize,
            quantity: currentQuantity
        });
    }
    
    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadge();
    
    // Show success message
    showSuccess(`Đã thêm ${currentQuantity} sản phẩm vào giỏ hàng!`);
    
    // Reset quantity
    currentQuantity = 1;
    document.getElementById('quantity-input').value = 1;
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
    const productDetail = document.getElementById('product-detail');
    
    if (show) {
        loading.style.display = 'block';
        productDetail.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

function hideMessages() {
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userRole');
    localStorage.removeItem('showWelcome');
    
    window.location.href = 'login.html';
} 