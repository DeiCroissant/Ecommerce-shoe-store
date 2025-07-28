from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
from datetime import datetime, timedelta
from functools import wraps
import os
import json
from dotenv import load_dotenv
from config import config

# Load environment variables from .env file
load_dotenv()

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'products'))

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load config
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

# Override MONGO_URI from .env file
if os.environ.get('MONGO_URI'):
    app.config['MONGO_URI'] = os.environ.get('MONGO_URI')

# Khởi tạo CORS và MongoDB
CORS(app, origins=['*'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization', 'Accept'])
mongo = PyMongo(app)

# Middleware để xác thực JWT
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No token'}), 401
        
        try:
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

# Middleware để kiểm tra quyền admin
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'user') or request.user.get('role') != 'admin':
            return jsonify({'error': 'Admin only'}), 403
        return f(*args, **kwargs)
    return decorated

# Đăng ký
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Vui lòng nhập đầy đủ email và mật khẩu.'}), 400
    
    # Kiểm tra email đã tồn tại
    existing_user = mongo.db.users.find_one({'email': email})
    if existing_user:
        return jsonify({'success': False, 'error': 'Email đã tồn tại.'}), 400
    
    # Tạo user mới
    hashed_password = generate_password_hash(password)
    user = {
        'email': email,
        'password': hashed_password,
        'role': 'user'
    }
    mongo.db.users.insert_one(user)
    
    return jsonify({'success': True})

# Đăng nhập
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Vui lòng nhập đầy đủ email và mật khẩu.'}), 400
    
    # Tìm user
    user = mongo.db.users.find_one({'email': email})
    if not user:
        return jsonify({'success': False, 'error': 'Sai tài khoản hoặc mật khẩu'}), 401
    
    # Kiểm tra mật khẩu
    if not check_password_hash(user['password'], password):
        return jsonify({'success': False, 'error': 'Sai tài khoản hoặc mật khẩu'}), 401
    
    # Tạo JWT token
    token = jwt.encode(
        {
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'success': True,
        'token': token,
        'role': user['role']
    })

# Lấy thông tin user từ token
@app.route('/api/me', methods=['GET'])
@auth_required
def get_me():
    user = mongo.db.users.find_one({'email': request.user['email']})
    if not user:
        return jsonify({'success': False, 'error': 'Không tìm thấy user'}), 404
    
    return jsonify({
        'success': True,
        'email': user['email'],
        'role': user['role']
    })

# Lấy danh sách tất cả users (chỉ admin)
@app.route('/api/users', methods=['GET'])
@auth_required
@admin_required
def get_users():
    users = list(mongo.db.users.find({}, {'password': 0, '_id': 0}))
    return jsonify({'success': True, 'users': users})

# Cập nhật role user (chỉ admin)
@app.route('/api/users/role', methods=['PUT'])
@auth_required
@admin_required
def update_user_role():
    from werkzeug.security import generate_password_hash
    data = request.get_json()
    email = data.get('email')
    new_role = data.get('role')
    new_password = data.get('password')
    
    if not email or not new_role:
        return jsonify({'success': False, 'error': 'Thiếu thông tin email hoặc role'}), 400
    
    if new_role not in ['user', 'admin']:
        return jsonify({'success': False, 'error': 'Role không hợp lệ'}), 400
    
    # Không cho phép admin tự thay đổi role của chính mình
    if email == request.user['email']:
        return jsonify({'success': False, 'error': 'Không thể thay đổi role của chính mình'}), 400
    
    update_fields = {'role': new_role}
    if new_password:
        update_fields['password'] = generate_password_hash(new_password)
    
    result = mongo.db.users.update_one(
        {'email': email},
        {'$set': update_fields}
    )
    
    if result.modified_count > 0:
        return jsonify({'success': True, 'message': f'Đã cập nhật user {email}'})
    else:
        return jsonify({'success': False, 'error': 'Không tìm thấy user hoặc không có thay đổi'}), 404

# Xóa user (chỉ admin)
@app.route('/api/users/<email>', methods=['DELETE'])
@auth_required
@admin_required
def delete_user(email):
    # Không cho phép admin tự xóa chính mình
    if email == request.user['email']:
        return jsonify({'success': False, 'error': 'Không thể xóa chính mình'}), 400
    
    result = mongo.db.users.delete_one({'email': email})
    
    if result.deleted_count > 0:
        return jsonify({'success': True, 'message': f'Đã xóa user {email}'})
    else:
        return jsonify({'success': False, 'error': 'Không tìm thấy user'}), 404

# Lấy danh sách sản phẩm
@app.route('/api/products', methods=['GET'])
def get_products():
    category_id = request.args.get('category')
    
    # Tạo filter query
    filter_query = {}
    if category_id:
        filter_query['category'] = category_id
    
    products = list(mongo.db.products.find(filter_query))
    # Convert ObjectId to string
    for product in products:
        product['_id'] = str(product['_id'])
    return jsonify({'success': True, 'products': products})

# Lấy chi tiết sản phẩm
@app.route('/api/products/<product_id>', methods=['GET'])
def get_product_detail(product_id):
    from bson import ObjectId
    
    try:
        product = mongo.db.products.find_one({'_id': ObjectId(product_id)})
        if product:
            product['_id'] = str(product['_id'])
            return jsonify({'success': True, 'product': product})
        else:
            return jsonify({'success': False, 'error': 'Không tìm thấy sản phẩm'}), 404
    except:
        return jsonify({'success': False, 'error': 'ID sản phẩm không hợp lệ'}), 400

# Lấy danh sách sản phẩm (admin)
@app.route('/api/products/admin', methods=['GET'])
@auth_required
@admin_required
def get_products_admin():
    category_id = request.args.get('category')
    
    # Tạo filter query
    filter_query = {}
    if category_id:
        filter_query['category'] = category_id
    
    products = list(mongo.db.products.find(filter_query))
    # Convert ObjectId to string
    for product in products:
        product['_id'] = str(product['_id'])
    return jsonify({'success': True, 'products': products})

# Lấy danh sách danh mục
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = list(mongo.db.categories.find({}))
    
    # Đếm số lượng sản phẩm trong mỗi danh mục
    for category in categories:
        category['_id'] = str(category['_id'])
        # Đếm sản phẩm trong danh mục này
        product_count = mongo.db.products.count_documents({'category': category['_id']})
        category['productCount'] = product_count
    
    return jsonify({'success': True, 'categories': categories})

# Thêm danh mục (chỉ admin)
@app.route('/api/categories', methods=['POST'])
@auth_required
@admin_required
def add_category():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'success': False, 'error': 'Tên danh mục không được để trống'}), 400
    
    # Kiểm tra danh mục đã tồn tại
    existing_category = mongo.db.categories.find_one({'name': name})
    if existing_category:
        return jsonify({'success': False, 'error': 'Danh mục đã tồn tại'}), 400
    
    category = {
        'name': name,
        'description': description,
        'created_at': datetime.utcnow()
    }
    
    result = mongo.db.categories.insert_one(category)
    category['_id'] = str(result.inserted_id)
    
    return jsonify({'success': True, 'category': category})

