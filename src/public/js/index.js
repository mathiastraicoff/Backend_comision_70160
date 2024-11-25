let socket = io();  

// Función para agregar productos al carrito
function addProductToCart(productId) {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
        socket.emit('createCart');
    } else {
        socket.emit('addProductToCart', { productId, cartId }); 
    }
}

// Evento cuando se crea un carrito
socket.on('cartCreated', ({ cartId }) => {
    localStorage.setItem('cartId', cartId);  
    updateCartCount(); 
});

// Evento cuando un producto se agrega correctamente
socket.on('addProductSuccess', (message) => {
    console.log(message);
    updateCartCount(); 
});

// Evento en caso de error al agregar producto al carrito
socket.on('addProductError', (error) => {
    console.error('Error al agregar al carrito:', error.message);
});

// Función para actualizar la cuenta de productos en el carrito
function updateCartCount() {
    let cartId = localStorage.getItem('cartId');
    if (cartId) {
        socket.emit('getCart', { cartId });  
    }
}

// Evento para actualizar la vista con el carrito actualizado
socket.on('cartUpdated', (cart) => {
    const cartCount = cart.products ? cart.products.reduce((sum, item) => sum + item.quantity, 0) : 0;
    document.getElementById('cart-count').innerText = cartCount; 
});

// Función para obtener el usuario actual
async function getCurrentUser() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No se encontró el token. Redirigiendo a la página de inicio de sesión.');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/sessions/current', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('No autorizado');
        }

        const data = await response.json();
        document.getElementById('user-info').innerText = `Bienvenido, ${data.first_name || 'Usuario'}`;
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/login';  
    }
}


getCurrentUser();
