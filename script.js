import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase Config
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
const auth = getAuth(app);

// Recaptcha Invisible Setup
let recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  'size': 'invisible',
  'callback': () => {
    sendOTP();
  }
});

let confirmationResult;

// Show/Hide Forms
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

// Send OTP
window.sendOTP = () => {
  const countryCode = document.getElementById('regCountryCode').value;
  const phone = document.getElementById('regPhone').value;
  if (!phone) return alert("⚠️ أدخل رقم الهاتف");

  const fullPhone = countryCode + phone;

  signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("📲 تم إرسال كود التحقق إلى رقمك");
    })
    .catch((error) => {
      alert("⚠️ خطأ في إرسال الكود: " + error.message);
    });
};

// Verify OTP
window.verifyOTP = () => {
  const code = document.getElementById('otpCode').value;
  if (!code) return alert("⚠️ أدخل كود التحقق");

  confirmationResult.confirm(code).then((result) => {
    alert("✅ تم تأكيد الرقم بنجاح، يمكنك إكمال التسجيل الآن");
  }).catch((error) => {
    alert("❌ كود التحقق غير صحيح");
  });
};

// Register User
window.register = () => {
  const name = document.getElementById('regName').value;
  const phone = document.getElementById('regPhone').value;
  const password = document.getElementById('regPassword').value;
  const grade = document.getElementById('regGrade').value;

  if (!name || !phone || !password || !grade) {
    alert("⚠️ يرجى ملء جميع الحقول");
    return;
  }

  const userData = {
    name: name,
    phone: phone,
    password: password,
    grade: grade
  };

  set(ref(db, 'users/' + name), userData)
    .then(() => {
      alert("✅ تم التسجيل بنجاح");
      showLogin();
    })
    .catch((error) => {
      alert("⚠️ خطأ أثناء الحفظ: " + error.message);
    });
};

// Login User
window.login = () => {
  const phone = document.getElementById('loginPhone').value;
  const password = document.getElementById('loginPassword').value;

  if (!phone || !password) {
    alert("⚠️ أدخل رقم الهاتف وكلمة المرور");
    return;
  }

  const dbRef = ref(db);
  get(child(dbRef, 'users')).then((snapshot) => {
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach(userSnap => {
        const user = userSnap.val();
        if (user.phone === phone && user.password === password) {
          found = true;
          alert(`✅ أهلاً ${user.name}`);
          window.location.href = 'asset/pages/home/index.html';
        }
      });
      if (!found) alert("❌ بيانات الدخول غير صحيحة");
    } else {
      alert("❌ لا يوجد مستخدمين");
    }
  }).catch((error) => {
    alert("⚠️ خطأ: " + error.message);
  });
};

// Recover Password (Demo)
window.recoverPassword = () => {
  const phone = document.getElementById('forgotPhone').value;
  if (!phone) return alert("⚠️ أدخل رقم الهاتف");

  alert(`📲 سيتم إرسال رابط الاستعادة إلى رقم: ${phone} (هذه ديمو، ركّب API SMS الحقيقي هنا)`);
};
