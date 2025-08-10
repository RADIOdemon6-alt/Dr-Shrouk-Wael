import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

const newsContainer = document.getElementById("news-container");
const teacherTools = document.getElementById("teacher-tools");
const newsText = document.getElementById("news-text");
const toggleBtn = document.getElementById("toggle-form-btn");
const form = document.getElementById("add-news-form");
const submitBtn = document.getElementById("submit-news-btn");

let isTeacher = false; // علشان نعرف الدور

// عرض خبر
function renderNews(id, text) {
  const div = document.createElement("div");
  div.className = "news-item";
  div.innerHTML = `<p>${text}</p>`;

  // زر الحذف يظهر للمعلم فقط
  if (isTeacher) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "🗑";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "news", id));
    };
    div.appendChild(delBtn);
  }

  newsContainer.appendChild(div);
}

// فتح/غلق الفورم
let formVisible = false;
toggleBtn.addEventListener("click", () => {
  formVisible = !formVisible;
  if (formVisible) {
    toggleBtn.classList.add("rotate");
    form.classList.remove("hidden");
    setTimeout(() => form.classList.add("show"), 10);
  } else {
    form.classList.remove("show");
    form.classList.add("explode");
    setTimeout(() => {
      form.classList.add("hidden");
      form.classList.remove("explode");
    }, 500);
    toggleBtn.classList.remove("rotate");
  }
});

// إضافة خبر جديد
submitBtn.addEventListener("click", async () => {
  const text = newsText.value.trim();
  if (!text) return;
  await addDoc(collection(db, "news"), { text, createdAt: Date.now() });
  newsText.value = "";
});

// متابعة الأخبار لحظياً
function startNewsListener() {
  onSnapshot(collection(db, "news"), (snapshot) => {
    newsContainer.innerHTML = "";
    snapshot.forEach(docSnap => {
      renderNews(docSnap.id, docSnap.data().text);
    });

    // لو طالب → إشعار بالخبر الجديد
    if (!isTeacher) {
      const latest = snapshot.docs[snapshot.docs.length - 1]?.data()?.text;
      if (latest) showNotification(latest);
    }
  });
}

// إشعارات
function showNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification("📢 خبر جديد", { body: msg });
  }
}

// التحقق من الدور
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const teacherRef = doc(db, `teachers/${user.uid}`);
    const teacherSnap = await getDoc(teacherRef);
    if (teacherSnap.exists()) {
      isTeacher = true;
      teacherTools.classList.remove("hidden");
      teacherTools.classList.add("visible");
    }
    startNewsListener();
  } else {
    console.warn("لم يتم تسجيل دخول المستخدم");
  }
});

// طلب إذن الإشعارات
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
