# Flask Backend cho E-commerce Shoe Store

## Cài đặt

1. **Cài đặt Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Cài đặt MongoDB:**
- **Option 1: MongoDB Local**
  - Đảm bảo MongoDB đã được cài đặt và chạy trên localhost:27017
  - Database sẽ được tạo tự động khi chạy ứng dụng

- **Option 2: MongoDB Atlas (Khuyến nghị)**
  - Chạy script cấu hình: `python setup_atlas.py`
  - Hoặc tự cấu hình theo hướng dẫn bên dưới

3. **Cấu hình môi trường (tùy chọn):**
```bash
# Copy file env.example thành .env và chỉnh sửa
cp env.example .env
```

## Chạy ứng dụng

### Cách 1: Chạy trực tiếp
```bash
python app.py
```

### Cách 2: Sử dụng script run.py (khuyến nghị)
```bash
python run.py
```

### Cách 3: Sử dụng Flask CLI
```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=3000
```

Backend sẽ chạy trên http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/register` - Đăng ký user mới
- `POST /api/login` - Đăng nhập
- `GET /api/me` - Lấy thông tin user (cần token)

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Thêm sản phẩm mới (chỉ admin)

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng (chỉ admin)
- `POST /api/orders` - Tạo đơn hàng mới (cần token)

## Cấu hình

- **SECRET_KEY**: Được sử dụng để mã hóa JWT tokens
- **MONGO_URI**: Kết nối đến MongoDB database

## Migration từ Node.js

### Backup dữ liệu hiện tại
```bash
python migrate_data.py
```

Script này sẽ:
- Backup tất cả dữ liệu từ MongoDB hiện tại
- Lưu vào file `backup_data.json`
- Hiển thị cấu trúc dữ liệu để kiểm tra

### Chuyển đổi từ Node.js

Backend này đã được chuyển đổi từ Node.js sang Flask với các tính năng tương đương:
- JWT authentication
- MongoDB integration
- CORS support
- Admin role management
- Product và Order management

### So sánh với Node.js backend

| Tính năng | Node.js | Flask |
|-----------|---------|-------|
| Framework | Express.js | Flask |
| Database | Mongoose | PyMongo |
| Authentication | JWT | JWT |
| Password Hashing | bcryptjs | Werkzeug |
| CORS | cors | Flask-CORS |

### API Endpoints (giữ nguyên)

Tất cả API endpoints vẫn giữ nguyên cấu trúc và response format:
- `/api/register` - Đăng ký
- `/api/login` - Đăng nhập
- `/api/me` - Thông tin user
- `/api/products` - Quản lý sản phẩm
- `/api/orders` - Quản lý đơn hàng

## MongoDB Atlas Setup

### Cách 1: Sử dụng script tự động
```bash
python setup_atlas.py
```

### Cách 2: Cấu hình thủ công

1. **Tạo MongoDB Atlas Cluster:**
   - Truy cập https://cloud.mongodb.com
   - Đăng ký/đăng nhập tài khoản
   - Tạo project mới
   - Tạo cluster (Free tier được khuyến nghị)

2. **Cấu hình Network Access:**
   - Vào Network Access trong menu bên trái
   - Click 'Add IP Address'
   - Chọn 'Allow Access from Anywhere' (0.0.0.0/0)

3. **Tạo Database User:**
   - Vào Database Access trong menu bên trái
   - Click 'Add New Database User'
   - Tạo username và password
   - Chọn 'Read and write to any database'

4. **Lấy Connection String:**
   - Vào Database trong menu bên trái
   - Click 'Connect' trên cluster
   - Chọn 'Connect your application'
   - Copy connection string

5. **Cấu hình Environment:**
   ```bash
   # Tạo file .env
   cp env.example .env
   
   # Cập nhật MONGO_URI trong file .env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Shoe-store?retryWrites=true&w=majority
   ```

### Test MongoDB Atlas Connection
```bash
python setup_atlas.py
``` 