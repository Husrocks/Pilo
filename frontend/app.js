// let products = []; // Start empty
// let cart = JSON.parse(localStorage.getItem('purely_cart')) || [];

// // Fetch products from FastAPI
// async function loadProducts() {
//     try {
//         const response = await fetch('http://localhost:8000/products');
//         const data = await response.json();
//         products = data.products; // Assign API data to our variable
//         renderProducts(products); // Render them on screen
//     } catch (error) {
//         console.error("Error loading products:", error);
//         document.getElementById('product-grid').innerHTML = '<p>Error loading store data. Is the backend running?</p>';
//     }
// }
// // 1. Mock Data: 10 Artisan Dairy Products
const products = [
    { id: 1, name: "Farmhouse Whole Milk", price: 4.50, category: "milk", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Skimmed Cow's Milk", price: 3.80, category: "milk", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Aged Cheddar Block", price: 8.50, category: "cheese", img: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=300&q=80" },
    { id: 4, name: "Fresh Mozzarella", price: 6.00, category: "cheese", img: "https://images.unsplash.com/photo-1599557456722-d7b1d120a1db?auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Artisan Swiss Cheese", price: 9.20, category: "cheese", img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=300&q=80" },
    { id: 6, name: "Plain Greek Yogurt", price: 5.00, category: "yogurt", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80" },
    { id: 7, name: "Honey Vanilla Yogurt", price: 5.50, category: "yogurt", img: "https://images.unsplash.com/photo-1574624644081-344cb89d97f2?auto=format&fit=crop&w=300&q=80" },
    { id: 8, name: "Unsalted Churned Butter", price: 4.20, category: "butter", img: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=300&q=80" },
    { id: 9, name: "Garlic Herb Butter", price: 4.80, category: "butter", img: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=300&q=80" },
    { id: 10, name: "Rich Heavy Cream", price: 3.50, category: "milk", img: "https://images.unsplash.com/photo-1593333333333-placeholder?auto=format&fit=crop&w=300&q=80" } // Placeholder for heavy cream
];

 let cart = JSON.parse(localStorage.getItem('purely_cart')) || [];

// DOM Elements
const grid = document.getElementById('product-grid');
const searchBar = document.getElementById('search-bar');
const catBtns = document.querySelectorAll('.cat-btn');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const cartTotal = document.getElementById('cart-total');

// 2. Render Products
function renderProducts(items) {
    grid.innerHTML = '';
    if(items.length === 0) {
        grid.innerHTML = '<p>No dairy products found.</p>';
        return;
    }
    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}" class="product-img">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

// 3. Search and Filter Logic
searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered);
});

catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // UI update
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter logic
        const category = btn.dataset.category;
        if (category === 'all') {
            renderProducts(products);
        } else {
            const filtered = products.filter(p => p.category === category);
            renderProducts(filtered);
        }
    });
});

// 4. Cart Logic
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    // Open cart to show user it was added
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('purely_cart', JSON.stringify(cart));
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <small>$${item.price.toFixed(2)} x ${item.quantity}</small>
            </div>
            <button onclick="removeFromCart(${item.id})" style="color:red; border:none; background:none; cursor:pointer;">Remove</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartBadge.innerText = count;
    cartTotal.innerText = total.toFixed(2);
}

// 5. Cart UI Toggles
cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
});

closeCartBtn.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

function closeCart() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// Init
// Init
loadProducts(); // Call the fetch function instead of renderProducts(products) directly
updateCartUI();
// renderProducts(products);
// updateCartUI();

document.getElementById('checkout-btn').addEventListener('click', async () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch('http://localhost:8000/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: cart, total: total })
        });
        
        const result = await response.json();
        alert(result.message + " Order ID: " + result.order_id);
        
        // Clear cart after successful checkout
        cart = [];
        saveCart();
        updateCartUI();
        closeCart();
    } catch (error) {
        alert("Checkout failed. Make sure the backend is running.");
        console.error(error);
    }
});