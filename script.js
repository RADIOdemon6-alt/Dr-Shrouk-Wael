import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSqV0VQGR3048_bhhDx7NYboe2jaYc85Y",
  authDomain: "dr-shrouk-wael.firebaseapp.com",
  projectId: "dr-shrouk-wael",
  storageBucket: "dr-shrouk-wael.appspot.com",
  messagingSenderId: "1053856451278",
  appId: "1:1053856451278:web:877ed5b22f6a8ecaee9e9f",
  measurementId: "G-1556HS2GRJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.register = async function() {
  const name = document.getElementById('regName').value.trim();
  const countryCode = document.getElementById('regCountryCode').value;
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const grade = document.getElementById('regGrade').value;

  if (!name || !phone || !password || !grade) {
    alert('⚠️ جميع الحقول مطلوبة.');
    return;
  }

  const fullPhone = countryCode + phone;

  try {
    const q = query(collection(db, "students"), where("phone", "==", fullPhone));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert('❌ هذا الرقم مسجل مسبقاً.');
      return;
    }

    await addDoc(collection(db, "students"), {
      name: name,
      phone: fullPhone,
      password: password,
      grade: grade,
      createdAt: new Date()
    });

    alert('✅ تم التسجيل بنجاح!');
    showLogin();
  } catch (error) {
    console.error("❌ خطأ أثناء التسجيل:", error);
    alert('❌ حدث خطأ أثناء التسجيل.');
  }
};

window.login = async function() {
  const phone = document.getElementById('loginPhone').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!phone || !password) {
    alert('⚠️ يرجى إدخال رقم الهاتف وكلمة المرور.');
    return;
  }

  try {
    const q = query(collection(db, "students"), where("phone", "==", phone), where("password", "==", password));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      alert(`✅ مرحباً ${userData.name} - تسجيل دخول ناجح!`);
      window.location.href = "dashboard.html";  // يمكنك تغيير الرابط هنا
    } else {
      alert('❌ بيانات الدخول غير صحيحة.');
    }
  } catch (error) {
    console.error("❌ خطأ أثناء تسجيل الدخول:", error);
    alert('❌ حدث خطأ أثناء تسجيل الدخول.');
  }
};

window.showLogin = function() {
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('forgotForm').classList.remove('active');
  document.getElementById('forgotForm').classList.add('hidden');
};

window.showRegister = function() {
  document.getElementById('registerForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('forgotForm').classList.remove('active');
  document.getElementById('forgotForm').classList.add('hidden');
};

window.showForgotPassword = function() {
  document.getElementById('forgotForm').classList.add('active');
  document.getElementById('forgotForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('registerForm').classList.add('hidden');
};

window.recoverPassword = function() {
  alert('🚧 جاري العمل على استعادة كلمة المرور لاحقاً.');
};
