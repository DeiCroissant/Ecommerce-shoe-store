// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadAdminStats();
    setupAdminDropdown();
});

// Kiểm tra quyền admin
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !email) {
        // Chưa đăng nhập, chuyển về trang login
        window.location.href = 'login.html';
        return;
    }
    
    if (userRole !== 'admin') {
        // Không phải admin, chuyển về trang user
        alert('Bạn không có quyền truy cập trang Admin!');
        window.location.href = 'user.html';
        return;
    }
    
    // Hiển thị thông tin admin
    document.getElementById('admin-email').textContent = email;
    
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

// Load thống kê admin
async function loadAdminStats() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('total-users').textContent = data.totalUsers.toLocaleString();
            document.getElementById('total-products').textContent = data.totalProducts.toLocaleString();
            document.getElementById('total-orders').textContent = data.totalOrders.toLocaleString();
            document.getElementById('total-revenue').textContent = data.totalRevenue.toLocaleString('vi-VN') + '₫';
        } else {
            throw new Error(data.error || 'Không lấy được thống kê');
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// Setup admin dropdown
function setupAdminDropdown() {
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

// Admin Functions
function manageUsers() {
    window.location.href = 'user_management.html';
}

function manageProducts() {
    window.location.href = 'product_management.html';
}

function manageOrders() {
    window.location.href = 'order_management.html';
}

function viewAnalytics() {
    alert('Chức năng xem thống kê đang được phát triển!');
}

// User Management
function viewUsers() {
    window.location.href = 'user_management.html';
}

function addUser() {
    alert('Thêm người dùng mới - Đang phát triển!');
}

function editUserRoles() {
    alert('Chỉnh sửa quyền người dùng - Đang phát triển!');
}

function deleteUser() {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        alert('Xóa người dùng - Đang phát triển!');
    }
}

// Product Management
function viewProducts() {
    window.location.href = 'product_management.html';
}

function addProduct() {
    alert('Thêm sản phẩm mới - Đang phát triển!');
}

function editProduct() {
    alert('Chỉnh sửa sản phẩm - Đang phát triển!');
}

function deleteProduct() {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        alert('Xóa sản phẩm - Đang phát triển!');
    }
}

// Order Management
function viewOrders() {
    window.location.href = 'order_management.html';
}

function updateOrderStatus() {
    alert('Cập nhật trạng thái đơn hàng - Đang phát triển!');
}

function viewOrderDetails() {
    alert('Xem chi tiết đơn hàng - Đang phát triển!');
}

function exportOrders() {
    alert('Xuất báo cáo đơn hàng - Đang phát triển!');
}

// System Settings
function generalSettings() {
    alert('Cài đặt chung hệ thống - Đang phát triển!');
}

function backupSystem() {
    alert('Quản lý backup hệ thống - Đang phát triển!');
}

function viewLogs() {
    alert('Xem logs hệ thống - Đang phát triển!');
}

function securitySettings() {
    alert('Cài đặt bảo mật - Đang phát triển!');
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userRole');
    localStorage.removeItem('showWelcome');
    
    // Chuyển về trang đăng nhập
    window.location.href = 'login.html';
} 