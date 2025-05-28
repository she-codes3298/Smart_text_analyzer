// Define word mapping for Base64 characters (A-Z, a-z, 0-9, +, /, =)
const BASE64_TO_WORDS = {
  'A': 'about', 'B': 'better', 'C': 'consider', 'D': 'day', 'E': 'early',
  'F': 'first', 'G': 'good', 'H': 'have', 'I': 'important', 'J': 'just',
  'K': 'know', 'L': 'like', 'M': 'many', 'N': 'new', 'O': 'only',
  'P': 'people', 'Q': 'question', 'R': 'right', 'S': 'such', 'T': 'time',
  'U': 'use', 'V': 'very', 'W': 'with', 'X': 'experience', 'Y': 'year',
  'Z': 'zero',
  
  'a': 'and', 'b': 'but', 'c': 'can', 'd': 'do', 'e': 'even',
  'f': 'find', 'g': 'get', 'h': 'help', 'i': 'in', 'j': 'join',
  'k': 'keep', 'l': 'let', 'm': 'make', 'n': 'not', 'o': 'or',
  'p': 'please', 'q': 'quite', 'r': 'really', 's': 'say', 't': 'tell',
  'u': 'under', 'v': 'value', 'w': 'work', 'x': 'example', 'y': 'you',
  'z': 'zone',
  
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
  
  '+': 'plus', '/': 'forward', '=': 'equals'
};

// Create reverse mapping (word -> Base64 char)
const WORDS_TO_BASE64 = {};
for (const [char, word] of Object.entries(BASE64_TO_WORDS)) {
  WORDS_TO_BASE64[word] = char;
}

// Special marker words to identify start and end of hidden content
const START_MARKER = {
  'AADHAR': 'Regarding',
  'BANK_ACCOUNT': 'Contacting',
  'EMAIL': 'Calling',
  'IFSC': 'Located',
  'PAN': 'Paying',
  'PHONE': 'Identifying',
  'UPI': 'Verifying',
  'DEFAULT': 'Notably'
};

// End markers that would look natural in sentences
const END_MARKER = {
  'AADHAR': 'sincerely',
  'BANK_ACCOUNT': 'promptly',
  'EMAIL': 'immediately',
  'IFSC': 'precisely',
  'PAN': 'securely',
  'PHONE': 'confidentially',
  'UPI': 'uniquely',
  'DEFAULT': 'accordingly'
};

// Function to create flowing text from words
function createFlowingText(words) {
  // Break into sentences of reasonable length
  const sentenceLength = 8;
  let result = '';
  
  for (let i = 0; i < words.length; i += sentenceLength) {
    const sentenceWords = words.slice(i, i + sentenceLength);
    // Capitalize first word
    sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
    result += sentenceWords.join(' ') + '. ';
  }
  
  return result.trim();
}

// Main encoding function
function encodeWithInvisibleSteganography(text, entityType) {
  console.log(text);
  console.log(entityType);
  // Step 1: Convert the text to Base64
  const base64Text = btoa(text);
  
  // Step 2: Convert each Base64 character to a word
  const words = [];
  
  // Add start marker based on entity type
  words.push(START_MARKER[entityType] || START_MARKER['DEFAULT']);
  
  // Add a word that encodes the entity type (for decoding)
  //words.push(BASE64_TO_WORDS[entityType.charAt(0)] || 'information');
  words.push(BASE64_TO_WORDS[entityType.charAt(0)] || 'information');
  words.push(BASE64_TO_WORDS[entityType.charAt(1)] || 'information');

  
  
  // Add words for each Base64 character
  for (let i = 0; i < base64Text.length; i++) {
    const char = base64Text.charAt(i);
    words.push(BASE64_TO_WORDS[char] || 'thing');
  }
  
  // Add end marker
  words.push(END_MARKER[entityType] || END_MARKER['DEFAULT']);
  
  // Step 3: Create flowing text from words
  return createFlowingText(words);
}

