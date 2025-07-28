# Hệ thống Authentication - Shoe Store

## 📋 Tổng quan

Hệ thống authentication được tách riêng thành 2 trang:
- **`login.html`** - Trang đăng nhập
- **`register.html`** - Trang đăng ký

## 🚀 Cách sử dụng

### 1. Khởi động nhanh
```bash
python start_auth.py
```

### 2. Khởi động thủ công

#### Bước 1: Khởi động Flask Backend
```bash
cd backend
python app.py
```

#### Bước 2: Mở Live Server
- Mở VS Code
- Cài extension "Live Server"
- Right-click vào file `index.html` → "Open with Live Server"

#### Bước 3: Truy cập các trang
- **Đăng ký**: http://127.0.0.1:5502/register.html
- **Đăng nhập**: http://127.0.0.1:5502/login.html
- **User Dashboard**: http://127.0.0.1:5502/user.html

## 📁 Cấu trúc file

```
├── login.html          # Trang đăng nhập
├── login.js           # Logic đăng nhập
├── register.html      # Trang đăng ký
├── register.js        # Logic đăng ký
├── user.html          # Trang dashboard user
├── user.js           # Logic user dashboard
├── start_auth.py     # Script khởi động nhanh
└── README_AUTH.md    # Hướng dẫn này
```

## 🎨 Tính năng

### Trang Đăng nhập (`login.html`)
- ✅ Form đăng nhập với email/password
- ✅ Validation client-side
- ✅ Loading state khi submit
- ✅ Error handling
- ✅ Auto redirect nếu đã đăng nhập
- ✅ Chuyển hướng đến user dashboard sau khi đăng nhập

### Trang Đăng ký (`register.html`)
- ✅ Form đăng ký với email/password/confirm password
- ✅ Kiểm tra độ mạnh mật khẩu
- ✅ Validation client-side
- ✅ Loading state khi submit
- ✅ Error handling
- ✅ Auto redirect nếu đã đăng nhập
- ✅ Chuyển hướng đến login sau khi đăng ký thành công

### Trang User Dashboard (`user.html`)
- ✅ Hiển thị thông tin user
- ✅ Kiểm tra authentication
- ✅ Chức năng logout
- ✅ Thống kê cơ bản
- ✅ Responsive design

## 🔧 API Endpoints

### Backend Flask (http://localhost:3000)
- `POST /api/register` - Đăng ký user mới
- `POST /api/login` - Đăng nhập
- `GET /api/me` - Lấy thông tin user hiện tại
- `GET /api/products` - Lấy danh sách sản phẩm

## 🎯 Luồng hoạt động

### Đăng ký
1. User truy cập `register.html`
2. Nhập email, password, confirm password
3. Client validation (độ mạnh mật khẩu, xác nhận password)
4. Gửi request đến `POST /api/register`
5. Nếu thành công → Chuyển hướng đến `login.html`
6. Nếu thất bại → Hiển thị error message

### Đăng nhập
1. User truy cập `login.html`
2. Nhập email, password
3. Client validation
4. Gửi request đến `POST /api/login`
5. Nếu thành công → Lưu token → Chuyển hướng đến `user.html`
6. Nếu thất bại → Hiển thị error message

### User Dashboard
1. Kiểm tra token trong localStorage
2. Nếu có token → Load thông tin user từ `GET /api/me`
3. Hiển thị thông tin user
4. Cung cấp chức năng logout

## 🛠️ Công nghệ sử dụng

### Frontend
- **HTML5** - Cấu trúc trang
- **CSS3** - Styling với gradient background
- **JavaScript (ES6+)** - Logic xử lý
- **Font Awesome** - Icons
- **Google Fonts** - Typography

### Backend
- **Python Flask** - Web framework
- **PyMongo** - MongoDB driver
- **JWT** - Authentication tokens
- **Werkzeug** - Password hashing
- **Flask-CORS** - Cross-origin requests

### Database
- **MongoDB Atlas** - Cloud database

## 🔒 Bảo mật

- ✅ Password hashing với Werkzeug
- ✅ JWT tokens cho authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling
- ✅ Secure password requirements

## 🎨 UI/UX Features

- ✅ Responsive design
- ✅ Loading states
- ✅ Error/success messages
- ✅ Password strength indicator
- ✅ Form validation feedback
- ✅ Smooth transitions
- ✅ Modern gradient background
- ✅ Clean card-based layout

## 🚀 Deployment

### Local Development
```bash
# Terminal 1: Backend
cd backend
python app.py

# Terminal 2: Frontend (VS Code Live Server)
# Right-click index.html → Open with Live Server
```

### Production
- Deploy Flask backend lên server
- Deploy static files lên CDN
- Cấu hình domain và SSL
- Setup MongoDB Atlas production cluster

## 📝 Notes

- Backend chạy trên port 3000
- Frontend chạy trên port 5502 (Live Server)
- Database: MongoDB Atlas
- Authentication: JWT tokens
- Password: Minimum 6 characters

## 🐛 Troubleshooting

### Lỗi kết nối backend
- Kiểm tra Flask backend có đang chạy không
- Kiểm tra port 3000 có bị block không
- Kiểm tra CORS configuration

### Lỗi database
- Kiểm tra MongoDB Atlas connection string
- Kiểm tra network access settings
- Kiểm tra database user permissions

### Lỗi frontend
- Kiểm tra Live Server có đang chạy không
- Kiểm tra console errors
- Kiểm tra network requests

## 📞 Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra console browser (F12)
2. Kiểm tra terminal backend
3. Kiểm tra network tab trong DevTools
4. Đảm bảo tất cả services đang chạy 