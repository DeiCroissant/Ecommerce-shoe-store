// User Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadUserInfo();
});

// Kiểm tra trạng thái đăng nhập
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    
    if (token && email) {
        // Kiểm tra role
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
            // Nếu là admin, chuyển đến trang admin
            window.location.href = 'admin.html';
            return;
        }
        
        // User đã đăng nhập
        document.getElementById('auth-links').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('user-email').textContent = email;
        
        // Load thông tin user từ server
        loadUserInfoFromServer();
    } else {
        // User chưa đăng nhập, chuyển về trang đăng nhập
        window.location.href = 'login.html';
    }
}

// Load thông tin user từ server
async function loadUserInfoFromServer() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                displayUserInfo(data);
            } else {
                // Token không hợp lệ, logout
                logout();
            }
        } else {
            // Lỗi server, logout
            logout();
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // Lỗi kết nối, vẫn hiển thị thông tin từ localStorage
        displayUserInfoFromLocalStorage();
    }
}

// Hiển thị thông tin user
function displayUserInfo(data) {
    const email = data.email || localStorage.getItem('email');
    const role = data.role || 'user';
    
    // Cập nhật các element
    document.getElementById('welcome-email').textContent = email;
    document.getElementById('user-email-display').textContent = email;
    document.getElementById('user-role').textContent = role === 'admin' ? 'Quản trị viên' : 'Người dùng';
    document.getElementById('join-date').textContent = new Date().toLocaleDateString('vi-VN');
    
    // Lưu thông tin vào localStorage
    localStorage.setItem('userRole', role);
}

// Hiển thị thông tin từ localStorage (fallback)
function displayUserInfoFromLocalStorage() {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('userRole') || 'user';
    
    document.getElementById('welcome-email').textContent = email;
    document.getElementById('user-email-display').textContent = email;
    document.getElementById('user-role').textContent = role === 'admin' ? 'Quản trị viên' : 'Người dùng';
    document.getElementById('join-date').textContent = new Date().toLocaleDateString('vi-VN');
}

// Load thông tin user (fallback)
function loadUserInfo() {
    const email = localStorage.getItem('email');
    if (email) {
        displayUserInfoFromLocalStorage();
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userRole');
    localStorage.removeItem('showWelcome');
    
    // Chuyển về trang đăng nhập
    window.location.href = 'login.html';
}

// Chỉnh sửa thông tin cá nhân
function editProfile() {
    alert('Tính năng đang được phát triển!');
}

// Xem tất cả đơn hàng
function viewAllOrders() {
    alert('Tính năng đang được phát triển!');
}

// Đổi mật khẩu
function changePassword() {
    alert('Tính năng đang được phát triển!');
}

// Xóa tài khoản
function deleteAccount() {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
        alert('Tính năng đang được phát triển!');
    }
}

// Cập nhật số liệu thống kê
function updateStats() {
    // Có thể load từ server sau này
    document.getElementById('order-count').textContent = '0';
    document.getElementById('favorite-count').textContent = '0';
    document.getElementById('review-count').textContent = '0';
}

// Load đơn hàng gần đây
function loadRecentOrders() {
    const recentOrdersDiv = document.getElementById('recent-orders');
    recentOrdersDiv.innerHTML = '<p>Chưa có đơn hàng nào</p>';
}

// Auto load khi trang load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    loadRecentOrders();
}); 