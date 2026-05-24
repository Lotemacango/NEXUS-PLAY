const STORAGE_KEYS = {
    players: 'nexus_players',
    devs: 'nexus_devs',
    moderators: 'nexus_moderators',
    support: 'nexus_support',
    staff: 'nexus_staff',
    images: 'nexus_images'
};
    
//-para mais informações entre em contacto 931471731---------lote by

const USERS = {
    admin: { senha: 'admin', perfil: 'Super Administrador', permissoes: ['players','devs','moderators','support','staff','images'] },
    diretor: { senha: 'diretor', perfil: 'Diretor Executivo', permissoes: ['players','devs','moderators','support','staff','images'] },
    rh: { senha: 'rh', perfil: 'Gestor de Pessoas', permissoes: ['devs','moderators','support','staff','images'] },
    gm: { senha: 'gm', perfil: 'Game Master', permissoes: ['players','moderators'] },
    player: { senha: 'player', perfil: 'Jogador Pro', permissoes: ['players_readonly'] }
};

const TableConfig = {
    players: {
        title: '👾 Jogadores',
        headers: ['Nome', 'Nickname', 'Nível', 'Email', 'Telefone', 'Ações'],
        row: item => `<tr><td>${item.nome}</td><td>${item.nickname}</td><td>${item.nivel}</td><td>${item.email}</td><td>${item.telefone}</td><td class="action-icons">${actionButtons('players')}</td></tr>`
    },
    devs: {
        title: '💻 Devs',
        headers: ['Nome', 'ID', 'Especialidade', 'Email', 'Ações'],
        row: item => `<tr><td>${item.nome}</td><td>${item.devId}</td><td>${item.especialidade}</td><td>${item.email}</td><td class="action-icons">${actionButtons('devs')}</td></tr>`
    },
    moderators: {
        title: '🛡️ Moderadores',
        headers: ['Nome', 'Função', 'Turno', 'Telefone', 'Ações'],
        row: item => `<tr><td>${item.nome}</td><td>${item.funcao}</td><td>${item.turno}</td><td>${item.telefone}</td><td class="action-icons">${actionButtons('moderators')}</td></tr>`
    },
    support: {
        title: '🎧 Suporte',
        headers: ['Nome', 'Especialidade', 'Disponibilidade', 'Telefone', 'Ações'],
        row: item => `<tr><td>${item.nome}</td><td>${item.especialidade}</td><td>${item.disponibilidade}</td><td>${item.telefone}</td><td class="action-icons">${actionButtons('support')}</td></tr>`
    },
    staff: {
        title: '🏢 Staff',
        headers: ['Nome', 'Cargo', 'Departamento', 'Admissão', 'Salário', 'Ações'],
        row: item => `<tr><td>${item.nome}</td><td>${item.cargo}</td><td>${item.departamento}</td><td>${item.dataAdmissao}</td><td>${item.salario}</td><td class="action-icons">${actionButtons('staff')}</td></tr>`
    },
    images: {
        title: '🖼️ Imagens',
        headers: ['Título', 'Categoria', 'Visualização', 'URL', 'Ações'],
        row: item => `<tr><td>${item.title}</td><td>${item.category}</td><td><img class="dashboard-image-thumb" src="${item.url}" alt="${item.title}"></td><td>${item.url}</td><td class="action-icons">${actionButtons('images')}</td></tr>`
    }
};

let currentUser = null;

function actionButtons(type) {
    return `<i class="fas fa-edit edit-icon" data-type="${type}" data-action="edit"></i><i class="fas fa-trash-alt delete-icon" data-type="${type}" data-action="delete"></i>`;
}

