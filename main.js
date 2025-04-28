let shoppingCart = document.querySelector('.shopping-cart');
let navbar = document.querySelector('.navbar');
let header = document.querySelector('.header');
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let lastScrollTop = 0;
let additionalProductsVisible = false;
let currentProduct = null;
let buyerDetails = null;

const pricingData = {
    "Wedding Cake": {
        options: [
            { label: "2 Tiers", price: 2500 },
            { label: "3 Tiers", price: 3500 },
            { label: "4 Tiers", price: 4500 }
        ],
        image: "./images/wedding-cake.jpg"
    },
    "Birthday Cake": {
        options: [
            { label: "6”x3”", price: 350 },
            { label: "6”x6” Round", price: 500 },
            { label: "6”x6” Square", price: 800 },
            { label: "8”x5” Round", price: 700 },
            { label: "8”x5” Square", price: 1300 }
        ],
        image: "./images/birthday-cake.jpg"
    },
    "Cupcakes": {
        flavors: ["Vanilla", "Chocolate", "Red Velvet", "Strawberry", "Marble"],
        quantities: ["Box of 6", "Box of 12", "Box of 24"],
        pricing: {
            "Vanilla": { "Box of 6": 100, "Box of 12": 180, "Box of 24": 300 },
            "Chocolate": { "Box of 6": 120, "Box of 12": 200, "Box of 24": 320 },
            "Red Velvet": { "Box of 6": 140, "Box of 12": 220, "Box of 24": 340 },
            "Strawberry": { "Box of 6": 140, "Box of 12": 220, "Box of 24": 340 },
            "Marble": { "Box of 6": 240, "Box of 12": null, "Box of 24": null }
        },
        image: "./images/cupcake.jpg"
    }
};

function updateCart() {
    let cartContainer = document.querySelector('.cart-items');
    cartContainer.innerHTML = '';
    let total = 0;

    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        let box = document.createElement('div');
        box.classList.add('box');
        let details = item.details ? ` (${item.details})` : '';
        box.innerHTML = `
            <i class="fas fa-trash" onclick="removeItem(${index})"></i>
            <img src="${item.image}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}${details}</h3>
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
        let details = item.details ? ` (${item.details})` : '';
        itemDiv.innerHTML = `
            <span>${item.name}${details} (x${item.quantity})</span>
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

    // Collect form data
    let form = document.querySelector('.billing-form');
    buyerDetails = {
        fullName: form.querySelector('input[placeholder="Full Name"]').value,
        email: form.querySelector('input[placeholder="Email"]').value,
        streetAddress: form.querySelector('input[placeholder="Street Address"]').value,
        city: form.querySelector('input[placeholder="City"]').value,
        state: form.querySelector('input[placeholder="State"]').value,
        phoneNumber: form.querySelector('input[placeholder="Phone Number"]').value,
        postalCode: "N/A" // Not in your form, adding as placeholder
    };

    // Optional: Add payment details section (you can remove this if not needed)
    let paymentDetails = document.createElement('div');
    paymentDetails.classList.add('payment-details');
    paymentDetails.innerHTML = `
        <h3>Shipping Details Saved</h3>
        <p>Name: ${buyerDetails.fullName}</p>
        <p>Email: ${buyerDetails.email}</p>
        <p>Address: ${buyerDetails.streetAddress}, ${buyerDetails.city}, ${buyerDetails.state}</p>
        <p>Phone: ${buyerDetails.phoneNumber}</p>
    `;
    form.parentElement.appendChild(paymentDetails);
    form.style.display = 'none';

    // Show the Place Order button
    const placeOrderBtn = document.querySelector('.place-order');
    if (placeOrderBtn) {
        placeOrderBtn.classList.remove('d-none');
    }
}