// Check if text might contain steganographic content
function detectStegContent(text) {
  // Convert text to lowercase and split into words
  const words = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
  
  // Check if any start markers are present
  const possibleStartMarkers = Object.values(START_MARKER).map(m => m.toLowerCase());
  for (const marker of possibleStartMarkers) {
    if (words.includes(marker)) {
      return true;
    }
  }
  
  return false;
}
// Extract and decode steganographic content
function decodeInvisibleSteganography(text) {
  // Split text into words
  const words = text.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);
  // Look for start markers
  const startMarkerValues = Object.values(START_MARKER).map(m => m.toLowerCase());
  
  for (let i = 0; i < words.length; i++) {
    // Check if current word is a start marker
    if (startMarkerValues.includes(words[i])) {
      // Get the matched start marker
      const startMarker = words[i];
      // Verify we have at least two more words after the start marker (for two entity type characters)
      if (i + 2 >= words.length) continue;
      
      // Look for end marker after this position
      const endMarkerValues = Object.values(END_MARKER).map(m => m.toLowerCase());
      // Find the end marker
      let endIndex = -1;
      for (let j = i + 3; j < words.length; j++) { // Start search after the two entity type indicators
        if (endMarkerValues.includes(words[j])) {
          endIndex = j;
          break;
        }
      }
      
      if (endIndex !== -1) {
        // Extract the encoded words (skip start marker and TWO entity type indicators)
        const encodedWords = words.slice(i + 3, endIndex);
        
        // Map words back to Base64 characters
        let base64String = '';
        for (const word of encodedWords) {
          // Use lowercase for consistency
          const cleanWord = word.toLowerCase().trim();
          if (WORDS_TO_BASE64[cleanWord]) {
            base64String += WORDS_TO_BASE64[cleanWord];
          }
        }
        
        try {
          // Decode the Base64 string
          const decodedText = atob(base64String);
          
          // Determine entity type from second AND third words
          let entityType = 'DEFAULT';
          const firstTypeChar = words[i + 1];
          const secondTypeChar = words[i + 2];
          let firstCharCode = '';
          let secondCharCode = '';
          
          // Get character code for first character
          for (const [key, word] of Object.entries(BASE64_TO_WORDS)) {
            if (word === firstTypeChar) {
              firstCharCode = key;
              break;
            }
          }
          
          // Get character code for second character
          for (const [key, word] of Object.entries(BASE64_TO_WORDS)) {
            if (word === secondTypeChar) {
              secondCharCode = key;
              break;
            }
          }
          
          // Find entity type that starts with these two characters
          for (const type of Object.keys(START_MARKER)) {
            if (type.charAt(0) === firstCharCode && type.charAt(1) === secondCharCode) {
              entityType = type;
              break;
            }
          }
          
          // Get the end marker
          const endMarker = words[endIndex];
          
          // Calculate original text positions
          const startMarkerIndex = text.toLowerCase().indexOf(startMarker);
          const endMarkerIndex = text.toLowerCase().lastIndexOf(endMarker);
          
          // Use a substring search to find the exact text segment
          let startPosition = startMarkerIndex;
          let endPosition = endMarkerIndex + endMarker.length;
          
          // Ensure positions are valid
          if (startPosition < 0) startPosition = 0;
          if (endPosition > text.length || endPosition < 0) endPosition = text.length;
          
          // Return the decoded information
          return {
            found: true,
            originalText: decodedText,
            entityType: entityType,
            startPosition: startPosition,
            endPosition: endPosition,
            stegoText: text.substring(startPosition, endPosition)
          };
        } catch (e) {
          console.log("Failed to decode Base64:", e, "Base64 string:", base64String);
        }
      }
    }
  }
  return { found: false };
}


// Function to find all steganographic content in text
// Modified findAllStegContent function to properly handle multiple encoded entities
function findAllStegContent(text) {
  const results = [];
  
  // First check if there's any start marker in the text at all
  const hasAnyMarker = Object.values(START_MARKER).some(marker => 
    text.toLowerCase().includes(marker.toLowerCase())
  );
  
  if (!hasAnyMarker) {
    console.log("No start markers found in text");
    return results; // No start markers found, return empty results
  }
  
  // Process each potential segment marked by start/end markers
  for (const [entityType, startMarker] of Object.entries(START_MARKER)) {
    const endMarker = END_MARKER[entityType];
    
    // Convert to lowercase for case-insensitive search
    const lowerText = text.toLowerCase();
    const lowerStartMarker = startMarker.toLowerCase();
    const lowerEndMarker = endMarker.toLowerCase();
    
    // Find all occurrences of this start marker
    let startIndex = lowerText.indexOf(lowerStartMarker);
    while (startIndex !== -1) {
      // Find the next end marker after this start marker
      const endIndex = lowerText.indexOf(lowerEndMarker, startIndex + lowerStartMarker.length);
      
      if (endIndex !== -1) {
        // Extract the segment containing this potential steganographic content
        const endPosition = endIndex + lowerEndMarker.length;
        const segment = text.substring(startIndex, endPosition);
        
        // Try to decode this segment
        const result = decodeInvisibleSteganography(segment);
        
        if (result.found) {
          // Adjust positions to match the full text
          result.startPosition = startIndex;
          result.endPosition = endPosition;
          results.push(result);
          
          // Move past this segment
          startIndex = lowerText.indexOf(lowerStartMarker, endPosition);
        } else {
          // Move to next occurrence of start marker
          startIndex = lowerText.indexOf(lowerStartMarker, startIndex + 1);
        }
      } else {
        // No matching end marker found
        break;
      }
    }
  }
  
  console.log("Found steganographic segments:", results.length);
  return results;
}

