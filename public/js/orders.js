document.addEventListener('DOMContentLoaded', function() {
    const ordersList = document.getElementById('ordersList');
    
    // Fungsi untuk memformat tanggal
    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    // Fungsi untuk memformat mata uang
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Fungsi untuk masking data sensitif
    function maskSensitiveData(data, type) {
        if (!data) return '';
        
        if (type === 'email') {
            // Ambil bagian sebelum @ dari email
            const emailParts = data.split('@');
            const username = emailParts[0];
            
            // Ambil 3 karakter pertama dari username
            const firstThree = username.substring(0, 3);
            
            // Buat masking untuk sisa username
            const maskLength = Math.max(username.length - 3, 0);
            const mask = '*'.repeat(maskLength);
            
            // Gabungkan dengan @gmail.com
            return `${firstThree}${mask}@gmail.com`;
        } else {
            // Untuk data lain (telepon, kartu kredit)
            const firstThree = data.substring(0, 3);
            const lastThree = data.slice(-3);
            const maskLength = Math.max(data.length - 6, 0);
            const mask = '*'.repeat(maskLength);
            return `${firstThree}${mask}${lastThree}`;
        }
    }

    // Fungsi untuk mengambil dan menampilkan riwayat pesanan
    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();

            if (data.success && data.orders) {
                let ordersHtml = '';
                
                data.orders.forEach(order => {
                    let itemsHtml = '';
                    let subtotal = 0;

                    order.items.forEach(item => {
                        const itemTotal = item.price * item.quantity;
                        subtotal += itemTotal;

                        itemsHtml += `
                            <div class="order-item">
                                <div class="item-details">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price">${formatCurrency(item.price)} x ${item.quantity}</span>
                                </div>
                                <div class="item-total">
                                    ${formatCurrency(itemTotal)}
                                </div>
                            </div>
                        `;
                    });

                    ordersHtml += `
                        <div class="order-card">
                            <div class="order-header">
                                <div class="order-title">
                                    <h3>Order #${order.id}</h3>
                                    <span class="order-date">${formatDate(order.created_at)}</span>
                                </div>
                                <div class="order-status status-${order.status.toLowerCase()}">
                                    ${order.status}
                                </div>
                            </div>
                            <div class="order-details">
                                <div class="customer-info">
                                    <p><strong>Nama:</strong> ${order.name}</p>
                                    <p><strong>Email:</strong> ${maskSensitiveData(order.email, 'email')}</p>
                                    <p><strong>Telepon:</strong> ${maskSensitiveData(order.phone)}</p>
                                    <p><strong>Alamat:</strong> ${order.address}</p>
                                    <p><strong>No. Kartu:</strong> ${maskSensitiveData(order.card_number)}</p>
                                </div>
                                <div class="order-items">
                                    <h4>Items:</h4>
                                    ${itemsHtml}
                                    <div class="order-summary">
                                        <div class="subtotal">
                                            <span>Subtotal:</span>
                                            <span>${formatCurrency(subtotal)}</span>
                                        </div>
                                        <div class="total">
                                            <strong>Total:</strong>
                                            <strong>${formatCurrency(order.total)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                if (ordersHtml) {
                    ordersList.innerHTML = ordersHtml;
                } else {
                    ordersList.innerHTML = '<div class="no-orders">Belum ada pesanan</div>';
                }
            } else {
                ordersList.innerHTML = '<div class="error-message">Gagal memuat riwayat pesanan</div>';
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = '<div class="error-message">Terjadi kesalahan saat memuat pesanan</div>';
        }
    }

    // Load orders when page loads
    loadOrders();
});