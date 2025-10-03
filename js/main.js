// Global variables
let currentTheme = localStorage.getItem("theme") || "dark";
let currentLang = localStorage.getItem("lang") || "en";
let tutorialStep = 0;
let history = JSON.parse(localStorage.getItem("qrHistory") || "[]");
let isFirstLoad = true;

// Apply initial theme
document.documentElement.setAttribute("data-theme", currentTheme);
document.getElementById("themeToggle").innerHTML =
  currentTheme === "dark"
    ? '<i class="fas fa-moon"></i>'
    : '<i class="fas fa-sun"></i>';

// Apply initial language
document.documentElement.setAttribute(
  "dir",
  currentLang === "ar" ? "rtl" : "ltr"
);
document.documentElement.setAttribute("lang", currentLang);
updateLangButton();

// Update language button
function updateLangButton() {
  const langToggle = document.getElementById("langToggle");
  const langCodes = {
    en: "EN",
    ar: "AR",
    fr: "FR",
  };

  langToggle.innerHTML = `<i class="fas fa-globe"></i> <span class="lang-current">${langCodes[currentLang]}</span>`;
}

if (typeof pdfMake !== "undefined") {
  pdfMake.fonts = {
    Roboto: {
      normal:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
      bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
      italics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
      bolditalics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
    },
    Arial: {
      normal:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
      bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
      italics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
      bolditalics:
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
    },
  };
}

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", function () {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("theme", currentTheme);
  this.innerHTML =
    currentTheme === "dark"
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
});

// Language dropdown functionality
const langToggle = document.getElementById("langToggle");
const langMenu = document.getElementById("langMenu");
const langOptions = document.querySelectorAll(".lang-option");

langToggle.addEventListener("click", function (e) {
  e.stopPropagation();
  langMenu.classList.toggle("show");
});

// Close dropdown when clicking outside
document.addEventListener("click", function () {
  langMenu.classList.remove("show");
});

// Handle language selection
langOptions.forEach((option) => {
  option.addEventListener("click", function () {
    const selectedLang = this.getAttribute("data-lang");
    if (selectedLang !== currentLang) {
      currentLang = selectedLang;
      document.documentElement.setAttribute(
        "dir",
        currentLang === "ar" ? "rtl" : "ltr"
      );
      document.documentElement.setAttribute("lang", currentLang);
      localStorage.setItem("lang", currentLang);
      updateLangButton();
      updateLanguage();
    }
    langMenu.classList.remove("show");
  });
});

// Update language
function updateLanguage() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (translations[currentLang][key]) {
      element.textContent = translations[currentLang][key];
    }
  });

  // Update placeholders
  const placeholderElements = document.querySelectorAll(
    "[data-i18n-placeholder]"
  );
  placeholderElements.forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (translations[currentLang][key]) {
      element.placeholder = translations[currentLang][key];
    }
  });

  // Update field names in results
  const fieldNames = {
    1: translations[currentLang].sellerName,
    2: translations[currentLang].vatNumber,
    3: translations[currentLang].invoiceTimestamp,
    4: translations[currentLang].totalAmount,
    5: translations[currentLang].vatAmount,
  };

  // Update field names in existing results
  const fieldLabels = document.querySelectorAll(".field-label");
  fieldLabels.forEach((label) => {
    const text = label.textContent;
    for (const [tag, name] of Object.entries(fieldNames)) {
      if (text.includes(name)) {
        label.textContent = name;
        break;
      }
    }
  });

  // Update summary labels
  const summaryLabels = document.querySelectorAll(".summary-label");
  summaryLabels.forEach((label) => {
    const text = label.textContent;
    if (text.includes("Business Name")) {
      label.textContent = translations[currentLang].businessName;
    } else if (text.includes("VAT Number")) {
      label.textContent = translations[currentLang].vatNumber;
    } else if (text.includes("Invoice Date")) {
      label.textContent = translations[currentLang].invoiceDate;
    } else if (text.includes("Total Amount")) {
      label.textContent = translations[currentLang].totalAmount;
    } else if (text.includes("VAT Amount")) {
      label.textContent = translations[currentLang].vatAmount;
    }
  });

  // Update summary title
  const summaryTitle = document.querySelector(".summary-title");
  if (summaryTitle) {
    summaryTitle.innerHTML = `📋 ${translations[currentLang].invoiceSummary}`;
  }
}

