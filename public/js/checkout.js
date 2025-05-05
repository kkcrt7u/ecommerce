document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');

    // Load cart items
    async function loadCartItems() {
        try {
            const response = await fetch('/api/cart');
            const data = await response.json();

            if (data.success && data.items && data.items.length > 0) {
                orderItems.innerHTML = data.items.map(item => `
                    <div class="order-item">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p>Rp ${item.price.toLocaleString()} x ${item.quantity}</p>
                        </div>
                        <div class="item-total">
                            Rp ${(item.price * item.quantity).toLocaleString()}
                        </div>
                    </div>
                `).join('');
                
                orderTotal.textContent = `Rp ${data.total.toLocaleString()}`;
            } else {
                orderItems.innerHTML = '<p class="empty-cart">Keranjang belanja kosong</p>';
                orderTotal.textContent = 'Rp 0';
            }
        } catch (error) {
            console.error('Error:', error);
            orderItems.innerHTML = '<p class="error">Gagal memuat data pesanan</p>';
        }
    }

    // Load cart items when page loads
    loadCartItems();

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim()
            };

            // Validasi input
            if (!formData.name || !formData.email || !formData.phone || !formData.address) {
                alert('Semua field harus diisi');
                return;
            }

            // Validasi format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Format email tidak valid');
                return;
            }

            try {
                const response = await fetch('/api/orders/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    window.location.href = '/payment';
                } else {
                    alert(result.message || 'Gagal membuat pesanan');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat memproses pesanan');
            }
        });
    }
});