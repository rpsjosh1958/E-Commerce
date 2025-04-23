let searchForm = document.querySelector('.search-form');
let shoppingCart = document.querySelector('.shopping-cart');
let account = document.querySelector('.login-form');
let navbar = document.querySelector('.navbar');
let header = document.querySelector('.header');
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let lastScrollTop = 0;
let additionalProductsVisible = false;

function updateCart() {
    let cartContainer = document.querySelector('.cart-items');
    cartContainer.innerHTML = '';
    let total = 0;

    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        let box = document.createElement('div');
        box.classList.add('box');
        box.innerHTML = `
            <i class="fas fa-trash" onclick="removeItem(${index})"></i>
            <img src="${item.image}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}</h3>
                <span class="price">GHS${item.price * item.quantity}/-</span>
                <div class="quantity">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>Qty: ${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
        cartContainer.appendChild(box);
    });

    document.querySelector('.total').textContent = `Total: GHS${total}/-`;
    updateCheckoutSummary();
}

function removeItem(index) {
    cartItems.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCart();
}

function updateQuantity(index, change) {
    cartItems[index].quantity += change;
    if (cartItems[index].quantity <= 0) {
        cartItems.splice(index, 1);
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCart();
}

function showPopup() {
    let popup = document.querySelector('#cart-popup');
    if (popup) {
        popup.classList.add('active');
        setTimeout(() => {
            popup.classList.remove('active');
        }, 2000);
    }
}

function closePopup() {
    let popup = document.querySelector('#cart-popup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function showSuccessPopup() {
    let popup = document.createElement('div');
    popup.classList.add('popup', 'success');
    popup.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Order placed successfully!</span>
    `;
    document.body.appendChild(popup);
    popup.classList.add('active');
    setTimeout(() => {
        popup.classList.remove('active');
        document.body.removeChild(popup);
        window.location.href = './index.html';
    }, 2000);
}

function updateCheckoutSummary() {
    let summaryContainer = document.querySelector('.order-summary');
    if (!summaryContainer) {
        console.log('Order summary container not found');
        return;
    }
    console.log('Cart items:', cartItems); // Debug cart items
    summaryContainer.innerHTML = '';

    if (cartItems.length === 0) {
        let emptyMessage = document.createElement('div');
        emptyMessage.classList.add('item');
        emptyMessage.innerHTML = `<span>Your cart is empty</span>`;
        summaryContainer.appendChild(emptyMessage);
        return;
    }

    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
        let itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>GHS${item.price * item.quantity}/-</span>
        `;
        summaryContainer.appendChild(itemDiv);
    });

    let tax = subtotal * 0.1;
    let total = subtotal + tax;

    let taxDiv = document.createElement('div');
    taxDiv.classList.add('tax');
    taxDiv.innerHTML = `<span>Tax (10%)</span><span>GHS${tax.toFixed(2)}/-</span>`;
    summaryContainer.appendChild(taxDiv);

    let totalDiv = document.createElement('div');
    totalDiv.classList.add('total');
    totalDiv.innerHTML = `<span>Total</span><span>GHS${total.toFixed(2)}/-</span>`;
    summaryContainer.appendChild(totalDiv);
}

function saveDetails(event) {
    event.preventDefault();
    let paymentDetails = document.createElement('div');
    paymentDetails.classList.add('payment-details');
    paymentDetails.innerHTML = `
        <h3>Payment Details</h3>
        <p>Payment Type: Credit Card</p>
        <p>Card Number: **** **** **** 1234</p>
        <p>Expiry: 12/27</p>
        <p>Cardholder: John Doe</p>
    `;
    let form = document.querySelector('.billing-form');
    form.parentElement.appendChild(paymentDetails);
    form.style.display = 'none';
}

function placeOrder() {
    let button = document.querySelector('.place-order');
    button.classList.add('loading');
    button.disabled = true;
    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        cartItems = [];
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        showSuccessPopup();
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing cart and checkout summary');

    // Initialize event listeners
    const cartBtn = document.querySelector('#cart-btn');
    if (cartBtn) {
        cartBtn.onclick = () => {
            shoppingCart.classList.toggle('active');
            account.classList.remove('active');
            navbar.classList.remove('active');
            updateCart();
        };
    } else {
        console.log('Cart button (#cart-btn) not found');
    }

    const loginBtn = document.querySelector('#login-btn');
    if (loginBtn) {
        loginBtn.onclick = () => {
            account.classList.toggle('active');
            shoppingCart.classList.remove('active');
            navbar.classList.remove('active');
        };
    } else {
        console.log('Login button (#login-btn) not found');
    }

    const menuBtn = document.querySelector('#menu-btn');
    if (menuBtn) {
        menuBtn.onclick = () => {
            navbar.classList.toggle('active');
            shoppingCart.classList.remove('active');
            account.classList.remove('active');
        };
    } else {
        console.log('Menu button (#menu-btn) not found');
    }

    const searchBox = document.querySelector('#search-box');
    if (searchBox) {
        searchBox.oninput = (e) => {
            let searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.product-slider .box').forEach(box => {
                let itemName = box.getAttribute('data-name').toLowerCase();
                if (searchTerm === '' || itemName.includes(searchTerm)) {
                    box.classList.remove('hidden');
                } else {
                    box.classList.add('hidden');
                }
            });
        };
    } else {
        console.log('Search box (#search-box) not found');
    }

    const viewMoreBtn = document.querySelector('#view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.onclick = () => {
            additionalProductsVisible = !additionalProductsVisible;
            document.querySelectorAll('.additional-product').forEach(product => {
                product.classList.toggle('visible', additionalProductsVisible);
            });
            viewMoreBtn.textContent = additionalProductsVisible ? 'View Less' : 'View More';
        };
    } else {
        console.log('View more button (#view-more-btn) not found');
    }

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.onclick = () => {
            let item = JSON.parse(button.getAttribute('data-item'));
            let existingItem = cartItems.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                item.quantity = 1;
                cartItems.push(item);
            }
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            showPopup();
            updateCart();
        };
    });

    // Initialize cart and checkout summary
    updateCart();
    updateCheckoutSummary();
});

window.onscroll = () => {
    shoppingCart.classList.remove('active');
    account.classList.remove('active');
    navbar.classList.remove('active');

    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > lastScrollTop) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
};

var swiper = new Swiper(".product-slider", {
    loop: false,
    spaceBetween: 20,
    breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1020: { slidesPerView: 4 }
    }
});

var swiper = new Swiper(".review-slider", {
    loop: true,
    spaceBetween: 20,
    breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1020: { slidesPerView: 4 }
    }
});