const express = require('express');
const session = require('express-session');
const path = require('path');

// Import controllers
const AuthController = require('./src/controllers/authController');
const ProductController = require('./src/controllers/productController');
const CartController = require('./src/controllers/cartController');
const OrderController = require('./src/controllers/orderController');
const PaymentController = require('./src/controllers/paymentController');
const authMiddleware = require('./src/middleware/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Auth routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/register.html'));
});

app.post('/auth/login', AuthController.login);
app.post('/auth/register', AuthController.register);
app.post('/auth/logout', AuthController.logout);

// Protected routes
app.get('/index', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/index.html'));
});

app.get('/add-product', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/add-product.html'));
});

app.get('/manage-products', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/manage-products.html'));
});

app.get('/cart', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/cart.html'));
});

app.get('/checkout', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/checkout.html'));
});

app.get('/payment', authMiddleware, (req, res) => {
    if (!req.session.orderData) {
        return res.redirect('/cart');
    }
    res.sendFile(path.join(__dirname, 'src/views/auth/payment.html'));
});

app.get('/orders', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/auth/orders.html'));
});

// Product API routes
app.get('/api/products', ProductController.getAllProducts);
app.post('/api/products', authMiddleware, ProductController.addProduct);
app.delete('/api/products/:id', authMiddleware, ProductController.deleteProduct);

// Cart API routes
app.get('/api/cart', authMiddleware, CartController.getCart);
app.post('/api/cart/add', authMiddleware, CartController.addToCart);
app.post('/api/cart/update', authMiddleware, CartController.updateCart);
app.delete('/api/cart/remove/:productId', authMiddleware, CartController.removeFromCart);
app.get('/api/cart/count', authMiddleware, CartController.getCartCount);

// Order API routes
app.get('/api/orders', authMiddleware, OrderController.getOrders);
app.post('/api/orders/create', authMiddleware, OrderController.createOrder);

// Payment API routes
app.post('/api/payments/process', authMiddleware, PaymentController.processPayment);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});