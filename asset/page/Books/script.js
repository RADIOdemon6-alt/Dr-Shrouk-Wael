// ===== إعداد Firebase =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getAuth,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

// ===== إعداد GitHub =====
const owner = "RADIOdemon6-alt";
const repo = "Dr-Shrouk-Wael-storage-";
const pdfPath = "storage";
const token = "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"; // ضع التوكين

// ===== عناصر الواجهة =====
const uploadSection = document.querySelector(".upload-section");
const uploadBtn = document.getElementById("uploadBtn");
const pdfUpload = document.getElementById("pdfUpload");
const pdfList = document.getElementById("pdfList");

// ===== اللودينج (Spinner) =====
const loadingSpinner = document.createElement("div");
loadingSpinner.className = "loading-spinner hidden";
loadingSpinner.innerHTML = `<div class="spinner" style="
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;">
</div>`;
document.body.appendChild(loadingSpinner);

const style = document.createElement("style");
style.innerHTML = `
.hidden { display: none; }
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);

// ===== شريط التقدم =====
const progressContainer = document.createElement("div");
progressContainer.style.width = "100%";
progressContainer.style.background = "#ddd";
progressContainer.style.borderRadius = "5px";
progressContainer.style.marginTop = "10px";
progressContainer.style.display = "none";

const progressBar = document.createElement("div");
progressBar.style.height = "10px";
progressBar.style.width = "0%";
progressBar.style.background = "#4caf50";
progressBar.style.borderRadius = "5px";
progressBar.style.transition = "width 0.3s";

progressContainer.appendChild(progressBar);
document.body.appendChild(progressContainer);

// ===== التحقق من المستخدم =====
uploadSection.style.display = "none";
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const teacherRef = doc(db, "teachers", user.uid);
    const teacherSnap = await getDoc(teacherRef);

    if (teacherSnap.exists()) {
      uploadSection.style.display = "block"; // معلم
    } else {
      uploadSection.style.display = "none"; // طالب
    }
    loadPDFs();
  } else {
    window.location.href = "https://dr-shrouk-wael.vercel.app/";
  }
});

// ===== رفع PDF =====
async function uploadPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = percent + "%";
      }
    };

    reader.onloadstart = () => {
      progressBar.style.width = "0%";
      progressContainer.style.display = "block";
    };

    reader.onload = async () => {
      const content = reader.result.split(",")[1];
      const filePath = `${pdfPath}/${encodeURIComponent(file.name)}`;

      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `رفع ملف ${file.name}`,
            content: content
          }),
        });

        if (res.ok) {
          const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${pdfPath}/${encodeURIComponent(file.name)}`;
          await addDoc(collection(db, "books"), {
            name: file.name,
            url: fileUrl,
            createdAt: serverTimestamp()
          });
          resolve(true);
        } else {
          reject(await res.json());
        }
      } catch (err) {
        reject(err);
      } finally {
        progressBar.style.width = "100%";
        setTimeout(() => {
          progressContainer.style.display = "none";
        }, 800);
      }
    };

    reader.readAsDataURL(file);
  });
}

// ===== عرض الـ PDF =====
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
      <span class="delete-btn" style="cursor:pointer;color:red;margin-left:10px;">❌</span>
    `;

    // حذف عند الضغط على ❌
    div.querySelector(".delete-btn").onclick = async () => {
      if (!confirm(`هل تريد حذف ${data.name}؟`)) return;
      loadingSpinner.classList.remove("hidden");

      try {
        const filePath = `${pdfPath}/${encodeURIComponent(data.name)}`;
        const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          headers: { Authorization: `token ${token}` }
        });
        const fileData = await checkRes.json();

        if (!fileData.sha) {
          alert("لم يتم العثور على الملف في GitHub.");
          loadingSpinner.classList.add("hidden");
          return;
        }

        // حذف من GitHub
        await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          method: "DELETE",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `حذف ملف ${data.name}`,
            sha: fileData.sha
          }),
        });

        // حذف من Firestore
        await deleteDoc(doc(db, "books", docSnap.id));
        loadPDFs();
      } catch (err) {
        console.error("خطأ أثناء الحذف:", err);
      } finally {
        loadingSpinner.classList.add("hidden");
      }
    };

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

  loadingSpinner.classList.remove("hidden");

  for (let file of pdfUpload.files) {
    try {
      await uploadPDF(file);
    } catch (err) {
      console.error("خطأ في رفع الملف:", err);
    }
  }

  loadingSpinner.classList.add("hidden");
  pdfUpload.value = "";
  loadPDFs();
});
