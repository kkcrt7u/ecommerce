const db = require('../config/database');

class CartController {
    static async getCart(req, res) {
        try {
            const userId = req.session.userId;
            const sql = `
                SELECT c.id, c.quantity, p.name, p.price, p.image_url, (p.price * c.quantity) as total
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            `;
            
            db.query(sql, [userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.json({ success: false, message: 'Gagal mengambil data keranjang' });
                }
                
                const total = results.reduce((sum, item) => sum + item.total, 0);
                res.json({ success: true, items: results, total });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.json({ success: false, message: 'Terjadi kesalahan server' });
        }
    }

    static async addToCart(req, res) {
        try {
            // Validasi session
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Silakan login terlebih dahulu' 
                });
            }
    
            const userId = req.session.userId;
            const { productId, quantity = 1 } = req.body;
            
            console.log('Session info:', { 
                sessionId: req.session.id,
                userId: req.session.userId
            });
    
            // Validasi input
            if (!productId) {
                return res.json({ 
                    success: false, 
                    message: 'ID produk tidak boleh kosong' 
                });
            }
    
            if (isNaN(quantity) || quantity < 1) {
                return res.json({ 
                    success: false, 
                    message: 'Jumlah harus lebih dari 0' 
                });
            }
    
            // Cek produk
            const checkProduct = 'SELECT id, stock FROM products WHERE id = ?';
            db.query(checkProduct, [productId], (err, results) => {
                if (err) {
                    console.error('Error checking product:', err);
                    return res.json({ 
                        success: false, 
                        message: 'Gagal memeriksa produk' 
                    });
                }
    
                if (results.length === 0) {
                    return res.json({ 
                        success: false, 
                        message: 'Produk tidak ditemukan' 
                    });
                }
    
                const product = results[0];
                if (product.stock < quantity) {
                    return res.json({ 
                        success: false, 
                        message: 'Stok tidak mencukupi' 
                    });
                }
    
                // Cek keranjang
                const checkCart = 'SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?';
                db.query(checkCart, [userId, productId], (err, cartResults) => {
                    if (err) {
                        console.error('Error checking cart:', err);
                        return res.json({ 
                            success: false, 
                            message: 'Gagal memeriksa keranjang' 
                        });
                    }
    
                    if (cartResults.length > 0) {
                        // Update quantity
                        const newQuantity = cartResults[0].quantity + quantity;
                        const updateSql = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
                        db.query(updateSql, [newQuantity, userId, productId], (err, result) => {
                            if (err) {
                                console.error('Error updating cart:', err);
                                return res.json({ 
                                    success: false, 
                                    message: 'Gagal mengupdate keranjang' 
                                });
                            }
                            res.json({ 
                                success: true, 
                                message: 'Jumlah produk berhasil diupdate' 
                            });
                        });
                    } else {
                        // Insert produk baru
                        const insertSql = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
                        db.query(insertSql, [userId, productId, quantity], (err, result) => {
                            if (err) {
                                console.error('Error inserting to cart:', err);
                                return res.json({ 
                                    success: false, 
                                    message: 'Gagal menambahkan ke keranjang' 
                                });
                            }
                            res.json({ 
                                success: true, 
                                message: 'Produk berhasil ditambahkan ke keranjang' 
                            });
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.json({ 
                success: false, 
                message: 'Terjadi kesalahan server' 
            });
        }
    }

    static async updateCart(req, res) {
        try {
            const userId = req.session.userId;
            const { productId, quantity } = req.body;
            
            if (quantity < 1) {
                return res.json({ success: false, message: 'Jumlah minimal 1' });
            }

            const sql = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
            db.query(sql, [quantity, userId, productId], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.json({ success: false, message: 'Gagal mengupdate keranjang' });
                }
                res.json({ success: true, message: 'Keranjang berhasil diupdate' });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.json({ success: false, message: 'Terjadi kesalahan server' });
        }
    }

    static async removeFromCart(req, res) {
        try {
            const userId = req.session.userId;
            const { productId } = req.params;
            
            const sql = 'DELETE FROM cart WHERE user_id = ? AND product_id = ?';
            db.query(sql, [userId, productId], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.json({ success: false, message: 'Gagal menghapus dari keranjang' });
                }
                res.json({ success: true, message: 'Item berhasil dihapus' });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.json({ success: false, message: 'Terjadi kesalahan server' });
        }
    }

    static async getCartCount(req, res) {
        try {
            const userId = req.session.userId;
            const sql = 'SELECT COUNT(*) as count FROM cart WHERE user_id = ?';
            
            db.query(sql, [userId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.json({ success: false, message: 'Gagal mengambil jumlah item' });
                }
                res.json({ success: true, count: results[0].count });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.json({ success: false, message: 'Terjadi kesalahan server' });
        }
    }
}

module.exports = CartController;