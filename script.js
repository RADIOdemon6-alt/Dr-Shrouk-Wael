function switchForm(showId) {
  const forms = document.querySelectorAll('.login-box');
  forms.forEach(form => {
    if (form.id === showId) {
      form.classList.add('active');
      form.classList.remove('hidden');
      form.classList.add('glitch');
      setTimeout(() => form.classList.remove('glitch'), 300);
    } else {
      form.classList.remove('active');
      form.classList.add('hidden');
    }
  });
}

function showRegister() {
  switchForm('registerForm');
}

function showLogin() {
  switchForm('loginForm');
}

function showForgotPassword() {
  switchForm('forgotForm');
}

function register() {
  alert('تم التسجيل (وهمي)');
  showLogin();
}

function login() {
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = '100%';

  setTimeout(() => {
    generateBubbles();
    document.getElementById('bubbles').style.display = 'block';

    setTimeout(() => {
      alert('تم تسجيل الدخول بنجاح!');
      // بعد كده ننتقل لصفحة Dashboard
    }, 1500);
  }, 1000);
}

function recoverPassword() {
  alert('تم إرسال رابط الاستعادة (وهمي)');
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
