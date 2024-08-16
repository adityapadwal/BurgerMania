// Fetch userId from localStorage
const userId = localStorage.getItem('userId');

// Check if userId is empty
if (!userId) {
    alert('Please log in first to access this page.');
    window.location.href = './index.html'; 
}

// API endpoints
const ordersApi = "https://localhost:7126/api/OrderApi/orders";

// buttons
const logoutButton = document.getElementById('logout-submit-button');

// Fetch user orders
async function fetchOrders() {
    try {
        const token = getCookieValue("token");
        const response = await fetch(`${ordersApi}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

// Display orders
function displayOrders(orders) {
    const tableBody = document.getElementById('table-body');
    orders.forEach(order => {
        const row = document.createElement('tr');

        // Create a unique ID for the product details section
        const productDetailsId = `product-details-${order.orderId}`;

        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.totalQuantity}</td>
            <td>Rs. ${order.totalPrice.toFixed(2)}</td>
            <td>${(order.discount * 100).toFixed(0)}%</td>
            <td>Rs. ${order.finalPrice.toFixed(2)}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
                <button onclick="toggleProductDetails('${productDetailsId}')">Show Products</button>
            </td>
        `;
        tableBody.appendChild(row);

        // Create a hidden table for product details
        const productDetailsRow = document.createElement('tr');
        productDetailsRow.id = productDetailsId;
        productDetailsRow.style.display = 'none'; // Initially hidden
        productDetailsRow.innerHTML = `
            <td colspan="7" class="product-list">
                <table>
                    <thead>
                        <tr>
                            <th>Burger Name</th>
                            <th>Burger Category</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                            <tr>
                                <td>${item.burgerName}</td>
                                <td>${item.burgerCategory}</td>
                                <td>${item.quantity}</td>
                                <td>Rs. ${item.price.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </td>
        `;
        tableBody.appendChild(productDetailsRow);
    });
}

function toggleProductDetails(productDetailsId) {
    const detailsRow = document.getElementById(productDetailsId);
    if (detailsRow.style.display === 'none') {
        detailsRow.style.display = 'table-row'; // Show the product details
    } else {
        detailsRow.style.display = 'none'; // Hide the product details
    }
}

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

// Fetch orders when the script loads
fetchOrders();

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