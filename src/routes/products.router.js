import { Router } from 'express';
import passport from 'passport';
import ProductController from '../controllers/product.controller.js';
import CartController from '../controllers/cart.controller.js'; 

const router = Router();
const productController = new ProductController();
const cartController = new CartController(); 

// Middleware de Passport para verificar el JWT
const authMiddleware = passport.authenticate('jwt', { session: false });

// GET /products (sin protección)
router.get('/', async (req, res) => {
    try {
        const products = await productController.getAllProducts(req.query);
        res.json({ status: 'success', products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// POST /products/:pid/add-to-cart
router.post('/:pid/add-to-cart', async (req, res) => {
    try {
        const { pid } = req.params; 
        const { quantity, returnTo } = req.body; 
        const cartId = req.session.cartId; 

        if (!cartId) {
            return res.status(400).json({ status: 'error', message: 'No se encontró el carrito' });
        }

        // Agregar el producto al carrito
        const cart = await cartController.addProductToCart(cartId, pid, parseInt(quantity, 10));

        // Manejar redirección si se especifica returnTo
        if (returnTo) {
            return res.redirect(returnTo); 
        }

        // Si no se especifica `returnTo`, devolver JSON
        res.json({ status: 'success', cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
