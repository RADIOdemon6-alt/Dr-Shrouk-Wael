import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc, // 📌 إضافة استيراد الحذف
  doc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// 📌 إعداد Firebase
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

// 📌 إعداد GitHub
const githubUser = "RADIOdemon6";
const repo = "Dr-Shrouk-Wael-storage-";
const basePath = "storage/pdf/";
const token = "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";

// 📌 عناصر الواجهة
const uploadSection = document.querySelector(".upload-section");
const uploadBtn = document.getElementById("uploadBtn");
const pdfUpload = document.getElementById("pdfUpload");
const pdfList = document.getElementById("pdfList");

// 🌀 عنصر اللودينج
const loadingSpinner = document.createElement("div");
loadingSpinner.className = "loading-spinner hidden";
loadingSpinner.innerHTML = `<div class="spinner"></div>`;
document.body.appendChild(loadingSpinner);

// 🎯 التحقق من نوع المستخدم
uploadSection.style.display = "none";
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const teacherRef = doc(db, "teachers", user.uid);
      const teacherSnap = await getDoc(teacherRef);

      if (teacherSnap.exists()) {
        uploadSection.style.display = "block"; // معلم
      } else {
        uploadSection.style.display = "none"; // طالب
      }

      loadPDFs();
    } catch (err) {
      console.error("خطأ في التحقق من نوع المستخدم:", err);
    }
  } else {
    window.location.href = "https://dr-shrouk-wael.vercel.app/";
  }
});

// 📤 رفع PDF إلى GitHub (مع تعديل إذا الملف موجود)
async function uploadPDFToGitHub(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function () {
      const content = reader.result.split(",")[1];
      const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${basePath}${encodeURIComponent(file.name)}`;

      let sha = null;
      try {
        const checkRes = await fetch(url, { headers: { Authorization: `token ${token}` } });
        if (checkRes.ok) {
          const data = await checkRes.json();
          sha = data.sha;
        }
      } catch {}

      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `رفع ملف ${file.name}`,
            content: content,
            ...(sha ? { sha } : {})
          })
        });

        if (res.ok) resolve(await res.json());
        else reject(await res.json());
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsDataURL(file);
  });
}

// 📌 عند الضغط على زر الرفع
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

// 📥 عرض وحذف الكتب
async function loadPDFs() {
  loadingSpinner.classList.remove("hidden");
  pdfList.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "books"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.className = "pdf-item";
      div.innerHTML = `
        <a href="https://raw.githubusercontent.com/${githubUser}/${repo}/main/${basePath}${encodeURIComponent(data.name)}" target="_blank">
          ${data.name}
        </a>
        <span class="delete-btn" style="cursor:pointer;color:red;margin-left:10px;">❌</span>
      `;

      // 📌 حذف عند الضغط على ❌
      div.querySelector(".delete-btn").onclick = async () => {
        if (!confirm(`هل تريد حذف ${data.name}؟`)) return;

        try {
          const fileUrl = `https://api.github.com/repos/${githubUser}/${repo}/contents/${basePath}${encodeURIComponent(data.name)}`;
          const checkRes = await fetch(fileUrl, { headers: { Authorization: `token ${token}` } });
          const fileData = await checkRes.json();

          // حذف من GitHub
          await fetch(fileUrl, {
            method: "DELETE",
            headers: {
              Authorization: `token ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: `حذف ملف ${data.name}`,
              sha: fileData.sha
            })
          });

          // حذف من Firestore
          await deleteDoc(doc(db, "books", docSnap.id));

          // تحديث القائمة
          loadPDFs();
        } catch (err) {
          console.error("خطأ أثناء الحذف:", err);
        }
      };

      pdfList.appendChild(div);
    });
  } catch (err) {
    console.error("خطأ في تحميل الملفات:", err);
  }

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
