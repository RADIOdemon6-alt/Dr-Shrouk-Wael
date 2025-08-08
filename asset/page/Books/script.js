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

// ===== التحقق من المعلم =====
uploadSection.style.display = "none";
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const teacherRef = doc(db, "teachers", user.uid);
    const teacherSnap = await getDoc(teacherRef);

    if (teacherSnap.exists()) {
      isTeacher = true;
      uploadSection.style.display = "block"; // معلم
    } else {
      isTeacher = false;
      uploadSection.style.display = "none"; // طالب
    }
    loadPDFs();
  } else {
    window.location.href = "https://dr-shrouk-wael.vercel.app/";
  }
});

// ===== رفع PDF إلى GoFile مع شريط تقدم =====
function uploadPDFtoGoFile(file) {
  return new Promise((resolve, reject) => {
    progressBar.style.width = "0%";
    progressContainer.style.display = "block";

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://store1.gofile.io/contents/uploadfile");

    // متابعة التقدم
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = percent + "%";
      }
    };

    xhr.onloadstart = () => {
      progressBar.style.width = "0%";
      loadingSpinner.classList.remove("hidden");
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
          resolve(true);
        } else {
          reject(data);
        }
      } catch (err) {
        reject(err);
      } finally {
        setTimeout(() => {
          progressContainer.style.display = "none";
        }, 800);
        loadingSpinner.classList.add("hidden");
      }
    };

    xhr.onerror = () => reject("خطأ في الاتصال بالسيرفر");

    xhr.send(formData);
  });
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

// ===== حدث الضغط على زر الرفع =====
uploadBtn.addEventListener("click", async () => {
  if (!pdfUpload.files.length) {
    alert("يرجى اختيار ملف PDF أولاً");
    return;
  }

  for (let file of pdfUpload.files) {
    try {
      await uploadPDFtoGoFile(file);
    } catch (err) {
      console.error("خطأ في رفع الملف:", err);
    }
  }

  pdfUpload.value = "";
  loadPDFs();
});
