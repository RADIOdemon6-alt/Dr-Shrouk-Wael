import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
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

// عناصر الصفحة
const newsContainer = document.getElementById("news-container");
const toggleBtn = document.getElementById("toggle-form-btn");
const form = document.getElementById("add-news-form");
const newsText = document.getElementById("news-text");
const submitBtn = document.getElementById("submit-news-btn");

let isTeacher = false;
let formVisible = false;
let lastNewsId = null; // لتفادي تكرار الإشعارات

// 🔹 زر إظهار/إخفاء الفورم مع أنيميشن
toggleBtn.addEventListener("click", () => {
  formVisible = !formVisible;
  toggleBtn.classList.toggle("rotate", formVisible);

  if (formVisible) {
    form.classList.remove("hidden");
    setTimeout(() => form.classList.add("show"), 10);
  } else {
    form.classList.remove("show");
    form.classList.add("explode");
    setTimeout(() => {
      form.classList.add("hidden");
      form.classList.remove("explode");
    }, 500);
  }
});

// 🔹 إضافة خبر جديد
submitBtn.addEventListener("click", async () => {
  const text = newsText.value.trim();
  if (!text) return;

  await addDoc(collection(db, "news"), { text, createdAt: Date.now() });
  newsText.value = "";
});

// 🔹 عرض الأخبار
function renderNews(id, text) {
  const div = document.createElement("div");
  div.className = "news-item";
  div.innerHTML = `<p>${text}</p>`;

  if (isTeacher) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "مسح";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "news", id));
    };
    div.appendChild(delBtn);
  }

  newsContainer.appendChild(div);
}

// 🔹 متابعة الأخبار لحظياً
onSnapshot(collection(db, "news"), (snapshot) => {
  newsContainer.innerHTML = "";
  let latestId = null;
  let latestText = null;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    renderNews(docSnap.id, data.text);
    if (!latestId || data.createdAt > latestId) {
      latestId = docSnap.id;
      latestText = data.text;
    }
  });

  // إشعار للطلاب عند إضافة خبر جديد
  if (!isTeacher && latestId && latestId !== lastNewsId) {
    lastNewsId = latestId;
    showNotification(latestText);
  }
});

// 🔹 إشعارات المتصفح
function showNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification("📢 خبر جديد", { body: msg });
  }
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// 🔹 تحقق تلقائي من دور المستخدم
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    isTeacher = false;
    toggleBtn.style.display = "none";
    form.style.display = "none";
    return;
  }

  try {
    const teacherSnap = await getDoc(doc(db, "teachers", user.uid));
    if (teacherSnap.exists()) {
      isTeacher = true;
      toggleBtn.style.display = "block"; // إظهار الزر
      form.style.display = "block"; // يجهز الفورم لكنه يظل hidden حتى الضغط على الزر
      return;
    }

    // طالب
    isTeacher = false;
    toggleBtn.style.display = "none";
    form.style.display = "none";

  } catch (err) {
    console.error("خطأ أثناء تحديد دور المستخدم:", err);
    isTeacher = false;
    toggleBtn.style.display = "none";
    form.style.display = "none";
  }
});
