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

let isTeacher = null; // null = لسه ما تحققناش

// ===== التحقق من المعلم =====
uploadSection.style.display = "none";
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.error("🚫 لم يتم تسجيل الدخول، إعادة توجيه...");
    window.location.href = "/";
    return;
  }

  try {
    const teacherRef = doc(db, "teachers", user.uid);
    const teacherSnap = await getDoc(teacherRef);

    if (teacherSnap.exists()) {
      isTeacher = true;
      console.log("✅ تم التحقق: المستخدم معلم");
      uploadSection.style.display = "block";
    } else {
      isTeacher = false;
      console.error("❌ المستخدم ليس معلمًا");
    }

    await loadPDFs();
  } catch (err) {
    console.error("⚠️ خطأ أثناء التحقق من المعلم:", err);
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

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://${server}.gofile.io/uploadFile`);

    return await new Promise((resolve, reject) => {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          progressBar.style.width = percent + "%";
        }
      };

      xhr.onload = async () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.status === "ok") {
            const fileUrl = data.data.downloadPage;

            await addDoc(collection(db, "books"), {
              name: file.name,
              url: fileUrl,
              createdAt: serverTimestamp()
            });
            console.log(`📤 تم رفع الملف: ${file.name}`);
            resolve(true);
          } else {
            throw new Error(data.status);
          }
        } catch (err) {
          reject(err);
        } finally {
          progressContainer.style.display = "none";
          loadingSpinner.classList.add("hidden");
        }
      };

      xhr.onerror = () => reject("خطأ في الاتصال بالسيرفر");
      xhr.send(formData);
    });

  } catch (err) {
    console.error("❌ خطأ أثناء رفع الملف:", err.message || err);
    return false;
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

// ===== رفع عند الضغط =====
uploadBtn.addEventListener("click", async () => {
  if (isTeacher === null) {
    alert("⏳ جاري التحقق من حسابك...");
    return;
  }
  if (!isTeacher) {
    alert("❌ مسموح بالرفع للمعلمين فقط");
    return;
  }
  if (!pdfUpload.files.length) {
    alert("📂 يرجى اختيار ملف PDF أولاً");
    return;
  }

  for (let file of pdfUpload.files) {
    const success = await uploadPDFtoGoFile(file);
    if (!success) {
      console.error(`⚠️ فشل رفع الملف: ${file.name}`);
    }
  }

  pdfUpload.value = "";
  loadPDFs();
});
