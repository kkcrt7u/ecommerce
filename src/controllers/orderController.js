const db = require('../config/database');
const kmsService = require('../services/kmsService');

class OrderController {
    static async createOrder(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User tidak terautentikasi'
                });
            }
    
            const { name, email, phone, address } = req.body;
    
            // Validasi input
            if (!name || !email || !phone || !address) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama, email, telepon, dan alamat harus diisi'
                });
            }
    
            // Validasi format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Format email tidak valid'
                });
            }
    
            try {
                // Enkripsi data sensitif secara terpisah
                const encryptedEmail = await kmsService.encryptData(email);
                const encryptedPhone = await kmsService.encryptData(phone);
                const encryptedAddress = await kmsService.encryptData(address);
    
                // Simpan data order ke session
                req.session.orderData = {
                    name,
                    email: encryptedEmail,
                    phone: encryptedPhone,
                    address: encryptedAddress,
                    userId
                };
    
                res.json({
                    success: true,
                    message: 'Lanjut ke pembayaran'
                });
            } catch (encryptionError) {
                console.error('Encryption error:', encryptionError);
                return res.status(500).json({
                    success: false,
                    message: 'Gagal mengenkripsi data'
                });
            }
        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }
    
    static async getOrders(req, res) {
        try {
            const userId = req.session.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User tidak terautentikasi'
                });
            }
    
            const ordersQuery = `
                SELECT o.id, o.user_id, o.name, o.email, o.phone, 
                       o.address, o.total, o.status, o.card_number, 
                       o.created_at,
                       oi.product_id, oi.quantity, oi.price,
                       p.name as product_name
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            `;
    
            db.query(ordersQuery, [userId], async (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Gagal mengambil data pesanan'
                    });
                }
    
                const orders = [];
                const orderMap = new Map();
    
                for (const row of results) {
                    if (!orderMap.has(row.id)) {
                        let decryptedEmail, decryptedPhone, decryptedAddress, decryptedCardNumber;
    
                        try {
                            decryptedEmail = await kmsService.decryptData(row.email);
                        } catch (error) {
                            console.error('Email decryption error:', error);
                            decryptedEmail = row.email;
                        }
    
                        try {
                            decryptedPhone = await kmsService.decryptData(row.phone);
                        } catch (error) {
                            console.error('Phone decryption error:', error);
                            decryptedPhone = row.phone;
                        }
    
                        try {
                            decryptedAddress = await kmsService.decryptData(row.address);
                        } catch (error) {
                            console.error('Address decryption error:', error);
                            decryptedAddress = row.address;
                        }
    
                        try {
                            decryptedCardNumber = await kmsService.decryptData(row.card_number);
                        } catch (error) {
                            console.error('Card number decryption error:', error);
                            decryptedCardNumber = row.card_number;
                        }
    
                        const order = {
                            id: row.id,
                            name: row.name,
                            email: decryptedEmail,
                            phone: decryptedPhone,
                            address: decryptedAddress,
                            total: row.total,
                            status: row.status,
                            card_number: decryptedCardNumber,
                            created_at: row.created_at,
                            items: []
                        };
                        orders.push(order);
                        orderMap.set(row.id, order);
                    }
    
                    if (row.product_id) {
                        orderMap.get(row.id).items.push({
                            product_id: row.product_id,
                            name: row.product_name,
                            quantity: row.quantity,
                            price: row.price
                        });
                    }
                }
    
                res.json({
                    success: true,
                    orders: orders
                });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan server'
            });
        }
    }
}
module.exports = OrderController;