function initData() {
    if (!localStorage.getItem(STORAGE_KEYS.players)) {
        saveCollection('players', [
            { id: 'p1', nome: "Lucas 'Shadow' Mendes", nickname: 'ShadowBlade', nivel: 'Diamante', email: 'lucas@nexus.ao', telefone: '923111222' },
            { id: 'p2', nome: "Ana 'Queen' Santos", nickname: 'QueenArrow', nivel: 'Mestre', email: 'ana@nexus.ao', telefone: '923444555' }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.devs)) {
        saveCollection('devs', [
            { id: 'd1', nome: 'Dev Master', devId: 'DEV-01', especialidade: 'Unreal 5', email: 'dev@nexus.ao' }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.moderators)) {
        saveCollection('moderators', [
            { id: 'm1', nome: 'Moderadora Lúcia', funcao: 'Moderação Global', turno: 'Noite', telefone: '923777888' }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.support)) {
        saveCollection('support', [
            { id: 's1', nome: 'Carlos Suporte', especialidade: 'Suporte Técnico', disponibilidade: '24/7', telefone: '923999000' }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.staff)) {
        saveCollection('staff', [
            { id: 'st1', nome: 'João Diretor', cargo: 'Diretor de E-sports', departamento: 'Executivo', dataAdmissao: '2023-01-10', salario: '850000 Kz' }
        ]);
    }

    if (!localStorage.getItem(STORAGE_KEYS.images)) {
        saveCollection('images', [
            { id: 'img1', title: 'Arena Principal', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=360&fit=crop', category: 'Evento' }
        ]);
    }
}

function getCollection(type) {
    const raw = localStorage.getItem(STORAGE_KEYS[type]);
    return raw ? JSON.parse(raw) : [];
}

function saveCollection(type, data) {
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function clearValues(ids) {
    ids.forEach(id => { const field = document.getElementById(id); if (field) field.value = ''; });
}

function renderTable(type, readonly = false) {
    const config = TableConfig[type];
    const collection = getCollection(type);
    const body = document.getElementById(`${type}TableBody`);
    if (!body || !config) return;

    body.innerHTML = collection.map(item => {
        const row = config.row(item);
        return row.replace(/data-action="edit"/g, readonly ? 'data-action="disabled"' : 'data-action="edit"');
    }).join('');
}

function addEntity(type, values) {
    const collection = getCollection(type);
    collection.push(values);
    saveCollection(type, collection);
    renderTable(type, currentUser?.permissoes.includes('players_readonly'));
}

function removeEntity(type, id) {
    const collection = getCollection(type).filter(item => item.id !== id);
    saveCollection(type, collection);
    renderTable(type, currentUser?.permissoes.includes('players_readonly'));
}

function editEntity(type, id) {
    const collection = getCollection(type);
    const item = collection.find(record => record.id === id);
    if (!item) return;

    const novoNome = prompt('Editar nome:', item.nome);
    if (!novoNome) return;

    item.nome = novoNome.trim();
    saveCollection(type, collection);
    renderTable(type, currentUser?.permissoes.includes('players_readonly'));
}

function buildDashboard() {
    const tabsContainer = document.getElementById('dashboardTabs');
    const contentsContainer = document.getElementById('dashboardContents');
    tabsContainer.innerHTML = '';
    contentsContainer.innerHTML = '';

    const permissions = currentUser.permissoes;
    const visibleModules = permissions.map(permission => permission === 'players_readonly' ? 'players' : permission).filter(module => TableConfig[module]);

    visibleModules.forEach((module, index) => {
        const config = TableConfig[module];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tab-btn';
        button.textContent = config.title;
        button.dataset.tab = module;
        button.addEventListener('click', () => activateTab(module));
        tabsContainer.appendChild(button);

        const tabContent = document.createElement('section');
        tabContent.id = `tab-${module}`;
        tabContent.className = 'tab-content';
        tabContent.innerHTML = `${renderModuleForm(module)}<div class="data-table"><table><thead><tr>${config.headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody id="${module}TableBody"></tbody></table></div>`;
        contentsContainer.appendChild(tabContent);

        if (index === 0) {
            button.classList.add('active');
            tabContent.classList.add('active');
        }
    });

    bindDashboardEvents();
    visibleModules.forEach(module => renderTable(module, currentUser.permissoes.includes('players_readonly')));
}

function activateTab(module) {
    document.querySelectorAll('.tab-btn').forEach(button => button.classList.toggle('active', button.dataset.tab === module));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.toggle('active', content.id === `tab-${module}`));
}

function renderModuleForm(type) {
    const readonly = currentUser.permissoes.includes('players_readonly') && type === 'players';
    if (readonly) return '<p class="readonly-note">Apenas leitura para este perfil.</p>';

    const formFields = {
        players: [
            { id: 'playerNome', placeholder: 'Nome' },
            { id: 'playerNick', placeholder: 'Nickname' },
            { id: 'playerNivel', placeholder: 'Nível' },
            { id: 'playerEmail', placeholder: 'Email', type: 'email' },
            { id: 'playerTel', placeholder: 'Tel' }
        ],
        devs: [
            { id: 'devNome', placeholder: 'Nome' },
            { id: 'devId', placeholder: 'ID Dev' },
            { id: 'devEsp', placeholder: 'Especialidade' },
            { id: 'devEmail', placeholder: 'Email', type: 'email' }
        ],
        moderators: [
            { id: 'modNome', placeholder: 'Nome' },
            { id: 'modFuncao', placeholder: 'Função' },
            { id: 'modTurno', placeholder: 'Turno' },
            { id: 'modTel', placeholder: 'Tel' }
        ],
        support: [
            { id: 'supportNome', placeholder: 'Nome' },
            { id: 'supportEsp', placeholder: 'Especialidade' },
            { id: 'supportDisp', placeholder: 'Disponibilidade' },
            { id: 'supportTel', placeholder: 'Tel' }
        ],
        staff: [
            { id: 'staffNome', placeholder: 'Nome' },
            { id: 'staffCargo', placeholder: 'Cargo' },
            { id: 'staffDepto', placeholder: 'Departamento' },
            { id: 'staffData', placeholder: 'Data de Admissão', type: 'date' },
            { id: 'staffSalario', placeholder: 'Salário' }
        ],
        images: [
            { id: 'imageTitle', placeholder: 'Título' },
            { id: 'imageUrl', placeholder: 'URL da imagem', type: 'url' },
            { id: 'imageCategory', placeholder: 'Categoria' }
        ]
    };

    const fields = formFields[type] || [];
    return `<div class="crud-form">${fields.map(field => `<input id="${field.id}" placeholder="${field.placeholder}" type="${field.type || 'text'}">`).join('')}<button id="add-${type}-btn" type="button" class="btn-primary">Adicionar</button></div>`;
}

function bindDashboardEvents() {
    document.querySelectorAll('[id^="add-"]').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.id.replace('add-', '').replace('-btn', '');
            handleAddItem(type);
        });
    });

    document.getElementById('dashboardContents').addEventListener('click', event => {
        const icon = event.target.closest('i');
        if (!icon) return;

        const type = icon.dataset.type;
        const action = icon.dataset.action;
        const row = icon.closest('tr');
        const index = Array.from(row.parentElement.children).indexOf(row);
        const item = getCollection(type)[index];
        if (!item) return;

        if (action === 'delete' && confirm('Remover item?')) {
            removeEntity(type, item.id);
        }
        if (action === 'edit') {
            editEntity(type, item.id);
        }
    });
}

function handleAddItem(type) {
    switch(type) {
        case 'players': {
            const nome = getValue('playerNome');
            const nickname = getValue('playerNick');
            const nivel = getValue('playerNivel');
            const email = getValue('playerEmail');
            const telefone = getValue('playerTel');
            if (!nome) return;
            addEntity('players', { id: `p${Date.now()}`, nome, nickname, nivel, email, telefone });
            clearValues(['playerNome','playerNick','playerNivel','playerEmail','playerTel']);
            break;
        }
        case 'devs': {
            const nome = getValue('devNome');
            const devId = getValue('devId');
            const especialidade = getValue('devEsp');
            const email = getValue('devEmail');
            if (!nome) return;
            addEntity('devs', { id: `d${Date.now()}`, nome, devId, especialidade, email });
            clearValues(['devNome','devId','devEsp','devEmail']);
            break;
        }
        case 'moderators': {
            const nome = getValue('modNome');
            const funcao = getValue('modFuncao');
            const turno = getValue('modTurno');
            const telefone = getValue('modTel');
            if (!nome) return;
            addEntity('moderators', { id: `m${Date.now()}`, nome, funcao, turno, telefone });
            clearValues(['modNome','modFuncao','modTurno','modTel']);
            break;
        }
        case 'support': {
            const nome = getValue('supportNome');
            const especialidade = getValue('supportEsp');
            const disponibilidade = getValue('supportDisp');
            const telefone = getValue('supportTel');
            if (!nome) return;
            addEntity('support', { id: `s${Date.now()}`, nome, especialidade, disponibilidade, telefone });
            clearValues(['supportNome','supportEsp','supportDisp','supportTel']);
            break;
        }
        case 'staff': {
            const nome = getValue('staffNome');
            const cargo = getValue('staffCargo');
            const departamento = getValue('staffDepto');
            const dataAdmissao = getValue('staffData');
            const salario = getValue('staffSalario');
            if (!nome) return;
            addEntity('staff', { id: `st${Date.now()}`, nome, cargo, departamento, dataAdmissao, salario });
            clearValues(['staffNome','staffCargo','staffDepto','staffData','staffSalario']);
            break;
        }
        case 'images': {
            const title = getValue('imageTitle');
            const url = getValue('imageUrl');
            const category = getValue('imageCategory');
            if (!title || !url) return;
            addEntity('images', { id: `img${Date.now()}`, title, url, category });
            clearValues(['imageTitle','imageUrl','imageCategory']);
            break;
        }
    }
}

function resetSystem() {
    if (!confirm('⚠️ ATENÇÃO: Isso apagará TODOS os dados. Ação irreversível.')) return;
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    initData();
    if (currentUser) {
        buildDashboard();
    }
    alert('Sistema reiniciado com dados padrão.');
}

function logout() {
    sessionStorage.removeItem('loggedUser');
    currentUser = null;
    window.location.href = 'index.html';
}

function restoreSession() {
    const saved = sessionStorage.getItem('loggedUser');
    if (!saved) {
        window.location.href = 'index.html';
        return false;
    }
    const { username } = JSON.parse(saved);
    const account = USERS[username];
    if (!account) {
        window.location.href = 'index.html';
        return false;
    }
    currentUser = { ...account, username };
    return true;
}

function init() {
    if (!restoreSession()) return;

    initData();
    
    document.getElementById('userDisplay').textContent = `${currentUser.username}`;
    document.getElementById('userRoleDisplay').textContent = currentUser.perfil;
    buildDashboard();

    if (['admin', 'diretor'].includes(currentUser.username)) {
        const special = document.getElementById('adminSpecial');
        special.innerHTML = '<button id="resetAllBtn" class="danger-btn" type="button"><i class="fas fa-skull-crosswalk"></i> Reset Total do Sistema</button>';
        document.getElementById('resetAllBtn').addEventListener('click', resetSystem);
    }

    document.getElementById('logoutBtn').addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', init);
