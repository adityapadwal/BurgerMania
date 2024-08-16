// API endpoints
const postRegisterUser = "https://localhost:7126/api/UserApi/register";
const postLoginUser = "https://localhost:7126/api/UserApi/login"; 

// Buttons
const loginButton = document.getElementById('login-submit-button');
const registerButton = document.getElementById('register-submit-button');
const logoutButton = document.getElementById('logout-submit-button');

// Function to validate user input
function validateUserInput(username, mobilenumber) {
    if (!username || !mobilenumber) {
        alert('Username and mobilenumber cannot be empty.');
        return false;
    }
    if (mobilenumber.length < 10) {
        alert('mobilenumber must be at least 10 characters long.');
        return false;
    }
    return true;
}

// Register User
registerButton.addEventListener('click', async function() {
    const username = document.getElementById('username').value;
    const mobilenumber = document.getElementById('mobilenumber').value;

    if (!validateUserInput(username, mobilenumber)) return;

    const user = {
        UserName: username,
        MobileNumber: mobilenumber,
        Role: "customer"
    };

    try {
        const response = await fetch(postRegisterUser, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            alert('User registered successfully! Please log in.');
            window.location.href = './index.html';
        } else {
            alert('Registration failed. Please try again.');
            window.location.href = './index.html';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while registering the user.');
    }
});

// Login User
loginButton.addEventListener('click', async function() {
    const username = document.getElementById('username').value;
    const mobilenumber = document.getElementById('mobilenumber').value;

    if (!validateUserInput(username, mobilenumber)) return;

    const user = {
        UserName: username,
        MobileNumber: mobilenumber
    };

    try {
        console.log(user);
        const response = await fetch(postLoginUser, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            const userData = await response.json();
            if(userData.userId) {
                localStorage.setItem('userId', userData.userId); // store userId in localStorage
            }
            if(userData.token) {
                document.cookie = `token=${userData.token}; path=/; SameSite=None; Secure`;
            }
            alert('Login successful!');
            if(userData.role === "admin")
            {
                // redirect to admin page
                window.location.href = './admin.html'
            }
            else
            {
                // redirect to burgers page
                window.location.href = './burgers.html';
            }
        } else {
            // Handle specific error responses
            const errorMessage = await response.text(); // Get the error message from the response
            if (response.status === 404) {
                alert('Login failed. User not found. Please check your credentials.');
            } else {
                alert(`Login failed: ${errorMessage || 'Please try again later.'}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
    }
});

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

// Set the playback speed to half speed
const video = document.getElementById('myVideo');
video.playbackRate = 0.75; // Slow down the video


