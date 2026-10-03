// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word)
// Returns an array of notes whose text contains word, ignoring case. Uses filter, toLowerCase, and includes.
function searchNotes(word) {
    const query = word.toLowerCase();
    return notes.filter(note => note.text.toLowerCase().includes(query));
}

// 2. longestNote()
// Returns the note object with most characters, or null if empty. Handles empty array first.
function longestNote() {
    if (notes.length === 0) {
        return null;
    }
    
    let longest = notes[0];
    for (let i = 1; i < notes.length; i++) {
        if (notes[i].text.length > longest.text.length) {
            longest = notes[i];
        }
    }
    return longest;
}

// 3. countByCategory()
// Returns an object counting notes per category. Loops over notes and increases counter.
function countByCategory() {
    let counts = {};
    for (let i = 0; i < notes.length; i++) {
        let cat = notes[i].category;
        if (counts[cat]) {
            counts[cat]++;
        } else {
            counts[cat] = 1;
        }
    }
    return counts;
}

// 4. getSummary()
// Returns a sentence summary. Uses countByCategory, a template literal, and pluralizes "note"/"notes".
function getSummary() {
    const counts = countByCategory();
    const totalNotes = notes.length;
    const noteWord = totalNotes === 1 ? "note" : "notes";
    
    let categoriesArray = [];
    for (let category in counts) {
        categoriesArray.push(`${counts[category]} ${category}`);
    }
    const categoriesString = categoriesArray.join(", ");
    
    return `${totalNotes} ${noteWord}: ${categoriesString}.`;
}

// 5. isDuplicate(text)
// Returns true if note exists. Uses some, compares trimmed lower-case text.
function isDuplicate(text) {
    const formattedText = text.trim().toLowerCase();
    return notes.some(note => note.text.trim().toLowerCase() === formattedText);
}

// 6. addNote(text, category)
// Checks length (1-200), checks category, checks duplicate. Returns true/false and logs reason.
function addNote(text, category) {
    const trimmedText = text.trim();
    const validCategories = ["personal", "work", "study"];
    
    if (trimmedText.length < 1 || trimmedText.length > 200) {
        console.log("Failed: Note text must be between 1 and 200 characters.");
        return false;
    }
    if (!validCategories.includes(category)) {
        console.log("Failed: Category must be one of personal, work, or study.");
        return false;
    }
    if (isDuplicate(trimmedText)) {
        console.log("Failed: This note is already a duplicate.");
        return false;
    }
    
    const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
    notes.push({ id: newId, text: trimmedText, category: category });
    return true;
}


// --- TESTS ---

console.log("--- 1. searchNotes ---");
// Normal Case
console.log(searchNotes("javascript")); 
// Expected: [ { id: 4, text: 'Revise JavaScript arrays', category: 'study' } ]
// Edge Case: No matches found
console.log(searchNotes("python")); 
// Expected: []

console.log("--- 2. longestNote ---");
// Normal Case
console.log(longestNote()); 
// Expected: { id: 3, text: 'Email the project report to Grace', category: 'work' }
// Edge Case: Empty array
let originalNotes = [...notes]; // Backup notes
notes = []; 
console.log(longestNote()); 
// Expected: null
notes = [...originalNotes]; // Restore notes

console.log("--- 3. countByCategory ---");
// Normal Case
console.log(countByCategory()); 
// Expected: { personal: 2, study: 2, work: 1 }
// Edge Case: Testing after an addition
notes.push({ id: 99, text: "Go to the gym", category: "personal" });
console.log(countByCategory()); 
// Expected: { personal: 3, study: 2, work: 1 }
notes.pop(); // Remove the temporary note

console.log("--- 4. getSummary ---");
// Normal Case
console.log(getSummary()); 
// Expected: "5 notes: 2 personal, 2 study, 1 work."
// Edge Case: Exactly 1 note
notes = [{ id: 1, text: "Just one note", category: "study" }];
console.log(getSummary()); 
// Expected: "1 note: 1 study."
notes = [...originalNotes]; // Restore notes

console.log("--- 5. isDuplicate ---");
// Normal Case
console.log(isDuplicate("call mum")); 
// Expected: true
// Edge Case: Handles weird capitalization and extra spaces
console.log(isDuplicate("   bUy MiLk and BREAD   ")); 
// Expected: true
console.log(isDuplicate("Walk the dog")); 
// Expected: false

console.log("--- 6. addNote ---");
// Normal Case
console.log(addNote("Read HTML documentation", "study")); 
// Expected: true (Note added successfully)
// Edge Case 1: Empty text
console.log(addNote("   ", "personal")); 
// Expected: false (Logs: Failed: Note text must be between 1 and 200 characters.)
// Edge Case 2: Invalid category
console.log(addNote("Fix car", "errand")); 
// Expected: false (Logs: Failed: Category must be one of personal, work, or study.)
// Edge Case 3: Duplicate entry
console.log(addNote("Call mum", "personal")); 
// Expected: false (Logs: Failed: This note is already a duplicate.)