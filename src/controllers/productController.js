const db = require('../models/db');
const productModel = require('../models/productModel');
const tagModel = require('../models/tagModel');

module.exports = {
  createProduct: async (req, res, next) => {
    const { name, description, initial_stock = 0, tags = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
      await db.transaction(async (trx) => {
        const [product] = await productModel.createProduct({
          name, description, current_stock: initial_stock
        }, trx);

        if (tags && tags.length) {
          const tagObjs = await tagModel.getOrCreateTagsByName(tags, trx);
          const tagIds = tagObjs.map(t => t.id);
          if (tagIds.length) {
            await tagModel.linkTagsToProduct(product.id, tagIds, trx);
          }
        }

        res.status(201).json({ product });
      });
    } catch (err) {
      next(err);
    }
  },

  getProductById: async (req, res, next) => {
    try {
      const product = await productModel.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Not found' });
      res.json(product);
    } catch (err) { next(err); }
  },

  getAllProducts: async (req, res, next) => {
    try {
      const { tag, min_stock, name } = req.query;
      const results = await productModel.getAllProductsWithFilters({
        tag, min_stock, name
      });
      res.json(results);
    } catch (err) { next(err); }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const updated = await productModel.updateProduct(req.params.id, { name, description });
      if (!updated || updated.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(updated[0]);
    } catch (err) { next(err); }
  },

  deleteProduct: async (req, res, next) => {
    try {
      await db.transaction(async (trx) => {
        await productModel.deleteProduct(req.params.id, trx);
        res.json({ success: true });
      });
    } catch (err) { next(err); }
  }
};
