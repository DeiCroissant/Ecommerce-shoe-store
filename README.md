# 🛍️ Ecommerce Shoe Store

Một ứng dụng web bán giày hiện đại được xây dựng với **Frontend HTML/CSS/JavaScript** và **Backend Flask Python**, tích hợp với **MongoDB** để quản lý dữ liệu.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Chạy dự án](#-chạy-dự-án)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Endpoints](#-api-endpoints)
- [Thành viên nhóm](#-thành-viên-nhóm)
- [Đóng góp](#-đóng-góp)

## ✨ Tính năng

### 👤 Quản lý người dùng
- Đăng ký và đăng nhập với JWT authentication
- Phân quyền admin/user
- Quản lý thông tin cá nhân
- Dashboard người dùng

### 🛒 Mua sắm
- Xem danh sách sản phẩm giày
- Tìm kiếm và lọc sản phẩm
- Thêm vào giỏ hàng
- Thanh toán và đặt hàng
- Theo dõi trạng thái đơn hàng

### 🛍️ Quản lý sản phẩm (Admin)
- Thêm, sửa, xóa sản phẩm
- Upload hình ảnh sản phẩm
- Quản lý danh mục và thông tin chi tiết

### 📦 Quản lý đơn hàng (Admin)
- Xem tất cả đơn hàng
- Cập nhật trạng thái đơn hàng
- Quản lý vận chuyển

### 📝 Blog & About
- Trang blog với các bài viết
- Trang giới thiệu về cửa hàng

## 🛠️ Công nghệ sử dụng

### Frontend
- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling và responsive design
- **JavaScript (ES6+)** - Tương tác và logic
- **Font Awesome** - Icons
- **Remix Icons** - Icon library

### Backend
- **Python 3.8+** - Ngôn ngữ lập trình
- **Flask 2.3.3** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **PyJWT** - JSON Web Token authentication
- **PyMongo** - MongoDB driver
- **Werkzeug** - Password hashing

### Database
- **MongoDB** - NoSQL database
- **MongoDB Atlas** - Cloud database (khuyến nghị)

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Python 3.8 hoặc cao hơn
- MongoDB (local hoặc Atlas)
- Git

### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd Ecommerce-shoe-store
```

### Bước 2: Cài đặt Backend

#### Cài đặt Python dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Cài đặt MongoDB

**Option 1: MongoDB Local**
```bash
# Windows
# Tải và cài đặt MongoDB từ https://www.mongodb.com/try/download/community

# macOS (với Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
```

**Option 2: MongoDB Atlas (Khuyến nghị)**
1. Truy cập [MongoDB Atlas](https://cloud.mongodb.com)
2. Tạo tài khoản và cluster miễn phí
3. Cấu hình Network Access (Allow from anywhere)
4. Tạo database user
5. Lấy connection string

#### Cấu hình môi trường
```bash
# Copy file env.example
cp env.example .env

# Chỉnh sửa file .env với thông tin MongoDB của bạn
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Shoe-store?retryWrites=true&w=majority
SECRET_KEY=your-secret-key-here
```

### Bước 3: Khởi tạo dữ liệu (tùy chọn)
```bash
# Chạy script setup MongoDB Atlas
python setup_atlas.py

# Hoặc backup dữ liệu hiện tại
python migrate_data.py
```

## 🏃‍♂️ Chạy dự án

### Chạy Backend
```bash
cd backend

# Cách 1: Chạy trực tiếp
python app.py

# Cách 2: Sử dụng script run.py (khuyến nghị)
python run.py

# Cách 3: Sử dụng Flask CLI
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=3000
```

Backend sẽ chạy trên: `http://localhost:3000`

### Chạy Frontend
```bash
# Mở file index.html trong trình duyệt
# Hoặc sử dụng live server
npx live-server --port=8080
```

Frontend sẽ chạy trên: `http://localhost:8080`

## 📁 Cấu trúc dự án

```
Ecommerce-shoe-store/
├── backend/                 # Backend Flask
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   ├── run.py             # Run script
│   └── README.md          # Backend documentation
├── products/               # Product images
├── banner/                 # Banner images
├── blog/                   # Blog images
├── about/                  # About page images
├── features/               # Feature icons
├── people/                 # Team member images
├── pay/                    # Payment images
├── index.html              # Homepage
├── shop.html               # Shop page
├── cart.html               # Shopping cart
├── login.html              # Login page
├── register.html           # Register page
├── user.html               # User dashboard
├── admin.html              # Admin panel
├── product_management.html # Product management
├── order_management.html   # Order management
├── user_management.html    # User management
├── blog.html               # Blog page
├── about.html              # About page
├── sproduct_detail.html    # Product detail page
├── style.css               # Main stylesheet
├── script.js               # Main JavaScript
├── common.js               # Common functions
├── cart.js                 # Cart functionality
├── login.js                # Login functionality
├── register.js             # Register functionality
├── user.js                 # User dashboard
├── admin.js                # Admin panel
├── shop.js                 # Shop functionality
├── sproduct_detail.js      # Product detail
├── product_management.js   # Product management
├── order_management.js     # Order management
├── user_management.js      # User management
└── README.md               # Project documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Đăng ký user mới
- `POST /api/login` - Đăng nhập
- `GET /api/me` - Lấy thông tin user (cần token)

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Thêm sản phẩm mới (chỉ admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (chỉ admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (chỉ admin)

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng (admin) hoặc đơn hàng của user
- `POST /api/orders` - Tạo đơn hàng mới (cần token)
- `PUT /api/orders/:id` - Cập nhật trạng thái đơn hàng (chỉ admin)

### Users (Admin only)
- `GET /api/users` - Lấy danh sách users
- `PUT /api/users/:id` - Cập nhật thông tin user
- `DELETE /api/users/:id` - Xóa user

## 👥 Thành viên nhóm

### 🏆 Nhóm DeiCroissant

| Thành viên | Vai trò | Mô tả |
|------------|---------|-------|
| **Phạm Mạnh Hà** | Full-stack Developer | Phát triển frontend và backend, quản lý database, tích hợp API |
| **Trần Minh Khoa** | Full-stack Developer | Thiết kế UI/UX, phát triển tính năng mua sắm, quản lý sản phẩm |

### 🎯 Đóng góp của từng thành viên

#### Phạm Mạnh Hà
- **Backend Development**: Xây dựng RESTful API với Flask
- **Database Design**: Thiết kế và quản lý MongoDB schema
- **Authentication**: Implement JWT authentication system
- **Admin Panel**: Phát triển hệ thống quản lý admin
- **API Integration**: Kết nối frontend với backend APIs

#### Trần Minh Khoa
- **Frontend Development**: Phát triển giao diện người dùng responsive
- **Shopping Cart**: Implement tính năng giỏ hàng và thanh toán
- **Product Management**: Hệ thống quản lý sản phẩm
- **User Experience**: Tối ưu hóa trải nghiệm người dùng
- **UI/UX Design**: Thiết kế giao diện hiện đại và thân thiện

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp vào dự án:

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển bởi nhóm **DeiCroissant** cho mục đích học tập và nghiên cứu.

## 📞 Liên hệ

- **Phạm Mạnh Hà**: [Email hoặc GitHub]
- **Trần Minh Khoa**: [Email hoặc GitHub]

---

<div align="center">
  <p>Made with ❤️ by <strong>DeiCroissant</strong></p>
  <p>🛍️ Ecommerce Shoe Store - Where Style Meets Comfort 🛍️</p>
</div> 
