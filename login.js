// Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Kiểm tra nếu đã đăng nhập thì chuyển hướng
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
        window.location.href = 'user.html';
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset messages
        errorMessage.textContent = '';
        successMessage.textContent = '';
        
        // Get form data
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Validation
        if (!email || !password) {
            showError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        // Show loading
        setLoading(true);
        
        try {
            console.log('Đang đăng nhập với:', { email, password });
            
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok && data.success) {
                // Đăng nhập thành công
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', email);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('showWelcome', '1');
                
                showSuccess('Đăng nhập thành công! Đang chuyển hướng...');
                
                // Chuyển hướng dựa trên role
                setTimeout(() => {
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'user.html';
                    }
                }, 1000);
            } else {
                // Đăng nhập thất bại
                showError(data.error || 'Email hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Không thể kết nối tới server! Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    });
    
    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Đang xử lý...';
            loading.style.display = 'block';
        } else {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Đăng nhập';
            loading.style.display = 'none';
        }
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }
    
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }
    
    // Auto focus vào email field
    document.getElementById('email').focus();
}); 