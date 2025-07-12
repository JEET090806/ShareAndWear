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
            <td>${product.price.toFixed(2)}</td>
            <td>${product.status}</td>
            <td>
                <button class="action-btn edit" onclick="editProduct('${product.id}')">&#9998;</button>
                <button class="action-btn delete" onclick="deleteProduct('${product.id}')">&#128465;</button>
                ${product.status === 'pending' ? `
                    <button class="action-btn approve" onclick="changeProductStatus('${product.id}', 'approved')">Approve</button>
                    <button class="action-btn reject" onclick="changeProductStatus('${product.id}', 'rejected')">Reject</button>
                ` : ''}
            </td>
        `;
        productTableBody.appendChild(row);
    });
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

    if (id) {
        const productIndex = products.findIndex(p => p.id === id);
        products[productIndex] = { id, name, image, price, category, status: products[productIndex].status };
        formTitle.textContent = 'Add New Product';
        cancelEditBtn.style.display = 'none';
    } else {
        const newProduct = {
            id: Date.now().toString(),
            name,
            image,
            price,
            category,
            status: 'pending' // Default status for new products
        };
        products.push(newProduct);
    }

    saveProducts();
    renderProductTable();
    productForm.reset();
});

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-price').value = product.price;
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
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderProductTable();
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

renderProductTable();
