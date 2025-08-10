// -------------------- Firebase Import --------------------
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getMessaging,
  getToken,
  onMessage
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

// -------------------- إعداد Firebase --------------------
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
const messaging = getMessaging(app);

// -------------------- إشعارات --------------------
function showInSiteNotification(msg) {
  const notifDiv = document.getElementById("in-site-notification");
  notifDiv.textContent = msg;
  notifDiv.classList.remove("hidden");
  setTimeout(() => notifDiv.classList.add("hidden"), 3000);
}

async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    getToken(messaging, {
      vapidKey: "BBgOloCSmi9dueZz5_BD3bWopezdv86DoKioePjdaVkKA_vGrNYw0uDdhahJMYgeDMn5E27TMCUs0-SREqkvHYc"
    }).then(token => {
      console.log("FCM Token:", token);
    });
  }
}

onMessage(messaging, (payload) => {
  if (payload.notification) {
    showInSiteNotification(payload.notification.title);
  }
});

// -------------------- الأخبار --------------------
function loadNews() {
  const newsContainer = document.getElementById("news-container");
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    newsContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const news = doc.data();
      const cube = document.createElement("div");
      cube.className = "news-cube";
      cube.innerHTML = `
        <div class="news-title">${news.title}</div>
        <div class="news-content hidden">${news.content}</div>
      `;
      cube.addEventListener("click", () => {
        cube.querySelector(".news-content").classList.toggle("hidden");
      });
      newsContainer.appendChild(cube);
    });
  });
}

async function addNews() {
  const title = document.getElementById("news-title").value.trim();
  const content = document.getElementById("news-content").value.trim();
  if (!title || !content) {
    alert("يرجى كتابة العنوان والمحتوى");
    return;
  }
  await addDoc(collection(db, "news"), {
    title,
    content,
    createdAt: serverTimestamp()
  });
  showInSiteNotification("📢 تم إضافة خبر جديد!");
  document.getElementById("news-form-popup").classList.add("hidden");
}

// -------------------- التحقق بعد تسجيل الدخول --------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("يرجى تسجيل الدخول أولاً");
    window.location.href = "https://dr-shrouk-wael.vercel.app/";
    return;
  }

  // تحقق إذا كان معلم
  const teacherRef = doc(db, `teachers/${user.uid}`);
  const teacherSnap = await getDoc(teacherRef);
  if (teacherSnap.exists()) {
    document.getElementById("add-news-btn").classList.remove("hidden");
    document.getElementById("add-news-btn").onclick = () => {
      document.getElementById("news-form-popup").classList.remove("hidden");
    };
    document.getElementById("save-news-btn").onclick = addNews;
  }

  // عرض الأخبار للجميع
  loadNews();
  requestNotificationPermission();
});
