document.addEventListener('DOMContentLoaded', function() {
    const productsList = document.getElementById('productsList');
    const cartCount = document.getElementById('cartCount');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Load products
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            
            if (data.success) {
                productsList.innerHTML = data.data.map(product => `
                    <div class="product-card">
                        ${product.image_url ? 
                            `<img src="${product.image_url}" alt="${product.name}" class="product-image">` : 
                            '<div class="no-image">No Image</div>'
                        }
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">Rp ${product.price}</p>
                        <p class="stock">Stok: ${product.stock}</p>
                        <button onclick="addToCart(${product.id})" class="btn-add-cart">Tambah ke Keranjang</button>
                    </div>
                `).join('');
            } else {
                productsList.innerHTML = '<p>Gagal memuat produk</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            productsList.innerHTML = '<p>Terjadi kesalahan saat memuat produk</p>';
        }
    }

    // Add to cart function
    window.addToCart = async function(productId) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: 1
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Produk berhasil ditambahkan ke keranjang!');
                updateCartCount();
            } else {
                console.error('Error response:', data);
                alert(data.message || 'Gagal menambahkan ke keranjang');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menambahkan ke keranjang');
        }
    };

    // Update cart count
    async function updateCartCount() {
        try {
            const response = await fetch('/api/cart/count');
            const data = await response.json();
            
            if (data.success) {
                cartCount.textContent = data.count;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Load initial data
    if (productsList) {
        loadProducts();
        updateCartCount();
    }
});