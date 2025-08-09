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

// المتغيرات العامة
let currentUser = null;
let isTeacher = false;
let correctCount = 0;
let wrongCount = 0;

// يجب عليك استدعاء بيانات المستخدم من فايرستور لتحديد دوره
async function fetchUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "Users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === "teacher"; // افترض أن الحقل role يخزن 'teacher' أو 'student'
    }
    return false;
  } catch (e) {
    console.error("Error fetching user role:", e);
    return false;
  }
}

// انشئ بطاقة سؤال (نص أو صورة)
function createTestCard(testDoc) {
  const data = testDoc.data();

  // عنصر أساسي لتمثيل السؤال + خيارات الإجابة + زر الحذف
  // يجب بناء الواجهة في HTML وربطها بهذه الدالة لعرض المحتوى

  // الخيارات
  const options = [...data.incorrectAnswers, data.correctAnswer];
  options.sort(() => Math.random() - 0.5);

  // عند اختيار خيار
  function handleOptionClick(selected, buttons) {
    buttons.forEach(btn => btn.disabled = true);

    if (selected.dataset.correct) {
      if (isTeacher) selected.style.backgroundColor = "#28a745";
      correctCount++;
    } else {
      selected.style.backgroundColor = "#dc3545";
      wrongCount++;
    }

    if (isTeacher) {
      buttons.forEach(btn => {
        if (btn.dataset.correct) btn.style.backgroundColor = "#28a745";
      });
    }
  }

  // ** هذه الدالة ترجع عناصر DOM يجب ربطها بالصفحة في HTML **

  // مثلاً يمكنك بناء div وإضافة صورة أو نص للسؤال، ثم أزرار للإجابات مع الحدث أعلاه.

  // مثال مبسط (يجب تعديل أو دمجه مع DOM حقيقي):
  
  const card = document.createElement("div");
  const questionEl = data.questionImage ? 
    Object.assign(document.createElement("img"), {src: data.questionImage, alt:"سؤال صورة"}) :
    Object.assign(document.createElement("div"), {textContent: data.question});
  card.appendChild(questionEl);

  const optionsContainer = document.createElement("div");
  options.forEach(optText => {
    const btn = document.createElement("button");
    btn.textContent = optText;
    if (optText === data.correctAnswer) btn.dataset.correct = "true";
    btn.onclick = () => handleOptionClick(btn, optionsContainer.querySelectorAll("button"));
    optionsContainer.appendChild(btn);
  });
  card.appendChild(optionsContainer);

  if (isTeacher) {
    const delBtn = document.createElement("button");
    delBtn.textContent = "حذف";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "Tests", testDoc.id));
      card.remove();
    };
    card.appendChild(delBtn);
  }
  return card;
}

// تحميل كل الاختبارات من فايرستور
async function loadTests(renderFunction) {
  try {
    const snapshot = await getDocs(collection(db, "Tests"));
    if (snapshot.empty) {
      console.log("لا يوجد اختبارات حتى الآن.");
      return;
    }
    snapshot.forEach(docSnap => {
      const card = createTestCard(docSnap);
      renderFunction(card); // دالة من طرف المستخدم تعرض البطاقة على الصفحة
    });
  } catch (e) {
    console.error("خطأ في تحميل الاختبارات:", e);
  }
}

// إضافة اختبار جديد (يجب ربطها مع الفورم الحقيقي)
async function addTest(testData) {
  if (!testData.question || !testData.correctAnswer || !testData.incorrectAnswers) {
    throw new Error("بيانات الاختبار غير كاملة");
  }
  const newTest = {
    question: testData.question || "",
    questionImage: testData.questionImage || "", // رابط صورة (اختياري)
    correctAnswer: testData.correctAnswer,
    incorrectAnswers: testData.incorrectAnswers,
    createdAt: serverTimestamp()
  };
  await setDoc(doc(collection(db, "Tests")), newTest);
  console.log("تم إضافة الاختبار");
}

// تسجيل نتائج التلميذ في فايرستور
async function saveStudentResults() {
  if (!currentUser) return;
  try {
    await setDoc(doc(collection(db, "StudentResults")), {
      studentId: currentUser.uid,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      timestamp: serverTimestamp()
    });
    console.log("تم حفظ نتائج التلميذ");
  } catch (e) {
    console.error("خطأ في حفظ النتائج:", e);
  }
}

// مراقبة حالة المستخدم
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    isTeacher = await fetchUserRole(user.uid);
    console.log("دور المستخدم:", isTeacher ? "معلم" : "طالب");
    // هنا يمكنك البدء بتحميل الاختبارات مثلا
    // loadTests(بطاقة_تعرض_في_الصفحة)
  } else {
    isTeacher = false;
    currentUser = null;
    console.log("المستخدم غير مسجل دخول");
  }
});
