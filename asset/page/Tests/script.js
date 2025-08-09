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
    const userDoc = await getDoc(doc(db, "teachers", uid));
    if (userDoc.exists()) {
      return true;
    }
    return false;
  } catch (e) {
    console.error("خطأ في جلب دور المستخدم:", e);
    return false;
  }
}

const addBtn = document.getElementById("addTestBtn");
const addFormContainer = document.getElementById("addTestForm");
const testContainer = document.getElementById("testContainer");

// خفي زر الإضافة بشكل افتراضي
addBtn.style.display = "none";

function toggleAddForm(show) {
  if (show) {
    addFormContainer.classList.remove("hidden");
    addBtn.textContent = "×";
  } else {
    addFormContainer.classList.add("hidden");
    addBtn.textContent = "+";
  }
}

function createTestCard(testDoc) {
  const data = testDoc.data();
  const card = document.createElement("div");
  card.className = "test-card";

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

  const options = [...data.incorrectAnswers, data.correctAnswer];
  options.sort(() => Math.random() - 0.5);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "options-container";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;

    if (isTeacher && opt === data.correctAnswer) {
      btn.dataset.correct = "true";
      btn.style.backgroundColor = "#28a745";
    }

    btn.addEventListener("click", () => {
      optionsContainer.querySelectorAll("button").forEach(b => b.disabled = true);

      if (!isTeacher) {
        if (opt === data.correctAnswer) {
          btn.style.backgroundColor = "#28a745";
        } else {
          btn.style.backgroundColor = "#dc3545";
        }
      }
    });

    optionsContainer.appendChild(btn);
  });

  card.appendChild(optionsContainer);

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

async function loadTests() {
  testContainer.innerHTML = "جارٍ تحميل الاختبارات...";

  addBtn.style.display = "none"; // اخفي زر الإضافة قبل التحميل

  try {
    const snapshot = await getDocs(collection(db, "Tests"));
    testContainer.innerHTML = "";

    if (snapshot.empty) {
      testContainer.textContent = "لا يوجد اختبارات حتى الآن.";
      addBtn.style.display = "none";
      return;
    }

    snapshot.forEach(docSnap => {
      const card = createTestCard(docSnap);
      testContainer.appendChild(card);
    });

    if (isTeacher) {
      addBtn.style.display = "block"; // اعرض زر الإضافة بعد تحميل الاختبارات
    }
  } catch (e) {
    testContainer.textContent = "حدث خطأ أثناء تحميل الاختبارات.";
    console.error(e);
    addBtn.style.display = "none";
  }
}

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

onAuthStateChanged(auth, async user => {
  currentUser = user;
  if (user) {
    isTeacher = await fetchUserRole(user.uid);
  } else {
    isTeacher = false;
  }
  loadTests();
});

addBtn.addEventListener("click", () => {
  if (addFormContainer.classList.contains("hidden")) {
    toggleAddForm(true);
  } else {
    toggleAddForm(false);
  }
});

addFormContainer.addEventListener("submit", addTest);
