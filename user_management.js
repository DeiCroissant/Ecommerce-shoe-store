// User Management JavaScript
let users = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadUsers();
    setupSearch();
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

// Load danh sách users
async function loadUsers() {
    showLoading(true);
    hideMessages();
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            users = data.users || [];
            filteredUsers = [...users];
            updateStats();
            displayUsers();
        } else {
            showError('Không thể tải danh sách người dùng!');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Lỗi kết nối server!');
    } finally {
        showLoading(false);
    }
}

// Cập nhật thống kê
function updateStats() {
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const regularUsers = users.filter(user => user.role === 'user').length;
    const activeUsers = users.length; // Giả sử tất cả đều active
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('admin-users').textContent = adminUsers;
    document.getElementById('regular-users').textContent = regularUsers;
    document.getElementById('active-users').textContent = activeUsers;
}

// Hiển thị danh sách users
function displayUsers() {
    const tableBody = document.getElementById('user-table-body');
    const table = document.getElementById('user-table');
    const noUsers = document.getElementById('no-users');
    const pagination = document.getElementById('pagination');
    
    if (filteredUsers.length === 0) {
        table.style.display = 'none';
        pagination.style.display = 'none';
        noUsers.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    noUsers.style.display = 'none';
    
    // Tính toán pagination
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Tạo HTML cho table
    tableBody.innerHTML = '';
    
    currentUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="user-email">${user.email}</td>
            <td>
                <span class="role-badge role-${user.role}">${user.role === 'admin' ? 'Admin' : 'User'}</span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <span class="role-badge role-user">Active</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editUserRole('${user.email}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-delete" onclick="deleteUser('${user.email}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Cập nhật pagination
    updatePagination();
}

// Cập nhật pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pageInfo.textContent = `Trang ${currentPage} của ${totalPages}`;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Chuyển trang
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayUsers();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayUsers();
    }
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filteredUsers = users.filter(user => 
            user.email.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        displayUsers();
    });
}

// Chỉnh sửa role user
function editUserRole(userEmail) {
    const user = users.find(u => u.email === userEmail);
    if (!user) return;
    
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmMessage = `Bạn có chắc chắn muốn thay đổi role của ${userEmail} từ ${user.role} thành ${newRole}?`;
    
    if (confirm(confirmMessage)) {
        updateUserRole(userEmail, newRole);
    }
}

// Cập nhật role user
async function updateUserRole(userEmail, newRole) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/role', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                role: newRole
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showSuccess(`Đã cập nhật role của ${userEmail} thành ${newRole}!`);
                loadUsers(); // Reload danh sách
            } else {
                showError(data.error || 'Có lỗi xảy ra khi cập nhật role!');
            }
        } else {
            showError('Không thể cập nhật role!');
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        showError('Lỗi kết nối server!');
    }
}

// Xóa user
function deleteUser(userEmail) {
    const confirmMessage = `Bạn có chắc chắn muốn xóa user ${userEmail}? Hành động này không thể hoàn tác!`;
    
    if (confirm(confirmMessage)) {
        performDeleteUser(userEmail);
    }
}

// Thực hiện xóa user
async function performDeleteUser(userEmail) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(userEmail)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                showSuccess(`Đã xóa user ${userEmail}!`);
                loadUsers(); // Reload danh sách
            } else {
                showError(data.error || 'Có lỗi xảy ra khi xóa user!');
            }
        } else {
            showError('Không thể xóa user!');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Lỗi kết nối server!');
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Show/hide loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    const table = document.getElementById('user-table');
    const noUsers = document.getElementById('no-users');
    
    if (show) {
        loading.style.display = 'block';
        table.style.display = 'none';
        noUsers.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

// Show/hide messages
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

// Mở modal chỉnh sửa user
function openEditUserModal(userEmail) {
    const user = users.find(u => u.email === userEmail);
    if (!user) return;
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-password').value = '';
    document.getElementById('edit-user-modal').style.display = 'block';
}

// Đóng modal
function closeEditUserModal() {
    document.getElementById('edit-user-modal').style.display = 'none';
}

// Gắn sự kiện cho nút Sửa
function attachEditUserEvents() {
    setTimeout(() => {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = function() {
                const email = this.closest('tr').querySelector('.user-email').textContent;
                openEditUserModal(email);
            };
        });
    }, 100);
}

// Sửa lại displayUsers để gọi attachEditUserEvents
const _oldDisplayUsers = displayUsers;
displayUsers = function() {
    _oldDisplayUsers();
    attachEditUserEvents();
};

// Xử lý submit form chỉnh sửa user
if (document.getElementById('edit-user-form')) {
    document.getElementById('edit-user-form').onsubmit = async function(e) {
        e.preventDefault();
        const email = document.getElementById('edit-user-email').value;
        const role = document.getElementById('edit-user-role').value;
        const password = document.getElementById('edit-user-password').value;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3000/api/users/role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, role, password })
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Cập nhật người dùng thành công!');
                closeEditUserModal();
                loadUsers();
            } else {
                showError(data.error || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            showError('Lỗi kết nối server!');
        }
    };
    document.getElementById('close-edit-user').onclick = closeEditUserModal;
    document.getElementById('cancel-edit-user').onclick = closeEditUserModal;
} 