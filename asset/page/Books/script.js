// مصفوفة كتب PDF
const pdfFiles = [
  { name: "ملخص-دكتور-شروق", file: "DR SHROUK.pdf" }
];

const pdfList = document.getElementById("pdfList");
const popup = document.getElementById("popup");
const closePopupBtn = document.getElementById("closePopup");
const elementTableBtn = document.getElementById("elementTableBtn");

// إنشاء عناصر العرض (العنوان + iframe) ديناميكياً
const fileTitle = document.createElement("h2");
fileTitle.id = "fileTitle";
fileTitle.style.textAlign = "center";
fileTitle.style.marginBottom = "10px";

const pdfViewer = document.createElement("iframe");
pdfViewer.id = "pdfViewer";
pdfViewer.width = "100%";
pdfViewer.height = "600px";

// إضافة العناصر إلى البوب أب
popup.querySelector(".popup-content").appendChild(fileTitle);
popup.querySelector(".popup-content").appendChild(pdfViewer);

// إنشاء الكروت للملفات
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
    fileTitle.textContent = pdf.name; // اسم الكتاب تلقائي
    pdfViewer.src = `/asset/storage/${pdf.file}`; // تحميل الملف
    popup.classList.remove("hidden"); // فتح البوب أب
  });

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(btn);
  pdfList.appendChild(card);
});

// إغلاق البوب أب
closePopupBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
  pdfViewer.src = ""; // إيقاف عرض الملف بعد الغلق
});

// إغلاق عند الضغط خارج المحتوى
window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.classList.add("hidden");
    pdfViewer.src = "";
  }
});
