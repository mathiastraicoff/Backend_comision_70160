import { Router } from 'express'; 
import ProductManager from '../service/ProductManager.js';
import CartManager from '../service/CartManager.js';
import mongoose from 'mongoose';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, category, availability } = req.query;

    try {
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (availability) {
            filter.available = availability === 'true'; 
        }

        const { products, totalProducts } = await productManager.getAll({
            limit,
            page,
            sort,
            category,
            availability,
        });

        const totalPages = Math.ceil(totalProducts / limit);
        const plainProducts = products.map(product => product.toObject());

        res.render('products', {
            products: plainProducts,
            totalPages,
            currentPage: parseInt(page),
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
            prevPage: parseInt(page) > 1 ? parseInt(page) - 1 : null,
            nextPage: parseInt(page) < totalPages ? parseInt(page) + 1 : null,
            limit,
            sort,
            category,
            availability,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

router.post('/:pid/add-to-cart', async (req, res) => {
    const quantity = 1; 
    await handleAddToCart(req, res, quantity);
});

// Función para manejar la lógica de agregar al carrito
async function handleAddToCart(req, res, quantity) {
    const productId = req.params.pid;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
    }

    let cartId = req.session.cartId;
    if (!cartId) {
        const cart = await cartManager.add(); 
        cartId = cart._id;
        req.session.cartId = cartId; 
    }

    // Agregar el producto al carrito
    try {
        await cartManager.addProduct(cartId, productId, quantity);
        res.redirect('/products'); 
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
}

// Rutas para actualizar y eliminar productos
router.put('/:pid', async (req, res) => {
    const productId = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
    }

    try {
        const updatedProduct = await productManager.update(productId, req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    const productId = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
    }

    try {
        await productManager.delete(productId);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

// Ruta para ver detalles de un producto
router.get('/:pid', async (req, res) => {
    const productId = req.params.pid;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
    }

    try {
        const product = await productManager.getById(productId);
        if (product) {
            res.render('productDetail', { product });
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).send('Error al obtener el producto');
    }
});

// Ruta para obtener el carrito
router.get('/carts/:cid', async (req, res) => {
    const cartId = req.params.cid;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ error: 'ID de carrito inválido' });
    }

    try {
        const cart = await cartManager.getCartById(cartId);
        if (cart) {
            res.render('cartDetail', { cart });
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        res.status(500).send('Error al obtener el carrito');
    }
});

export default router;

