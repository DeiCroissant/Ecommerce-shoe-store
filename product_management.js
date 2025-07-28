// Product Management JavaScript
let products = [];
let categories = [];
let selectedFiles = {
    mainImage: null,
    detailImages: []
};

// ==== COUPON MANAGEMENT (API) ====

async function renderCoupons() {
    const list = document.getElementById('coupon-list');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center;color:#888;padding:40px;">Đang tải...</div>';
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/coupons', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Lỗi tải mã giảm giá');
        const coupons = data.coupons || [];
        if (coupons.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:#888;padding:40px;">Chưa có mã giảm giá nào</div>';
            return;
        }
        list.innerHTML = `
            <table style="width:100%;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <thead>
                    <tr style="background:#f8f9fa;">
                        <th style="padding:12px;">Mã</th>
                        <th>Giảm (%)</th>
                        <th>HSD</th>
                        <th>Đã dùng</th>
                        <th>Tối đa</th>
                        <th>Trạng thái</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${coupons.map((c, i) => `
                        <tr>
                            <td style="padding:12px;font-weight:bold;">${c.code}</td>
                            <td>${c.discount}%</td>
                            <td>${c.expiry}</td>
                            <td>${c.used}</td>
                            <td>${c.maxUses}</td>
                            <td>${(new Date(c.expiry) < new Date()) ? '<span style=\'color:red\'>Hết hạn</span>' : (c.used >= c.maxUses ? '<span style=\'color:orange\'>Hết lượt</span>' : '<span style=\'color:green\'>Còn hiệu lực</span>')}</td>
                            <td><button class="btn btn-danger btn-sm" onclick="deleteCoupon('${c.code}')"><i class="fas fa-trash"></i> Xóa</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (err) {
        list.innerHTML = `<div style='color:red;text-align:center;padding:40px;'>${err.message}</div>`;
    }
}

function showAddCouponModal() {
    document.getElementById('add-coupon-modal').style.display = 'block';
    document.getElementById('add-coupon-form').reset();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

document.getElementById('add-coupon-form').onsubmit = async function(e) {
    e.preventDefault();
    const code = document.getElementById('coupon-code').value.trim();
    const discount = parseInt(document.getElementById('coupon-discount').value);
    const expiry = document.getElementById('coupon-expiry').value;
    const maxUses = parseInt(document.getElementById('coupon-max-uses').value);
    if (!code || !discount || !expiry || !maxUses) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/coupons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code, discount, expiry, maxUses })
        });
        const data = await response.json();
        if (data.success) {
            closeModal('add-coupon-modal');
            renderCoupons();
            showSuccess('Đã thêm mã giảm giá!');
        } else {
            showError(data.error || 'Có lỗi khi thêm mã!');
        }
    } catch (err) {
        showError('Lỗi kết nối server!');
    }
};

async function deleteCoupon(code) {
    showConfirmationModal('Bạn có chắc chắn muốn xóa mã giảm giá này?', async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/coupons/${code}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                renderCoupons();
                showSuccess('Đã xóa mã giảm giá!');
            } else {
                showError(data.error || 'Có lỗi khi xóa mã!');
            }
        } catch (err) {
            showError('Lỗi kết nối server!');
        }
    });
}

// Tab switching logic bổ sung cho coupon
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (tabName === 'products') {
        document.getElementById('products-tab').style.display = 'block';
        document.querySelector('.tab-btn[onclick*="products"]').classList.add('active');
    } else if (tabName === 'categories') {
        document.getElementById('categories-tab').style.display = 'block';
        document.querySelector('.tab-btn[onclick*="categories"]').classList.add('active');
    } else if (tabName === 'coupons') {
        document.getElementById('coupons').style.display = 'block';
        document.querySelector('.tab-btn[onclick*="coupons"]').classList.add('active');
        renderCoupons();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadCategories();
    loadProducts();
    setupEventListeners();
});

// Kiểm tra quyền admin
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !email) {
        window.location.href = 'login.html';
        return;
    }
    
    if (userRole !== 'admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'user.html';
        return;
    }
    
    // Cập nhật dropdown
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email-text');
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    
    if (authLinks && userInfo && userEmail) {
        authLinks.style.display = 'none';
        userInfo.style.display = 'block';
        userEmail.textContent = email;
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = email;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add product form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Add category form
    const addCategoryForm = document.getElementById('add-category-form');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', handleAddCategory);
    }
}

// Load categories
async function loadCategories() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/categories', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            categories = data.categories || [];
            
            // Đảm bảo products đã được load để đếm chính xác
            if (products.length === 0) {
                await loadProducts();
            }
            
            updateCategorySelect();
            displayCategories();
        } else {
            showError('Không thể tải danh mục!');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Lỗi kết nối server!');
    }
}

