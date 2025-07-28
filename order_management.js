// order_management.js
let orders = [];

// Load đơn hàng từ server
async function loadOrders() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      orders = await response.json();
      displayOrders();
    } else {
      console.error('Failed to load orders');
    }
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

// Hiển thị danh sách đơn hàng
function displayOrders() {
  const container = document.getElementById('orders-container');
  const statusFilter = document.getElementById('status-filter').value;
  
  let filteredOrders = orders;
  if (statusFilter) {
    filteredOrders = orders.filter(order => order.status === statusFilter);
  }

  if (filteredOrders.length === 0) {
    container.innerHTML = '<div class="no-orders">Không có đơn hàng nào</div>';
    return;
  }

  let html = `
    <table width="100%">
      <thead>
        <tr>
          <td>Mã đơn hàng</td>
          <td>Khách hàng</td>
          <td>Sản phẩm</td>
          <td>Tổng tiền</td>
          <td>Trạng thái</td>
          <td>Ngày tạo</td>
          <td>Thao tác</td>
        </tr>
      </thead>
      <tbody>
  `;

  filteredOrders.forEach(order => {
    const itemCount = order.items ? order.items.length : 0;
    const statusClass = getStatusClass(order.status);
    const statusText = getStatusText(order.status);
    
    html += `
      <tr>
        <td>${order.order_id || 'N/A'}</td>
        <td>${order.shipping_address ? order.shipping_address.fullname : 'N/A'}</td>
        <td>${itemCount} sản phẩm</td>
        <td>${order.total ? order.total.toLocaleString('vi-VN') + '₫' : 'N/A'}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${order.created_at || 'N/A'}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="viewOrderDetail('${order._id}')">
            <i class="fas fa-eye"></i> Xem
          </button>
          <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Đã gửi hàng</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao hàng</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
          </select>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Lấy class CSS cho trạng thái
function getStatusClass(status) {
  const statusClasses = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'shipped': 'status-shipped',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return statusClasses[status] || 'status-pending';
}

// Lấy text cho trạng thái
function getStatusText(status) {
  const statusTexts = {
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'shipped': 'Đã gửi hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy'
  };
  return statusTexts[status] || 'Chờ xử lý';
}

// Cập nhật trạng thái đơn hàng
async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      // Cập nhật local data
      const order = orders.find(o => o._id === orderId);
      if (order) {
        order.status = newStatus;
      }
      
      showSuccess('Cập nhật trạng thái thành công!');
      displayOrders(); // Refresh display
    } else {
      showError('Có lỗi khi cập nhật trạng thái!');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    showError('Lỗi kết nối server!');
  }
}

// Xem chi tiết đơn hàng
function viewOrderDetail(orderId) {
  const order = orders.find(o => o._id === orderId);
  if (!order) return;

  const modal = document.getElementById('order-detail-modal');
  const content = document.getElementById('order-detail-content');

  let html = `
    <div class="order-detail">
      <div class="order-info">
        <h3>Thông tin đơn hàng</h3>
        <p><strong>Mã đơn hàng:</strong> ${order.order_id || 'N/A'}</p>
        <p><strong>Ngày tạo:</strong> ${order.created_at || 'N/A'}</p>
        <p><strong>Trạng thái:</strong> <span class="status-badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
        <p><strong>Tổng tiền:</strong> ${order.total ? order.total.toLocaleString('vi-VN') + '₫' : 'N/A'}</p>
        ${order.coupon_code ? `<p><strong>Mã giảm giá:</strong> ${order.coupon_code} (-${order.discount_amount ? order.discount_amount.toLocaleString('vi-VN') + '₫' : '0₫'})</p>` : ''}
      </div>

      <div class="shipping-info">
        <h3>Thông tin giao hàng</h3>
        ${order.shipping_address ? `
          <p><strong>Họ tên:</strong> ${order.shipping_address.fullname}</p>
          <p><strong>Số điện thoại:</strong> ${order.shipping_address.phone}</p>
          <p><strong>Địa chỉ:</strong> ${order.shipping_address.address}</p>
          <p><strong>Tỉnh/Thành phố:</strong> ${order.shipping_address.city}</p>
          <p><strong>Quận/Huyện:</strong> ${order.shipping_address.district}</p>
          ${order.shipping_address.note ? `<p><strong>Ghi chú:</strong> ${order.shipping_address.note}</p>` : ''}
        ` : '<p>Không có thông tin địa chỉ</p>'}
      </div>

      <div class="order-items">
        <h3>Sản phẩm đã đặt</h3>
        ${order.items && order.items.length > 0 ? `
          <table width="100%">
            <thead>
              <tr>
                <td>Sản phẩm</td>
                <td>Giá</td>
                <td>Số lượng</td>
                <td>Thành tiền</td>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.price ? item.price.toLocaleString('vi-VN') + '₫' : 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price && item.quantity ? (item.price * item.quantity).toLocaleString('vi-VN') + '₫' : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align:right;font-weight:600;">Tổng phụ:</td>
                <td style="font-weight:600;">${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('vi-VN')}₫</td>
              </tr>
              ${order.discount_amount && order.discount_amount > 0 ? `
              <tr>
                <td colspan="3" style="text-align:right;font-weight:600; color:#e74c3c;">Giảm giá (${order.coupon_code}):</td>
                <td style="font-weight:600; color:#e74c3c;">- ${order.discount_amount.toLocaleString('vi-VN')}₫</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align:right;font-weight:700; color:#088178;">Tổng thanh toán:</td>
                <td style="font-weight:700; color:#088178;">${(order.total || 0).toLocaleString('vi-VN')}₫</td>
              </tr>
              ` : ''}
            </tfoot>
          </table>
        ` : '<p>Không có sản phẩm</p>'}
      </div>
    </div>
  `;

  content.innerHTML = html;
  modal.style.display = 'block';
}

// Làm mới danh sách đơn hàng
function refreshOrders() {
  loadOrders();
}

// Hiển thị thông báo
function showSuccess(msg) {
  let div = document.getElementById('success-message');
  if (!div) {
    div = document.createElement('div');
    div.id = 'success-message';
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 9999;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      font-weight: bold;
      display: none;
    `;
    document.body.appendChild(div);
  }
  div.textContent = msg;
  div.style.display = 'block';
  setTimeout(() => { div.style.display = 'none'; }, 3000);
}

function showError(msg) {
  let div = document.getElementById('error-message');
  if (!div) {
    div = document.createElement('div');
    div.id = 'error-message';
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 9999;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      font-weight: bold;
      display: none;
    `;
    document.body.appendChild(div);
  }
  div.textContent = msg;
  div.style.display = 'block';
  setTimeout(() => { div.style.display = 'none'; }, 4000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  loadOrders();
  
  // Filter by status
  document.getElementById('status-filter').addEventListener('change', displayOrders);
  
  // Modal close
  const modal = document.getElementById('order-detail-modal');
  const closeBtn = modal.querySelector('.close');
  
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  }
  
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}); 