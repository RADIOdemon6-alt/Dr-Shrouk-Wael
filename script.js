  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
  import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
  import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

  // Recaptcha Invisible
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'registerBtn', {
    'size': 'invisible',
    'callback': () => {
      sendOTP();
    }
  });

  let confirmationResult;

  // Send OTP
  window.sendOTP = () => {
    const phone = document.getElementById('regPhone').value;
    const fullPhone = "+20" + phone;  // Change according to country code

    signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)
      .then((result) => {
        confirmationResult = result;
        alert("📲 تم إرسال كود التحقق إلى رقمك");
      })
      .catch((error) => {
        alert("⚠️ خطأ في إرسال الكود: " + error.message);
      });
  };

  // Verify OTP and Save Data
  window.verifyAndRegister = () => {
    const code = prompt("ادخل كود التحقق:");
    confirmationResult.confirm(code).then((result) => {
      const user = result.user;
      saveUserData();
    }).catch((error) => {
      alert("❌ كود التحقق غير صحيح");
    });
  };

  function saveUserData() {
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const grade = document.getElementById('regGrade').value;

    if (!name || !phone || !password || !grade) {
      alert("❌ يرجى ملء جميع الحقول");
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
  }

  // Switch Forms
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
