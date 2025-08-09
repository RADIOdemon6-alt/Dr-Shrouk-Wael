// مصفوفة الكتب
const pdfFiles = [
  { name: "ملخص-دكتور-شروق", file: "DR SHROUK.pdf" },
  { name: "كتاب-الكيمياء", file: "chemistry.pdf" }
];

// عناصر HTML
const pdfList = document.getElementById("pdfList");
pdfList.style.display = "flex";
pdfList.style.flexDirection = "column";
pdfList.style.gap = "10px";

const container = document.createElement("div");
container.style.marginTop = "20px";

// عنوان الكتاب
const fileTitle = document.createElement("h2");
fileTitle.style.textAlign = "center";
fileTitle.style.margin = "3px 0";
fileTitle.style.opacity = "1"; // دائمًا ظاهر

// أيقونة الكتاب
const pdfIcon = document.createElement("img");
pdfIcon.style.width = "100%";
pdfIcon.style.height = "auto";
pdfIcon.style.display = "block";
pdfIcon.style.opacity = "1";

// iframe لعرض الكتاب
const pdfViewer = document.createElement("iframe");
pdfViewer.width = "100%";
pdfViewer.height = "600px";
pdfViewer.style.border = "none";

// إضافة العناصر للكونتينر
container.appendChild(fileTitle);
container.appendChild(pdfIcon);
container.appendChild(pdfViewer);
document.body.insertBefore(container, document.getElementById("elementTableBtn"));

// دالة عرض الكتاب
function displayBook(pdf) {
  fileTitle.textContent = pdf.name;
  pdfIcon.src = "/asset/icons/pdf-icon.png";
  pdfViewer.src = `/asset/storage/${pdf.file}`;
}

// التحقق من وجود الملف قبل عرضه
async function fileExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

// إنشاء الكروت بعد التحقق
(async () => {
  for (const pdf of pdfFiles) {
    const filePath = `/asset/storage/${pdf.file}`;
    if (await fileExists(filePath)) {
      const card = document.createElement("div");
      card.classList.add("pdf-card");
      card.style.border = "1px solid #ccc";
      card.style.borderRadius = "8px";
      card.style.cursor = "pointer";
      card.style.position = "relative";
      card.style.overflow = "hidden";
      card.style.padding = "0";
      card.style.height = "150px"; // ارتفاع مناسب عشان الايقونة full
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "center";
      card.style.alignItems = "center";

      // الأيقونة تغطي الكارت كلها
      const icon = document.createElement("img");
      icon.src = "/asset/icons/pdf-icon.png";
      icon.alt = pdf.name;
      icon.style.width = "100%";
      icon.style.height = "100%";
      icon.style.objectFit = "cover";
      icon.style.transition = "transform 0.3s ease";
      icon.style.display = "block";

      // زر عرض الكتاب مخفي في البداية
      const btn = document.createElement("button");
      btn.textContent = "عرض الكتاب";
      btn.style.position = "absolute";
      btn.style.bottom = "10px";
      btn.style.left = "50%";
      btn.style.transform = "translateX(-50%)";
      btn.style.padding = "8px 15px";
      btn.style.fontSize = "14px";
      btn.style.border = "none";
      btn.style.borderRadius = "5px";
      btn.style.backgroundColor = "#007bff";
      btn.style.color = "white";
      btn.style.cursor = "pointer";
      btn.style.opacity = "0";
      btn.style.transition = "opacity 0.3s ease";
      btn.style.zIndex = "10";

      // عند مرور الماوس على الكارت تظهر الزر وتكبر الأيقونة شوية
      card.addEventListener("mouseenter", () => {
        btn.style.opacity = "1";
        icon.style.transform = "scale(1.1)";
      });
      card.addEventListener("mouseleave", () => {
        btn.style.opacity = "0";
        icon.style.transform = "scale(1)";
      });

      // عند الضغط على الزر يعرض الكتاب مباشرة
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // منع الحدث من الصعود للكارت
        displayBook(pdf);
      });

      card.appendChild(icon);
      card.appendChild(btn);
      pdfList.appendChild(card);
    }
  }
})();

// بوب أب الجدول الدوري
const popup = document.getElementById("popup");
const closePopupBtn = document.getElementById("closePopup");
const elementTableBtn = document.getElementById("elementTableBtn");

elementTableBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

closePopupBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.classList.add("hidden");
  }
});