// Tutorial functionality
const tutorialModal = document.getElementById("tutorialModal");
const tutorialBtn = document.getElementById("tutorialBtn");
const tutorialClose = document.getElementById("tutorialClose");
const tutorialPrev = document.getElementById("tutorialPrev");
const tutorialNext = document.getElementById("tutorialNext");
const tutorialConfirm = document.getElementById("tutorialConfirm");
const tutorialSteps = document.querySelectorAll(".tutorial-step");
const tutorialDots = document.getElementById("tutorialDots");
const shortcutsModal = document.getElementById("shortcutsModal");
const shortcutsBtn = document.getElementById("shortcutsBtn");
const shortcutsClose = document.getElementById("shortcutsClose");

// Add event listeners for shortcuts modal
shortcutsBtn.addEventListener("click", () => {
  shortcutsModal.classList.add("active");
});

shortcutsClose.addEventListener("click", () => {
  shortcutsModal.classList.remove("active");
});

// Close shortcuts modal when clicking outside
shortcutsModal.addEventListener("click", (e) => {
  if (e.target === shortcutsModal) {
    shortcutsModal.classList.remove("active");
  }
});

// Initialize tutorial dots
function initTutorialDots() {
  tutorialDots.innerHTML = "";
  for (let i = 0; i < tutorialSteps.length; i++) {
    const dot = document.createElement("div");
    dot.className = "tutorial-dot";
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => showTutorialStep(i));
    tutorialDots.appendChild(dot);
  }
}

function showTutorialStep(step) {
  tutorialStep = step;
  tutorialSteps.forEach((s, index) => {
    s.style.display = index === step ? "block" : "none";
  });

  const dots = tutorialDots.querySelectorAll(".tutorial-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === step);
  });

  tutorialPrev.disabled = step === 0;

  // Show/hide next and confirm buttons based on step
  if (step === tutorialSteps.length - 1) {
    tutorialNext.style.display = "none";
    tutorialConfirm.style.display = "block";
  } else {
    tutorialNext.style.display = "block";
    tutorialConfirm.style.display = "none";
  }
}

tutorialBtn.addEventListener("click", () => {
  tutorialModal.classList.add("active");
  showTutorialStep(0);
});

tutorialClose.addEventListener("click", () => {
  tutorialModal.classList.remove("active");
});

tutorialPrev.addEventListener("click", () => {
  if (tutorialStep > 0) showTutorialStep(tutorialStep - 1);
});

tutorialNext.addEventListener("click", () => {
  if (tutorialStep < tutorialSteps.length - 1)
    showTutorialStep(tutorialStep + 1);
});

tutorialConfirm.addEventListener("click", () => {
  tutorialModal.classList.remove("active");
});

// Initialize tutorial
initTutorialDots();
showTutorialStep(0);

// Show tutorial on first visit
if (!localStorage.getItem("tutorialShown")) {
  setTimeout(() => {
    tutorialModal.classList.add("active");
    localStorage.setItem("tutorialShown", "true");
  }, 1000);
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    document.getElementById("qrInput").focus();
  }
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    decodeQR();
  }
});

// History functionality
function addToHistory(data, result) {
  const historyItem = {
    data: data,
    result: result,
    timestamp: new Date().toISOString(),
  };
  history.unshift(historyItem);
  if (history.length > 10) history.pop();
  localStorage.setItem("qrHistory", JSON.stringify(history));
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");
  if (history.length === 0) {
    historyList.innerHTML = `<p class="empty-state" data-i18n="historyEmpty">${translations[currentLang].historyEmpty}</p>`;
  } else {
    historyList.innerHTML = history
      .map(
        (item, index) => `<div class="history-item" onclick="loadFromHistory(${index})">
        <div>
          <div class="history-date">${formatDate(item.timestamp)}</div>
          <div class="history-data">${item.data.substring(0, 50)}...</div>
        </div>
        <button class="remove-btn" onclick="removeFromHistory(${index}, event)">✕</button>
      </div>`
      )
      .join("");
  }
  updateLanguage();
}

function loadFromHistory(index) {
  const item = history[index];
  document.getElementById("qrInput").value = item.data;
  // Don't add to history again when loading from history
  const wasFirstLoad = isFirstLoad;
  isFirstLoad = false;
  decodeQR(false);
}

function removeFromHistory(index, event) {
  event.stopPropagation();
  history.splice(index, 1);
  localStorage.setItem("qrHistory", JSON.stringify(history));
  updateHistoryDisplay();
}

