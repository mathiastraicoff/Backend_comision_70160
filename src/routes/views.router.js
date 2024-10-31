import { Router } from 'express'; 
import ProductManager from '../service/ProductManager.js';
import CartManager from '../service/CartManager.js'; 
// import { loginUser, registerUser, getCurrentUser } from '../controllers/session.controller.js';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager(); 

// Middleware para manejar el cartId
router.use(async (req, res, next) => {
    if (!req.session.cartId) {
        const newCart = await cartManager.add(); 
        req.session.cartId = newCart._id; 
    }
    req.cartId = req.session.cartId; 
    next();
});

// GET /
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getRandomProducts(10); 
        res.render('home', { products, cartCount: req.cartCount }); 
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error en el servidor');
    }
});

// GET /products
router.get('/products', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1; 
    const sort = req.query.sort;
    const query = req.query.query || '';

    try {
        const { products, totalPages } = await productManager.getAll({ limit, page, sort, query });
        res.render('products', {
            products,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            limit,
            sort,
            query,
            cartCount: req.cartCount, 
        });
    } catch (error) {
        console.error('Error en /products:', error);
        res.status(500).send('Error al obtener productos');
    }
});

// GET /products/:pid
router.get('/products/:pid', async (req, res) => {
    const productId = req.params.pid;

    try {
        const product = await productManager.getById(productId);
        if (product) {
            res.render('productDetail', { product, cartCount: req.cartCount }); 
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        console.error('Error en /products/:pid:', error);
        res.status(500).send('Error al obtener el producto');
    }
});

// GET /carts
router.get('/carts', async (req, res) => {
    const cartId = req.cartId; 

    try {
        const cart = await cartManager.getCartById(cartId);
        if (cart) {
            res.render('cartDetail', { cart, cartCount: req.cartCount }); 
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});

// Vista de registro
router.get('/register', (req, res) => {
    res.render('register'); 
});

// Vista de inicio de sesión
router.get('/login', (req, res) => {
    res.render('login'); 
});


export default router;