// Improved detection function
function detectStegContent(text) {
  // Convert text to lowercase and split into words
  const words = text.toLowerCase().replace(/[.,!?;]/g, '').split(/\s+/);
  
  // Check if any start markers are present
  const possibleStartMarkers = Object.values(START_MARKER).map(m => m.toLowerCase());
  const hasStartMarker = possibleStartMarkers.some(marker => {
    const contains = words.includes(marker);
    if (contains) console.log("Found start marker:", marker);
    return contains;
  });
  
  if (!hasStartMarker) {
    console.log("No start markers found in text");
    return false;
  }
  
  // Also check for end markers - both should be present for valid steganography
  const possibleEndMarkers = Object.values(END_MARKER).map(m => m.toLowerCase());
  const hasEndMarker = possibleEndMarkers.some(marker => {
    const contains = words.includes(marker);
    if (contains) console.log("Found end marker:", marker);
    return contains;
  });
  
  console.log("Has both markers:", hasStartMarker && hasEndMarker);
  return hasStartMarker && hasEndMarker;
}


// Create a nicer display for revealed content
function createStegRevealOverlay(text, stegResults) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '10%';
  overlay.style.left = '50%';
  overlay.style.transform = 'translateX(-50%)';
  overlay.style.backgroundColor = 'white';
  overlay.style.padding = '20px';
  overlay.style.borderRadius = '8px';
  overlay.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  overlay.style.zIndex = '10000';
  overlay.style.maxWidth = '80%';
  overlay.style.maxHeight = '80%';
  overlay.style.overflow = 'auto';
  
  const header = document.createElement('h3');
  header.textContent = 'Hidden Content Detected';
  header.style.marginTop = '0';
  header.style.color = '#007bff';
  overlay.appendChild(header);
  
  if (stegResults.length === 0) {
    const noContent = document.createElement('p');
    noContent.textContent = 'No hidden content was found in this message.';
    overlay.appendChild(noContent);
  } else {
    // Add original text with highlights
    const originalHeader = document.createElement('h4');
    //originalHeader.textContent = 'Original Message:';
    overlay.appendChild(originalHeader);
    
    const originalDiv = document.createElement('div');
    originalDiv.style.backgroundColor = '#f8f9fa';
    originalDiv.style.padding = '10px';
    originalDiv.style.borderRadius = '5px';
    originalDiv.style.marginBottom = '15px';
    originalDiv.style.whiteSpace = 'pre-wrap';
    originalDiv.style.position = 'relative';
    
    // Create highlighted text
    let currentPos = 0;
    for (const result of stegResults) {
      // Add text before this result
      originalDiv.appendChild(document.createTextNode(
        text.substring(currentPos, result.startPosition)
      ));
      
      // Add highlighted steganographic text
      const highlightSpan = document.createElement('span');
      highlightSpan.style.backgroundColor = '#ffe6e6';
      highlightSpan.style.padding = '2px';
      highlightSpan.style.borderRadius = '3px';
      highlightSpan.textContent = text.substring(result.startPosition, result.endPosition);
      originalDiv.appendChild(highlightSpan);
      
      currentPos = result.endPosition;
    }
    
    // Add remaining text
    if (currentPos < text.length) {
      originalDiv.appendChild(document.createTextNode(text.substring(currentPos)));
    }
    
    overlay.appendChild(originalDiv);
    
    // Add revealed content
    const revealedHeader = document.createElement('h4');
    overlay.appendChild(revealedHeader);
    
    // Create table for revealed content
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '15px';
    
    // Add table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Entity Type', 'Original Content'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.style.textAlign = 'left';
      th.style.padding = '8px';
      th.style.borderBottom = '2px solid #ddd';
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Add table body
    const tbody = document.createElement('tbody');
    
    stegResults.forEach((result, index) => {
      const row = document.createElement('tr');
      row.style.backgroundColor = index % 2 === 0 ? '#f2f2f2' : 'white';
      
      // Entity type cell
      const typeCell = document.createElement('td');
      typeCell.style.padding = '8px';
      typeCell.style.borderBottom = '1px solid #ddd';
      typeCell.textContent = result.entityType;
      row.appendChild(typeCell);
      
      // Original content cell
      const contentCell = document.createElement('td');
      contentCell.style.padding = '8px';
      contentCell.style.borderBottom = '1px solid #ddd';
      contentCell.style.fontWeight = 'bold';
      contentCell.textContent = result.originalText;
      row.appendChild(contentCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    overlay.appendChild(table);
  }
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.padding = '8px 16px';
  closeButton.style.backgroundColor = '#007bff';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '4px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => document.body.removeChild(overlay);
  overlay.appendChild(closeButton);
  
  return overlay;
}

// Helper functions for masking and tokenization
function maskText(text, entityType) {
  // Replace with asterisks, preserving length, with entity type metadata
  return `[MASKED: ${entityType}:${'*'.repeat(text.length)}]`;
}

function tokenizeText(text, entityType) {
  // Replace with a token indicating the entity type and a unique ID
  const tokenId = generateSimpleHash(text);
  return `[${entityType}_TOKEN:${tokenId}]`;
}

// Generate a simple hash for the text (for tokenization)
function generateSimpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Function to detect zero-width character content
function hasZWCContent(text) {
  // Check for zero-width characters that might indicate hidden content
  const zwcPattern = /[\u200B\u200C\u200D\uFEFF]/;
  return zwcPattern.test(text);
}

// Main listener for Chrome extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageText") {
    const isGmail = window.location.hostname.includes("mail.google.com");

    let attempts = 0;
    const maxAttempts = 10;

    function tryExtractText() {
      let composeBox = null;

      if (isGmail) {
        console.log("Attempting to find Gmail compose box...");
        composeBox = document.querySelector('div[aria-label="Message Body"][role="textbox"]');
        // For received messages, also check the email body
        if (!composeBox) {
          const emailBody = document.querySelector('.a3s.aiL');
          if (emailBody) {
            composeBox = emailBody;
          }
        }
        console.log("Gmail Compose/Read Box found?", composeBox);
      }

      if (composeBox) {
        const text = composeBox.innerText.trim();
        console.log("[Content Script] Extracted text:", text);
        
        // Check if the text contains any processed content patterns
        const encryptedPattern = /\u200D[\u200B\u200C]+\u200D/g;
        const maskedPattern = /\[MASKED: ([^\]]+)\]/g;
        const tokenizedPattern = /\[([A-Z_]+)_TOKEN\]/g;
        
        const hasProcessedContent = 
          encryptedPattern.test(text) ||
          maskedPattern.test(text) ||
          tokenizedPattern.test(text) ||
          hasZWCContent(text) ||
          detectStegContent(text);
        
        sendResponse({ 
          text,
          hasProcessedContent,
          isCompose: composeBox.getAttribute('aria-label') === "Message Body" || 
                     composeBox.getAttribute('contenteditable') === "true"
        });
      } else if (attempts < maxAttempts) {
        attempts++;
        console.log(`[Content Script] Compose box not found. Retrying (${attempts})...`);

        setTimeout(tryExtractText, 300);
      } else {
        console.error("[Content Script] Failed to find compose box.");
        sendResponse({ text: "", hasProcessedContent: false, isCompose: false });
      }
    }

    tryExtractText();
    return true;
  }
  
  else if (request.action === "processText") {
    const isGmail = window.location.hostname.includes("mail.google.com");
    
    let composeBox = null;
    
    if (isGmail) {
      composeBox = document.querySelector('div[aria-label="Message Body"][role="textbox"]');
    }
    
    if (!composeBox) {
      console.error("[Content Script] Failed to find compose box for processing");
      sendResponse({ success: false });
      return true;
    }
    
    const entities = request.entities;
    const actionType = request.actionType;
    let processedText = request.originalText;
    
    // Process entities in reverse order to avoid index shifts
    entities.sort((a, b) => b.start - a.start);
    
    for (const enti of entities) {
      const before = processedText.substring(0, enti.start);
      const after = processedText.substring(enti.end);
      let replacement = '';
      
      switch (actionType) {
        case 'encrypt':
          replacement = encodeWithInvisibleSteganography(enti.text, enti.entity);
          break;
        case 'mask':
          replacement = maskText(enti.text, enti.entity);
          break;
        case 'tokenize':
          replacement = tokenizeText(enti.text, enti.entity);
          break;
        default:
          replacement = enti.text;
      }
      
      processedText = before + replacement + after;
    }
    
    console.log("About to update text to:", processedText);
    
    // Gmail handling
    composeBox.innerText = processedText;
    const inputEvent = new Event('input', { bubbles: true });
    composeBox.dispatchEvent(inputEvent);
    
    sendResponse({ success: true });
    return true;
  }
  
  else if (request.action === "restoreText") {
    const isGmail = window.location.hostname.includes("mail.google.com");
    
    let textContainer = null;
    
    if (isGmail) {
      // Try to find the email body for received emails
      textContainer = document.querySelector('.a3s.aiL');
      if (!textContainer) {
        // Fallback to compose box if we're replying
        textContainer = document.querySelector('div[aria-label="Message Body"][role="textbox"]');
      }
    }
    
    if (!textContainer) {
      console.error("[Content Script] Failed to find text container for restoration");
      sendResponse({ success: false });
      return true;
    }
    
    const text = textContainer.innerText;
    let foundHiddenContent = false;
    
    // First check for invisible steganography
    const stegResults = findAllStegContent(text);
    if (stegResults.length > 0) {
      foundHiddenContent = true;
      // Create and display the overlay
      const overlay = createStegRevealOverlay(text, stegResults);
      document.body.appendChild(overlay);
    } else {
      // Check for other encoded content patterns using compatible formats
      let foundOtherEncoding = false;
      let restoredText = text;
      
      // Check for masked content
      const maskedPattern = /\[MASKED: ([^:]+):([^\]]+)\]/g;
      let maskedMatch = maskedPattern.exec(text);
      
      if (maskedMatch) {
        foundOtherEncoding = true;
        while (maskedMatch) {
          const entityType = maskedMatch[1];
          restoredText = restoredText.replace(maskedMatch[0], `[${entityType} was masked]`);
          maskedMatch = maskedPattern.exec(text);
        }
      }
      
      // Check for tokenized content
      const tokenizedPattern = /\[([A-Z_]+)_TOKEN:([^\]]+)\]/g;
      let tokenMatch = tokenizedPattern.exec(text);
      
      if (tokenMatch) {
        foundOtherEncoding = true;
        while (tokenMatch) {
          const entityType = tokenMatch[1];
          restoredText = restoredText.replace(tokenMatch[0], `[${entityType} was tokenized]`);
          tokenMatch = tokenizedPattern.exec(text);
        }
      }
      
      if (foundOtherEncoding) {
        foundHiddenContent = true;
        
        // Create a basic overlay for other encoding types
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '20%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.backgroundColor = 'white';
        overlay.style.padding = '20px';
        overlay.style.borderRadius = '8px';
        overlay.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        overlay.style.zIndex = '10000';
        overlay.style.maxWidth = '80%';
        overlay.style.maxHeight = '80%';
        overlay.style.overflow = 'auto';
        
        const header = document.createElement('h3');
        header.textContent = 'Restored Content';
        header.style.marginTop = '0';
        
        const content = document.createElement('div');
        content.style.whiteSpace = 'pre-wrap';
        content.textContent = restoredText;
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '15px';
        closeButton.style.padding = '8px 16px';
        closeButton.onclick = () => document.body.removeChild(overlay);
        
        overlay.appendChild(header);
        overlay.appendChild(content);
        overlay.appendChild(closeButton);
        document.body.appendChild(overlay);
      }
    }
    
    // If no hidden content was found in any format
    if (!foundHiddenContent) {
      console.log("No hidden content found in the text");
      // Show notification that no hidden content was found
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.left = '50%';
      notification.style.transform = 'translateX(-50%)';
      notification.style.backgroundColor = '#f8d7da';
      notification.style.color = '#721c24';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '10000';
      notification.textContent = 'No hidden content found in this message.';
      
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
    
    sendResponse({ success: foundHiddenContent });
    return true;
  }
}); 
