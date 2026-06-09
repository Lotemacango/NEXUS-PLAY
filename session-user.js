function displayLoggedUser() {
    const savedUser = sessionStorage.getItem('loggedUser');
    const badge = document.getElementById('loggedUserBadge');
    const loginAnchor = document.getElementById('loginAnchor');
    const loginButton = document.getElementById('openLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!badge) return;

    if (!savedUser) {
        badge.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        return;
    }

    try {
        const { username } = JSON.parse(savedUser);
        if (!username) {
            badge.style.display = 'none';
            return;
        }

        badge.style.display = 'inline-flex';
        badge.innerHTML = `<i class="fas fa-user"></i> ${username}`;

        if (loginAnchor) {
            loginAnchor.href = 'dashboard.html';
            loginAnchor.textContent = 'Dashboard';
            loginAnchor.classList.remove('btn-login');
            loginAnchor.classList.add('btn-home');
        }

        if (loginButton) {
            loginButton.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
            loginButton.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }

        if (logoutBtn) {
            logoutBtn.style.display = 'inline-flex';
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('loggedUser');
                window.location.reload();
            });
        }
    } catch (error) {
        console.warn('Falha ao exibir usuário logado:', error);
        badge.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', displayLoggedUser);
