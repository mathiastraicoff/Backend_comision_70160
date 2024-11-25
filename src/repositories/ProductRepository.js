class ProductRepository {
    constructor(productModel) {
        this.productModel = productModel;
    }

    async getById(productId) {
        try {
            const product = await this.productModel.findById(productId);
            if (!product) throw new Error('Product not found');
            return product;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async update(product) {
        try {
            return await product.save();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

export default ProductRepository;
