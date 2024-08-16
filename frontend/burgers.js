// Fetch userId from localStorage
const userId = localStorage.getItem('userId');

// Check if userId is empty
if (!userId) {
    alert('Please log in first to access this page.');
    window.location.href = './index.html'; 
}

// API endpoints
const getBurgersApi = 'https://localhost:7126/api/BurgerApi';
const postAddToCartApi = 'https://localhost:7126/api/CartApi';

// buttons
const addToCartButton = document.getElementById('add-to-cart-button');
const logoutButton = document.getElementById('logout-submit-button');

// Call the function to fetch burgers when the page loads
document.addEventListener('DOMContentLoaded', fetchBurgers);

// Cart product structure
class Burger {
    constructor(burgerId, burgerName, burgerCategory, quantity, price) {
        this.burgerId = burgerId;
        this.burgerName = burgerName;
        this.burgerCategory = burgerCategory;
        this.quantity = quantity;
        this.price = price;
    }
}

// Fetch burgers from the server
let burgers = []; // Declare this at a higher scope
async function fetchBurgers() {
    try {
        const token = getCookieValue("token"); // Get the token from the cookie
        const response = await fetch(getBurgersApi, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        burgers = await response.json(); // Store the fetched burgers
        if (!Array.isArray(burgers) || burgers.length === 0) {
            console.error('No burgers found in the API response');
            return;
        }
        renderBurgers(burgers);
    } catch (error) {
        console.error('Error fetching burgers:', error);
    }
}

// Render burgers dynamically - new
function renderBurgers(burgers) {
    const burgerList = document.getElementById('burger-list');
    burgerList.innerHTML = ''; // Clear existing burgers

    burgers.forEach(burger => {
        const burgerCard = document.createElement('div');
        burgerCard.className = 'burger-card';

        // Generate category options from the burgerCategories object
        const categoryOptions = Object.entries(burger.burgerCategories)
            .map(([category, price]) => `<option value="${category}">${category} - Rs. ${price}</option>`)
            .join('');

        burgerCard.innerHTML = `
            <img src="${burger.burgerImageUrl}" alt="${burger.burgerName}">
            <h3>${burger.burgerName}</h3>
            <label for="category-${burger.burgerId}">Category:</label>
            <select id="category-${burger.burgerId}">
                ${categoryOptions}
            </select>
            <label for="quantity-${burger.burgerId}">Quantity:</label>
            <input type="number" id="quantity-${burger.burgerId}" min="1" max="5" value="1">
            <button onclick="addToCart('${burger.burgerId}', '${burger.burgerName}', 'category-${burger.burgerId}', 'quantity-${burger.burgerId}')">Add to Cart</button>
        `;
        burgerList.appendChild(burgerCard);
    });
}

// Adding products to cart
async function addToCart(burgerId, burgerName, categoryId, quantityId) {
    const burgerCategory = document.getElementById(categoryId).value;
    const quantity = parseInt(document.getElementById(quantityId).value);
    
    if (quantity > 5) {
        alert(`Sorry, you cannot buy more than 5 burgers!`);
        return false;
    }
    
    // Get the price dynamically from the burger data
    const burger = burgers.find(b => b.burgerId === burgerId);
    const price = burger.burgerCategories[burgerCategory];

    const burgerItem = {
        burgerId: burgerId,
        burgerName: burgerName,
        burgerCategory: burgerCategory,
        quantity: quantity,
        price: price,
        userId: userId // Include userId here
    };
    await pushCartToServer(burgerItem);
}

// Send cart data to the server
async function pushCartToServer(burger) {
    try {
        const token = getCookieValue('token'); // get token from cookie
        const response = await fetch(`${postAddToCartApi}/${burger.userId}`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // including token in authorization header
            },
            body: JSON.stringify(burger)
        });

        if (!response.ok) {
            throw new Error('Failed to add burger to cart');
        }

        alert(`Added ${burger.quantity} ${burger.burgerCategory} ${burger.burgerName} to cart`);
    } catch (error) {
        console.error('There was a problem with the POST operation:', error);
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

addToCartButton.addEventListener('click', redirectToCheckoutPage);

function redirectToCheckoutPage() {
    alert(`Redirecting to the checkout page...`);
    window.location.href = './checkout.html'; // Redirect to the /checkout page
}

// Logout functionality
function checkUserIdInLocalStorage(userId)
{
    return localStorage.getItem(`${userId}`);
}
function checkTokenInCookies(cookieName)
{
    // Get all cookies as a single string
    const cookies = document.cookie;

    // Check if the specified cookie exists
    return cookies.split(';').some(cookie => cookie.trim().startsWith(`${cookieName}=`));
}
logoutButton.addEventListener('click', function() {
    console.log("Handling user logout...");
    if(checkUserIdInLocalStorage("userId") && checkTokenInCookies("token"))
    {
        // clear local storage
        localStorage.clear();
        // clear cookie
        document.cookie = 'token=; Max-Age=0; path=/; SameSite=Lax;';
        // redirect to home page
        alert('Logout successful!');
        window.location.href = './index.html';
    }
});

// Toggling visibility of logout
function toggleLogoutButton() {
    const logoutButton = document.getElementById('logout-submit-button');
    
    // Check if userId exists in localStorage and token exists in cookies
    if (checkUserIdInLocalStorage('userId') && checkTokenInCookies('token')) {
        logoutButton.classList.remove('hidden'); // Show the button
    } else {
        logoutButton.classList.add('hidden'); // Hide the button
    }
}

// Call the toggle function on page load
document.addEventListener('DOMContentLoaded', toggleLogoutButton);