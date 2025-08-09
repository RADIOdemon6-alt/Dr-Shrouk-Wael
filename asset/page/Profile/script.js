import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

document.addEventListener("DOMContentLoaded", () => {
  const userNameEl = document.getElementById("userName");
  const userNumberEl = document.getElementById("userNumber");
  const userClassEl = document.getElementById("userClass");
  const userRoleEl = document.getElementById("userRole");

  const studentsContainer = document.getElementById("studentsContainer");
  const showStudentsBtn = document.querySelector(".show-students-btn");

  let currentUserUID = null;
  let currentUserRole = null; // "teacher" أو "student"
  let currentUserGrade = null;

  // تسجيل الخروج
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("تم تسجيل الخروج بنجاح");
      window.location.href = "../login.html"; // عدل حسب مسار صفحة تسجيل الدخول
    } catch (error) {
      alert("حدث خطأ أثناء تسجيل الخروج: " + error.message);
    }
  });

  // دوال أزرار التواصل
  function openWhatsApp() {
    window.open("https://wa.me/201559002189", "_blank");
  }

  function callTeacher() {
    window.location.href = "tel:+201559002189";
  }

  // ربط أزرار التواصل
  const whatsappBtn = document.querySelector(".whatsapp-btn");
  const phoneBtn = document.querySelector(".phone-btn");

  if (whatsappBtn) whatsappBtn.addEventListener("click", openWhatsApp);
  if (phoneBtn) phoneBtn.addEventListener("click", callTeacher);

  // إخفاء زر عرض الطلاب افتراضياً
  if (showStudentsBtn) showStudentsBtn.style.display = "none";

  // جلب الطلاب (خاص بالمعلمين)
  async function fetchStudents() {
    if (currentUserRole !== "teacher") {
      alert("هذه الميزة متاحة فقط للمعلمين.");
      return;
    }

    studentsContainer.innerHTML = "جارِ التحميل...";

    try {
      const grades = ["1", "2", "3"];
      let allStudents = [];

      for (const grade of grades) {
        const studentsCol = collection(db, `grades/${grade}/students`);
        const snapshot = await getDocs(studentsCol);
        snapshot.forEach(docSnap => {
          allStudents.push({
            id: docSnap.id,
            grade,
            ...docSnap.data()
          });
        });
      }

      if (allStudents.length === 0) {
        studentsContainer.innerHTML = "<p>لا يوجد طلاب حالياً.</p>";
        return;
      }

      studentsContainer.innerHTML = allStudents.map(student => `
        <div class="student-card" style="background: rgba(192,132,252,0.15); padding: 12px; margin-bottom: 10px; border-radius: 10px;">
          <strong>الاسم:</strong> ${student.name}<br>
          <strong>الرقم:</strong> ${student.phone}<br>
          <strong>الصف:</strong> ${student.grade}<br>
        </div>
      `).join("");

    } catch (error) {
      console.error("خطأ في جلب الطلاب:", error);
      studentsContainer.innerHTML = "<p>حدث خطأ أثناء تحميل الطلاب.</p>";
    }
  }

  if(showStudentsBtn) {
    showStudentsBtn.addEventListener("click", fetchStudents);
  }

  // تحقق حالة تسجيل الدخول وجلب بيانات المستخدم
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("لم يتم تسجيل الدخول! يرجى تسجيل الدخول أولاً.");
      window.location.href = "../login.html"; // عدل الرابط حسب الحاجة
      return;
    }

    currentUserUID = user.uid;

    // جلب بيانات المعلم
    const teacherRef = doc(db, `teachers/${currentUserUID}`);
    const teacherSnap = await getDoc(teacherRef);

    if (teacherSnap.exists()) {
      const teacherData = teacherSnap.data();
      userNameEl.textContent = teacherData.name || "-";
      userNumberEl.textContent = teacherData.phone || "-";
      userClassEl.textContent = "-";
      userRoleEl.textContent = "معلم";
      currentUserRole = "teacher";
      if (showStudentsBtn) showStudentsBtn.style.display = "inline-block";
      return;
    }

    // جلب بيانات الطالب
    const grades = ["1", "2", "3"];
    let foundStudent = false;

    for (const grade of grades) {
      const studentRef = doc(db, `grades/${grade}/students/${currentUserUID}`);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        userNameEl.textContent = studentData.name || "-";
        userNumberEl.textContent = studentData.phone || "-";
        userClassEl.textContent = studentData.grade || grade || "-";
        userRoleEl.textContent = "طالب";
        currentUserRole = "student";
        currentUserGrade = grade;
        if (showStudentsBtn) showStudentsBtn.style.display = "none";
        foundStudent = true;
        break;
      }
    }

    if (!foundStudent) {
      alert("لم يتم العثور على بيانات المستخدم.");
      userNameEl.textContent = "-";
      userNumberEl.textContent = "-";
      userClassEl.textContent = "-";
      userRoleEl.textContent = "-";
      if (showStudentsBtn) showStudentsBtn.style.display = "none";
    }
  });
});
