function swipeTo(targetFormId, direction) {
    const activeForm = document.querySelector('.login-box.active');
    const targetForm = document.getElementById(targetFormId);

    // سحب الفورم الحالي
    activeForm.classList.add(direction === 'left' ? 'exit-left' : 'exit-right');

    // بعد الانيميشن نبدل الفورم
    setTimeout(() => {
        activeForm.classList.remove('active', 'exit-left', 'exit-right');

        targetForm.classList.add('active', 'glitch-effect'); // تأثير الخلل الخفيف

        setTimeout(() => {
            targetForm.classList.remove('glitch-effect');
        }, 400);

    }, 500); // نفس مدة transition في CSS
}

// أزرار التنقل بين الفورمات
function showRegister() {
    swipeTo('registerForm', 'left');
}

function showLogin() {
    swipeTo('loginForm', 'right');
}

function showForgotPassword() {
    swipeTo('forgotForm', 'left');
}

// Progress Bar + Bubbles عند تسجيل الدخول
function login() {
    const progressBar = document.getElementById('progressBar');
    const bubbles = document.getElementById('bubbles');

    // Start Progress Bar
    progressBar.style.width = '0%';
    setTimeout(() => {
        progressBar.style.width = '100%';
    }, 100);

    // بعد ما يتملي البار → فقاعات النجاح
    setTimeout(() => {
        bubbles.innerHTML = '';
        for (let i = 0; i < 15; i++) {
            const span = document.createElement('span');
            span.style.left = `${Math.random() * 100}%`;
            span.style.animationDuration = `${2 + Math.random() * 2}s`;
            bubbles.appendChild(span);
        }
        bubbles.style.display = 'block';

        // إخفاء الفقاعات بعد شوية
        setTimeout(() => {
            bubbles.style.display = 'none';
        }, 3000);
    }, 1500); // بعد ما يخلص الـProgress
}

// Placeholder functions for Register & Recover
function register() {
    alert("🚀 تم إنشاء الحساب (دي مجرد تجربة)!");
}

function recoverPassword() {
    alert("🔑 تم إرسال رابط الاستعادة (دي مجرد تجربة)!");
}
