document.addEventListener('DOMContentLoaded', () => {
    const loginToggle = document.getElementById('login-toggle');
    const signupToggle = document.getElementById('signup-toggle');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const loginMessage = document.getElementById('login-message');
    const signupMessage = document.getElementById('signup-message');

    function displayMessage(element, message, type) {
        element.textContent = message;
        element.className = `form-message ${type}`;
    }

    loginToggle.addEventListener('click', () => {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
    });

    signupToggle.addEventListener('click', () => {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupToggle.classList.add('active');
        loginToggle.classList.remove('active');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        // Admin login
        if (email === 'podj1234@gmail.com' && password === 'podj1234') {
            localStorage.setItem('loggedInUser', JSON.stringify({
                username: 'Admin',
                email: email,
                isAdmin: true
            }));
            displayMessage(loginMessage, 'Admin login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            return;
        }

        // Regular user login
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            displayMessage(loginMessage, 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                // Redirect back to index.html instead of landing.html
                window.location.href = 'index.html';
            }, 1000);
        } else {
            displayMessage(loginMessage, 'Invalid email or password.', 'error');
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const confirmPassword = signupForm.querySelector('input[placeholder="Confirm Password"]').value;

        if (password !== confirmPassword) {
            displayMessage(signupMessage, 'Passwords do not match.', 'error');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === email)) {
            displayMessage(signupMessage, 'User with this email already exists.', 'error');
            return;
        }

        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        displayMessage(signupMessage, 'Sign up successful! Please log in.', 'success');
        setTimeout(() => {
            loginToggle.click();
        }, 1500);
    });
});