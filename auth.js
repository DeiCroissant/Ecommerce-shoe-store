const form = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const toggleForm = document.getElementById('toggle-form');
const errorMessage = document.getElementById('error-message');
const repasswordInput = document.getElementById('repassword');

let isLogin = true;

function showRegisterFields(show) {
  if (show) {
    repasswordInput.style.display = '';
    repasswordInput.previousElementSibling.style.marginBottom = '10px';
  } else {
    repasswordInput.style.display = 'none';
  }
}

toggleForm.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  if (isLogin) {
    formTitle.textContent = 'Đăng nhập';
    submitBtn.textContent = 'Đăng nhập';
    toggleForm.innerHTML = 'Chưa có tài khoản? <a href="#" id="switch-to-register">Đăng ký</a>';
    showRegisterFields(false);
  } else {
    formTitle.textContent = 'Đăng ký';
    submitBtn.textContent = 'Đăng ký';
    toggleForm.innerHTML = 'Đã có tài khoản? <a href="#" id="switch-to-register">Đăng nhập</a>';
    showRegisterFields(true);
  }
  errorMessage.textContent = '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const repassword = repasswordInput.value.trim();

  if (!email || !password || (!isLogin && !repassword)) {
    errorMessage.textContent = 'Vui lòng nhập đầy đủ thông tin!';
    return;
  }
  if (!isLogin && password !== repassword) {
    errorMessage.textContent = 'Mật khẩu nhập lại không khớp!';
    return;
  }

  try {
    const url = isLogin ? 'http://localhost:3000/api/login' : 'http://localhost:3000/api/register';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      errorMessage.textContent = data.error || 'Có lỗi xảy ra!';
      return;
    }

    if (isLogin) {
      // Lưu token, chuyển hướng hoặc hiển thị tài khoản
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email);
      localStorage.setItem('showWelcome', '1');
      // Quay lại trang trước nếu có, hoặc về index.html
      if (document.referrer && !document.referrer.includes('auth.html')) {
        window.location.href = document.referrer;
      } else {
        window.location.href = 'index.html';
      }
    } else {
      errorMessage.style.color = 'green';
      errorMessage.textContent = 'Đăng ký thành công! Vui lòng đăng nhập.';
      setTimeout(() => {
        isLogin = true;
        formTitle.textContent = 'Đăng nhập';
        submitBtn.textContent = 'Đăng nhập';
        toggleForm.innerHTML = 'Chưa có tài khoản? <a href="#" id="switch-to-register">Đăng ký</a>';
        showRegisterFields(false);
        errorMessage.textContent = '';
        errorMessage.style.color = 'red';
      }, 1500);
    }
  } catch (err) {
    errorMessage.textContent = 'Không thể kết nối tới server!';
  }
});
// Khi load lại trang, nếu ở chế độ đăng ký thì hiện trường nhập lại mật khẩu
if (!isLogin) showRegisterFields(true); 