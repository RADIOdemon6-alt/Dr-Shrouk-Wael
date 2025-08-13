import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
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

const videoContainer = document.getElementById("video-container");
const toggleBtn = document.getElementById("toggle-form-btn");
const form = document.getElementById("add-video-form");
const videoName = document.getElementById("video-name");
const videoUrl = document.getElementById("video-url");
const submitBtn = document.getElementById("submit-video-btn");

let isTeacher = false;
let formVisible = false;

// تبديل إظهار الفورم
toggleBtn.addEventListener("click", () => {
  formVisible = !formVisible;
  toggleBtn.classList.toggle("active", formVisible);
  form.classList.toggle("show", formVisible);
});

// إضافة فيديو
submitBtn.addEventListener("click", async () => {
  const name = videoName.value.trim();
  const url = videoUrl.value.trim();
  if (!name || !url) return;
  
  await addDoc(collection(db, "videos"), { name, url, createdAt: Date.now() });
  videoName.value = "";
  videoUrl.value = "";
  formVisible = false;
  toggleBtn.classList.remove("active");
  form.classList.remove("show");
});

// عرض الفيديوهات
function renderVideo(id, name, url) {
  const card = document.createElement("div");
  card.className = "video-card";

  // استخراج embed link
  let embedUrl = url;
  if (url.includes("watch?v=")) {
    embedUrl = url.replace("watch?v=", "embed/");
  }

  card.innerHTML = `
    <div class="video-title">${name}</div>
    <iframe src="${embedUrl}" allowfullscreen></iframe>
  `;

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
  setTimeout(() => card.classList.add("show"), 50);
}

// متابعة الفيديوهات لحظياً
onSnapshot(collection(db, "videos"), (snapshot) => {
  videoContainer.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    renderVideo(docSnap.id, data.name, data.url);
  });
});

// تحقق من دور المستخدم
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    isTeacher = false;
    toggleBtn.style.display = "none";
    form.style.display = "none";
    return;
  }
  const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const teacherSnap = await getDoc(doc(db, "teachers", user.uid));
  if (teacherSnap.exists()) {
    isTeacher = true;
    toggleBtn.style.display = "block";
    form.style.display = "block";
  } else {
    isTeacher = false;
    toggleBtn.style.display = "none";
    form.style.display = "none";
  }
});
