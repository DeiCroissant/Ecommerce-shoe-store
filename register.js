// Register JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrength = document.getElementById('password-strength');

    // Kiểm tra nếu đã đăng nhập thì chuyển hướng
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
        window.location.href = 'user.html';
    }

    // Kiểm tra độ mạnh mật khẩu
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        
        passwordStrength.textContent = strength.message;
        passwordStrength.className = 'password-strength ' + strength.class;
    });

    // Kiểm tra xác nhận mật khẩu
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.classList.add('error');
            this.classList.remove('success');
        } else if (confirmPassword && password === confirmPassword) {
            this.classList.remove('error');
            this.classList.add('success');
        } else {
            this.classList.remove('error', 'success');
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset messages
        errorMessage.textContent = '';
        successMessage.textContent = '';
        
        // Get form data
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        // Validation
        if (!email || !password || !confirmPassword) {
            showError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Mật khẩu nhập lại không khớp!');
            return;
        }
        
        if (password.length < 6) {
            showError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        // Show loading
        setLoading(true);
        
        try {
            console.log('Đang đăng ký với:', { email, password });
            
            const response = await fetch('http://localhost:3000/api/register', {
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
                // Đăng ký thành công
                showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
                
                // Reset form
                registerForm.reset();
                passwordStrength.textContent = '';
                confirmPasswordInput.classList.remove('error', 'success');
                
                // Chuyển hướng sau 2 giây
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                // Đăng ký thất bại
                showError(data.error || 'Có lỗi xảy ra khi đăng ký!');
            }
        } catch (error) {
            console.error('Register error:', error);
            showError('Không thể kết nối tới server! Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    });
    
    function checkPasswordStrength(password) {
        if (password.length === 0) {
            return { message: '', class: '' };
        }
        
        let score = 0;
        let feedback = [];
        
        if (password.length >= 8) score++;
        else feedback.push('Ít nhất 8 ký tự');
        
        if (/[a-z]/.test(password)) score++;
        else feedback.push('Có chữ thường');
        
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Có chữ hoa');
        
        if (/[0-9]/.test(password)) score++;
        else feedback.push('Có số');
        
        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('Có ký tự đặc biệt');
        
        if (score <= 2) {
            return { 
                message: 'Mật khẩu yếu: ' + feedback.join(', '), 
                class: 'strength-weak' 
            };
        } else if (score <= 4) {
            return { 
                message: 'Mật khẩu trung bình: ' + feedback.join(', '), 
                class: 'strength-medium' 
            };
        } else {
            return { 
                message: 'Mật khẩu mạnh!', 
                class: 'strength-strong' 
            };
        }
    }
    
    function setLoading(isLoading) {
        if (isLoading) {
            registerBtn.disabled = true;
            registerBtn.textContent = 'Đang xử lý...';
            loading.style.display = 'block';
        } else {
            registerBtn.disabled = false;
            registerBtn.textContent = 'Đăng ký';
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