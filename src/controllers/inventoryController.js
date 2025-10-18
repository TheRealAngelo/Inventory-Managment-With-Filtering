const db = require('../models/db');
const inventoryModel = require('../models/inventoryModel');

module.exports = {
  createStock: async (req, res, next) => {
    const productId = Number(req.params.id);
    const { type, quantity } = req.body;
    if (!['in', 'out'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: 'Quantity must be positive integer' });

    try {
      await db.transaction(async (trx) => {
        const product = await trx('products').where({ id: productId }).first().forUpdate();
        if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });

        const newStock = type === 'in' ? product.current_stock + quantity : product.current_stock - quantity;
        if (newStock < 0) {
          throw Object.assign(new Error('Insufficient stock — operation would make stock negative'), { status: 400 });
        }

        await inventoryModel.createInventoryRecord(productId, type, quantity, trx);
        await trx('products').where({ id: productId }).update({ current_stock: newStock });

        res.json({ success: true, productId, newStock });
      });
    } catch (err) {
      next(err);
    }
  }
};
