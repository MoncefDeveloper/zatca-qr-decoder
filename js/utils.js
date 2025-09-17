// Utility functions for the ZATCA QR Decoder

// Load script dynamically
function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  script.onerror = function () {
    console.error("Failed to load script:", src);
    showError(
      translations[currentLang].errorLoadingLibrary ||
        "Failed to load QR scanner library"
    );
  };
  document.head.appendChild(script);
}

function arabicToUnicode(text) {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return code > 127 ? "\\u" + code.toString(16).padStart(4, "0") : char;
    })
    .join("");
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
  toast.innerHTML = `
        <i class="fas ${
          isError ? "fa-exclamation-circle" : "fa-check-circle"
        }"></i>
        <span>${message}</span>
    `;
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
  resultContent.innerHTML = `
        <div class="error-message">
            <div class="error-icon">⚠️</div>
            <strong>${
              translations[currentLang].error || "Error"
            }:</strong> ${message}
        </div>
    `;

  emptyState.style.display = "none";
  resultContent.classList.add("active");
}

// Download file
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
