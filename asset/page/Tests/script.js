import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  getDoc,
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

let currentUser = null;
let isTeacher = false;

// جلب دور المستخدم (معلم أو طالب)
async function fetchUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "teachers", uid));  // بدل "Users" صرنا نجيب من "teachers"
    if (userDoc.exists()) {
      // بما إنه موجود في "teachers" معناها معلم
      return true;
    }
    return false; // لو مش موجود معناه مش معلم
  } catch (e) {
    console.error("خطأ في جلب دور المستخدم:", e);
    return false;
  }
}
// تفعيل/إخفاء نموذج الإضافة
const addBtn = document.getElementById("addTestBtn");
const addFormContainer = document.getElementById("addTestForm");
const testContainer = document.getElementById("testContainer");

function toggleAddForm(show) {
  if (show) {
    addFormContainer.classList.remove("hidden");
    addBtn.textContent = "×";
  } else {
    addFormContainer.classList.add("hidden");
    addBtn.textContent = "+";
  }
}

// إنشاء بطاقة سؤال مع خيارات وإظهار الإجابة الصحيحة فقط للمعلم
function createTestCard(testDoc) {
  const data = testDoc.data();
  const card = document.createElement("div");
  card.className = "test-card";

  // سؤال نصي أو صورة
  if (data.questionImage) {
    const img = document.createElement("img");
    img.src = data.questionImage;
    img.alt = "صورة سؤال";
    img.className = "question-image";
    card.appendChild(img);
  } else {
    const questionEl = document.createElement("div");
    questionEl.className = "question";
    questionEl.textContent = data.question;
    card.appendChild(questionEl);
  }

  // خيارات
  const options = [...data.incorrectAnswers, data.correctAnswer];
  options.sort(() => Math.random() - 0.5);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "options-container";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;

    // إذا المعلم فقط يظهر الإجابة الصحيحة بخلفية خضراء
    if (isTeacher && opt === data.correctAnswer) {
      btn.dataset.correct = "true";
      btn.style.backgroundColor = "#28a745";
    }

    btn.addEventListener("click", () => {
      // تعطيل كل الأزرار بعد اختيار إجابة
      optionsContainer.querySelectorAll("button").forEach(b => b.disabled = true);

      // فقط إذا الطالب هو الذي يختار، نظهر الأخضر أو الأحمر بعد الاختيار
      if (!isTeacher) {
        if (opt === data.correctAnswer) {
          btn.style.backgroundColor = "#28a745"; // أخضر
        } else {
          btn.style.backgroundColor = "#dc3545"; // أحمر
        }
      }
    });

    optionsContainer.appendChild(btn);
  });

  card.appendChild(optionsContainer);

  // زر حذف يظهر فقط للمعلم
  if (isTeacher) {
    const delBtn = document.createElement("button");
    delBtn.className = "delete-test-btn";
    delBtn.textContent = "حذف";
    delBtn.addEventListener("click", async () => {
      if (confirm("هل تريد حذف هذا الاختبار؟")) {
        await deleteDoc(doc(db, "Tests", testDoc.id));
        card.remove();
      }
    });
    card.appendChild(delBtn);
  }

  return card;
}

// تحميل وعرض الاختبارات
async function loadTests() {
  testContainer.innerHTML = "جارٍ تحميل الاختبارات...";
  try {
    const snapshot = await getDocs(collection(db, "Tests"));
    testContainer.innerHTML = "";

    if (snapshot.empty) {
      testContainer.textContent = "لا يوجد اختبارات حتى الآن.";
      return;
    }

    snapshot.forEach(docSnap => {
      const card = createTestCard(docSnap);
      testContainer.appendChild(card);
    });
  } catch (e) {
    testContainer.textContent = "حدث خطأ أثناء تحميل الاختبارات.";
    console.error(e);
  }
}

// إضافة اختبار جديد
async function addTest(e) {
  e.preventDefault();

  const questionInput = document.getElementById("questionInput");
  const correctAnswerInput = document.getElementById("correctAnswerInput");
  const wrong1Input = document.getElementById("wrong1Input");
  const wrong2Input = document.getElementById("wrong2Input");
  const wrong3Input = document.getElementById("wrong3Input");

  if (!questionInput.value.trim() || !correctAnswerInput.value.trim() ||
      !wrong1Input.value.trim() || !wrong2Input.value.trim() || !wrong3Input.value.trim()) {
    alert("يرجى ملء جميع الحقول");
    return;
  }

  const newTest = {
    question: questionInput.value.trim(),
    correctAnswer: correctAnswerInput.value.trim(),
    incorrectAnswers: [
      wrong1Input.value.trim(),
      wrong2Input.value.trim(),
      wrong3Input.value.trim()
    ],
    createdAt: serverTimestamp()
  };

  try {
    await setDoc(doc(collection(db, "Tests")), newTest);
    alert("تم إضافة الاختبار بنجاح!");
    e.target.reset();
    toggleAddForm(false);
    loadTests();
  } catch (error) {
    alert("حدث خطأ أثناء الإضافة");
    console.error(error);
  }
}

// مراقبة حالة تسجيل الدخول وجلب دور المستخدم
onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (user) {
    isTeacher = await fetchUserRole(user.uid);
    addBtn.style.display = isTeacher ? "block" : "none";
  } else {
    isTeacher = false;
    addBtn.style.display = "none";
    toggleAddForm(false);
  }
  loadTests();
});

// التحكم بزر الإضافة
addBtn.addEventListener("click", () => {
  if (addFormContainer.classList.contains("hidden")) {
    toggleAddForm(true);
  } else {
    toggleAddForm(false);
  }
});

// ربط حدث الإرسال للنموذج
addFormContainer.addEventListener("submit", addTest);
