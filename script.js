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

// 👇 استخدم grade ثابت مؤقتًا (غيره حسب الحاجة: 1، 2، 3)
const defaultGrade = "1";

// تسجيل طالب جديد
async function registerStudent(name, phone, password, grade = defaultGrade) {
  const studentRef = doc(db, `grades/${grade}/students/${phone}`);
  const docSnap = await getDoc(studentRef);

  if (docSnap.exists()) {
    throw new Error('رقم الهاتف مستخدم بالفعل');
  }

  const studentData = {
    name,
    phone,
    password,
    grade,
    createdAt: serverTimestamp()
  };

  await setDoc(studentRef, studentData);
  return studentData;
}

// تسجيل الدخول
async function loginStudent(phone, password, grade = defaultGrade) {
  const studentRef = doc(db, `grades/${grade}/students/${phone}`);
  const docSnap = await getDoc(studentRef);

  if (!docSnap.exists()) {
    throw new Error('الطالب غير مسجل');
  }

  const student = docSnap.data();
  if (student.password !== password) {
    throw new Error('كلمة المرور غير صحيحة');
  }

  return student;
}

// تسجيل حساب
document.getElementById("registerBtn")?.addEventListener("click", async () => {
  const name = document.getElementById("regName")?.value.trim();
  const code = document.getElementById("regCountryCode")?.value;
  const phoneRaw = document.getElementById("regPhone")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();

  const phone = code + phoneRaw;

  if (!name || !phoneRaw || !password) return alert("يرجى إدخال جميع البيانات");

  try {
    await registerStudent(name, phone, password);
    alert("تم التسجيل بنجاح");
    showLogin();
  } catch (error) {
    alert(error.message);
  }
});

// تسجيل الدخول
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const code = "+20"; // ثابت
  const phoneRaw = document.getElementById("loginPhone")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();
  const phone = code + phoneRaw;

  if (!phoneRaw || !password) return alert("يرجى إدخال جميع البيانات");

  try {
    const user = await loginStudent(phone, password);
    alert(`مرحبًا ${user.name}، تم تسجيل الدخول`);
    // هنا تقدر تنقل الطالب لصفحة تانية أو تظهر بياناته
  } catch (error) {
    alert(error.message);
  }
});

// تبديل بين النماذج
function showRegister() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

window.showRegister = showRegister;
window.showLogin = showLogin;
