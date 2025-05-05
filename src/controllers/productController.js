const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/products/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('image');

class ProductController {
    static async getAllProducts(req, res) {
        const sql = 'SELECT * FROM products ORDER BY created_at DESC';
        db.query(sql, (err, results) => {
            if (err) {
                return res.json({ success: false, message: 'Gagal mengambil data produk' });
            }
            res.json({ success: true, data: results });
        });
    }

    static async addProduct(req, res) {
        upload(req, res, async function(err) {
            if (err) {
                return res.json({ success: false, message: 'Error uploading file: ' + err });
            }

            const { name, description, price, stock } = req.body;
            const image_url = req.file ? `/images/products/${req.file.filename}` : null;

            const sql = 'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)';
            db.query(sql, [name, description, price, stock, image_url], (err, result) => {
                if (err) {
                    return res.json({ success: false, message: 'Gagal menambahkan produk' });
                }
                res.json({ success: true, message: 'Produk berhasil ditambahkan' });
            });
        });
    }

    static async deleteProduct(req, res) {
        const { id } = req.params;
        const sql = 'DELETE FROM products WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Gagal menghapus produk' });
            }
            res.json({ success: true, message: 'Produk berhasil dihapus' });
        });
    }

    static async updateProduct(req, res) {
        const { id } = req.params;
        const { name, description, price, stock, image_url } = req.body;
        const sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?';
        db.query(sql, [name, description, price, stock, image_url, id], (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Gagal mengupdate produk' });
            }
            res.json({ success: true, message: 'Produk berhasil diupdate' });
        });
        
    }
   
}

module.exports = ProductController;