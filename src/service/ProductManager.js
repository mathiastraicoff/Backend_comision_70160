import ProductRepository from '../repositories/ProductRepository.js';

class ProductManager {
    constructor() {
        this.productRepo = new ProductRepository();
    }

    async getProductById(productId) {
        try {
            const product = await this.productRepo.getById(productId);
            if (!product) throw new Error('Product not found');
            return product;
        } catch (error) {
            throw new Error('Error fetching product: ' + error.message);
        }
    }

    async updateProductStock(productId, quantity) {
        try {
            const product = await this.productRepo.getById(productId);
            if (!product) throw new Error('Product not found');

            product.stock += quantity;
            await this.productRepo.update(productId, product);
            return product;
        } catch (error) {
            throw new Error('Error updating product stock: ' + error.message);
        }
    }
}

export default ProductManager;


