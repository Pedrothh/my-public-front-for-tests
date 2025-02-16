// import { API_URL } from '../config.js';
const API_URL = 'https://my-public-api-for-tests-production.up.railway.app/api';

// Verifica se o token está presente no localStorage
const token = localStorage.getItem('token');
console.log('Token no localStorage:', token);

if (!token) {
    // Se não houver token, redireciona para a página de login
    window.location.href = 'index.html';
}

// Função para capitalizar a primeira letra de uma string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função para buscar as informações do usuário logado
async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_URL}/user-info`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}` // Passa o token no cabeçalho
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar informações do usuário.');
        }

        const userData = await response.json(); // Converte a resposta para JSON
        console.log('Dados do usuário:', userData); // Adicione este log
        return userData;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Função para buscar a lista de usuários
async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}` // Passa o token no cabeçalho
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar a lista de usuários.');
        }

        const users = await response.json(); // Converte a resposta para JSON
        console.log('Lista de usuários:', users); // Adicione este log
        return users;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// Função para exibir o nome do usuário logado
function displayWelcomeMessage(username) {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        const formattedUsername = capitalizeFirstLetter(username);
        usernameElement.textContent = formattedUsername;
    } else {
        console.error('Elemento #username não encontrado.');
    }
}

// Função para exibir a lista de usuários
function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (tbody) {
        tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

        users.forEach(user => {
            const row = document.createElement('tr');

            // Adiciona o ID do usuário
            const idCell = document.createElement('td');
            idCell.textContent = user.id;
            row.appendChild(idCell);

            // Adiciona o nome de usuário
            const usernameCell = document.createElement('td');
            usernameCell.textContent = capitalizeFirstLetter(user.username);
            row.appendChild(usernameCell);

            // Adiciona o status (ativo/inativo)
            const statusCell = document.createElement('td');
            statusCell.textContent = user.inativo === 0 ? 'Ativo' : 'Inativo';
            row.appendChild(statusCell);

            // Adiciona a função (role)
            const roleCell = document.createElement('td');
            roleCell.textContent = user.role === 1 ? 'Admin' : 'Usuário';
            row.appendChild(roleCell);

            // Adiciona a linha à tabela
            tbody.appendChild(row);
        });
    } else {
        console.error('Elemento #usersTable tbody não encontrado.');
    }
}

// Função principal
async function init() {
    try {
        // Busca as informações do usuário logado
        const userData = await fetchUserInfo();
        // Exibe o nome do usuário na mensagem de boas-vindas
        displayWelcomeMessage(userData.username);

        // Busca a lista de usuários
        const users = await fetchUsers();
        // Exibe a lista de usuários na tabela
        displayUsers(users);
    } catch (error) {
        console.error('Erro ao carregar informações:', error);
        alert('Erro ao carregar informações. Tente novamente.');
    }
}

// Adiciona funcionalidade ao botão de logout
document.getElementById('logoutButton').addEventListener('click', function() {
    // Remove o token do localStorage
    localStorage.removeItem('token');
    // Redireciona para a página de login
    window.location.href = 'index.html';
});

// Adiciona funcionalidade ao botão de alteração de senha
document.getElementById('changePasswordButton').addEventListener('click', function() {
    console.log('Botão de alteração de senha clicado'); // Adicione este log
    window.location.href = 'change-password.html';
});

// Inicializa a página
init();