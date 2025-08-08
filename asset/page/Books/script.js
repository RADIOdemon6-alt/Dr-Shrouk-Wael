// ===== إعداد Firebase =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

// ===== عناصر الواجهة =====
const uploadSection = document.querySelector(".upload-section");
const uploadBtn = document.getElementById("uploadBtn");
const pdfUpload = document.getElementById("pdfUpload");
const pdfList = document.getElementById("pdfList");
const loadingSpinner = document.getElementById("loadingSpinner");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

let isTeacher = false;
uploadSection.style.display = "none";

// ===== التحقق من المعلم =====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const teacherRef = doc(db, "teachers", user.uid);
      const teacherSnap = await getDoc(teacherRef);

      if (teacherSnap.exists()) {
        isTeacher = true;
        console.log("✅ تم التحقق: المستخدم معلم");
        uploadSection.style.display = "block";
      } else {
        isTeacher = false;
        console.log("⛔ المستخدم ليس معلم");
        uploadSection.style.display = "none";
      }
      loadPDFs();
    } catch (err) {
      console.error("⚠️ خطأ أثناء التحقق من المعلم:", err);
    }
  } else {
    window.location.href = "https://dr-shrouk-wael.vercel.app/";
  }
});

// ===== رفع PDF إلى GoFile =====
async function uploadPDFtoGoFile(file) {
  progressBar.style.width = "0%";
  progressContainer.style.display = "block";
  loadingSpinner.classList.remove("hidden");

  try {
    // 1. الحصول على سيرفر GoFile
    const serverRes = await fetch("https://api.gofile.io/getServer");
    const serverData = await serverRes.json();
    if (serverData.status !== "ok") throw new Error("تعذر الحصول على السيرفر");
    const server = serverData.data.server;

    // 2. رفع الملف
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch(`https://${server}.gofile.io/uploadFile`, {
      method: "POST",
      body: formData
    });

    let text = await uploadRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`رد السيرفر غير صالح: ${text}`);
    }

    if (data.status !== "ok") {
      throw new Error(`خطأ من GoFile: ${data.status}`);
    }

    // 3. حفظ في Firestore
    await addDoc(collection(db, "books"), {
      name: file.name,
      url: data.data.downloadPage,
      createdAt: serverTimestamp()
    });

    console.log(`✅ تم رفع الملف: ${file.name}`);
  } catch (err) {
    console.error(`❌ فشل رفع الملف: ${file.name} - ${err.message}`);
    alert(`⚠️ فشل رفع الملف: ${file.name}\n${err.message}`);
  } finally {
    loadingSpinner.classList.add("hidden");
    progressContainer.style.display = "none";
  }
}

// ===== عرض الملفات =====
async function loadPDFs() {
  loadingSpinner.classList.remove("hidden");
  pdfList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "books"));

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "pdf-item";
    div.innerHTML = `
      <a href="${data.url}" target="_blank">${data.name}</a>
      ${isTeacher ? `<span class="delete-btn" style="cursor:pointer;color:red;">❌</span>` : ""}
    `;

    if (isTeacher) {
      div.querySelector(".delete-btn").onclick = async () => {
        if (!confirm(`هل تريد حذف ${data.name}؟`)) return;
        await deleteDoc(doc(db, "books", docSnap.id));
        loadPDFs();
      };
    }

    pdfList.appendChild(div);
  });

  loadingSpinner.classList.add("hidden");
}

// ===== عند الضغط على زر الرفع =====
uploadBtn.addEventListener("click", async () => {
  if (!pdfUpload.files.length) {
    alert("يرجى اختيار ملف PDF أولاً");
    return;
  }

  for (let file of pdfUpload.files) {
    await uploadPDFtoGoFile(file);
  }

  pdfUpload.value = "";
  loadPDFs();
});
