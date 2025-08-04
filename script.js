function showLogin() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  registerForm.classList.remove('active');
  registerForm.classList.add('exit-right');

  forgotForm.classList.remove('active');
  forgotForm.classList.add('exit-right');

  setTimeout(() => {
    registerForm.classList.remove('exit-right');
    forgotForm.classList.remove('exit-right');

    loginForm.classList.add('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    forgotForm.classList.add('hidden');
  }, 300); // نفس مدة animation
}

function showRegister() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  loginForm.classList.remove('active');
  loginForm.classList.add('exit-left');

  forgotForm.classList.remove('active');
  forgotForm.classList.add('exit-left');

  setTimeout(() => {
    loginForm.classList.remove('exit-left');
    forgotForm.classList.remove('exit-left');

    registerForm.classList.add('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    forgotForm.classList.add('hidden');
  }, 300);
}

function showForgotPassword() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  loginForm.classList.remove('active');
  loginForm.classList.add('exit-left');

  registerForm.classList.remove('active');
  registerForm.classList.add('exit-left');

  setTimeout(() => {
    loginForm.classList.remove('exit-left');
    registerForm.classList.remove('exit-left');

    forgotForm.classList.add('active');
    forgotForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
  }, 300);
}  setTimeout(() => {
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
