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

// ===== معلومات GitHub =====
const repoOwner = "RADIOdemon6-alt";
const repoName = "Dr-Shrouk-Wael";
const folderPath = "asset/storage";
const githubToken = "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";

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
        uploadSection.style.display = "block";
        console.log("✅ تم التحقق: المستخدم معلم");
      } else {
        isTeacher = false;
        uploadSection.style.display = "none";
        console.log("⛔ المستخدم ليس معلم");
      }
      loadPDFs();
    } catch (err) {
      console.error("⚠️ خطأ أثناء التحقق من المعلم:", err);
    }
  } else {
    window.location.href = "https://dr-shrouk-wael.vercel.app/";
  }
});

// ===== رفع ملف PDF إلى GitHub =====
async function uploadPDFtoGitHub(file) {
  progressBar.style.width = "0%";
  progressContainer.style.display = "block";
  loadingSpinner.classList.remove("hidden");

  try {
    // تحويل الملف إلى Base64
    const fileBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });

    const pathInRepo = `${folderPath}/${file.name}`;

    // الحصول على SHA للملف إذا كان موجودًا (للتحديث)
    let sha;
    try {
      const getRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${pathInRepo}`, {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github+json"
        }
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }
    } catch {}

    // رفع أو تحديث الملف
    const message = sha ? `Update ${file.name}` : `Add ${file.name}`;
    const putRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${pathInRepo}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        content: fileBase64,
        sha
      })
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      throw new Error(errData.message || "خطأ في رفع الملف");
    }

    // رابط الملف raw
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${pathInRepo}`;

    console.log(`✅ تم رفع الملف: ${file.name}`);
    return { url: rawUrl, name: file.name };
  } catch (err) {
    console.error(`❌ فشل رفع الملف: ${file.name} - ${err.message}`);
    alert(`⚠️ فشل رفع الملف: ${file.name}\n${err.message}`);
    return null;
  } finally {
    loadingSpinner.classList.add("hidden");
    progressContainer.style.display = "none";
  }
}

// ===== تحميل وعرض الملفات من Firestore =====
async function loadPDFs() {
  pdfList.innerHTML = "";
  try {
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
  } catch (err) {
    console.error("⚠️ خطأ في تحميل الملفات:", err);
  }
}

// ===== رفع الملفات عند الضغط =====
uploadBtn.addEventListener("click", async () => {
  if (!pdfUpload.files.length) {
    alert("يرجى اختيار ملف PDF أولاً");
    return;
  }

  for (const file of pdfUpload.files) {
    const res = await uploadPDFtoGitHub(file);
    if (res) {
      // حفظ الرابط في Firestore
      try {
        await addDoc(collection(db, "books"), {
          name: res.name,
          url: res.url,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("⚠️ خطأ في حفظ البيانات في Firestore:", err);
      }
    }
  }

  pdfUpload.value = "";
  loadPDFs();
});
