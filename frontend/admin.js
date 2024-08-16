// Fetch userId from localStorage
const userId = localStorage.getItem('userId');

// Check if userId is empty
if (!userId) {
    alert('Please log in first to access this page.');
    window.location.href = './index.html'; 
}

// API endpoints
const getBurgersApi = 'https://localhost:7126/api/BurgerApi';
const postAddBurgerApi = 'https://localhost:7126/api/BurgerApi';
const putBurgerApi = 'https://localhost:7126/api/BurgerApi'; // Ensure this is correct
const deleteBurgerApi = 'https://localhost:7126/api/BurgerApi';

// Buttons
const logoutButton = document.getElementById('logout-submit-button');

// Fetch burgers when the page loads
document.addEventListener('DOMContentLoaded', fetchBurgers);

// Fetch burgers from the server
async function fetchBurgers() {
    try {
        const token = getCookieValue("token");
        const response = await fetch(getBurgersApi, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const burgers = await response.json();
        renderBurgers(burgers);
    } catch (error) {
        console.error('Error fetching burgers:', error);
    }
}

// Render burgers dynamically
function renderBurgers(burgers) {
    const burgerList = document.getElementById('burger-list');
    burgerList.innerHTML = ''; 

    burgers.forEach(burger => {
        const burgerCard = document.createElement('div');
        burgerCard.className = 'burger-card';
        burgerCard.innerHTML = `
            <h3>${burger.burgerName}</h3>
            <p class="burger-id">ID: ${burger.burgerId}</p>
            <img src="${burger.burgerImageUrl}" alt="${burger.burgerName}" style="width:100%; height:auto;">
            <p>Categories: ${JSON.stringify(burger.burgerCategories, null, 2)}</p>
            <button onclick="deleteBurger('${burger.burgerId}')">Delete</button>
        `;
        burgerList.appendChild(burgerCard);
    });
}

// Add new burger
document.getElementById('burger-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const burgerName = document.getElementById('burger-name').value;
    const burgerImageUrl = document.getElementById('burger-image-url').value;
    const burgerCategories = JSON.parse(document.getElementById('burger-categories').value);

    const burger = {
        burgerName: burgerName,
        burgerImageUrl: burgerImageUrl,
        burgerCategories: burgerCategories
    };

    try {
        const token = getCookieValue("token");
        const response = await fetch(`${postAddBurgerApi}/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(burger)
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        alert('Burger added successfully!');
        window.location.href="./admin.html";
    } catch (error) {
        console.error('Error adding burger:', error);
    }
});

// Update burger
document.getElementById('edit-burger-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const userId = localStorage.getItem('userId');
    const burgerId = document.getElementById('edit-burger-id').value;
    const burgerName = document.getElementById('edit-burger-name').value;
    const burgerImageUrl = document.getElementById('edit-burger-image-url').value;
    const burgerCategoriesString = document.getElementById('edit-burger-categories').value;
    const burgerCategories = JSON.parse(burgerCategoriesString); // Parse the categories string to an object

    const burger = {
        burgerName: burgerName,
        burgerImageUrl: burgerImageUrl,
        burgerCategories: burgerCategories // Send categories as an object
    };

    try {
        const token = getCookieValue("token");
        const response = await fetch(`${putBurgerApi}/${userId}/${burgerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(burger)
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        alert('Burger updated successfully!');
        window.location.href="./admin.html";
    } catch (error) {
        console.error('Error updating burger:', error);
    }
});

// Delete burger
async function deleteBurger(burgerId) {
    try {
        const token = getCookieValue("token");
        const response = await fetch(`${deleteBurgerApi}/${burgerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        alert('Burger deleted successfully!');
        window.location.href="./admin.html";
    } catch (error) {
        console.error('Error deleting burger:', error);
    }
}

// Helper function to get the value of a cookie
function getCookieValue(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${cookieName}=`)) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

// Logout functionality
logoutButton.addEventListener('click', function() {
    console.log("Handling user logout...");
    localStorage.clear();
    document.cookie = 'token=; Max-Age=0; path=/; SameSite=Lax;';
    alert('Logout successful!');
    window.location.href = './index.html';
});