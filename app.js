// ==================== CONFIG ====================
const USERS = {
    admin: { senha: 'admin', perfil: 'Super Administrador', permissoes: ['players','devs','moderators','support','staff','images'] },
    diretor: { senha: 'diretor', perfil: 'Diretor Executivo', permissoes: ['players','devs','moderators','support','staff','images'] },
    rh: { senha: 'rh', perfil: 'Gestor de Pessoas', permissoes: ['devs','moderators','support','staff','images'] },
    gm: { senha: 'gm', perfil: 'Game Master', permissoes: ['players','moderators'] },
    player: { senha: 'player', perfil: 'Jogador Pro', permissoes: ['players_readonly'] }
};

const STORAGE_KEYS = {
    players: 'nexus_players',
    devs: 'nexus_devs',
    moderators: 'nexus_moderators',
    support: 'nexus_support',
    staff: 'nexus_staff',
    images: 'nexus_images'
};
const AUTH_STORAGE_KEY = 'nexus_auth_users';
//-para mais informações entre em contacto 931471731---------lote by

function loadAuthUsers() {
    const storedUsers = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUsers) {
        try {
            const parsed = JSON.parse(storedUsers);
            Object.assign(USERS, parsed);
        } catch (error) {
            console.warn('Falha ao carregar usuários salvos:', error);
        }
    } else {
        saveAuthUsers();
    }
}

function saveAuthUsers() {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(USERS));
}

// ==================== INIT ====================
function initData() {
    const defaultCollections = {
        players: [
            { id: 'p1', nome: "Lucas 'Shadow' Mendes", nickname: 'ShadowBlade', nivel: 'Diamante', email: 'lucas@nexus.ao', telefone: '923111222' },
            { id: 'p2', nome: "Ana 'Queen' Santos", nickname: 'QueenArrow', nivel: 'Mestre', email: 'ana@nexus.ao', telefone: '923444555' }
        ],
        devs: [
            { id: 'd1', nome: 'Dev Master', devId: 'DEV-01', especialidade: 'Unreal 5', email: 'dev@nexus.ao' }
        ],
        moderators: [
            { id: 'm1', nome: 'Moderadora Lúcia', funcao: 'Moderação Global', turno: 'Noite', telefone: '923777888' }
        ],
        support: [
            { id: 's1', nome: 'Carlos Suporte', especialidade: 'Suporte Técnico', disponibilidade: '24/7', telefone: '923999000' }
        ],
        staff: [
            { id: 'st1', nome: 'João Diretor', cargo: 'Diretor de E-sports', departamento: 'Executivo', dataAdmissao: '2023-01-10', salario: '850000 Kz' }
        ],
        images: [
            { id: 'img1', title: 'Arena Principal', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=360&fit=crop', category: 'Evento' }
        ]
    };

    Object.entries(defaultCollections).forEach(([type, data]) => {
        if (!localStorage.getItem(STORAGE_KEYS[type])) {
            localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
        }
    });
}

function updateCounters() {
    const players = JSON.parse(localStorage.getItem(STORAGE_KEYS.players) || '[]').length;
    const staff = (JSON.parse(localStorage.getItem(STORAGE_KEYS.devs) || '[]').length +
                   JSON.parse(localStorage.getItem(STORAGE_KEYS.moderators) || '[]').length +
                   JSON.parse(localStorage.getItem(STORAGE_KEYS.support) || '[]').length +
                   JSON.parse(localStorage.getItem(STORAGE_KEYS.staff) || '[]').length);
    const totalJogadores = document.getElementById('totalJogadoresCount');
    const totalStaff = document.getElementById('totalStaffCount');
    if (totalJogadores) totalJogadores.textContent = players;
    if (totalStaff) totalStaff.textContent = staff;
}

// ==================== HELPERS ====================
function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function clearValues(ids) {
    ids.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

// ==================== MODAL CONTROLS ====================
function openModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.auth-section').forEach(section => {
        section.classList.toggle('active', section.id === `${tab}Section`);
    });
}

// ==================== AUTH ====================
function login(username, password) {
    const account = USERS[username];
    if (!account || account.senha !== password) return false;

    sessionStorage.setItem('loggedUser', JSON.stringify({
        username,
        perfil: account.perfil,
        permissoes: account.permissoes
    }));
    window.location.href = 'dashboard.html';
    return true;
}

function handleSignup() {
    const username = getValue('signupUser');
    const email = getValue('signupEmail');
    const password = getValue('signupPass');
    const confirm = getValue('signupConfirm');

    if (!username || !email || !password || !confirm) {
        alert('Preencha todos os campos!');
        return;
    }

    if (password !== confirm) {
        alert('As senhas não correspondem!');
        return;
    }

    if (USERS[username]) {
        alert('Usuário já existe!');
        return;
    }

    if (password.length < 6) {
        alert('Senha deve ter no mínimo 6 caracteres!');
        return;
    }

    USERS[username] = {
        senha: password,
        perfil: 'Jogador Pro',
        permissoes: ['players_readonly']
    };
    saveAuthUsers();
    sessionStorage.setItem('loggedUser', JSON.stringify({
        username,
        perfil: 'Jogador Pro',
        permissoes: ['players_readonly']
    }));

    clearValues(['signupUser', 'signupEmail', 'signupPass', 'signupConfirm']);
    alert('Conta criada com sucesso! Redirecionando...');
    window.location.href = 'dashboard.html';
}

// ==================== APP INIT ====================
function init() {
    loadAuthUsers();
    initData();
    updateCounters();

    const loginModal = document.getElementById('loginModal');

    // Open/close modal
    document.getElementById('openLoginBtn').addEventListener('click', openModal);
    document.querySelector('.close-modal').addEventListener('click', closeModal);

    // Auth tabs
    document.getElementById('authTabLogin').addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('authTabSignup').addEventListener('click', () => switchAuthTab('signup'));

    // Login
    document.getElementById('doLoginBtn').addEventListener('click', () => {
        const username = getValue('loginUser');
        const password = getValue('loginPass');
        if (!login(username, password)) {
            alert('Credenciais inválidas!');
        }
    });

    // Signup
    document.getElementById('doSignupBtn').addEventListener('click', handleSignup);

    // Close modal on background click
    window.addEventListener('click', event => {
        if (event.target === loginModal) closeModal();
    });

    // Mobile menu
    document.getElementById('mobile-menu').addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', init);