// Initialize after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Load jsQR library
  loadScript(
    "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
    function () {
      // Initialize upload functionality after jsQR is loaded
      initializeUpload();
      // Update history display
      updateHistoryDisplay();
    }
  );
});

function initializeUpload() {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("qrImageUpload");
  const uploadPreview = document.getElementById("uploadPreview");
  const previewImg = document.getElementById("previewImg");
  const removeBtn = document.getElementById("removeImage");
  const qrInput = document.getElementById("qrInput");

  // Click to upload
  uploadArea.addEventListener("click", () => fileInput.click());

  // Drag and drop
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    if (e.dataTransfer.files.length) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  });

  // File input change
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length) {
      handleImageUpload(e.target.files[0]);
    }
  });

  // Remove image
  removeBtn.addEventListener("click", () => {
    uploadArea.style.display = "block";
    uploadPreview.style.display = "none";
    fileInput.value = "";
  });

  // Handle image upload
  function handleImageUpload(file) {
    if (!file.type.match("image.*")) {
      showError(
        translations[currentLang].errorImageFile ||
          "Please upload an image file"
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      uploadArea.style.display = "none";
      uploadPreview.style.display = "flex";

      // Process QR code
      processQRCode(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Improved QR code processing with multiple preprocessing steps
// Replace ONLY your processQRCode function with this simplified version
// Simple fix for your processQRCode function
function processQRCode(imageSrc) {
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // First, draw the image in grayscale
    ctx.filter = 'grayscale(100%) contrast(200%)';
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Check if jsQR is available
    if (typeof jsQR === "undefined") {
      showError(
        translations[currentLang].errorLibraryNotLoaded ||
          "QR scanner library not loaded"
      );
      return;
    }

    // Try to decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      // Set decoded data to textarea
      qrInput.value = code.data;
      // Auto-decode
      decodeQR();
    } else {
      // Try again with the original image
      ctx.filter = 'none';
      ctx.drawImage(img, 0, 0);
      const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const originalCode = jsQR(originalData.data, originalData.width, originalData.height);
      
      if (originalCode) {
        qrInput.value = originalCode.data;
        decodeQR();
      } else {
        showError(
          translations[currentLang].errorNoQRFound ||
            "No QR code found in the image. Try using a clearer image with higher contrast."
        );
      }
    }
  };
  img.src = imageSrc;
}

// Add this function to handle colored QR codes
function preprocessForColoredQR(imageData) {
  const data = imageData.data;
  
  // Convert to grayscale with enhanced contrast for colored QR codes
  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value with emphasis on blue-purple colors
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // For blue-purple QR codes, we need to enhance the contrast
    // This formula gives more weight to blue and less to red
    const gray = r * 0.2 + g * 0.3 + b * 0.5;
    
    // Apply aggressive threshold to create binary image
    const threshold = 120; // Adjust this value if needed
    const value = gray > threshold ? 255 : 0;
    
    // Set RGB values to the binary value
    data[i] = value;     // Red
    data[i + 1] = value; // Green
    data[i + 2] = value; // Blue
    // Alpha channel remains unchanged
  }
  
  return imageData;
}
// Clone image data for processing
function cloneImageData(imageData) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  return ctx.createImageData(imageData);
}

// Try decoding with QRCodeReader library
function tryDecodeWithQRCodeReader(imageData) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
    
    const qrReader = new QRCodeReader();
    const result = qrReader.decode({ data: canvas.toDataURL() });
    return result ? result.result : null;
  } catch (e) {
    return null;
  }
}

// Preprocessing functions

// Function to preprocess image for better QR detection
function preprocessImage(imageData) {
  const data = imageData.data;
  
  // Convert to grayscale and enhance contrast
  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    
    // Apply threshold to create binary image
    const threshold = 128;
    const value = gray > threshold ? 255 : 0;
    
    // Set RGB values to the binary value
    data[i] = value;     // Red
    data[i + 1] = value; // Green
    data[i + 2] = value; // Blue
    // Alpha channel remains unchanged
  }
  
  return imageData;
}

// Function to enhance contrast
function enhanceContrast(imageData) {
  const data = imageData.data;
  const factor = 2; // Contrast factor
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply contrast enhancement
    data[i] = factor * (data[i] - 128) + 128;     // Red
    data[i + 1] = factor * (data[i + 1] - 128) + 128; // Green
    data[i + 2] = factor * (data[i + 2] - 128) + 128; // Blue
    
    // Clamp values to 0-255 range
    data[i] = Math.max(0, Math.min(255, data[i]));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
  }
  
  return imageData;
}

