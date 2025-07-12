document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    const header = document.querySelector('header');
    const loginSignupBtn = document.getElementById('login-signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const productCategoriesContainer = document.getElementById('product-categories-container');

    let isUserClickScrolling = false;
    let scrollTimeout;

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function addToCart(productName, price, image) {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            alert('Please login to add items to cart');
            return;
        }

        const existingItem = cart.find(item => item.name === productName);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: productName,
                price: parseFloat(price.replace('$', '')),
                image: image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Show success message
        showNotification(`${productName} added to cart!`, 'success');
        
        // Update cart display if it exists
        updateCartDisplay();
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function updateCartDisplay() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        // Update cart button if it exists
        const cartBtn = document.querySelector('.cart-btn');
        if (cartBtn) {
            cartBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> Cart (${cartCount})`;
        }
    }

    // Enhanced scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Intersection Observer for smooth animations
    const observer = new IntersectionObserver((entries) => {
        if (isUserClickScrolling) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                
                // Update navigation
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === currentSectionId) {
                        link.classList.add('active');
                    }
                });

                // Add animation class to section
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Initialize sections with animation styles
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Add cart button to header
    function addCartButton() {
        const authButtons = document.querySelector('.auth-buttons');
        const cartBtn = document.createElement('a');
        cartBtn.href = '#';
        cartBtn.className = 'auth-btn cart-btn';
        cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Cart (0)';
        cartBtn.style.marginRight = '10px';
        
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCart();
        });
        
        authButtons.insertBefore(cartBtn, authButtons.firstChild);
        updateCartDisplay();
    }

    function showCart() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            alert('Please login to view your cart');
            return;
        }

        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartItems = cart.map(item => 
            `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        alert(`Cart Contents:\n${cartItems}\n\nTotal: $${total.toFixed(2)}`);
    }

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
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            section.innerHTML = `
                <h2>${categoryName}</h2>
                <div class="carousel-container">
                    <div class="carousel ${isLeftToRight ? 'scroll-left-to-right' : 'scroll-right-to-left'}">
                        ${categoryProducts.map(product => `
                            <div class="carousel-item">
                                <img src="${product.image}" alt="${product.name}" loading="lazy">
                                <h3>${product.name}</h3>
                                <p>$${product.price.toFixed(2)}</p>
                                <button class="shop-now-btn" onclick="addToCart('${product.name}', '$${product.price.toFixed(2)}', '${product.image}')">Add to Cart</button>
                            </div>
                        `).join('')}
                        ${categoryProducts.map(product => `
                            <div class="carousel-item">
                                <img src="${product.image}" alt="${product.name}" loading="lazy">
                                <h3>${product.name}</h3>
                                <p>$${product.price.toFixed(2)}</p>
                                <button class="shop-now-btn" onclick="addToCart('${product.name}', '$${product.price.toFixed(2)}', '${product.image}')">Add to Cart</button>
                            </div>
                        `).join('')} <!-- Duplicate for seamless loop -->
                    </div>
                </div>
                <button class="cta-button view-more-btn">View More</button>
            `;
            
            productCategoriesContainer.appendChild(section);
            observer.observe(section);

            // Animate section after a short delay
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100);

            isLeftToRight = !isLeftToRight; // Alternate scroll direction
        }
    }

    // Enhanced smooth scrolling
    function smoothScrollTo(targetSection, offset = 0) {
        const headerHeight = header.offsetHeight;
        const targetOffset = targetSection.offsetTop - headerHeight - 30 + offset;
        
        window.scrollTo({
            top: targetOffset,
            behavior: 'smooth'
        });
    }

    // Navigation click handlers with enhanced UX
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            isUserClickScrolling = true;

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Update active state immediately for better UX
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                smoothScrollTo(targetSection);

                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isUserClickScrolling = false;
                }, 1000);
            } else {
                isUserClickScrolling = false;
            }
        });
    });

    // Enhanced header scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add subtle header animation
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateX(-50%) translateY(-10px)';
            header.style.opacity = '0.9';
        } else {
            header.style.transform = 'translateX(-50%) translateY(0)';
            header.style.opacity = '1';
        }
        
        lastScrollTop = scrollTop;
    });

    // Enhanced CTA button click handler
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add to cart functionality for featured products
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('shop-now-btn')) {
            const carouselItem = e.target.closest('.carousel-item');
            if (carouselItem) {
                const productName = carouselItem.querySelector('h3').textContent;
                const price = carouselItem.querySelector('p').textContent;
                const image = carouselItem.querySelector('img').src;
                
                addToCart(productName, price, image);
            }
        }
    });

    // Enhanced login status check
    function checkLoginStatus() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            loginSignupBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            
            // Add user welcome message
            const user = JSON.parse(loggedInUser);
            if (user.name) {
                logoutBtn.textContent = `Logout (${user.name})`;
            }
            
            // Add cart button for logged in users
            addCartButton();
        } else {
            loginSignupBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            
            // Remove cart button for logged out users
            const cartBtn = document.querySelector('.cart-btn');
            if (cartBtn) {
                cartBtn.remove();
            }
        }
    }

    // Enhanced logout with confirmation
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('cart'); // Clear cart on logout
            cart = [];
            
            // Add success animation
            logoutBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                logoutBtn.style.transform = 'scale(1)';
                alert('Logged out successfully!');
                window.location.href = 'index.html';
            }, 150);
        }
    });

    // Enhanced category item interactions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-item') || e.target.closest('.category-item')) {
            const categoryItem = e.target.classList.contains('category-item') ? e.target : e.target.closest('.category-item');
            
            // Add click animation
            categoryItem.style.transform = 'scale(0.98)';
            setTimeout(() => {
                categoryItem.style.transform = '';
            }, 150);
        }
    });

    // Enhanced carousel pause on hover
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        const container = carousel.closest('.carousel-container');
        
        container.addEventListener('mouseenter', () => {
            carousel.style.animationPlayState = 'paused';
        });
        
        container.addEventListener('mouseleave', () => {
            carousel.style.animationPlayState = 'running';
        });
    });

    // Initialize page
    window.addEventListener('load', () => {
        // Set initial active link
        const initialActiveLink = document.querySelector('nav ul li a[href="#home"]');
        if (initialActiveLink) {
            initialActiveLink.classList.add('active');
        }
        
        // Initialize sections
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
        
        // Initialize sample products
        initializeSampleProducts();
        
        checkLoginStatus();
        loadProductsByCategories();
        
        // Add loading animation
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Enhanced error handling
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
    });

    // Performance optimization: Debounce scroll events
    let scrollTimeoutId;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeoutId);
        scrollTimeoutId = setTimeout(() => {
            // Handle scroll-based animations here if needed
        }, 16); // ~60fps
    });

    // Make addToCart function globally available
    window.addToCart = addToCart;

    // Initialize sample products data
    function initializeSampleProducts() {
        // Clear existing products and reinitialize with new data
        // This ensures we have all the new products
        localStorage.removeItem('products');
        
        // Initialize with new sample data
            const sampleProducts = [
                // Shirts Category
                {
                    name: "Classic White Tee",
                    price: 29.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Premium Polo Shirt",
                    price: 45.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Oxford Button-Down",
                    price: 59.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Casual Flannel Shirt",
                    price: 39.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // Trousers Category
                {
                    name: "Classic Chino Pants",
                    price: 69.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Slim Fit Jeans",
                    price: 79.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Formal Dress Pants",
                    price: 89.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Cargo Pants",
                    price: 54.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // Dresses Category
                {
                    name: "Summer Floral Dress",
                    price: 59.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Elegant Cocktail Dress",
                    price: 129.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Bohemian Maxi Dress",
                    price: 89.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Little Black Dress",
                    price: 99.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // Outerwear Category
                {
                    name: "Classic Denim Jacket",
                    price: 89.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Premium Leather Jacket",
                    price: 199.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Professional Blazer",
                    price: 149.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Winter Coat",
                    price: 179.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // Shoes Category
                {
                    name: "Premium Sneakers",
                    price: 129.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Classic Dress Shoes",
                    price: 159.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Leather Ankle Boots",
                    price: 179.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Running Shoes",
                    price: 119.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // Accessories Category
                {
                    name: "Leather Crossbody Bag",
                    price: 79.99,
                    category: "Accessories",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Designer Sunglasses",
                    price: 149.99,
                    category: "Accessories",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Luxury Watch",
                    price: 299.99,
                    category: "Accessories",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Silk Scarf",
                    price: 39.99,
                    category: "Accessories",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // Additional 40 Products
                
                // More Shirts (8 additional)
                {
                    name: "Striped Button-Up Shirt",
                    price: 49.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "V-Neck Sweater",
                    price: 65.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Hooded Sweatshirt",
                    price: 55.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Turtleneck Sweater",
                    price: 75.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Denim Shirt",
                    price: 69.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Linen Shirt",
                    price: 54.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Graphic Tee",
                    price: 34.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Crew Neck Sweater",
                    price: 59.99,
                    category: "Shirts",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // More Trousers (8 additional)
                {
                    name: "Wide Leg Pants",
                    price: 84.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Pleated Trousers",
                    price: 94.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "High-Waisted Jeans",
                    price: 89.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Linen Pants",
                    price: 74.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Corduroy Pants",
                    price: 79.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Jogger Pants",
                    price: 64.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Paper Bag Waist Pants",
                    price: 89.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Straight Leg Jeans",
                    price: 94.99,
                    category: "Trousers",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // More Dresses (8 additional)
                {
                    name: "Wrap Dress",
                    price: 79.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Midi Dress",
                    price: 69.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Bodycon Dress",
                    price: 84.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Shirt Dress",
                    price: 74.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "A-Line Dress",
                    price: 94.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Pencil Dress",
                    price: 89.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Sundress",
                    price: 64.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Evening Gown",
                    price: 199.99,
                    category: "Dresses",
                    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // More Outerwear (8 additional)
                {
                    name: "Bomber Jacket",
                    price: 129.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Trench Coat",
                    price: 189.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Puffer Jacket",
                    price: 159.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Cardigan",
                    price: 79.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Peacoat",
                    price: 169.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Windbreaker",
                    price: 89.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Faux Fur Coat",
                    price: 149.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Motorcycle Jacket",
                    price: 219.99,
                    category: "Outerwear",
                    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                
                // More Shoes (8 additional)
                {
                    name: "Loafers",
                    price: 139.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Heels",
                    price: 119.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Sandals",
                    price: 89.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Oxford Shoes",
                    price: 169.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Chelsea Boots",
                    price: 189.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Slides",
                    price: 69.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Mules",
                    price: 99.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                },
                {
                    name: "Espadrilles",
                    price: 79.99,
                    category: "Shoes",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                    status: "approved"
                }
            ];
            
            localStorage.setItem('products', JSON.stringify(sampleProducts));
        }
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .cta-button {
        position: relative;
        overflow: hidden;
    }
    
    .cart-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    }
    
    .cart-btn:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
    }
`;
document.head.appendChild(style);