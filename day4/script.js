const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

const DRAFT_KEY = "day4_draft";
const THEME_KEY = "day4_theme";

function updateCounts() {
    const text = textarea.value;
    const length = text.length;
    
    charCount.textContent = `${length} / 200 characters`;
    
    charCount.classList.remove("warning", "over");
    if (length > 200) {
        charCount.classList.add("over");
    } else if (length > 180) {
        charCount.classList.add("warning");
    }
    
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const wordLabel = words === 1 ? "word" : "words";
    wordCount.textContent = `${words} ${wordLabel}`;
}

function clearAll() {
    textarea.value = "";
    localStorage.removeItem(DRAFT_KEY);
    updateCounts();
    textarea.focus();
}

textarea.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem(DRAFT_KEY, textarea.value);
});

textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearAll();
    }
});

clearBtn.addEventListener("click", clearAll);

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "Light mode";
        localStorage.setItem(THEME_KEY, "dark");
    } else {
        themeToggle.textContent = "Dark mode";
        localStorage.setItem(THEME_KEY, "light");
    }
});

function init() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "Light mode";
    }
    
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
        textarea.value = savedDraft;
    }
    
    updateCounts();
}

init();