// Function to convert to grayscale
function convertToGrayscale(imageData) {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    
    // Set RGB values to the grayscale value
    data[i] = gray;     // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
    // Alpha channel remains unchanged
  }
  
  return imageData;
}

// Adaptive threshold function
function adaptiveThreshold(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const blockSize = 15;
  const C = 2;
  
  // First convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  
  // Apply adaptive threshold
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate local threshold
      let sum = 0;
      let count = 0;
      const halfBlock = Math.floor(blockSize / 2);
      
      for (let dy = -halfBlock; dy <= halfBlock; dy++) {
        for (let dx = -halfBlock; dx <= halfBlock; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            sum += data[nidx];
            count++;
          }
        }
      }
      
      const threshold = (sum / count) - C;
      const value = data[idx] > threshold ? 255 : 0;
      
      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
    }
  }
  
  return imageData;
}

// Normalize image function
function normalizeImage(imageData) {
  const data = imageData.data;
  
  // Find min and max values
  let min = 255;
  let max = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }
  
  // Normalize and convert to grayscale
  const range = max - min;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const normalized = ((gray - min) / range) * 255;
    
    data[i] = normalized;
    data[i + 1] = normalized;
    data[i + 2] = normalized;
  }
  
  return imageData;
}

function decodeQR(addToHistoryFlag = true) {
  const qrData = document.getElementById("qrInput").value.trim();
  const emptyState = document.getElementById("emptyState");
  const resultContent = document.getElementById("resultContent");
  const loadingState = document.getElementById("loadingState");
  const skeletonState = document.getElementById("skeletonState");

  if (!qrData) {
    showError(
      translations[currentLang].errorEnterData || "Please enter QR code data"
    );
    return;
  }

  // Show loading state
  emptyState.style.display = "none";
  resultContent.classList.remove("active");
  loadingState.classList.add("active");
  skeletonState.style.display = "none";

  // Show skeleton after short delay
  setTimeout(() => {
    loadingState.classList.remove("active");
    skeletonState.style.display = "block";
  }, 500);

  // Simulate processing time for better UX
  setTimeout(() => {
    try {
      // Decode base64
      const decodedBytes = atob(qrData);
      const bytes = new Uint8Array(decodedBytes.length);
      for (let i = 0; i < decodedBytes.length; i++) {
        bytes[i] = decodedBytes.charCodeAt(i);
      }

      // Parse TLV format
      const fields = parseTLV(bytes);
      displayResults(fields);

      // Add to history only if not first load and flag is true
      if (!isFirstLoad && addToHistoryFlag) {
        addToHistory(qrData, fields);
      }

      // Hide loading and show results
      skeletonState.style.display = "none";
      resultContent.classList.add("active");

      // Show success animation only if not first load
      if (!isFirstLoad) {
        showSuccessAnimation();
      }

      // Set first load to false after first decode
      isFirstLoad = false;
    } catch (error) {
      skeletonState.style.display = "none";
      showError(
        `${
          translations[currentLang].errorDecode || "Failed to decode QR code"
        }: ${error.message}`
      );
    }
  }, 1500);
}

