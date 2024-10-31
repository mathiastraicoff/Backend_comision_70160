import { Router } from 'express';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';
import CartManager from '../service/CartManager.js'; 

const router = Router();
const cartManager = new CartManager(); 

// DELETE /carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        // Filtra los productos del carrito
        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();

        // Devuelve el carrito actualizado
        res.json({ status: 'success', cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al eliminar el producto del carrito', error });
    }
});

// PUT /carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const product = cart.products.find(p => p.product.toString() === pid);
        if (product) {
            product.quantity = quantity;
            await cart.save();

            res.json({ status: 'success', message: 'Cantidad actualizada' });
        } else {
            res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al actualizar la cantidad del producto', error });
    }
});

// DELETE /carts/:cid
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        // Vaciar el carrito (eliminar todos los productos)
        cart.products = [];
        await cart.save();

        res.json({ status: 'success', message: 'Todos los productos eliminados del carrito' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al vaciar el carrito', error });
    }
});

// GET /carts/:cid
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;

        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ status: 'error', message: 'ID de carrito inválido' });
        }

        const cart = await cartManager.getCartById(cartId); 
        res.render('cartDetail', { cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener el carrito', error });
    }
});

// POST /carts/add-product
router.post('/add-product', async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne();

        if (!cart) {
            cart = new Cart({ products: [] });
        }

        const productExists = cart.products.find(p => p.product.toString() === productId);
        if (productExists) {
            productExists.quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();

        res.json({ status: 'success', message: 'Producto agregado al carrito', productId });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al agregar el producto al carrito', error });
    }
});

export default router;
