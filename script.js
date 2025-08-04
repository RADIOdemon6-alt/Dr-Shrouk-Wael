function switchForm(showId) {
  const forms = document.querySelectorAll('.login-box');
  forms.forEach(form => {
    if (form.id === showId) {
      form.classList.add('active');
      form.classList.remove('hidden');
      form.classList.add('glitch'); // Glitch تأثير
      setTimeout(() => form.classList.remove('glitch'), 300); // إلغاء بعد 0.3s
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

// مثال للتسجيل / الدخول التجريبي
function register() {
  alert('تم التسجيل (وهمي)');
  showLogin();
}

function login() {
  alert('تم تسجيل الدخول (وهمي)');
}

function recoverPassword() {
  alert('تم إرسال رابط الاستعادة (وهمي)');
}
