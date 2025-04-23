let searchForm = document.querySelector('.search-form');
let shoppingCart = document.querySelector('.shopping-cart');
let account = document.querySelector('.login-form');
let navbar = document.querySelector('.navbar');
let header = document.querySelector('.header');
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let lastScrollTop = 0;
let additionalProductsVisible = false;

document.querySelector('#cart-btn').onclick = () => {
    shoppingCart.classList.toggle('active');
    account.classList.remove('active');
    navbar.classList.remove('active');
    updateCart();
};

document.querySelector('#login-btn').onclick = () => {
    account.classList.toggle('active');
    shoppingCart.classList.remove('active');
    navbar.classList.remove('active');
};

document.querySelector('#menu-btn').onclick = () => {
    navbar.classList.toggle('active');
    shoppingCart.classList.remove('active');
    account.classList.remove('active');
};

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
    popup.classList.add('active');
    setTimeout(() => {
        popup.classList.remove('active');
    }, 2000);
}

function closePopup() {
    document.querySelector('#cart-popup').classList.remove('active');
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

document.querySelector('#search-box').oninput = (e) => {
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

function updateCheckoutSummary() {
    let summaryContainer = document.querySelector('.order-summary');
    if (!summaryContainer) return;
    summaryContainer.innerHTML = '';
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

document.querySelector('#view-more-btn').onclick = () => {
    additionalProductsVisible = !additionalProductsVisible;
    document.querySelectorAll('.additional-product').forEach(product => {
        product.classList.toggle('visible', additionalProductsVisible);
    });
    document.querySelector('#view-more-btn').textContent = additionalProductsVisible ? 'View Less' : 'View More';
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

window.onload = () => {
    updateCart();
    updateCheckoutSummary();
};