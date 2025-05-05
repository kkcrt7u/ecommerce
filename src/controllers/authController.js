const bcrypt = require('bcrypt');
const db = require('../config/database');

class AuthController {
    static async login(req, res) {
        const { username, password } = req.body;
        
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.query(sql, [username], async (err, results) => {
            if (err || results.length === 0) {
                return res.json({ success: false, message: 'Login gagal' });
            }
            
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                // Simpan userId dan username di session
                req.session.userId = results[0].id;
                req.session.user = username;
                res.json({ success: true, message: 'Login berhasil', redirect: '/index' });
            } else {
                res.json({ success: false, message: 'Password salah' });
            }
        });
    }

    static async register(req, res) {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                res.json({ success: false, message: 'Registrasi gagal' });
            } else {
                res.json({ success: true, message: 'Registrasi berhasil', redirect: '/login' });
            }
        });
    }
    static async logout(req, res) {
        try {
            // Hapus data user dari session
            delete req.session.userId;
            delete req.session.user;
    
            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Gagal logout' 
                    });
                }
    
                // Hapus cookie session
                res.clearCookie('connect.sid');
    
                res.json({ 
                    success: true, 
                    message: 'Berhasil logout' 
                });
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Terjadi kesalahan saat logout' 
            });
        }
    }
}

module.exports = AuthController;