function displayResults(fields) {
  const resultContent = document.getElementById("resultContent");

  let html = '<div class="field-grid">';

  // Display individual fields
  for (const [tag, field] of Object.entries(fields)) {
    html += `<div class="field-card" style="animation-delay: ${tag * 0.1}s">
      <div class="field-label">${field.name}</div>
      <div class="field-value">
        <span>${field.value}</span>
        <button class="copy-btn" onclick="copyToClipboard('${field.value.replace(/'/g, "\\'")}', this)">📋</button>
      </div>
    </div>`;
  }

  html += "</div>";

  // Add summary if we have key fields
  if (fields[1] && fields[4]) {
    html += `<div class="summary-card">
      <div class="summary-title">📋 ${translations[currentLang].invoiceSummary}</div>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">${translations[currentLang].businessName}</span>
          <span class="summary-value">${fields[1].value}</span>
        </div>
        ${fields[2] ? `
        <div class="summary-item">
          <span class="summary-label">${translations[currentLang].vatNumber}</span>
          <span class="summary-value">${fields[2].value}</span>
        </div>` : ""}
        ${fields[3] ? `
        <div class="summary-item">
          <span class="summary-label">${translations[currentLang].invoiceDate}</span>
          <span class="summary-value">${formatDate(fields[3].value)}</span>
        </div>` : ""}
        <div class="summary-item">
          <span class="summary-label">${translations[currentLang].totalAmount}</span>
          <span class="summary-value">${fields[4].value} SAR</span>
        </div>
        ${fields[5] ? `
        <div class="summary-item">
          <span class="summary-label">${translations[currentLang].vatAmount}</span>
          <span class="summary-value">${fields[5].value} SAR</span>
        </div>` : ""}
      </div>
    </div>`;
  }

  // Add export buttons
  html += `<div class="export-buttons">
    <button class="export-btn" onclick="exportToPDF()">
      <i class="fas fa-file-pdf"></i>
      <span>${translations[currentLang].exportPDF}</span>
    </button>
    <button class="export-btn" onclick="exportToCSV()">
      <i class="fas fa-file-csv"></i>
      <span>${translations[currentLang].exportCSV}</span>
    </button>
    <button class="export-btn" onclick="exportToJSON()">
      <i class="fas fa-file-code"></i>
      <span>${translations[currentLang].exportJSON}</span>
    </button>
  </div>`;

  resultContent.innerHTML = html;
}

