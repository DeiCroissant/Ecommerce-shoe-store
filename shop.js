// shop.js
// Shop page logic for E-commerce Shoe Store
import { setupAddToCartButtons, updateCartCount } from './cart.js';
import { showUserName } from './common.js';

document.addEventListener('DOMContentLoaded', function() {
  // Lọc sản phẩm theo tag và làm nổi bật mục đang chọn
  document.querySelectorAll('.category-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var tag = this.getAttribute('data-tag');
      document.querySelectorAll('.category-item').forEach(function(i){
        i.classList.remove('selected');
      });
      this.classList.add('selected');
      document.querySelectorAll('.pro').forEach(function(pro) {
        var span = pro.querySelector('.desc span');
        if (tag === 'all' || (span && span.textContent.trim() === tag)) {
          pro.style.display = '';
        } else {
          pro.style.display = 'none';
        }
      });
    });
  });
  // Đặt mặc định là 'Tất cả' được chọn
  var defaultCat = document.querySelector('.category-item[data-tag="all"]');
  if(defaultCat) defaultCat.classList.add('selected');

  // Gắn nút add to cart
  setupAddToCartButtons();
  // Hiển thị số lượng sản phẩm trên icon giỏ hàng
  updateCartCount();
  // Hiển thị tên user nếu đã đăng nhập
  showUserName();
}); 