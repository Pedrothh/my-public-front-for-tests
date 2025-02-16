// import { API_URL } from '../config.js';
const API_URL = 'https://my-public-api-for-tests-production.up.railway.app/api';

// Verifica se o token está presente no localStorage
const token = localStorage.getItem('token');

if (!token) {
    // Se não houver token, redireciona para a página de login
    window.location.href = 'index.html';
}

// Função para exibir mensagens de sucesso ou erro
function displayMessage(message, isError = false) {
    const messageElement = document.getElementById('changePasswordMessage');
    messageElement.textContent = message;
    messageElement.classList.toggle('error', isError);
}

// Função para atualizar a senha
async function updatePassword(currentPassword, newPassword) {
    try {
        const response = await fetch(`${API_URL}/update-password`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const result = await response.json(); // Converte a resposta para JSON

        if (!response.ok) {
            // Se a resposta não for bem-sucedida, lança um erro com a mensagem da API
            throw new Error(result.message || 'Erro ao atualizar a senha.');
        }

        // Exibe a mensagem de sucesso
        displayMessage(result.message);
    } catch (error) {
        // Exibe a mensagem de erro
        displayMessage(error.message, true);
    }
}

// Adiciona funcionalidade ao formulário de atualização de senha
document.getElementById('changePasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    // Atualiza a senha
    await updatePassword(currentPassword, newPassword);
});