import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

class CartManager {
    async add() {
        const newCart = new Cart();
        await newCart.save();
        return newCart;
    }

    async addProduct(cartId, productId, quantity) {
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            throw new Error('ID de carrito inválido');
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        if (!Array.isArray(cart.products)) {
            cart.products = [];
        }

        const productIndex = cart.products.findIndex(item => {
            return item.product && item.product.equals(productId); 
        });

        if (productIndex === -1) {
            cart.products.push({ product: productId, quantity });
        } else {
            cart.products[productIndex].quantity += quantity;
        }
        try {
            await cart.save();
        } catch (error) {
            console.error('Error al guardar el carrito:', error);
            throw new Error('Error al guardar el carrito');
        }

        return cart;
    }

    async getCartById(cartId) {
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            throw new Error('ID de carrito inválido');
        }

        const cart = await Cart.findById(cartId).populate('products.product');
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart;
    }
}

export default CartManager;


