let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
    const query = word.toLowerCase();
    return notes.filter(note => note.text.toLowerCase().includes(query));
}

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

function isDuplicate(text) {
    const formattedText = text.trim().toLowerCase();
    return notes.some(note => note.text.trim().toLowerCase() === formattedText);
}

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

console.log(searchNotes("javascript")); 
console.log(searchNotes("python")); 

console.log(longestNote()); 
let originalNotes = [...notes];
notes = []; 
console.log(longestNote()); 
notes = [...originalNotes]; 

console.log(countByCategory()); 
notes.push({ id: 99, text: "Go to the gym", category: "personal" });
console.log(countByCategory()); 
notes.pop(); 

console.log(getSummary()); 
notes = [{ id: 1, text: "Just one note", category: "study" }];
console.log(getSummary()); 
notes = [...originalNotes]; 

console.log(isDuplicate("call mum")); 
console.log(isDuplicate("   bUy MiLk and BREAD   ")); 
console.log(isDuplicate("Walk the dog")); 

console.log(addNote("Read HTML documentation", "study")); 
console.log(addNote("   ", "personal")); 
console.log(addNote("Fix car", "errand")); 
console.log(addNote("Call mum", "personal"));