// Load products
async function loadProducts() {
    showLoading(true);
    hideMessages();
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/products/admin', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            updateStats();
            displayProducts();
            
            // Cập nhật lại danh mục để đếm số lượng sản phẩm chính xác
            if (categories.length > 0) {
                displayCategories();
            }
        } else {
            showError('Không thể tải sản phẩm!');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Lỗi kết nối server!');
    } finally {
        showLoading(false);
    }
}

// Update stats
function updateStats() {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-categories').textContent = totalCategories;
    document.getElementById('active-products').textContent = activeProducts;
    document.getElementById('total-value').textContent = '$' + totalValue.toLocaleString();
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-box" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                <p>Chưa có sản phẩm nào</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => {
        // Tìm tên danh mục từ category ID
        const category = categories.find(cat => cat._id === product.category);
        const categoryName = category ? category.name : 'Chưa phân loại';
        
        // Xử lý đường dẫn ảnh cho admin panel (sử dụng đường dẫn tương đối)
        let imgSrc = product.mainImage
            ? (product.mainImage.startsWith('products/') ? `/${product.mainImage}` : `/products/${product.mainImage}`)
            : 'products/f1.jpg';
            
        return `
            <div class="product-card">
                <img src="${imgSrc}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">${categoryName}</div>
                    <div class="product-price">$${product.price?.toLocaleString() || '0'}</div>
                    <div class="product-rating">
                        <div class="stars">
                            ${'★'.repeat(product.rating || 0)}${'☆'.repeat(5 - (product.rating || 0))}
                        </div>
                        <span>(${product.rating || 0}/5)</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="viewProduct('${product._id}')">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editProduct('${product._id}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display categories
function displayCategories() {
    const categoriesList = document.getElementById('categories-list');
    
    if (categories.length === 0) {
        categoriesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-tags" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                <p>Chưa có danh mục nào</p>
            </div>
        `;
        return;
    }
    
    categoriesList.innerHTML = categories.map(category => {
        // Đếm số lượng sản phẩm trong danh mục từ dữ liệu frontend
        const productCount = products.filter(p => p.category === category._id).length;
        
        return `
            <div class="category-item">
                <div>
                    <div class="category-name">${category.name}</div>
                    <div class="category-count">${productCount} sản phẩm</div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-info btn-sm" onclick="viewCategoryProducts('${category._id}', '${category.name}')">
                        <i class="fas fa-eye"></i> Xem sản phẩm
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editCategory('${category._id}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category._id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// View products by category
async function viewCategoryProducts(categoryId, categoryName) {
    try {
        showLoading(true);
        console.log('Loading products for category:', categoryId, categoryName);
        
        // Ẩn danh sách danh mục
        document.getElementById('categories-list').style.display = 'none';
        
        // Hiển thị phần sản phẩm theo danh mục
        document.getElementById('products-by-category').style.display = 'block';
        document.getElementById('selected-category-name').textContent = categoryName;
        
        // Lấy sản phẩm theo danh mục từ API admin
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/products/admin?category=${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        console.log('API response:', data);
        
        if (data.success) {
            displayCategoryProducts(data.products || []);
        } else {
            showError('Không thể tải sản phẩm!');
        }
    } catch (error) {
        console.error('Error loading category products:', error);
        showError('Lỗi kết nối server!');
    } finally {
        showLoading(false);
    }
}

// Display products in category
function displayCategoryProducts(products) {
    console.log('Displaying products:', products);
    const productsList = document.getElementById('category-products-list');
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                <p>Chưa có sản phẩm nào trong danh mục này</p>
            </div>
        `;
        return;
    }
    
    productsList.innerHTML = products.map(product => {
        const imgSrc = product.mainImage 
            ? (product.mainImage.startsWith('products/') ? `/${product.mainImage}` : `/products/${product.mainImage}`)
            : 'products/f1.jpg';
            
        return `
            <div class="product-card">
                <img src="${imgSrc}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-price">$${product.price}</p>
                    <p>Số sao: ${product.rating}/5</p>
                    <p>Trạng thái: ${product.status || 'active'}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewProduct('${product._id}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editProduct('${product._id}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Hide category products and show categories list
function hideCategoryProducts() {
    document.getElementById('products-by-category').style.display = 'none';
    document.getElementById('categories-list').style.display = 'block';
}

// Update category select
function updateCategorySelect() {
    const categorySelect = document.getElementById('product-category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Chọn danh mục</option>' +
            categories.map(cat => `<option value="${cat._id}">${cat.name}</option>`).join('');
    }
}

// Show modals
function showAddProductModal() {
    document.getElementById('add-product-modal').style.display = 'block';
    resetProductForm();
}

function showAddCategoryModal() {
    document.getElementById('add-category-modal').style.display = 'block';
    resetCategoryForm();
}

// Reset forms
function resetProductForm() {
    document.getElementById('add-product-form').reset();
    selectedFiles = { mainImage: null, detailImages: [] };
    document.getElementById('main-image-preview').innerHTML = '';
    document.getElementById('detail-images-preview').innerHTML = '';
}

function resetCategoryForm() {
    document.getElementById('add-category-form').reset();
}

// Image preview functions
function previewMainImage(input) {
    const file = input.files[0];
    if (file) {
        selectedFiles.mainImage = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('main-image-preview').innerHTML = `
                <img src="${e.target.result}" alt="Main Image">
            `;
        };
        reader.readAsDataURL(file);
    }
}

function previewDetailImages(input) {
    const files = Array.from(input.files);
    selectedFiles.detailImages = files.slice(0, 4); // Limit to 4 images
    
    const preview = document.getElementById('detail-images-preview');
    preview.innerHTML = '';
    
    selectedFiles.detailImages.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML += `
                <img src="${e.target.result}" alt="Detail Image">
            `;
        };
        reader.readAsDataURL(file);
    });
}

// Handle add product
async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('product-name').value);
    // Lấy category ID từ value
    const categorySelect = document.getElementById('product-category');
    const categoryId = categorySelect.value;
    formData.append('category', categoryId);
    formData.append('price', document.getElementById('product-price').value);
    formData.append('rating', document.getElementById('product-rating').value);
    formData.append('description', document.getElementById('product-description').value);
    
    // Add main image
    if (selectedFiles.mainImage) {
        formData.append('mainImage', selectedFiles.mainImage);
    }
    
    // Add detail images
    selectedFiles.detailImages.forEach((file, index) => {
        formData.append(`detailImages`, file);
    });
    
    // Add sizes
    const selectedSizes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    formData.append('sizes', JSON.stringify(selectedSizes));
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showSuccess('Thêm sản phẩm thành công!');
                closeModal('add-product-modal');
                loadProducts();
            } else {
                showError(data.error || 'Có lỗi xảy ra khi thêm sản phẩm!');
            }
        } else {
            showError('Không thể thêm sản phẩm!');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showError('Lỗi kết nối server!');
    }
}

// Handle add category
async function handleAddCategory(e) {
    e.preventDefault();
    
    const categoryData = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showSuccess('Thêm danh mục thành công!');
                closeModal('add-category-modal');
                loadCategories();
            } else {
                showError(data.error || 'Có lỗi xảy ra khi thêm danh mục!');
            }
        } else {
            showError('Không thể thêm danh mục!');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showError('Lỗi kết nối server!');
    }
}

// Product actions
function viewProduct(productId) {
    window.location.href = `sproduct_detail.html?id=${productId}`;
}

function editProduct(productId) {
    alert('Chức năng chỉnh sửa sản phẩm đang được phát triển!');
}

function deleteProduct(productId) {
    showConfirmationModal('Bạn có chắc chắn muốn xóa sản phẩm này?', () => {
        performDeleteProduct(productId);
    });
}

async function performDeleteProduct(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showSuccess('Đã xóa sản phẩm!');
                loadProducts();
            } else {
                showError(data.error || 'Có lỗi xảy ra khi xóa sản phẩm!');
            }
        } else {
            showError('Không thể xóa sản phẩm!');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Lỗi kết nối server!');
    }
}

// Category actions
function editCategory(categoryId) {
    showConfirmationModal('Chức năng chỉnh sửa danh mục đang được phát triển!', () => {
        // Placeholder for future edit functionality
    });
}

function deleteCategory(categoryId) {
    showConfirmationModal('⚠️ CẢNH BÁO: Xóa danh mục này sẽ xóa TẤT CẢ sản phẩm trong danh mục và ảnh của chúng! Bạn có chắc chắn muốn tiếp tục?', () => {
        performDeleteCategory(categoryId);
    });
}

async function performDeleteCategory(categoryId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showSuccess(data.message || 'Đã xóa danh mục!');
                loadCategories();
                loadProducts(); // Reload products để cập nhật số liệu
            } else {
                showError(data.error || 'Có lỗi xảy ra khi xóa danh mục!');
            }
        } else {
            showError('Không thể xóa danh mục!');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showError('Lỗi kết nối server!');
    }
}

// Utility functions
function refreshProducts() {
    loadProducts();
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.style.display = 'block';
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

// Confirmation Modal Functions
let currentConfirmationCallback = null;

function showConfirmationModal(message, callback) {
    const modal = document.getElementById('confirmation-modal');
    const messageElement = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirm-btn');
    
    messageElement.textContent = message;
    currentConfirmationCallback = callback;
    
    // Setup confirm button
    confirmBtn.onclick = () => {
        if (currentConfirmationCallback) {
            currentConfirmationCallback();
        }
        closeConfirmationModal();
    };
    
    modal.style.display = 'block';
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'none';
    currentConfirmationCallback = null;
} 