function showLogin() {
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('forgotForm').classList.remove('active');
  document.getElementById('forgotForm').classList.add('hidden');
}

function showRegister() {
  document.getElementById('registerForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('forgotForm').classList.remove('active');
  document.getElementById('forgotForm').classList.add('hidden');
}

function showForgotPassword() {
  document.getElementById('forgotForm').classList.add('active');
  document.getElementById('forgotForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('hidden');
}

function login() {
  // Animation progress
  document.getElementById('progressBar').style.width = '100%';
  setTimeout(() => {
    document.getElementById('bubbles').style.display = 'block';
    // Trigger bubbles animation
    for (let i = 0; i < 20; i++) {
      let bubble = document.createElement('span');
      bubble.style.left = Math.random() * 100 + '%';
      document.getElementById('bubbles').appendChild(bubble);
    }
  }, 1000);
}

function register() {
  alert('تم التسجيل بنجاح (Demo)');
}

function recoverPassword() {
  alert('تم إرسال رابط الاستعادة (Demo)');
}
function generateBubbles() {
  const bubbles = document.getElementById('bubbles');
  bubbles.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const span = document.createElement('span');
    span.style.left = Math.random() * 100 + '%';
    span.style.width = span.style.height = Math.random() * 15 + 10 + 'px';
    span.style.animationDuration = (Math.random() * 2 + 2) + 's';
    bubbles.appendChild(span);
  }
}
