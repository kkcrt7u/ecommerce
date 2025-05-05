document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat login');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat registrasi');
            }
        });
    }
});
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            try {
                const response = await fetch('/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                
                const data = await response.json();
                if (data.success) {
                    // Hapus data lokal jika ada
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // Redirect ke halaman login
                    window.location.href = '/login';
                } else {
                    alert(data.message || 'Gagal logout');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat logout');
            }
        }
    });
}