import Product from '../models/Product.js';
import mongoose from 'mongoose';

class ProductManager {
    async getAll({ limit = 10, page = 1, sort, category, availability }) {
        const filter = {};
    
        if (category) {
            filter.category = category; 
        }
        if (availability) {
            filter.available = availability === 'true'; 
        }
    
        const options = {
            limit: parseInt(limit),
            skip: (page - 1) * limit,
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        };
    
        try {
            const products = await Product.find(filter, null, options).lean();
            const totalProducts = await Product.countDocuments(filter);
            return { products, totalProducts };
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    }
    

    async add(productData) {
        const product = new Product(productData);
        await product.save();
        return product;
    }

    async update(productId, productData) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('ID de producto inválido');
        }
        const updatedProduct = await Product.findByIdAndUpdate(productId, productData, { new: true });
        return updatedProduct;
    }

    async delete(productId) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('ID de producto inválido');
        }
        await Product.findByIdAndDelete(productId);
    }

    async getById(productId) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error('ID de producto inválido');
        }
        const product = await Product.findById(productId).lean();
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    }
    async getRandomProducts(limit = 10) {
        const count = await Product.countDocuments();
        const randomIndex = Math.floor(Math.random() * (count - limit));
    
        return Product.find().skip(randomIndex).limit(limit).lean();
    }
}

export default ProductManager;



