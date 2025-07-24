// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/Shoe-store', { useNewUrlParser: true, useUnifiedTopology: true });

// Sử dụng model User từ file User.js
const User = require('./User');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  status: String
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  user: String,
  items: Array,
  total: Number,
  status: String
});
const Order = mongoose.model('Order', orderSchema);

const SECRET = 'SECRET_KEY';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin only' });
}

// Đăng ký
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, error: 'Email đã tồn tại.' });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hash });
  await user.save();
  res.json({ success: true });
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ success: false, error: 'Sai tài khoản hoặc mật khẩu' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ success: false, error: 'Sai tài khoản hoặc mật khẩu' });
  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: '1d' });
  res.json({ success: true, token, role: user.role });
});

// Lấy thông tin user từ token
app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ success: false, error: 'Không tìm thấy user' });
  res.json({ success: true, email: user.email, role: user.role });
});

// Lấy danh sách sản phẩm
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Thêm sản phẩm (chỉ admin)
app.post('/api/products', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, price, image, status } = req.body;
  const product = new Product({ name, price, image, status });
  await product.save();
  res.json({ success: true });
});

// Lấy đơn hàng (chỉ admin)
app.get('/api/orders', authMiddleware, adminMiddleware, async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// Tạo đơn hàng (user)
app.post('/api/orders', authMiddleware, async (req, res) => {
  const { user, items, total, status } = req.body;
  const order = new Order({ user, items, total, status });
  await order.save();
  res.json({ success: true });
});

app.listen(3000, () => console.log('Backend running on http://localhost:3000')); 