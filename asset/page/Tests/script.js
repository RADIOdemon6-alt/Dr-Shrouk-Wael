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

const testContainer = document.getElementById("testContainer");
const addBtn = document.getElementById("addTestBtn");
const addFormContainer = document.getElementById("addTestForm");

let currentUser = null;
let isTeacher = false;

async function fetchUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "Users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role === "teacher";
    }
    return false;
  } catch (e) {
    console.error("Error fetching role:", e);
    return false;
  }
}

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

  // السؤال: نص أو صورة (لو في صورة رابطها موجود في data.questionImage)
  if (data.questionImage) {
    const img = document.createElement("img");
    img.src = data.questionImage;
    img.alt = "سؤال صورة";
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
    const optBtn = document.createElement("button");
    optBtn.className = "option-btn";
    optBtn.textContent = opt;

    if (opt === data.correctAnswer) {
      optBtn.dataset.correct = "true";
    }

    optBtn.addEventListener("click", () => {
      optionsContainer.querySelectorAll("button").forEach(b => b.disabled = true);

      if (optBtn.dataset.correct) {
        optBtn.style.backgroundColor = "#28a745"; // أخضر
      } else {
        optBtn.style.backgroundColor = "#dc3545"; // أحمر
      }

      if (isTeacher) {
        optionsContainer.querySelectorAll("button").forEach(btn => {
          if (btn.dataset.correct) btn.style.backgroundColor = "#28a745";
        });
      }
    });

    // إذا المستخدم مش معلم، لا تظهر الإجابة الصحيحة من البداية
    if (!isTeacher) {
      optBtn.addEventListener("mouseenter", () => {
        // لا نكشف شيء عند المرور
      });
    } else {
      // المعلم يرى الإجابة الصحيحة مباشرة (لون أخضر)
      if (optBtn.dataset.correct) {
        optBtn.style.backgroundColor = "#28a745";
      }
    }

    optionsContainer.appendChild(optBtn);
  });

  card.appendChild(optionsContainer);

  // زر حذف فقط للمعلم
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
  try {
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
  } catch (e) {
    testContainer.textContent = "حدث خطأ أثناء تحميل الاختبارات.";
    console.error(e);
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

// مراقبة حالة الدخول وتحديد دور المعلم
onAuthStateChanged(auth, async (user) => {
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

addBtn.addEventListener("click", () => {
  if (addFormContainer.classList.contains("hidden")) {
    toggleAddForm(true);
  } else {
    toggleAddForm(false);
  }
});

addFormContainer.addEventListener("submit", addTest);
