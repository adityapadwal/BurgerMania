// Fetch userId from localStorage
const userId = localStorage.getItem('userId');

// Check if userId is empty
if (!userId) {
    alert('Please log in first to access this page.');
    window.location.href = './index.html'; 
}

// API endpoints
const getCartApi = "https://localhost:7126/api/CartApi";
const deleteCartProductApi = "https://localhost:7126/api/CartApi";
const placeOrderApi = 'https://localhost:7126/api/OrderApi';


const table = document.getElementById('table-body');
const totalQuantityLabel = document.getElementById('total-quantity');
const totalPriceLabel = document.getElementById('total-price');
const discountLabel = document.getElementById('discount');
const finalPriceLabel = document.getElementById('final-price');

// buttons
const placeOrderButton = document.getElementById('submit-button');
const logoutButton = document.getElementById('logout-submit-button');

let totalQuantity = 0;
let totalPrice = 0;
let discountedPrice = 0;

async function fetchCartProducts() {
    try {
        const token = getCookieValue("token"); // Get the token from the cookie
        const response = await fetch(`${getCartApi}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const cartItems = await response.json();
        populateCartTable(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }
}

function populateCartTable(cartItems) {
    cartItems.forEach(product => {
        const row = document.createElement('tr');

        const burgerType = document.createElement('td');
        burgerType.textContent = product.burgerName;

        const burgerCategory = document.createElement('td');
        burgerCategory.textContent = product.burgerCategory;

        const priceCell = document.createElement('td');
        priceCell.textContent = product.price.toFixed(2);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = product.quantity;

        const totalPriceCell = document.createElement('td');
        const totalProductPrice = product.price * product.quantity;
        totalPriceCell.textContent = totalProductPrice.toFixed(2);

        const removeCell = document.createElement('td');
        const removeButton = document.createElement('p');
        removeButton.textContent = '❌';
        removeButton.classList.add('removeButton');
        removeButton.addEventListener('click', () => {
            console.log(product.burgerId);
            removeFromCart(product.burgerId, product.burgerCategory);
        });
        removeCell.appendChild(removeButton);

        row.appendChild(burgerType);
        row.appendChild(burgerCategory);
        row.appendChild(priceCell);
        row.appendChild(quantityCell);
        row.appendChild(totalPriceCell);
        row.appendChild(removeCell);

        table.appendChild(row);

        totalQuantity += product.quantity;
        totalPrice += totalProductPrice;
    });

    updateTotals();
}

async function removeFromCart(burgerId, burgerCategory) {
    try {
        const token = getCookieValue("token"); // Get the token from the cookie
        const response = await fetch(`${deleteCartProductApi}/${userId}/${burgerId}/${burgerCategory}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            },
        });
        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
        location.reload();
    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

function updateTotals() {
    totalQuantityLabel.textContent = totalQuantity;
    totalPriceLabel.textContent = totalPrice.toFixed(2);

    if (totalPrice >= 500 && totalPrice < 1000) {
        discountLabel.textContent = '5%';
        discountedPrice = totalPrice * 0.95;
    } else if (totalPrice >= 1000) {
        discountLabel.textContent = '10%';
        discountedPrice = totalPrice * 0.90;
    } else {
        discountLabel.textContent = '0%';
        discountedPrice = totalPrice;
    }

    finalPriceLabel.textContent = discountedPrice.toFixed(2);
}

async function placeOrder() {
    try {
        const token = getCookieValue("token"); // Get the token from the cookie
        const response = await fetch(`${placeOrderApi}/${userId}`, { // Include userId in the URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            },
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to place order: ${errorMessage}`);
        }

        const order = await response.json();
        console.log('Order created:', order);

        alert('Order placed successfully!');
        window.location.href="./orders.html";
    } catch (error) {
        console.error('Error placing order:', error);
        alert(`Error placing order: ${error.message}`);
    }
}

placeOrderButton.addEventListener('click', () => {
    if (totalPrice === 0) {
        alert('You do not have any items to proceed :)');
        return false;
    }
    placeOrder();
});

fetchCartProducts(); 

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