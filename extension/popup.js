document.addEventListener("DOMContentLoaded", function () {
  const analyzeButton = document.getElementById("analyze");
  const applyButton = document.getElementById("apply");
  const restoreButton = document.getElementById("restore");
  let detectedEntities = [];
  let originalText = "";
  let hasProcessedContent = false;
  let isComposeMode = true;

  // Initially hide the apply and restore buttons
  applyButton.style.display = "none";
  restoreButton.style.display = "none";

  // First, detect if we're in compose mode or viewing mode
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getPageText" }, function (response) {
      if (!response) {
        document.getElementById("output").innerHTML = "<p> Unable to access this page. Make sure you're on Gmail or WhatsApp Web.</p>";
        return;
      }
      
      originalText = response.text;
      hasProcessedContent = response.hasProcessedContent;
      isComposeMode = response.isCompose;
      
      // Show appropriate UI based on content and mode
      if (hasProcessedContent) {
        document.getElementById("processingOptions").style.display = "none";
        document.getElementById("receiverOptions").style.display = "block";
        restoreButton.style.display = "block";
        
        const outputDiv = document.getElementById("output");
        outputDiv.innerHTML = "<h3>Protected Content Detected</h3>";
        outputDiv.innerHTML += "<p>This message contains protected information that has been encrypted, masked, or tokenized.</p>";
      } else {
        document.getElementById("processingOptions").style.display = "block";
        document.getElementById("receiverOptions").style.display = "none";
      }
    });
  });

  analyzeButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getPageText" }, function (response) {
        if (!response || !response.text) {
          alert("Could not extract text from the page.");
          return;
        }

        originalText = response.text;
        const payload = { text: originalText };

        // Use 127.0.0.1 instead of localhost
        fetch("http://127.0.0.1:8001/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const outputDiv = document.getElementById("output");
          outputDiv.innerHTML = "<h3>Detected Sensitive Info:</h3>";
          
          if (!data || !data.entities || data.entities.length === 0) {
            outputDiv.innerHTML += "<p> No sensitive info detected.</p>";
            applyButton.style.display = "none";
          } else {
            detectedEntities = data.entities;
            data.entities.forEach((ent) => {
              outputDiv.innerHTML += `<p> <strong>${ent.entity}</strong>: ${ent.text} <em>(score: ${ent.score})</em></p>`;
            });
            // Show apply button when sensitive info is detected
            applyButton.style.display = "block";
          }
        })
        .catch((err) => {
          console.error("Error during fetch:", err);
          alert(" Error contacting the backend. Check the console for details.");
        });
      });
    });
  });

  applyButton.addEventListener("click", () => {
    // Get selected action type
    const selectedAction = document.querySelector('input[name="actionType"]:checked');
    
    if (!selectedAction) {
      alert("Please select an action: Encrypt, Mask, or Tokenize");
      return;
    }

    const actionType = selectedAction.value;
    
    if (detectedEntities.length === 0 || !originalText) {
      alert("No sensitive information detected to process.");
      return;
    }

    // Send the action request to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id, 
        { 
          action: "processText", 
          entities: detectedEntities, 
          actionType: actionType,
          originalText: originalText
        }, 
        function (response) {
          if (response && response.success) {
            const outputDiv = document.getElementById("output");
            outputDiv.innerHTML += `<p> Successfully applied ${actionType} to sensitive information.</p>`;
          } else {
            alert("Failed to process text. See console for details.");
          }
        }
      );
    });
  });
  
  restoreButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id, 
        { action: "restoreText" }, 
        function (response) {
          if (response && response.success) {
            const outputDiv = document.getElementById("output");
            outputDiv.innerHTML += `<p> Attempting to restore protected content.</p>`;
          } else {
            alert("Failed to restore text. See console for details.");
          }
        }
      );
    });
  });
});
