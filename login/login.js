document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Impede o envio do formulário padrão

  const passwordInput = document.getElementById('admin-password');
  const errorMessage = document.getElementById('error-message');
  
  // Substitua 'suasenha' pela senha que você deseja usar.
  // Lembre-se: em um ambiente real, esta senha não deve estar no código.
  const correctPassword = 'admin123'; 

  if (passwordInput.value === correctPassword) {
    // Se a senha estiver correta, redireciona para a página de administração
    window.location.href = '../admin/admin.html';
  } else {
    // Se a senha estiver incorreta, mostra uma mensagem de erro
    errorMessage.style.display = 'block';
  }
});