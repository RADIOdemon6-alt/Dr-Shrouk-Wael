import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSqV0VQGR3048_bhhDx7NYboe2jaYc85Y",
  authDomain: "dr-shrouk-wael.firebaseapp.com",
  projectId: "dr-shrouk-wael",
  storageBucket: "dr-shrouk-wael.appspot.com",
  messagingSenderId: "1053856451278",
  appId: "1:1053856451278:web:877ed5b22f6a8ecaee9e9f",
  databaseURL: "https://dr-shrouk-wael-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// تسجيل حساب جديد
window.register = () => {
  const name = document.getElementById('regName').value.trim();
  const countryCode = document.getElementById('regCountryCode').value;
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const grade = document.getElementById('regGrade').value.trim();

  if (!name || !phone || !password || !grade) {
    alert("❌ يرجى ملء جميع الحقول");
    return;
  }

  const fullPhone = countryCode + phone;
  const userData = {
    name: name,
    phone: fullPhone,
    password: password,
    grade: grade
  };

  set(ref(db, 'users/' + name), userData)
    .then(() => {
      alert("✅ تم تسجيل الحساب بنجاح");
      showLogin();
    })
    .catch((error) => {
      alert("❌ خطأ أثناء الحفظ: " + error.message);
    });
};

// تسجيل الدخول
window.login = () => {
  const phoneInput = document.getElementById('loginPhone').value.trim();
  const passwordInput = document.getElementById('loginPassword').value.trim();

  if (!phoneInput || !passwordInput) {
    alert("❌ أدخل رقم الهاتف وكلمة المرور");
    return;
  }

  const dbRef = ref(db, 'users');
  get(dbRef).then((snapshot) => {
    let found = false;

    snapshot.forEach((userSnap) => {
      const userData = userSnap.val();
      if (userData.phone === phoneInput && userData.password === passwordInput) {
        found = true;
        alert("✅ تسجيل الدخول ناجح! جاري تحويلك...");
        window.location.href = "asset/pages/home/index.html";
      }
    });

    if (!found) {
      alert("❌ رقم الهاتف أو كلمة المرور غير صحيحة");
    }
  }).catch((error) => {
    alert("❌ خطأ أثناء التحقق: " + error.message);
  });
};

// استرجاع كلمة المرور
window.recoverPassword = () => {
  const phone = document.getElementById('forgotPhone').value.trim();
  if (!phone) {
    alert("❌ أدخل رقم الهاتف");
    return;
  }

  const dbRef = ref(db, 'users');
  get(dbRef).then((snapshot) => {
    let found = false;
    snapshot.forEach((userSnap) => {
      const userData = userSnap.val();
      if (userData.phone === phone) {
        found = true;
        alert(`🔑 كلمة المرور الخاصة بك: ${userData.password}`);
      }
    });

    if (!found) {
      alert("❌ لم يتم العثور على رقم الهاتف");
    }
  }).catch((error) => {
    alert("❌ خطأ أثناء البحث: " + error.message);
  });
};

// التنقل بين النماذج
window.showRegister = () => {
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('active');
  document.getElementById('forgotForm').classList.remove('active');
};

window.showLogin = () => {
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('forgotForm').classList.remove('active');
};

window.showForgotPassword = () => {
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('forgotForm').classList.add('active');
};
