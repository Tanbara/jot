if (!document.getElementById("note-sidebar")) {

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  const sidebar = document.createElement("div");
  sidebar.id = "note-sidebar";
  sidebar.innerHTML = `
    <div class="modal-header" id="note-header">
      <span>Notes</span>
      <div class="button-icon-group">
        <button class="button-icon" id="toggle-btn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M6 1V1.75V5C6 5.55229 5.55228 6 5 6H1.75H1V4.5H1.75H4.5V1.75V1H6ZM14.25 6H15V4.5H14.25H11.5V1.75V1H10V1.75V5C10 5.55228 10.4477 6 11 6H14.25ZM10 14.25V15H11.5V14.25V11.5H14.29H15.04V10H14.29H11C10.4477 10 10 10.4477 10 11V14.25ZM1.75 10H1V11.5H1.75H4.5V14.25V15H6V14.25V11C6 10.4477 5.55229 10 5 10H1.75Z" fill="#1B1B1B"/>
</svg>

        </button>
        <button class="button-icon" id="close-btn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z" fill="#1B1B1B"/>
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
  document.body.appendChild(sidebar);

  const header = sidebar.querySelector("#note-header");
  const textarea = sidebar.querySelector("#note-text");

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

  const clearBtn = sidebar.querySelector("#clear-note");
  const copyBtn = sidebar.querySelector("#copy-note");
  const toggleBtn = sidebar.querySelector("#toggle-btn");
  const closeBtn = sidebar.querySelector("#close-btn");
  const content = sidebar.querySelector("#note-content");
  const footer = sidebar.querySelector("#note-footer");

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
      sidebar.style.height = "40px";
      toggleBtn.textContent = "➕";
    } else {
      content.style.display = "block";
      footer.style.display = "flex";
      sidebar.style.height = "600px";
      toggleBtn.textContent = "➖";
    }
  });

  // Close sidebar
  closeBtn.addEventListener("click", () => sidebar.remove());

  // Drag logic
  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener("mousedown", (e) => {
    if (e.target === toggleBtn || e.target === closeBtn) return;
    isDragging = true;
    const rect = sidebar.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    sidebar.style.left = `${e.clientX - offsetX}px`;
    sidebar.style.top = `${e.clientY - offsetY}px`;
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
