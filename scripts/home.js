import { API_URL } from '../scripts/config.js';

const token = localStorage.getItem('token');
let currentUserRole = null;

if (!token) {
    window.location.href = 'index.html';
}

// Elementos do DOM
const userModal = document.getElementById('userModal');
const registerModal = document.getElementById('registerModal');
const modalUserDetails = document.getElementById('modalUserDetails');
const adminActions = document.getElementById('adminActions');
const registerUserBtn = document.getElementById('registerUserBtn');
const usersTableBody = document.querySelector('#usersTable tbody');

function displayMessage(message, isError = false) {
    const apiMessage = document.getElementById('apiMessage');
    if (!apiMessage) return;
    apiMessage.textContent = message;
    apiMessage.style.color = isError ? 'red' : 'green';
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatRole(role) {
    if (role === 1) return 'Admin';
    if (role === 2) return 'Gerente';
    if (role === 3) return 'Usuário';
    return String(role ?? '');
}

async function apiFetchJson(path, { method = 'GET', body } = {}) {
    const headers = {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const fetchOptions = { method, headers };
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, fetchOptions);
    let json = null;
    try {
        json = await response.json();
    } catch {
        // Algumas rotas podem retornar sem body
    }

    if (!response.ok) {
        const message = json?.message || response.statusText || 'Erro na requisição.';
        throw new Error(message);
    }

    return json;
}

// Busca a lista de usuários e preenche a tabela
async function loadUsers() {
    try {
        const users = await apiFetchJson('/users');
        usersTableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${capitalizeFirstLetter(user.username)}</td>
                <td>${user.inativo === 0 ? 'Ativo' : 'Inativo'}</td>
                <td>${formatRole(user.role)}</td>
            `;
            row.addEventListener('click', () => openUserModal(user.id));
            usersTableBody.appendChild(row);
        });
    } catch (error) {
        displayMessage(error.message, true);
    }
}

// Abre o modal de detalhes do usuário
async function openUserModal(userId) {
    try {
        const user = await apiFetchJson(`/user/${userId}`);
        modalUserDetails.innerHTML = `
            <p><b>ID:</b> ${user.id}</p>
            <p><b>Usuário:</b> ${capitalizeFirstLetter(user.username)}</p>
            <p><b>Status:</b> ${user.inativo === 0 ? 'Ativo' : 'Inativo'}</p>
            <p><b>Função:</b> ${formatRole(user.role)}</p>
        `;

        if (currentUserRole === 1) {
            adminActions.style.display = 'flex';
            adminActions.innerHTML = '';

            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = user.inativo === 0 ? 'Inativar' : 'Ativar';
            toggleBtn.className = user.inativo === 0 ? 'btn-warning' : 'btn-success';
            toggleBtn.onclick = () => toggleUserStatus(user.id, user.inativo === 0);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Deletar';
            deleteBtn.className = 'btn-danger';
            deleteBtn.onclick = () => deleteUser(user.id);

            adminActions.appendChild(toggleBtn);
            adminActions.appendChild(deleteBtn);
        } else {
            adminActions.style.display = 'none';
        }

        userModal.style.display = 'block';
    } catch (error) {
        displayMessage('Erro ao carregar detalhes do usuário: ' + error.message, true);
    }
}

async function toggleUserStatus(userId, isCurrentlyActive) {
    try {
        const endpoint = isCurrentlyActive ? `/inativar-user/${userId}` : `/reativar-user/${userId}`;
        const method = isCurrentlyActive ? 'DELETE' : 'PUT';
        await apiFetchJson(endpoint, { method });
        userModal.style.display = 'none';
        displayMessage(`Usuário ${isCurrentlyActive ? 'inativado' : 'ativado'} com sucesso.`);
        loadUsers();
    } catch (error) {
        displayMessage(error.message, true);
    }
}

async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    try {
        await apiFetchJson(`/user/${userId}`, { method: 'DELETE' });
        userModal.style.display = 'none';
        displayMessage('Usuário deletado com sucesso.');
        loadUsers();
    } catch (error) {
        displayMessage(error.message, true);
    }
}

// Inicialização
async function init() {
    try {
        const userData = await apiFetchJson('/user-info');
        document.getElementById('username').textContent = capitalizeFirstLetter(userData.username);
        currentUserRole = userData.role;

        if (currentUserRole === 1) {
            registerUserBtn.style.display = 'inline-block';
        }

        loadUsers();
    } catch (error) {
        console.error('Erro no init:', error);
        displayMessage('Erro ao carregar informações iniciais.', true);
    }
}

// Event Listeners
registerUserBtn.onclick = () => registerModal.style.display = 'block';

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = () => {
        userModal.style.display = 'none';
        registerModal.style.display = 'none';
    };
});

window.onclick = (event) => {
    if (event.target == userModal) userModal.style.display = 'none';
    if (event.target == registerModal) registerModal.style.display = 'none';
};

document.getElementById('confirmRegisterBtn').onclick = async () => {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const regMessage = document.getElementById('registerMessage');

    if (!username || !password) {
        regMessage.textContent = 'Preencha todos os campos.';
        regMessage.style.color = 'red';
        return;
    }

    try {
        await apiFetchJson('/register', {
            method: 'POST',
            body: { username, password }
        });
        registerModal.style.display = 'none';
        displayMessage('Usuário registrado com sucesso.');
        document.getElementById('regUsername').value = '';
        document.getElementById('regPassword').value = '';
        loadUsers();
    } catch (error) {
        regMessage.textContent = error.message;
        regMessage.style.color = 'red';
    }
};

document.getElementById('logoutButton').onclick = () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
};

document.getElementById('changePasswordButton').onclick = () => {
    window.location.href = 'change-password.html';
};

init();
