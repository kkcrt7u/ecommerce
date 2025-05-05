document.addEventListener('DOMContentLoaded', function() {
    const productsList = document.getElementById('productsList');

    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            if (data.success) {
                productsList.innerHTML = data.data.map(product => `
                    <div class="product-item" data-id="${product.id}">
                        <img src="${product.image_url || '/images/default-product.jpg'}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">Rp ${product.price}</p>
                        <p class="stock">Stok: ${product.stock}</p>
                        <button onclick="deleteProduct(${product.id})" class="btn-delete">Hapus</button>
                    </div>
                `).join('');
            }
        } catch (error) {
            alert('Gagal memuat produk');
        }
    }

    window.deleteProduct = async (id) => {
        if (confirm('Yakin ingin menghapus produk ini?')) {
            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    alert('Produk berhasil dihapus');
                    loadProducts();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                alert('Gagal menghapus produk');
            }
        }
    };

    loadProducts();
});