import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// تسجيل حساب جديد
window.register = async function () {
  const name = document.getElementById("regName")?.value.trim();
  const phoneCode = document.getElementById("regCountryCode")?.value || "+20";
  const phone = phoneCode + document.getElementById("regPhone")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();
  const grade = document.getElementById("regGrade")?.value || "1";

  if (!name || !phone || !password) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  try {
    const studentRef = doc(db, `grades/${grade}/students/${phone}`);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      alert("رقم الهاتف مستخدم مسبقًا");
      return;
    }

    const studentData = {
      name,
      phone,
      password,
      grade,
      createdAt: serverTimestamp(),
    };

    await setDoc(studentRef, studentData);
    alert("تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن");
    showLogin();
  } catch (error) {
    alert("حدث خطأ أثناء التسجيل: " + error.message);
  }
};

// تسجيل الدخول
window.login = async function () {
  const phoneRaw = document.getElementById("loginPhone")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();
  const phone = "+20" + phoneRaw;

  if (!phoneRaw || !password) {
    alert("يرجى إدخال رقم الهاتف وكلمة المرور");
    return;
  }

  try {
    const grades = ["1", "2", "3"];
    let found = false;
    for (const grade of grades) {
      const studentRef = doc(db, `grades/${grade}/students/${phone}`);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const student = studentSnap.data();
        if (student.password === password) {
          alert(`أهلًا ${student.name} 👋\nتم تسجيل الدخول بنجاح`);
          found = true;
          break;
        } else {
          alert("كلمة المرور غير صحيحة");
          return;
        }
      }
    }

    if (!found) {
      alert("الطالب غير مسجل بأي صف");
    }
  } catch (error) {
    alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
  }
};

// التبديل بين النماذج
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

// نسيت كلمة المرور
window.showForgotPassword = function () {
  alert("قريبًا سيتم تفعيل استعادة كلمة المرور");
};
