import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// إعداد Firebase
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
const auth = getAuth(app);

// 🔐 تحويل رقم الهاتف إلى بريد وهمي
function phoneToEmail(phone) {
  return phone.replace(/[^+\d]/g, '') + "@chemapp.com";
}

// ✅ تسجيل حساب جديد
window.register = async function () {
  const name = document.getElementById("regName")?.value.trim();
  let phone = document.getElementById("regPhone")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();
  const grade = document.getElementById("regGrade")?.value;

  if (!name || !phone || !password || !grade) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  if (!/^01[0-9]{9}$/.test(phone)) {
    alert("رقم الهاتف غير صالح. يرجى إدخاله بدون كود الدولة (مثال: 1061234567)");
    return;
  }

  phone = "+20" + phone;
  const email = phoneToEmail(phone);

  try {
    // إنشاء مستخدم في Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // تخزين بيانات إضافية في Firestore
    const studentRef = doc(db, `grades/${grade}/students/${uid}`);
    const studentData = {
      name,
      phone,
      grade,
      createdAt: serverTimestamp()
    };
    await setDoc(studentRef, studentData);

    alert("✅ تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن");
    showLogin();

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("❌ رقم الهاتف مستخدم مسبقًا");
    } else {
      alert("حدث خطأ أثناء التسجيل: " + error.message);
    }
  }
};

// ✅ تسجيل الدخول
window.login = async function () {
  const phoneRaw = document.getElementById("loginPhone")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!phoneRaw || !password) {
    alert("يرجى إدخال رقم الهاتف وكلمة المرور");
    return;
  }

  let phone = phoneRaw;
  if (!phone.startsWith("+")) {
    phone = "+20" + phone;
  }

  const email = phoneToEmail(phone);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // البحث عن بيانات الطالب
    const grades = ["1", "2", "3"];
    let found = false;
    for (const grade of grades) {
      const studentRef = doc(db, `grades/${grade}/students/${uid}`);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const student = studentSnap.data();
        alert(`أهلًا ${student.name} 👋\nتم تسجيل الدخول بنجاح`);
        found = true;
        break;
      }
    }

    if (!found) {
      alert("لم يتم العثور على بيانات الطالب");
    }

  } catch (error) {
    if (error.code === "auth/user-not-found") {
      alert("رقم الهاتف غير مسجل");
    } else if (error.code === "auth/wrong-password") {
      alert("كلمة المرور غير صحيحة");
    } else {
      alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
    }
  }
};

// ✅ التبديل بين النماذج
window.showRegister = function () {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("active");
  document.getElementById("registerForm").classList.remove("hidden");
};

window.showLogin = function () {
  document.getElementById("registerForm").classList.remove("active");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("loginForm").classList.remove("hidden");
};

// 🔒 استعادة كلمة المرور (مستقبليًا)
window.showForgotPassword = function () {
  alert("سيتم تفعيل استعادة كلمة المرور قريبًا");
};
