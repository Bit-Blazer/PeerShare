const sendArea = document.getElementById("sendArea");
const receiveArea = document.getElementById("receiveArea");

// Function to get IP address
async function getIpAddress() {
   try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
   } catch (error) {
      console.error("Error fetching IP address:", error);
      return "Error fetching IP";
   }
}

document.addEventListener("DOMContentLoaded", async () => {
   const ip = await getIpAddress();
   document.getElementById("displayIp").textContent = ip;
   new QRCode(document.getElementById("qr-code"), {
      text: ip,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
   });
});

// Show send window
document.getElementById("sendButton").addEventListener("click", () => {
   sendArea.style.display = "block";
});

// Show receive window and display IP
document.getElementById("receiveButton").addEventListener("click", () => {
   receiveArea.style.display = "block";
});

window.addEventListener("click", (event) => {
   if (event.target === sendArea) {
      sendArea.style.display = "none";
   }
   if (event.target === receiveArea) {
      receiveArea.style.display = "none";
   }
});

// Close windows
document.querySelectorAll(".close").forEach((button) => {
   button.addEventListener("click", () => {
      sendArea.style.display = "none";
      receiveArea.style.display = "none";
   });
});

// Handle form submission
document.getElementById("sendForm").addEventListener("submit", async (event) => {
   event.preventDefault();

   const targetIp = document.getElementById("targetIp").value;
   const fileInput = document.getElementById("fileInput").files;

   const formData = new FormData();
   formData.append("file", fileInput);

   try {
      const response = await fetch(`http://${targetIp}:5000/upload`, {
         method: "POST",
         body: formData,
      });

      if (response.ok) {
         alert("File sent successfully!");
      } else {
         alert("Error sending file.");
      }
   } catch (error) {
      console.error("Error sending file:", error);
      alert("Error sending file.");
   }
});

// Display selected file name
const fileInput = document.getElementById("fileInput");
const numOfFiles = document.getElementById("num-of-files");
const fileList = document.getElementById("files-list");
const dropZone = document.getElementById("dropzone-area");

// Handle drag and drop
dropZone.addEventListener("dragover", (e) => {
   e.preventDefault();
   dropZone.classList.add("dropzone--over");
});

["dragleave", "dragend"].forEach((type) => {
   dropZone.addEventListener(type, () => {
      dropZone.classList.remove("dropzone--over");
   });
});

dropZone.addEventListener("drop", (e) => {
   e.preventDefault();
   fileInput.files = e.dataTransfer.files;
   updateFileList(fileInput.files);
   dropZone.classList.remove("dropzone--over");
});

// Handle file input change
fileInput.addEventListener("change", () => {
   updateFileList(fileInput.files);
});

// Display file details
const updateFileList = (files) => {
   numOfFiles.textContent = `${files.length} Files Selected`;

   for (let file of files) {
      let listItem = document.createElement("li");
      let fileSize = (file.size / 1024).toFixed(1);
      let sizeUnit = fileSize >= 1024 ? "MB" : "KB";
      if (fileSize >= 1024) {
         fileSize = (fileSize / 1024).toFixed(1);
      }
      listItem.innerHTML = `<p>${file.name}</p><p>${fileSize}  ${sizeUnit}</p>`;
      fileList.appendChild(listItem);
   }
};


const qrIcon = document.getElementById("qrIcon");
const targetIp = document.getElementById("targetIp");

// Function to start the QR code scanner
function startQrScanner() {
   const qrReader = document.getElementById("qr-reader");
   qrReader.style.display = "block";

   const html5QrCode = new Html5Qrcode("qr-reader");

   html5QrCode.start(
      { facingMode: "environment" },
      {
         fps: 10,    // Optional, frame per seconds for qr code scanning
         qrbox: 250  // Optional, if you want bounded box UI
      },
      (decodedText, decodedResult) => {
         // Handle the decoded text (the IP address)
         targetIp.value = decodedText;
         // Stop the QR code scanner
         html5QrCode.stop().then(() => {
            qrReader.style.display = "none";
         }).catch(err => {
            console.error("Failed to stop QR code scanner:", err);
         });
      },
      (errorMessage) => {
         // parse error, ignore it.
      }
   ).catch(err => {
      console.error("Unable to start scanning, error:", err);
   });
}

// Event listener for QR icon click
qrIcon.addEventListener("click", () => {
   startQrScanner();
   // qrFileInput.click();
});