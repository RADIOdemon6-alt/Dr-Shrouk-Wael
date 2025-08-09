const pdfFiles = [
  { name: "ملخص-دكتور-شروق", file: "DR SHROUK.pdf" },
  { name: "كتاب-الكيمياء", file: "chemistry.pdf" }
];

const pdfList = document.getElementById("pdfList");
pdfList.style.display = "flex";
pdfList.style.flexWrap = "wrap";
pdfList.style.gap = "20px";  // تباعد تلقائي 20px بين الكروت

// دالة للتحقق من وجود الملف
async function fileExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// دالة لإنشاء كارد لكل كتاب
async function createCard(pdf) {
  const filePath = `/asset/storage/${pdf.file}`;
  if (!await fileExists(filePath)) return null;

  // الكارد
  const card = document.createElement("div");
  card.classList.add("pdf-card");
  card.style.width = "300px";  // حجم ثابت مناسب
  card.style.border = "1px solid #ccc";
  card.style.borderRadius = "10px";
  card.style.padding = "10px";
  card.style.boxSizing = "border-box";
  card.style.display = "flex";
  card.style.flexDirection = "column";
  card.style.alignItems = "center";
  card.style.background = "#fff";
  card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
  
  // اسم الكتاب
  const title = document.createElement("h3");
title.textContent = pdf.name;
title.style.color = "black"; 
  title.style.marginBottom = "10px";
  title.style.textAlign = "center";

  // الأيقونة
  const icon = document.createElement("img");
  icon.src = "/asset/icons/pdf-icon.png";
  icon.alt = pdf.name;
  icon.style.width = "100%";
  icon.style.height = "150px";
  icon.style.objectFit = "cover";
  icon.style.borderRadius = "6px";

  // iframe العرض
  const iframe = document.createElement("iframe");
  iframe.src = filePath;
  iframe.width = "100%";
  iframe.height = "400px";
  iframe.style.marginTop = "10px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "6px";

  // زر إظهار/إخفاء iframe
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "عرض الكتاب";
  toggleBtn.style.marginTop = "10px";
  toggleBtn.style.padding = "8px 16px";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.border = "none";
  toggleBtn.style.borderRadius = "5px";
  toggleBtn.style.backgroundColor = "#007bff";
  toggleBtn.style.color = "#fff";

  // iframe مخفي أولًا
  iframe.style.display = "none";

  toggleBtn.addEventListener("click", () => {
    if (iframe.style.display === "none") {
      // قبل الفتح، أغلق كل iframes تانية
      document.querySelectorAll(".pdf-card iframe").forEach(frame => frame.style.display = "none");
      // وعرض هذا الإطار
      iframe.style.display = "block";
      toggleBtn.textContent = "إخفاء الكتاب";
    } else {
      iframe.style.display = "none";
      toggleBtn.textContent = "عرض الكتاب";
    }
  });

  // إضافة العناصر للكارد
  card.appendChild(title);
  card.appendChild(icon);
  card.appendChild(toggleBtn);
  card.appendChild(iframe);

  return card;
}

// إنشاء جميع الكروت وعرضها
(async () => {
  for (const pdf of pdfFiles) {
    const card = await createCard(pdf);
    if (card) pdfList.appendChild(card);
  }
})();

// بوب أب جدول العناصر: خليه بعيد (مثلاً تحت الكتب)
const elementTableBtn = document.getElementById("elementTableBtn");
const popup = document.getElementById("popup");
const closePopupBtn = document.getElementById("closePopup");

elementTableBtn.style.marginTop = "40px"; // يفصلها عن الكتب

elementTableBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

closePopupBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

window.addEventListener("click", e => {
  if (e.target === popup) {
    popup.classList.add("hidden");
  }
});
