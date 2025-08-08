import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

// إعداد GitHub
const githubUser = "RADIOdemon6";
const repo = "Dr-Shrouk-Wael-storage-";
const basePath = "storage/pdf/";
const token = "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";

const uploadSection = document.querySelector(".upload-section");
const uploadBtn = document.getElementById("uploadBtn");
const pdfUpload = document.getElementById("pdfUpload");
const pdfList = document.getElementById("pdfList");

// 🌀 عنصر اللودينج
const loadingSpinner = document.createElement("div");
loadingSpinner.className = "loading-spinner hidden";
loadingSpinner.innerHTML = `<div class="spinner"></div>`;
document.body.appendChild(loadingSpinner);

// 🎯 عرض أو إخفاء أزرار الرفع حسب نوع المستخدم
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const teacherRef = doc(db, "teachers", uid);
    const teacherSnap = await getDoc(teacherRef);

    if (teacherSnap.exists()) {
      // المستخدم معلم
      uploadSection.style.display = "block";
    } else {
      // المستخدم طالب
      uploadSection.style.display = "none";
    }

    loadPDFs();
  } else {
    window.location.href = "https://dr-shrouk-wael.vercel.app/";
  }
});

// 📤 رفع الكتب إلى GitHub
async function uploadPDFToGitHub(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function () {
      const content = reader.result.split(",")[1];

      const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${basePath}${file.name}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `رفع ملف ${file.name}`,
          content: content
        })
      });

      if (res.ok) {
        resolve(await res.json());
      } else {
        reject(await res.json());
      }
    };
    reader.readAsDataURL(file);
  });
}

uploadBtn.addEventListener("click", async () => {
  if (!pdfUpload.files.length) {
    alert("يرجى اختيار ملف PDF أولاً");
    return;
  }

  loadingSpinner.classList.remove("hidden");

  for (let file of pdfUpload.files) {
    try {
      await uploadPDFToGitHub(file);
      await addDoc(collection(db, "books"), {
        name: file.name,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("خطأ في رفع الملف:", err);
    }
  }

  loadingSpinner.classList.add("hidden");
  pdfUpload.value = "";
  loadPDFs();
});

// 📥 عرض الكتب
async function loadPDFs() {
  loadingSpinner.classList.remove("hidden");
  pdfList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "books"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "pdf-item";
    div.innerHTML = `<a href="https://raw.githubusercontent.com/${githubUser}/${repo}/main/${basePath}${encodeURIComponent(data.name)}" target="_blank">${data.name}</a>`;
    pdfList.appendChild(div);
  });

  loadingSpinner.classList.add("hidden");
}

// 📌 بوب أب جدول العناصر
const popup = document.getElementById("popup");
const elementTableBtn = document.getElementById("elementTableBtn");
const closePopup = document.getElementById("closePopup");

elementTableBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

closePopup.addEventListener("click", () => {
  popup.classList.add("hidden");
});

// 🔄 تفعيل النڤيجيشن
const list = document.querySelectorAll('.list');
function activeLink() {
  list.forEach((item) => item.classList.remove('active'));
  this.classList.add('active');
}
list.forEach((item) => item.addEventListener('click', activeLink));
