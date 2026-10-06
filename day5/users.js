const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Store the fetched users globally so we can filter them locally later
let allUsers = []; 

function renderUsers(list) {
    usersList.innerHTML = ""; // Wipe the current list clean

    // Handle the empty filter state
    if (list.length === 0 && filterInput.value.trim() !== "") {
        usersList.innerHTML = "<li>No users match your filter.</li>";
        return;
    }

    // Build the DOM elements safely using textContent
    list.forEach(user => {
        const li = document.createElement("li");
        
        // Extracting name, email, city (nested in address), and company name (nested in company)
        const nameAndEmail = `${user.name} (${user.email})`;
        const city = `City: ${user.address.city}`;
        const company = `Company: ${user.company.name}`;
        
        li.textContent = `${nameAndEmail} | ${city} | ${company}`;
        usersList.appendChild(li);
    });
}

loadBtn.addEventListener("click", async () => {
    // UI Loading State
    statusText.textContent = "Loading users...";
    loadBtn.disabled = true;
    usersList.innerHTML = "";
    filterInput.value = ""; // Reset the filter input on a fresh load

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }
        
        allUsers = await response.json();
        renderUsers(allUsers);
        
        // UI Success State
        statusText.textContent = `Successfully loaded ${allUsers.length} users.`;
        
    } catch (error) {
        // UI Error State
        statusText.textContent = "Could not load users. Please try again.";
        console.error("Fetch failed:", error);
    } finally {
        // Always release the button lock
        loadBtn.disabled = false;
    }
});

filterInput.addEventListener("input", () => {
    const searchTerm = filterInput.value.trim().toLowerCase();
    
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );
    
    renderUsers(filteredUsers);
});