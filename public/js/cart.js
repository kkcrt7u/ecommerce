document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');

    loadCartItems();
});

async function loadCartItems() {
    try {
        const response = await fetch('/api/cart', {
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success && data.items && data.items.length > 0) {
            cartItems.innerHTML = data.items.map(item => `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="item-info">
                        ${item.image_url ? 
                            `<img src="${item.image_url}" alt="${item.name}" class="cart-item-image">` : 
                            '<div class="no-image">No Image</div>'
                        }
                        <h4>${item.name}</h4>
                        <p>Rp ${item.price.toLocaleString()} x ${item.quantity}</p>
                        <p class="subtotal">Subtotal: Rp ${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-quantity btn-decrease" data-product-id="${item.id}" data-quantity="${item.quantity - 1}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="btn-quantity btn-increase" data-product-id="${item.id}" data-quantity="${item.quantity + 1}">+</button>
                        <button class="btn-remove" data-product-id="${item.id}">Hapus</button>
                    </div>
                </div>
            `).join('');
            
            cartTotal.textContent = `Rp ${data.total.toLocaleString()}`;
            checkoutButton.style.display = 'block';

            setupCartEventListeners();
        } else {
            cartItems.innerHTML = '<p class="empty-cart">Keranjang belanja kosong</p>';
            cartTotal.textContent = 'Rp 0';
            checkoutButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        cartItems.innerHTML = '<p class="error">Gagal memuat keranjang</p>';
        checkoutButton.style.display = 'none';
    }
}

function setupCartEventListeners() {
    document.querySelectorAll('.btn-quantity').forEach(button => {
        button.addEventListener('click', async function() {
            const productId = this.getAttribute('data-product-id');
            const quantity = parseInt(this.getAttribute('data-quantity'));
            if (productId && quantity >= 1) {
                await updateQuantity(productId, quantity);
            }
        });
    });

    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', async function() {
            const productId = this.getAttribute('data-product-id');
            if (productId) {
                await removeFromCart(productId);
            }
        });
    });
}

async function updateQuantity(productId, quantity) {
    if (!productId || quantity < 1) return;

    try {
        const response = await fetch('/api/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json();
        if (data.success) {
            await loadCartItems();
            await updateCartCount();
        } else {
            alert(data.message || 'Gagal mengupdate jumlah');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal mengupdate keranjang');
    }
}

async function removeFromCart(productId) {
    if (!productId || !confirm('Apakah Anda yakin ingin menghapus item ini?')) return;

    try {
        const response = await fetch(`/api/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        if (data.success) {
            await loadCartItems();
            await updateCartCount();
        } else {
            alert(data.message || 'Gagal menghapus item');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menghapus item');
    }
}

async function updateCartCount() {
    try {
        const response = await fetch('/api/cart/count', {
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.success) {
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = data.count;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}