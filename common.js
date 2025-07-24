// common.js
// Common functions for E-commerce Shoe Store

// Hamburger menu
function setupHamburgerMenu() {
  var hamburger = document.getElementById('hamburger');
  var navbar = document.getElementById('navbar');
  if (hamburger && navbar) {
    hamburger.addEventListener('click', function() {
      navbar.classList.toggle('open');
    });
  }
}
// Back-to-top button
function setupBackToTop() {
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
// Smooth scroll
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
// Tab modal
function setupTabModal() {
  var tabBtns = document.querySelectorAll('.tab button.tablinks');
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function(evt) {
      var tabName = btn.getAttribute('data-tab');
      var tabcontent = document.getElementsByClassName('tabcontent');
      for (var i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = 'none';
      var tablinks = document.getElementsByClassName('tablinks');
      for (var i = 0; i < tablinks.length; i++) tablinks[i].classList.remove('active');
      document.getElementById(tabName).style.display = 'block';
      btn.classList.add('active');
    });
  });
}
// Export
export { setupHamburgerMenu, setupBackToTop, setupSmoothScroll, setupTabModal };

document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('login-btn');
  const email = localStorage.getItem('email');
  const showWelcome = localStorage.getItem('showWelcome');
  if (email && loginBtn) {
    loginBtn.innerHTML = `<i class=\"fa fa-user\"></i> Xin chào, ${email} <span id=\"logout-btn\" style=\"margin-left:12px;cursor:pointer;color:#f37021;font-weight:bold;\">Đăng xuất</span>`;
    loginBtn.removeAttribute('href');
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = function(e) {
        e.stopPropagation();
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('showWelcome');
        window.location.reload();
      };
    }
    // Hiển thị thông báo chào mừng nếu vừa đăng nhập
    if (showWelcome) {
      setTimeout(() => {
        alert(`Xin chào, ${email} !`);
        localStorage.removeItem('showWelcome');
      }, 300);
    }
  } else if (loginBtn) {
    loginBtn.innerHTML = '<i class="fa fa-user"></i> Đăng nhập';
    loginBtn.setAttribute('href', 'auth.html');
  }
}); 