if (!document.getElementById("outer-container")) {

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  const outerContainer = document.createElement("div");
  outerContainer.id = "outer-container";
  outerContainer.innerHTML = `
    <div class="modal-header" id="note-header">
      <span>Notes</span>
      <div class="button-icon-group">
         <button class="button-icon" id="toggle-btn">

        <div class="svg-animation-container">

            <svg id="collapse-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"
                xmlns="http://www.w3.org/2000/svg" style="color: inherit;">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M6 1V1.75V5C6 5.55229 5.55228 6 5 6H1.75H1V4.5H1.75H4.5V1.75V1H6ZM14.25 6H15V4.5H14.25H11.5V1.75V1H10V1.75V5C10 5.55228 10.4477 6 11 6H14.25ZM10 14.25V15H11.5V14.25V11.5H14.29H15.04V10H14.29H11C10.4477 10 10 10.4477 10 11V14.25ZM1.75 10H1V11.5H1.75H4.5V14.25V15H6V14.25V11C6 10.4477 5.55229 10 5 10H1.75Z"
                    fill="currentColor" />
            </svg>
            
            <svg id="expand-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"
                xmlns="http://www.w3.org/2000/svg" style="color: inherit;">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M1 5.25V6H2.5V5.25V2.5H5.25H6V1H5.25H2C1.44772 1 1 1.44772 1 2V5.25ZM5.25 14.9994H6V13.4994H5.25H2.5V10.7494V9.99939H1V10.7494V13.9994C1 14.5517 1.44772 14.9994 2 14.9994H5.25ZM15 10V10.75V14C15 14.5523 14.5523 15 14 15H10.75H10V13.5H10.75H13.5V10.75V10H15ZM10.75 1H10V2.5H10.75H13.5V5.25V6H15V5.25V2C15 1.44772 14.5523 1 14 1H10.75Z"
                    fill="currentColor" />
            </svg>

        </div>

    </button>

 <button class="button-icon" id="close-btn">

        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: inherit;">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z" fill="currentColor"/>
</svg>


    </button>

      </div>
    </div>
    <div id="note-content">
      <textarea id="note-text" placeholder="Write your note..."></textarea>
    </div>
    <div id="note-footer">
      <div>
        <button id="clear-note">Clear</button>
        <button id="copy-note">Copy</button>
      </div>
    </div>
  `;
  document.body.appendChild(outerContainer);

  // const header = outerContainer.querySelector("#note-header");
  const textarea = outerContainer.querySelector("#note-text");

  // Debounced save
  const debouncedSave = debounce((text) => {
    chrome.storage.local.set({ note: text });
  }, 2000);

  // Load existing note
  chrome.storage.local.get("note", (data) => {
    if (data.note) textarea.value = data.note;
  });

  // Autosave input
  textarea.addEventListener("input", async (e) => {
    let text = textarea.value;
    if (text.includes("@tab")) {
      const tabInfo = await getCurrentTabInfo();
      const markdownLink = `[${tabInfo.title}](${tabInfo.url})`;
      text = text.replace("@tab", markdownLink);
      textarea.value = text;
    }
    debouncedSave(text);
  });

  const clearBtn = outerContainer.querySelector("#clear-note");
  const copyBtn = outerContainer.querySelector("#copy-note");
  const toggleBtn = outerContainer.querySelector("#toggle-btn");
  const toggleBtnCondenseSvg = toggleBtn.querySelector("#collapse-icon");
  const toggleBtnExpandSvg = toggleBtn.querySelector("#expand-icon");
  const closeBtn = outerContainer.querySelector("#close-btn");
  const content = outerContainer.querySelector("#note-content");
  const footer = outerContainer.querySelector("#note-footer");

  let isCollapsed = false;

  // Clear note
  clearBtn.addEventListener("click", () => {
    textarea.value = "";
    chrome.storage.local.remove("note");
  });

  // Copy to clipboard
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(textarea.value);
  });

  // Collapse / expand
  toggleBtn.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      content.style.display = "none";
      footer.style.display = "none";
      outerContainer.style.height = "40px";
      // toggleBtn.textContent = "➕";
      toggleBtnCondenseSvg.style.opacity = "0";
      toggleBtnExpandSvg.style.opacity = "1";
    } else {
      content.style.display = "block";
      footer.style.display = "flex";
      outerContainer.style.height = "600px";
      // toggleBtn.textContent = "➖";
      toggleBtnCondenseSvg.style.opacity = "1";
      toggleBtnExpandSvg.style.opacity = "0";
    }
  });

  // Close outerContainer
  closeBtn.addEventListener("click", () => outerContainer.remove());

  // Drag logic
  let isDragging = false;
  let offsetX, offsetY;

  outerContainer.addEventListener("mousedown", (e) => {
    if (e.target === toggleBtn || e.target === closeBtn) return;
    isDragging = true;
    const rect = outerContainer.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    outerContainer.style.left = `${e.clientX - offsetX}px`;
    outerContainer.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });
}

async function getCurrentTabInfo() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "get-tab-info" }, (response) => {
      resolve(response);
    });
  });
}
