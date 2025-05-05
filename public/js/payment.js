document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    const cardNumberInput = document.getElementById('cardNumber');
    const cvvInput = document.getElementById('cvv');

    // Format nomor kartu saat input
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value;
        value = value.replace(/\D/g, '');
        value = value.substring(0, 16);
        e.target.value = value;
    });

    // Format CVV saat input
    cvvInput.addEventListener('input', function(e) {
        let value = e.target.value;
        value = value.replace(/\D/g, '');
        value = value.substring(0, 3);
        e.target.value = value;
    });

    // Handle form submission
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cardNumber = cardNumberInput.value.trim();
        const cvv = cvvInput.value.trim();

        // Validasi input
        if (cardNumber.length !== 16) {
            alert('Nomor kartu kredit harus 16 digit');
            return;
        }

        if (cvv.length !== 3) {
            alert('CVV harus 3 digit');
            return;
        }

        try {
            const response = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cardNumber,
                    cvv
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Pembayaran berhasil!');
                window.location.href = '/orders';
            } else {
                alert(result.message || 'Pembayaran gagal');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memproses pembayaran');
        }
    });
});