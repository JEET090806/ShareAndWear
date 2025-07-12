const productForm = document.getElementById('product-form');
const productTableBody = document.querySelector('#product-table tbody');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let products = JSON.parse(localStorage.getItem('products')) || [];

function renderProductTable() {
    productTableBody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="product-info">
                    <img src="${product.image}" alt="${product.name}">
                    <span>${product.name}</span>
                </div>
            </td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.category || 'Uncategorized'}</td>
            <td>
                <span class="status-badge ${product.status}">${product.status}</span>
            </td>
            <td>
                <button class="action-btn edit" onclick="editProduct('${product.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                ${product.status === 'pending' ? `
                    <button class="action-btn approve" onclick="changeProductStatus('${product.id}', 'approved')" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn reject" onclick="changeProductStatus('${product.id}', 'rejected')" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </td>
        `;
        productTableBody.appendChild(row);
    });
    
    // Update product count
    document.getElementById('product-count').textContent = `${products.length} products`;
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const image = document.getElementById('product-image').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;

    if (id) {
        const productIndex = products.findIndex(p => p.id === id);
        products[productIndex] = { 
            ...products[productIndex],
            name, 
            image, 
            price, 
            category, 
            description 
        };
        formTitle.textContent = 'Add New Product';
        cancelEditBtn.style.display = 'none';
    } else {
        const newProduct = {
            id: Date.now().toString(),
            name,
            image,
            price,
            category,
            description,
            status: 'pending' // Default status for new products
        };
        products.push(newProduct);
    }

    saveProducts();
    renderProductTable();
    productForm.reset();
    document.getElementById('product-id').value = '';
});

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-description').value = product.description || '';
    formTitle.textContent = 'Edit Product';
    cancelEditBtn.style.display = 'inline-block';
}

cancelEditBtn.addEventListener('click', () => {
    productForm.reset();
    document.getElementById('product-id').value = '';
    formTitle.textContent = 'Add New Product';
    cancelEditBtn.style.display = 'none';
});

window.deleteProduct = function(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProductTable();
    }
}

window.changeProductStatus = function(id, newStatus) {
    if (newStatus === 'rejected') {
        // If rejected, delete the product
        deleteProduct(id);
    } else {
        // Otherwise, update the status
        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            products[productIndex].status = newStatus;
            saveProducts();
            renderProductTable();
        }
    }
};

// Search functionality
document.getElementById('search-products').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = productTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const productName = row.querySelector('.product-info span').textContent.toLowerCase();
        const category = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || category.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Status filter functionality
document.getElementById('status-filter').addEventListener('change', (e) => {
    const filterStatus = e.target.value;
    const rows = productTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const status = row.querySelector('.status-badge').textContent;
        
        if (filterStatus === 'all' || status === filterStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Logout functionality
window.logout = function() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}

renderProductTable();
