# 🚀 E-commerce Shoe Store với Flask Backend

## 📋 Tổng quan

Ứng dụng E-commerce Shoe Store đã được chuyển đổi từ Node.js sang Python Flask với MongoDB Atlas.

## 🛠️ Công nghệ sử dụng

### Backend
- **Framework**: Flask (Python)
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **CORS**: Flask-CORS

### Frontend
- **HTML/CSS/JavaScript**
- **Font Awesome Icons**
- **Responsive Design**

## 🚀 Cách chạy ứng dụng

### 1. Khởi động nhanh (Khuyến nghị)
```bash
python start_app.py
```

### 2. Khởi động thủ công

#### Bước 1: Khởi động Flask Backend
```bash
cd backend
python app.py
```

#### Bước 2: Khởi động Frontend Server
```bash
# Sử dụng Live Server extension trong VS Code
# Hoặc sử dụng Python HTTP server
python -m http.server 5500
```

## 🌐 URLs

### Backend APIs
- **Base URL**: `http://localhost:3000`
- **Register**: `POST /api/register`
- **Login**: `POST /api/login`
- **User Info**: `GET /api/me`
- **Products**: `GET /api/products`
- **Orders**: `GET/POST /api/orders`

### Frontend Pages
- **Trang chủ**: `http://localhost:5500/index.html`
- **Đăng nhập**: `http://localhost:5500/login.html`
- **Đăng ký**: `http://localhost:5500/register.html`

## 🔧 Cấu hình MongoDB Atlas

### Connection String
```
mongodb+srv://hapham:971012@cluster0.bezcusp.mongodb.net/Shoe-store?retryWrites=true&w=majority
```

### Database Collections
- `users` - Thông tin người dùng
- `products` - Sản phẩm
- `orders` - Đơn hàng

## 📁 Cấu trúc thư mục

```
Ecommerce-shoe-store/
├── backend/
│   ├── app.py              # Flask application
│   ├── config.py           # Cấu hình
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   ├── test_api.py        # Test API endpoints
│   └── README.md          # Backend documentation
├── login.html             # Trang đăng nhập
├── login.js              # Logic đăng nhập
├── register.html          # Trang đăng ký
├── register.js           # Logic đăng ký
├── start_app.py           # Script khởi động
└── README_FLASK.md        # Documentation này
```

## 🧪 Test API

### Test tự động
```bash
cd backend
python test_api.py
```

### Test thủ công
1. Mở `http://localhost:5500/login.html`
2. Test các API endpoints
3. Kiểm tra kết quả

## 🔐 Authentication

### Register
```javascript
fetch('http://localhost:3000/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Login
```javascript
fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Get User Info
```javascript
fetch('http://localhost:3000/api/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## 🎯 Tính năng đã hoàn thành

### ✅ Backend
- [x] Flask application setup
- [x] MongoDB Atlas integration
- [x] JWT authentication
- [x] User registration/login
- [x] Product management
- [x] Order management
- [x] CORS configuration
- [x] API testing

### ✅ Frontend
- [x] Login page
- [x] Register page
- [x] API integration
- [x] Token management
- [x] Error handling

## 🐛 Troubleshooting

### Flask backend không khởi động
1. Kiểm tra MongoDB Atlas connection
2. Kiểm tra file `.env`
3. Cài đặt dependencies: `pip install -r requirements.txt`

### API không hoạt động
1. Kiểm tra Flask backend có chạy trên port 3000
2. Kiểm tra CORS configuration
3. Test với `python test_api.py`

### Frontend không kết nối được
1. Kiểm tra Flask backend URL
2. Kiểm tra browser console
3. Test với `login.html`

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs trong terminal
2. Test API với `test_api.py`
3. Kiểm tra MongoDB Atlas connection
4. Xem browser console để debug frontend

## 🎉 Kết quả

✅ **Flask Backend**: Hoạt động với MongoDB Atlas
✅ **Frontend**: Kết nối thành công với API
✅ **Authentication**: JWT token hoạt động
✅ **Database**: MongoDB Atlas kết nối thành công
✅ **API Testing**: Tất cả endpoints hoạt động

Ứng dụng đã sẵn sàng để sử dụng! 🚀 