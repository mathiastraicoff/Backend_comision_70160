import {getCurrentUser} from '/src/controllers/session.controller';


let socket;
if (typeof socket === "undefined") {
    socket = io(); 

    function addProductToCart(productId) {
        let cartId = localStorage.getItem('cartId');
        if (!cartId) {
            socket.emit('createCart');
        } else {
            socket.emit('addProductToCart', { productId });
        }
    }

    socket.on('cartCreated', ({ cartId }) => {
        localStorage.setItem('cartId', cartId);
    });

    socket.on('addProductSuccess', (message) => {
        updateCartCount();
    });

    socket.on('addProductError', (error) => {
        console.error('Error al agregar al carrito:', error.message);
    });

    function updateCartCount() {
        let cartId = localStorage.getItem('cartId');
        if (cartId) {
            socket.emit('getCart', { cartId });
        }
    }

    socket.on('cartUpdated', (cart) => {
        const cartCount = cart.products.reduce((sum, item) => sum + item.quantity, 0);
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
            const response = await fetch('http://localhost:8080/api/sessions/current', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                throw new Error('No autorizado');
            }

            const data = await response.json();
            console.log('Usuario actual:', data);
            document.getElementById('user-info').innerText = `Bienvenido, ${data.first_name}`;
        } catch (error) {
            console.error('Error:', error);
            
            window.location.href = '/login';
        }
    }


    getCurrentUser();
}


