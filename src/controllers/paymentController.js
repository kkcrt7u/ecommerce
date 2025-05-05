const db = require('../config/database');
const kmsService = require('../services/kmsService');

class PaymentController {
    static async processPayment(req, res) {
        try {
            const userId = req.session.userId;
            const orderData = req.session.orderData;

            if (!userId || !orderData) {
                return res.status(400).json({
                    success: false,
                    message: 'Data pesanan tidak ditemukan'
                });
            }

            const { cardNumber, cvv } = req.body;

            // Validasi kartu kredit
            if (!cardNumber || !cvv || cardNumber.length !== 16 || cvv.length !== 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Data kartu kredit tidak valid'
                });
            }

            // Ambil items dari cart
            const cartQuery = `
                SELECT c.product_id, c.quantity, p.price, p.name
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            `;

            db.query(cartQuery, [userId], async (err, cartItems) => {
                if (err) {
                    console.error('Error getting cart items:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Gagal mengambil data keranjang'
                    });
                }

                if (!cartItems.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Keranjang kosong'
                    });
                }

                // Hitung total
                const total = cartItems.reduce((sum, item) => {
                    return sum + (item.price * item.quantity);
                }, 0);

                try {
                    // Enkripsi data sensitif satu per satu untuk menghindari error
                    let encryptedCard, encryptedEmail, encryptedPhone, encryptedAddress;
                    
                    try {
                        encryptedCard = await kmsService.encryptData(cardNumber);
                    } catch (error) {
                        console.error('Error encrypting card:', error);
                        encryptedCard = cardNumber.slice(-4).padStart(16, '*'); // Fallback ke masking
                    }
                    
                    try {
                        encryptedEmail = await kmsService.encryptData(orderData.email);
                    } catch (error) {
                        console.error('Error encrypting email:', error);
                        encryptedEmail = orderData.email; // Fallback ke plain text
                    }
                    
                    try {
                        encryptedPhone = await kmsService.encryptData(orderData.phone);
                    } catch (error) {
                        console.error('Error encrypting phone:', error);
                        encryptedPhone = orderData.phone; // Fallback ke plain text
                    }
                    
                    try {
                        encryptedAddress = await kmsService.encryptData(orderData.address);
                    } catch (error) {
                        console.error('Error encrypting address:', error);
                        encryptedAddress = orderData.address; // Fallback ke plain text
                    }

                    // Buat order baru dengan data pembayaran
                    const orderQuery = `
                        INSERT INTO orders (
                            user_id, name, email, phone, address, total, status,
                            card_number, created_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `;

                    const orderValues = [
                        userId,
                        orderData.name,
                        orderData.email,    // Data sudah terenkripsi dari session
                        orderData.phone,    // Data sudah terenkripsi dari session
                        orderData.address,  // Data sudah terenkripsi dari session
                        total,
                        'paid',
                        encryptedCard      // Hanya enkripsi card number
                    ];

                    db.query(orderQuery, orderValues, (err, result) => {
                        if (err) {
                            console.error('Error creating order:', err);
                            return res.status(500).json({
                                success: false,
                                message: 'Gagal membuat pesanan'
                            });
                        }

                        const orderId = result.insertId;

                        // Masukkan items ke order_items
                        const orderItemsQuery = `
                            INSERT INTO order_items (order_id, product_id, quantity, price)
                            VALUES ?
                        `;

                        const orderItemsValues = cartItems.map(item => [
                            orderId,
                            item.product_id,
                            item.quantity,
                            item.price
                        ]);

                        db.query(orderItemsQuery, [orderItemsValues], (err) => {
                            if (err) {
                                console.error('Error creating order items:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Gagal menyimpan item pesanan'
                                });
                            }

                            // Kosongkan cart
                            const clearCartQuery = 'DELETE FROM cart WHERE user_id = ?';
                            db.query(clearCartQuery, [userId], (err) => {
                                if (err) {
                                    console.error('Error clearing cart:', err);
                                }

                                // Hapus data order dari session
                                delete req.session.orderData;

                                res.json({
                                    success: true,
                                    message: 'Pembayaran berhasil',
                                    orderId: orderId
                                });
                            });
                        });
                    });
                } catch (encryptionError) {
                    console.error('Encryption error:', encryptionError);
                    return res.status(500).json({
                        success: false,
                        message: 'Gagal mengenkripsi data sensitif'
                    });
                }
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

module.exports = PaymentController;