function placeOrder() {
    // Ensure buyer details are available
    if (!buyerDetails) {
        alert('Please save your shipping details first.');
        return;
    }

    // Get the order summary from cartItems
    let orderSummary = {
        items: cartItems.map(item => ({
            name: item.name,
            details: item.details || '',
            quantity: item.quantity,
            price: item.price
        })),
        tax: 0,
        total: 0
    };

    // Calculate subtotal, tax, and total
    let subtotal = 0;
    orderSummary.items.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    orderSummary.tax = subtotal * 0.1; // 10% tax
    orderSummary.total = subtotal + orderSummary.tax;

    // Format the order summary for WhatsApp
    const orderItems = orderSummary.items.map(item => 
        `${item.name}${item.details ? ` (${item.details})` : ''} - Quantity: ${item.quantity}, Price: GHS${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    const whatsappMessage = `Hello Fhanash Bakery,\nI would like to place an order:\n\n${orderItems}\n\nTax (10%): GHS${orderSummary.tax.toFixed(2)}\nTotal: GHS${orderSummary.total.toFixed(2)}\n\nCustomer: ${buyerDetails.fullName}\nEmail: ${buyerDetails.email}\nPhone: ${buyerDetails.phoneNumber}\nAddress: ${buyerDetails.streetAddress}, ${buyerDetails.city}, ${buyerDetails.state}`;

    // Encode the message for the URL
    const encodedMessage = encodeURIComponent(whatsappMessage);

    // Replace with your WhatsApp Business number (without the +)
    const whatsappNumber = '233591397357'; // e.g., if your number is +12025550123, use 12025550123
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    // Clear the cart
    cartItems = [];
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCart();

    alert('Order submitted! You will be redirected to WhatsApp to confirm your order.');
    window.location.href = whatsappUrl;
}

function openModal(productType) {
    currentProduct = { name: productType, image: pricingData[productType].image, price: 0, details: '' };
    const modal = document.querySelector('#custom-product-modal');
    const modalTitle = document.querySelector('#modal-title');
    const modalOptions = document.querySelector('#modal-options');
    const modalPrice = document.querySelector('#modal-price');
    const addToCartBtn = document.querySelector('#modal-add-to-cart');

    modalTitle.textContent = `Customize Your ${productType}`;
    modalOptions.innerHTML = '';
    modalPrice.textContent = 'GHS0/-';
    addToCartBtn.disabled = true;

    if (productType === "Wedding Cake" || productType === "Birthday Cake") {
        const select = document.createElement('select');
        select.id = 'tier-select';
        select.innerHTML = '<option value="">Select Option</option>';
        pricingData[productType].options.forEach(option => {
            select.innerHTML += `<option value="${option.label}" data-price="${option.price}">${option.label} - GHS${option.price}</option>`;
        });
        modalOptions.appendChild(select);

        select.onchange = () => {
            const selectedOption = select.options[select.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            currentProduct.price = price ? parseInt(price) : 0;
            currentProduct.details = selectedOption.value;
            modalPrice.textContent = `GHS${currentProduct.price}/-`;
            addToCartBtn.disabled = !selectedOption.value;
        };
    } else if (productType === "Cupcakes") {
        const flavorSelect = document.createElement('select');
        flavorSelect.id = 'flavor-select';
        flavorSelect.innerHTML = '<option value="">Select Flavor</option>';
        pricingData[productType].flavors.forEach(flavor => {
            flavorSelect.innerHTML += `<option value="${flavor}">${flavor}</option>`;
        });
        modalOptions.appendChild(flavorSelect);

        const quantitySelect = document.createElement('select');
        quantitySelect.id = 'quantity-select';
        quantitySelect.innerHTML = '<option value="">Select Quantity</option>';
        pricingData[productType].quantities.forEach(quantity => {
            quantitySelect.innerHTML += `<option value="${quantity}">${quantity}</option>`;
        });
        modalOptions.appendChild(quantitySelect);

        const updatePrice = () => {
            const flavor = flavorSelect.value;
            const quantity = quantitySelect.value;
            if (flavor && quantity) {
                const price = pricingData[productType].pricing[flavor][quantity];
                currentProduct.price = price || 0;
                currentProduct.details = `${flavor}, ${quantity}`;
                modalPrice.textContent = price ? `GHS${price}/-` : 'N/A';
                addToCartBtn.disabled = !price;
            } else {
                currentProduct.price = 0;
                currentProduct.details = '';
                modalPrice.textContent = 'GHS0/-';
                addToCartBtn.disabled = true;
            }
        };

        flavorSelect.onchange = updatePrice;
        quantitySelect.onchange = updatePrice;
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.querySelector('#custom-product-modal');
    modal.classList.remove('active');
    currentProduct = null;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing cart and checkout summary');

    const cartBtn = document.querySelector('#cart-btn');
    if (cartBtn) {
        cartBtn.onclick = () => {
            shoppingCart.classList.toggle('active');
            navbar.classList.remove('active');
            updateCart();
        };
    }

    const menuBtn = document.querySelector('#menu-btn');
    if (menuBtn) {
        menuBtn.onclick = () => {
            navbar.classList.toggle('active');
            shoppingCart.classList.remove('active');
        };
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

    document.querySelectorAll('.add-to-cart-custom').forEach(button => {
        button.onclick = () => {
            const productType = button.getAttribute('data-type');
            openModal(productType);
        };
    });

    const modalCancelBtn = document.querySelector('#modal-cancel');
    if (modalCancelBtn) {
        modalCancelBtn.onclick = closeModal;
    }

    const modalAddToCartBtn = document.querySelector('#modal-add-to-cart');
    if (modalAddToCartBtn) {
        modalAddToCartBtn.onclick = () => {
            if (currentProduct && currentProduct.price > 0) {
                let existingItem = cartItems.find(cartItem => cartItem.name === currentProduct.name && cartItem.details === currentProduct.details);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    currentProduct.quantity = 1;
                    cartItems.push(currentProduct);
                }
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                closeModal();
                showPopup();
                updateCart();
            }
        };
    }

    updateCart();
    updateCheckoutSummary();
});

window.onscroll = () => {
    shoppingCart.classList.remove('active');
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