// ===== Firebase إعداد =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// إعدادات Firebase
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

const videoContainer = document.getElementById("video-container");
const toggleBtn = document.getElementById("toggle-form-btn");
const form = document.getElementById("add-video-form");
const videoNameInput = document.getElementById("video-title");
const videoUrlInput = document.getElementById("video-link");
const submitBtn = document.getElementById("submit-video-btn");

let isTeacher = false;
let formVisible = false;

// ===== تحويل رابط YouTube إلى embed =====
function getEmbedUrl(url) {
  try {
    const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(ytRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
    }
    return url;
  } catch {
    return url;
  }
}

// ===== فتح/إغلاق الفورم مع أنيميشن زر الإضافة =====
toggleBtn.addEventListener("click", () => {
  formVisible = !formVisible;
  toggleBtn.classList.toggle("active", formVisible);

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

// ===== إضافة فيديو جديد =====
submitBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // منع إعادة تحميل الصفحة

  const url = videoUrlInput.value.trim();
  const name = videoNameInput.value.trim();
  if (!url || !name) return;

  await addDoc(collection(db, "videos"), {
    url,
    name,
    createdAt: Date.now()
  });

  videoUrlInput.value = "";
  videoNameInput.value = "";
  toggleBtn.click(); // إغلاق الفورم بعد الإضافة
});

// ===== عرض الفيديوهات =====
function renderVideo(id, name, url) {
  const card = document.createElement("div");
  card.className = "video-card fade-in";

  const iframe = document.createElement("iframe");
  iframe.src = getEmbedUrl(url);
  iframe.width = "100%";
  iframe.height = "150";
  iframe.allowFullscreen = true;

  const title = document.createElement("h3");
  title.textContent = name;

  card.appendChild(iframe);
  card.appendChild(title);

  if (isTeacher) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "مسح";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "videos", id));
    };
    card.appendChild(delBtn);
  }

  videoContainer.appendChild(card);
}

// ===== متابعة التحديثات لحظياً =====
onSnapshot(collection(db, "videos"), (snapshot) => {
  videoContainer.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    renderVideo(docSnap.id, data.name, data.url);
  });
});

// ===== التحقق من دور المستخدم =====
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
      toggleBtn.style.display = "block";
      return;
    }
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
const list = document.querySelectorAll('.list');
function activeLink() {
    list.forEach((item) =>
    item.classList.remove('active'));
    this.classList.add('active');
}
list.forEach((item) =>
item.addEventListener('click',activeLink));
