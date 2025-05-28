chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze_text") {
    fetch("http://127.0.0.1:8001/analyze", {

      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: request.text })
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ result: data });
    })
    .catch(error => {
      console.error("Error:", error);
      sendResponse({ error: "Failed to analyze text." });
    });
    return true; // Required to indicate async response
  }
});
