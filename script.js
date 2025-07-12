document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    const header = document.querySelector('header');
    const loginSignupBtn = document.getElementById('login-signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const productCategoriesContainer = document.getElementById('product-categories-container');

    let isUserClickScrolling = false;
    let scrollTimeout;

    function loadProductsByCategories() {
        const allProducts = JSON.parse(localStorage.getItem('products')) || [];
        const approvedProducts = allProducts.filter(product => product.status === 'approved');

        const categories = {};
        approvedProducts.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });

        productCategoriesContainer.innerHTML = ''; // Clear existing content
        let isLeftToRight = true;

        for (const categoryName in categories) {
            const categoryProducts = categories[categoryName];

            const section = document.createElement('section');
            section.className = 'product-category-section';
            section.innerHTML = `
                <h2>${categoryName}</h2>
                <div class="carousel-container">
                    <div class="carousel ${isLeftToRight ? 'scroll-left-to-right' : 'scroll-right-to-left'}">
                        ${categoryProducts.map(product => `
                            <div class="carousel-item">
                                <img src="${product.image}" alt="${product.name}">
                                <h3>${product.name}</h3>
                                <p>${product.price.toFixed(2)}</p>
                            </div>
                        `).join('')}
                        ${categoryProducts.map(product => `
                            <div class="carousel-item">
                                <img src="${product.image}" alt="${product.name}">
                                <h3>${product.name}</h3>
                                <p>${product.price.toFixed(2)}</p>
                            </div>
                        `).join('')} <!-- Duplicate for seamless loop -->
                    </div>
                </div>
                <button class="cta-button view-more-btn">View More</button>
            `;
            productCategoriesContainer.appendChild(section);
            observer.observe(section); // Observe the newly created section

            isLeftToRight = !isLeftToRight; // Alternate scroll direction
        }
    }

    const observer = new IntersectionObserver(entries => {
        if (isUserClickScrolling) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === currentSectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.7 });

    // Initial observation of static sections (if any)
    sections.forEach(section => {
        observer.observe(section);
    });

    window.addEventListener('load', () => {
        const initialActiveLink = document.querySelector('nav ul li a[href="#home"]');
        if (initialActiveLink) {
            initialActiveLink.classList.add('active');
        }
        checkLoginStatus();
        loadProductsByCategories(); // Load products on page load
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            isUserClickScrolling = true;

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const offset = targetSection.offsetTop - headerHeight - 30;

                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });

                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isUserClickScrolling = false;
                }, 1000);
            } else {
                isUserClickScrolling = false;
            }
        });
    });

    function checkLoginStatus() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            loginSignupBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginSignupBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        alert('Logged out successfully!');
        window.location.href = 'index.html';
    });
});