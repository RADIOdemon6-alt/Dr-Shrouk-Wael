// مصفوفة كتب PDF
const pdfFiles = [
  { name: "ملخص-دكتور-شروق", file: "DR SHROUK.pdf" }
];

// عناصر أساسية
const pdfList = document.getElementById("pdfList");
const popup = document.getElementById("popup");
const closePopupBtn = document.getElementById("closePopup");
const elementTablePopup = document.getElementById("elementTablePopup");
const closeElementTableBtn = document.getElementById("closeElementTable");
const elementTableBtn = document.getElementById("elementTableBtn");

// إنشاء العنوان فوق الـ iframe
const fileTitle = document.createElement("h2");
fileTitle.id = "fileTitle";
fileTitle.style.textAlign = "center";
fileTitle.style.margin = "3px 0"; // مسافة 3px فوق iframe

// إنشاء أيقونة (صورة full width)
const pdfIcon = document.createElement("img");
pdfIcon.id = "pdfIcon";
pdfIcon.style.width = "100%";
pdfIcon.style.height = "auto";
pdfIcon.style.display = "block";

// إنشاء iframe لعرض الكتب
const pdfViewer = document.createElement("iframe");
pdfViewer.id = "pdfViewer";
pdfViewer.width = "100%";
pdfViewer.height = "600px";

// إضافة العناصر إلى البوب أب
popup.querySelector(".popup-content").appendChild(fileTitle);
popup.querySelector(".popup-content").appendChild(pdfIcon);
popup.querySelector(".popup-content").appendChild(pdfViewer);

// إنشاء كروت الكتب من المصفوفة
pdfFiles.forEach(pdf => {
  const card = document.createElement("div");
  card.classList.add("pdf-card");

  const img = document.createElement("img");
  img.src = "/asset/icons/pdf-icon.png";
  img.alt = pdf.name;

  const title = document.createElement("h3");
  title.textContent = pdf.name;

  const btn = document.createElement("button");
  btn.textContent = "📖 عرض الكتاب";
  btn.classList.add("open-btn");

  btn.addEventListener("click", () => {
    fileTitle.textContent = pdf.name; // اسم الكتاب
    pdfIcon.src = "/asset/icons/pdf-icon.png"; // أيقونة الكتاب
    pdfViewer.src = `/asset/storage/${pdf.file}`; // رابط الكتاب
    popup.classList.remove("hidden"); // عرض بوب أب الكتاب
  });

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(btn);
  pdfList.appendChild(card);
});

// إغلاق بوب أب الكتاب
closePopupBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
  pdfViewer.src = "";
});

// فتح بوب أب الجدول الدوري
elementTableBtn.addEventListener("click", () => {
  elementTablePopup.classList.remove("hidden");
});

// إغلاق بوب أب الجدول الدوري
closeElementTableBtn.addEventListener("click", () => {
  elementTablePopup.classList.add("hidden");
});

// إغلاق عند الضغط خارج البوب أب
window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.classList.add("hidden");
    pdfViewer.src = "";
  }
  if (e.target === elementTablePopup) {
    elementTablePopup.classList.add("hidden");
  }
});
