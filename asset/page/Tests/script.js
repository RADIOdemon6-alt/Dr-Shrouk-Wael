import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
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

// عناصر DOM
const testContainer = document.getElementById("testContainer");
const addBtn = document.getElementById("addTestBtn");
const addFormContainer = document.getElementById("addTestForm");

let currentUser = null;

// تفعيل / إخفاء الفورم
function toggleAddForm(show) {
  if (show) {
    addFormContainer.classList.remove("hidden");
    addBtn.textContent = "×";
  } else {
    addFormContainer.classList.add("hidden");
    addBtn.textContent = "+";
  }
}

// إنشاء كارد سؤال
function createTestCard(testDoc) {
  const data = testDoc.data();
  const card = document.createElement("div");
  card.className = "test-card";

  const questionEl = document.createElement("div");
  questionEl.className = "question";
  questionEl.textContent = data.question;
  card.appendChild(questionEl);

  // خيارات
  const options = [...data.incorrectAnswers, data.correctAnswer];
  options.sort(() => Math.random() - 0.5);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "options-container";

  options.forEach(opt => {
    const optBtn = document.createElement("button");
    optBtn.className = "option-btn";
    optBtn.textContent = opt;

    if (opt === data.correctAnswer) {
      optBtn.dataset.correct = "true";
    }

    optBtn.addEventListener("click", () => {
      if (optBtn.dataset.correct) {
        optBtn.style.backgroundColor = "#28a745"; // أخضر
      } else {
        optBtn.style.backgroundColor = "#dc3545"; // أحمر
      }
      optionsContainer.querySelectorAll("button").forEach(b => b.disabled = true);
    });

    optionsContainer.appendChild(optBtn);
  });

  card.appendChild(optionsContainer);

  // زر حذف للمعلمين فقط
  if (currentUser) {
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

// تحميل الاختبارات
async function loadTests() {
  testContainer.innerHTML = "جارٍ تحميل الاختبارات...";
  const querySnapshot = await getDocs(collection(db, "Tests"));
  testContainer.innerHTML = "";
  if (querySnapshot.empty) {
    testContainer.textContent = "لا يوجد اختبارات حتى الآن.";
    return;
  }
  querySnapshot.forEach(docSnap => {
    const card = createTestCard(docSnap);
    testContainer.appendChild(card);
  });
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

// مراقبة حالة الدخول
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    addBtn.style.display = "block";
  } else {
    addBtn.style.display = "none";
    toggleAddForm(false);
  }
  loadTests();
});

addBtn.addEventListener("click", () => {
  // تبديل عرض الفورم
  if (addFormContainer.classList.contains("hidden")) {
    toggleAddForm(true);
  } else {
    toggleAddForm(false);
  }
});

// ربط حدث الإرسال على الفورم
addFormContainer.addEventListener("submit", addTest);