// Export functions
function exportToPDF() {
  try {
    // Get the fields
    const qrData = document.getElementById("qrInput").value.trim();
    const fields = parseTLV(qrData);

    // Prepare document definition
    const docDefinition = {
      content: [
        { text: "ZATCA QR Code Decoded Data", style: "header" },
        {
          text: `Generated: ${new Date().toLocaleString()}`,
          style: "subheader",
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*"],
            body: [
              [
                { text: "Field", style: "tableHeader" },
                { text: "Value", style: "tableHeader" },
              ],
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 10, 0],
          alignment: "center",
        },
        subheader: {
          fontSize: 12,
          margin: [0, 0, 20, 0],
          alignment: "center",
        },
        tableHeader: {
          bold: true,
          fillColor: "#667eea",
          color: "white",
          alignment: "center",
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    // Add table rows
    for (const [tag, field] of Object.entries(fields)) {
      docDefinition.content[2].table.body.push([
        {
          text: field.name,
          alignment: currentLang === "ar" ? "right" : "left",
        },
        {
          text: field.value,
          alignment: currentLang === "ar" ? "right" : "left",
        },
      ]);
    }

    // Create PDF
    pdfMake.createPdf(docDefinition).download("zatca-qr-data.pdf");
    showToast("PDF exported successfully!");
  } catch (error) {
    console.error("Error exporting PDF:", error);
    showError("Failed to export PDF: " + error.message);
  }
}

function exportToCSV() {
  try {
    const qrData = document.getElementById("qrInput").value.trim();
    const fields = parseTLV(qrData);

    // Create CSV content with BOM for UTF-8 support
    let csv = addBOM("Field,Value\n");

    for (const [tag, field] of Object.entries(fields)) {
      const fieldName = formatCSVText(field.name);
      const fieldValue = formatCSVText(field.value);

      // For Arabic text, ensure proper encoding
      if (isArabic(field.value)) {
        csv += `"${fieldName}","${fieldValue}"\n`;
      } else {
        csv += `"${fieldName}","${fieldValue}"\n`;
      }
    }

    // Create blob with explicit UTF-8 encoding
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zatca-qr-data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("CSV exported successfully!");
  } catch (error) {
    console.error("Error exporting CSV:", error);
    showError("Failed to export CSV: " + error.message);
  }
}

function exportToJSON() {
  try {
    const qrData = document.getElementById("qrInput").value.trim();
    const fields = parseTLV(qrData);
    const json = JSON.stringify(fields, null, 2);
    downloadFile(json, "zatca-qr-data.json", "application/json;charset=utf-8");
    showToast("JSON exported successfully!");
  } catch (error) {
    console.error("Error exporting JSON:", error);
    showError("Failed to export JSON: " + error.message);
  }
}

// Update the downloadFile function to handle charset
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Auto-decode on page load if there's default data, but don't show success animation
window.addEventListener("load", function () {
  const input = document.getElementById("qrInput");
  if (input.value.trim()) {
    decodeQR(false);
  }
});

// Add input event listener for real-time validation
document.getElementById("qrInput").addEventListener("input", function () {
  const resultContent = document.getElementById("resultContent");
  const emptyState = document.getElementById("emptyState");

  if (!this.value.trim()) {
    resultContent.classList.remove("active");
    emptyState.style.display = "block";
  }
});

// Utility functions

// Load script dynamically with fallback
function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  script.onerror = function () {
    console.error("Failed to load script:", src);
    
    // If jsQR fails, try an alternative library
    if (src.includes("jsqr")) {
      console.log("Trying alternative QR library...");
      loadScript("https://cdn.jsdelivr.net/npm/qrcode-reader@1.0.4/dist/qrcode-reader.min.js", function() {
        console.log("Alternative QR library loaded");
        callback();
      });
    } else {
      showError(
        translations[currentLang].errorLoadingLibrary ||
          "Failed to load QR scanner library"
      );
    }
  };
  document.head.appendChild(script);
}

// Create BOM for UTF-8 CSV files
function addBOM(text) {
  return "\uFEFF" + text;
}

// Check if text contains Arabic characters
function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// Format text for CSV with proper escaping
function formatCSVText(text) {
  if (isArabic(text)) {
    // For Arabic text, we need to ensure proper encoding
    return text.replace(/"/g, '""');
  }
  return text.replace(/"/g, '""');
}

// Format date based on current language
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const options =
      currentLang === "ar"
        ? {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            calendar: "gregory",
          }
        : currentLang === "fr"
        ? {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        : {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          };

    return date.toLocaleDateString(
      currentLang === "ar" ? "ar-SA" : currentLang === "fr" ? "fr-FR" : "en-US",
      options
    );
  } catch (e) {
    return dateString;
  }
}

// Copy text to clipboard
function copyToClipboard(text, button) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // Visual feedback
      button.classList.add("copied");
      button.innerHTML = "✓";

      // Show toast notification
      showToast(translations[currentLang].copySuccess);

      // Reset after 2 seconds
      setTimeout(() => {
        button.classList.remove("copied");
        button.innerHTML = "📋";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}

// Show success animation
function showSuccessAnimation() {
  const successAnimation = document.getElementById("successAnimation");
  successAnimation.classList.add("show");
  setTimeout(() => {
    successAnimation.classList.remove("show");
  }, 1000);

  // Show toast notification
  showToast(translations[currentLang].decodeSuccess);
}

// Show toast notification
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = isError ? "toast error" : "toast";
  toast.innerHTML = `<i class="fas ${isError ? "fa-exclamation-circle" : "fa-check-circle"}"></i>
    <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Show error message
function showError(message) {
  const emptyState = document.getElementById("emptyState");
  const resultContent = document.getElementById("resultContent");
  const loadingState = document.getElementById("loadingState");
  const skeletonState = document.getElementById("skeletonState");

  loadingState.classList.remove("active");
  skeletonState.style.display = "none";
  resultContent.innerHTML = `<div class="error-message">
    <div class="error-icon">⚠️</div>
    <strong>${translations[currentLang].error || "Error"}:</strong> ${message}
  </div>`;

  emptyState.style.display = "none";
  resultContent.classList.add("active");
}

// Parse TLV format with error handling
function parseTLV(bytes) {
  try {
    // If bytes is a string (from export functions), convert it to Uint8Array
    if (typeof bytes === "string") {
      const decodedBytes = atob(bytes);
      const byteArray = new Uint8Array(decodedBytes.length);
      for (let i = 0; i < decodedBytes.length; i++) {
        byteArray[i] = decodedBytes.charCodeAt(i);
      }
      bytes = byteArray;
    }

    const fields = {};
    let index = 0;

    // ZATCA field mappings
    const fieldNames = {
      1: translations[currentLang].sellerName,
      2: translations[currentLang].vatNumber,
      3: translations[currentLang].invoiceTimestamp,
      4: translations[currentLang].totalAmount,
      5: translations[currentLang].vatAmount,
    };

    while (index < bytes.length) {
      if (index + 2 >= bytes.length) break;

      const tag = bytes[index];
      const length = bytes[index + 1];

      if (index + 2 + length > bytes.length) break;

      const value = bytes.slice(index + 2, index + 2 + length);
      const valueStr = new TextDecoder("utf-8").decode(value);

      fields[tag] = {
        name: fieldNames[tag] || `Field ${tag}`,
        value: valueStr,
        tag: tag,
      };

      index += 2 + length;
    }

    return fields;
  } catch (error) {
    console.error("Error parsing TLV:", error);
    return {};
  }
}