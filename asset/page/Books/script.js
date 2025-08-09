// مصفوفة الكتب
const pdfFiles = [
  { name: "ملخص-دكتور-شروق", file: "DR SHROUK.pdf" },
  { name: "كتاب-الكيمياء", file: "chemistry.pdf" }
];

// عناصر HTML
const pdfList = document.getElementById("pdfList");
pdfList.style.display = "flex";
pdfList.style.flexDirection = "column";
pdfList.style.gap = "10px"; // فرق 10px بين الكتب

const container = document.createElement("div");
container.style.marginTop = "20px";

// عنوان الكتاب
const fileTitle = document.createElement("h2");
fileTitle.style.textAlign = "center";
fileTitle.style.margin = "3px 0";
fileTitle.style.opacity = "0";
fileTitle.style.transition = "opacity 0.4s ease, transform 0.4s ease";

// أيقونة الكتاب
const pdfIcon = document.createElement("img");
pdfIcon.style.width = "100%";
pdfIcon.style.height = "auto";
pdfIcon.style.display = "block";
pdfIcon.style.opacity = "0";
pdfIcon.style.transition = "opacity 0.4s ease, transform 0.4s ease";

// iframe لعرض الكتاب
const pdfViewer = document.createElement("iframe");
pdfViewer.width = "100%";
pdfViewer.height = "600px";
pdfViewer.style.border = "none";
pdfViewer.style.opacity = "0";
pdfViewer.style.transition = "opacity 0.4s ease, transform 0.4s ease";

// إضافة العناصر للكونتينر
container.appendChild(fileTitle);
container.appendChild(pdfIcon);
container.appendChild(pdfViewer);
document.body.insertBefore(container, document.getElementById("elementTableBtn"));

// دالة عرض الكتاب مع أنيميشن
function displayBook(pdf) {
  // إخفاء القديم
  fileTitle.style.opacity = "0";
  pdfIcon.style.opacity = "0";
  pdfViewer.style.opacity = "0";
  fileTitle.style.transform = "translateY(-10px)";
  pdfIcon.style.transform = "translateY(-10px)";
  pdfViewer.style.transform = "translateY(-10px)";

  setTimeout(() => {
    fileTitle.textContent = pdf.name;
    pdfIcon.src = "/asset/icons/pdf-icon.png";
    pdfViewer.src = `/asset/storage/${pdf.file}`;

    // إظهار الجديد
    fileTitle.style.opacity = "1";
    pdfIcon.style.opacity = "1";
    pdfViewer.style.opacity = "1";
    fileTitle.style.transform = "translateY(0)";
    pdfIcon.style.transform = "translateY(0)";
    pdfViewer.style.transform = "translateY(0)";
  }, 300); // وقت الإخفاء قبل عرض الجديد
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
      card.style.padding = "10px";
      card.style.borderRadius = "8px";
      card.style.cursor = "pointer";
      card.style.transition = "background 0.3s ease";
      card.addEventListener("mouseover", () => card.style.background = "#f0f0f0");
      card.addEventListener("mouseout", () => card.style.background = "#fff");

      const img = document.createElement("img");
      img.src = "/asset/icons/pdf-icon.png";
      img.alt = pdf.name;
      img.style.width = "50px";

      const title = document.createElement("h3");
      title.textContent = pdf.name;

      card.appendChild(img);
      card.appendChild(title);
      card.addEventListener("click", () => displayBook(pdf));

      pdfList.appendChild(card);

      // عرض أول كتاب تلقائي لو مش معروض كتاب بعد
      if (!pdfViewer.src) displayBook(pdf);
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