# Xóa danh mục (chỉ admin)
@app.route('/api/categories/<category_id>', methods=['DELETE'])
@auth_required
@admin_required
def delete_category(category_id):
    from bson import ObjectId
    
    try:
        # Tìm tất cả sản phẩm trong danh mục này
        products_in_category = list(mongo.db.products.find({'category': category_id}))
        
        # Xóa ảnh của tất cả sản phẩm trong danh mục
        for product in products_in_category:
            # Xóa ảnh chính
            if product.get('mainImage'):
                main_image_path = os.path.join(app.config['UPLOAD_FOLDER'], product['mainImage'])
                if os.path.exists(main_image_path):
                    os.remove(main_image_path)
            
            # Xóa ảnh chi tiết
            if product.get('detailImages'):
                for detail_image in product['detailImages']:
                    detail_image_path = os.path.join(app.config['UPLOAD_FOLDER'], detail_image)
                    if os.path.exists(detail_image_path):
                        os.remove(detail_image_path)
        
        # Xóa tất cả sản phẩm trong danh mục
        delete_products_result = mongo.db.products.delete_many({'category': category_id})
        
        # Xóa danh mục
        delete_category_result = mongo.db.categories.delete_one({'_id': ObjectId(category_id)})
        
        if delete_category_result.deleted_count > 0:
            return jsonify({
                'success': True, 
                'message': f'Đã xóa danh mục và {delete_products_result.deleted_count} sản phẩm'
            })
        else:
            return jsonify({'success': False, 'error': 'Không tìm thấy danh mục'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': f'Lỗi khi xóa danh mục: {str(e)}'}), 400

# Thêm sản phẩm (chỉ admin)
@app.route('/api/products', methods=['POST'])
@auth_required
@admin_required
def add_product():
    try:
        # Lấy thông tin sản phẩm
        name = request.form.get('name')
        category = request.form.get('category')
        price = float(request.form.get('price', 0))
        rating = int(request.form.get('rating', 0))
        description = request.form.get('description', '')
        sizes = json.loads(request.form.get('sizes', '[]'))
        
        if not name or not price:
            return jsonify({'success': False, 'error': 'Tên sản phẩm và giá không được để trống'}), 400
        
        # Kiểm tra category có tồn tại không
        if category:
            from bson import ObjectId
            try:
                # Kiểm tra xem category có phải là ObjectId hợp lệ không
                category_obj = mongo.db.categories.find_one({'_id': ObjectId(category)})
                if not category_obj:
                    return jsonify({'success': False, 'error': 'Danh mục không tồn tại'}), 400
            except:
                return jsonify({'success': False, 'error': 'ID danh mục không hợp lệ'}), 400
        
        # Xử lý ảnh chính
        main_image = request.files.get('mainImage')
        main_image_path = None
        if main_image:
            filename = secure_filename(main_image.filename)
            main_image_path = filename
            main_image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        # Xử lý ảnh chi tiết
        detail_images = request.files.getlist('detailImages')
        detail_image_paths = []
        for i, image in enumerate(detail_images[:4]):  # Giới hạn 4 ảnh
            if image:
                filename = secure_filename(image.filename)
                image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                detail_image_paths.append(filename)
        
        product = {
            'name': name,
            'category': category,  # Đây sẽ là category ID
            'price': price,
            'rating': rating,
            'description': description,
            'mainImage': main_image_path,
            'detailImages': detail_image_paths,
            'sizes': sizes,
            'status': 'active',
            'created_at': datetime.utcnow()
        }
        
        result = mongo.db.products.insert_one(product)
        product['_id'] = str(result.inserted_id)
        
        return jsonify({'success': True, 'product': product})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Xóa sản phẩm (chỉ admin)
@app.route('/api/products/<product_id>', methods=['DELETE'])
@auth_required
@admin_required
def delete_product(product_id):
    from bson import ObjectId
    
    try:
        # Tìm sản phẩm trước khi xóa để lấy thông tin ảnh
        product = mongo.db.products.find_one({'_id': ObjectId(product_id)})
        
        if not product:
            return jsonify({'success': False, 'error': 'Không tìm thấy sản phẩm'}), 404
        
        # Xóa ảnh chính
        if product.get('mainImage'):
            main_image_path = os.path.join(app.config['UPLOAD_FOLDER'], product['mainImage'])
            if os.path.exists(main_image_path):
                os.remove(main_image_path)
        
        # Xóa ảnh chi tiết
        if product.get('detailImages'):
            for detail_image in product['detailImages']:
                detail_image_path = os.path.join(app.config['UPLOAD_FOLDER'], detail_image)
                if os.path.exists(detail_image_path):
                    os.remove(detail_image_path)
        
        # Xóa sản phẩm khỏi database
        result = mongo.db.products.delete_one({'_id': ObjectId(product_id)})
        
        if result.deleted_count > 0:
            return jsonify({'success': True, 'message': 'Đã xóa sản phẩm và ảnh'})
        else:
            return jsonify({'success': False, 'error': 'Không thể xóa sản phẩm'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': f'Lỗi khi xóa sản phẩm: {str(e)}'}), 400

# Lấy đơn hàng (chỉ admin)
@app.route('/api/orders', methods=['GET'])
@auth_required
@admin_required
def get_orders():
    orders = list(mongo.db.orders.find({}))
    for order in orders:
        order['_id'] = str(order['_id'])
        if 'created_at' in order:
            order['created_at'] = order['created_at'].strftime('%Y-%m-%d %H:%M:%S')
    return jsonify(orders)

# Tạo đơn hàng (user)
@app.route('/api/orders', methods=['POST'])
@auth_required
def create_order():
    data = request.get_json()
    user = data.get('user')
    items = data.get('items')
    total = data.get('total')
    status = data.get('status', 'pending')
    shipping_address = data.get('shipping_address', {})
    coupon_code = data.get('coupon_code', '')
    discount_amount = data.get('discount_amount', 0)
    
    order = {
        'user': user,
        'items': items,
        'total': total,
        'status': status,
        'shipping_address': shipping_address,
        'coupon_code': coupon_code,
        'discount_amount': discount_amount,
        'created_at': datetime.utcnow(),
        'order_id': f"ORD{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    }
    
    # Cập nhật số lượt sử dụng coupon nếu có
    if coupon_code:
        mongo.db.coupons.update_one(
            {'code': coupon_code.upper()},
            {'$inc': {'used': 1}}
        )
    
    result = mongo.db.orders.insert_one(order)
    order['_id'] = str(result.inserted_id)
    
    return jsonify({'success': True, 'order_id': order['order_id']})

# Cập nhật trạng thái đơn hàng (chỉ admin)
@app.route('/api/orders/<order_id>/status', methods=['PUT'])
@auth_required
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'success': False, 'error': 'Thiếu trạng thái mới'}), 400
    
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'success': False, 'error': 'Trạng thái không hợp lệ'}), 400
    
    try:
        from bson import ObjectId
        result = mongo.db.orders.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'status': new_status}}
        )
        
        if result.modified_count > 0:
            return jsonify({'success': True, 'message': 'Cập nhật trạng thái thành công'})
        else:
            return jsonify({'success': False, 'error': 'Không tìm thấy đơn hàng'}), 404
    except:
        return jsonify({'success': False, 'error': 'ID đơn hàng không hợp lệ'}), 400

