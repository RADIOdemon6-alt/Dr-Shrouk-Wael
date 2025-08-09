// script.js

// مصفوفة كتب PDF
const pdfFiles = [
  { name: "ملخص-دكتور-شروق", file: "DR SHROUK.pdf" }
];

const pdfList = document.getElementById("pdfList");
const popup = document.getElementById("popup");
const closePopupBtn = document.getElementById("closePopup");
const elementTableBtn = document.getElementById("elementTableBtn");

// إنشاء الكروت للملفات
pdfFiles.forEach(pdf => {
  const card = document.createElement("div");
  card.classList.add("pdf-card");

  const img = document.createElement("img");
  img.src = "/asset/icons/pdf-icon.png";
  img.alt = pdf.name;

  const title = document.createElement("h3");
  title.textContent = pdf.name;

  const btn = document.createElement("a");
  btn.href = `/asset/storage/${pdf.file}`;
  btn.target = "_blank";
  btn.textContent = "📖 عرض الكتاب";
  btn.classList.add("open-btn");

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(btn);

  pdfList.appendChild(card);
});

// فتح البوب أب
elementTableBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

// إغلاق البوب أب
closePopupBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

// إغلاق عند الضغط خارج المحتوى
window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.classList.add("hidden");
  }
});
