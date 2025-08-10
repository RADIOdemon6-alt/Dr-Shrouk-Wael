import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, onSnapshot, deleteDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
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
const addNewsBtn = document.getElementById("add-news-btn");
const newsText = document.getElementById("news-text");

// عرض الأخبار
function renderNews(id, text, isTeacher) {
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

// إشعارات المتصفح
function showNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification("📢 خبر جديد", { body: msg });
  }
}

// متابعة الأخبار لحظياً
onSnapshot(collection(db, "news"), (snapshot) => {
  newsContainer.innerHTML = "";
  snapshot.forEach(docSnap => {
    renderNews(docSnap.id, docSnap.data().text, teacherTools.classList.contains("visible"));
  });
  // لو طالب → اشعار بالخبر الجديد
  if (!teacherTools.classList.contains("visible")) {
    const latest = snapshot.docs[snapshot.docs.length - 1]?.data()?.text;
    if (latest) showNotification(latest);
  }
});

// تحقق تلقائي من الدور
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const teacherRef = doc(db, `teachers/${user.uid}`);
    const teacherSnap = await getDoc(teacherRef);
    if (teacherSnap.exists()) {
      teacherTools.classList.remove("hidden");
      teacherTools.classList.add("visible");
    }
  } else {
    console.warn("لم يتم تسجيل دخول المستخدم");
  }
});

// إضافة خبر جديد
addNewsBtn.onclick = async () => {
  const text = newsText.value.trim();
  if (!text) return;
  await addDoc(collection(db, "news"), { text, createdAt: Date.now() });
  newsText.value = "";
};

// طلب إذن الإشعارات
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
