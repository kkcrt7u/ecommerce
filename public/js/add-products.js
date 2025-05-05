document.addEventListener('DOMContentLoaded', function() {
    const addProductForm = document.getElementById('addProductForm');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    
    // Preview gambar yang dipilih
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(addProductForm);
            
            try {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    body: formData // Kirim langsung FormData untuk mendukung file upload
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Produk berhasil ditambahkan!');
                    window.location.href = '/index';
                } else {
                    alert(data.message || 'Gagal menambahkan produk');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menambahkan produk');
            }
        });
    }
});