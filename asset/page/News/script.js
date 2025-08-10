import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

const newsContainer = document.getElementById("news-container");
const form = document.getElementById("add-news-form");
const toggleBtn = document.getElementById("toggle-form-btn");
const newsText = document.getElementById("news-text");
const submitBtn = document.getElementById("submit-news-btn");

// زر الفتح والغلق
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

// إضافة خبر
submitBtn.addEventListener("click", async () => {
  const text = newsText.value.trim();
  if (!text) return;
  await addDoc(collection(db, "news"), { text, createdAt: Date.now() });
  newsText.value = "";
});

// عرض الأخبار
onSnapshot(collection(db, "news"), (snapshot) => {
  newsContainer.innerHTML = "";
  snapshot.forEach(docSnap => {
    const div = document.createElement("div");
    div.className = "news-item";
    div.textContent = docSnap.data().text;
    newsContainer.appendChild(div);
  });
});
