// import { API_URL } from '../config.js'; 
const API_URL = 'https://my-public-api-for-tests-production.up.railway.app/api';

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Dados para enviar à API
    const data = {
        username: username,
        password: password
    };

    // Faz a requisição para a API
    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Converte a resposta para JSON
        } else {
            return response.json().then(err => {
                throw new Error(err.message || 'Erro ao fazer login.');
            });
        }
    })
    .then(data => {
        // Se a API retornar um token, o login foi bem-sucedido
        if (data.token) {
            // Armazena o token no localStorage
            localStorage.setItem('token', data.token);
            // Redireciona para a página inicial
            window.location.href = 'home.html';
        }
    })
    .catch(error => {
        // Exibe a mensagem de erro
        document.getElementById('message').textContent = error.message;
        document.getElementById('message').style.color = 'red';
    });
});