# API thống kê cho admin
@app.route('/api/admin/stats', methods=['GET'])
@auth_required
@admin_required
def admin_stats():
    total_users = mongo.db.users.count_documents({})
    total_products = mongo.db.products.count_documents({})
    total_orders = mongo.db.orders.count_documents({})
    total_revenue = 0
    for order in mongo.db.orders.find({'status': 'delivered'}):
        total_revenue += order.get('total', 0)
    return jsonify({
        'success': True,
        'totalUsers': total_users,
        'totalProducts': total_products,
        'totalOrders': total_orders,
        'totalRevenue': total_revenue
    })

# ==== COUPON API ====
from flask import jsonify
from datetime import datetime

@app.route('/api/coupons', methods=['GET'])
@auth_required
@admin_required
def get_coupons():
    coupons = list(mongo.db.coupons.find({}))
    for c in coupons:
        c['_id'] = str(c['_id'])
        c['expiry'] = c['expiry'].strftime('%Y-%m-%d') if isinstance(c['expiry'], datetime) else c['expiry']
    return jsonify({'success': True, 'coupons': coupons})

@app.route('/api/coupons', methods=['POST'])
@auth_required
@admin_required
def create_coupon():
    data = request.get_json()
    code = data.get('code', '').strip().upper()
    discount = int(data.get('discount', 0))
    expiry = data.get('expiry')
    max_uses = int(data.get('maxUses', 1))
    if not code or not discount or not expiry or not max_uses:
        return jsonify({'success': False, 'error': 'Thiếu thông tin'}), 400
    if mongo.db.coupons.find_one({'code': code}):
        return jsonify({'success': False, 'error': 'Mã đã tồn tại'}), 400
    try:
        expiry_date = datetime.strptime(expiry, '%Y-%m-%d')
    except:
        return jsonify({'success': False, 'error': 'Ngày hết hạn không hợp lệ'}), 400
    coupon = {
        'code': code,
        'discount': discount,
        'expiry': expiry_date,
        'maxUses': max_uses,
        'used': 0
    }
    mongo.db.coupons.insert_one(coupon)
    return jsonify({'success': True, 'coupon': code})

@app.route('/api/coupons/<code>', methods=['DELETE'])
@auth_required
@admin_required
def delete_coupon(code):
    result = mongo.db.coupons.delete_one({'code': code.upper()})
    if result.deleted_count > 0:
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Không tìm thấy mã'}), 404

@app.route('/api/coupons/validate', methods=['GET'])
def validate_coupon():
    code = request.args.get('code', '').strip().upper()
    coupon = mongo.db.coupons.find_one({'code': code})
    if not coupon:
        return jsonify({'success': False, 'error': 'Mã không tồn tại'}), 404
    if coupon['used'] >= coupon['maxUses']:
        return jsonify({'success': False, 'error': 'Mã đã hết lượt sử dụng'}), 400
    if coupon['expiry'] < datetime.utcnow():
        return jsonify({'success': False, 'error': 'Mã đã hết hạn'}), 400
    return jsonify({'success': True, 'discount': coupon['discount']})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000) 