const db = require('../models/db');
const inventoryModel = require('../models/inventoryModel'); 

module.exports = {
  createStock: async (req, res, next) => {
    const productId = Number(req.params.id);
    const { type, quantity } = req.body;

    // validation
    if (!['in', 'out'].includes(type)) return res.status(400).json({ error: "type must be 'in' or 'out'" });
    if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: 'quantity must be a positive integer' });

    try {
      await db.transaction(async (trx) => {
        // lock product row for update
        const product = await trx('products').where({ id: productId }).forUpdate().first();
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const current = Number(product.current_stock || 0);
        const newStock = current + (type === 'in' ? quantity : -quantity);

        // no negative stocks
        if (newStock < 0) return res.status(400).json({ error: 'Insufficient stock — operation would make stock negative' });

        // insert inventory record
        const [inventoryRow] = await trx('inventory')
          .insert({ product_id: productId, type, quantity })
          .returning('*');

        // update product current_stock
        await trx('products').where({ id: productId }).update({
          current_stock: newStock,
          updated_at: trx.fn ? trx.fn.now() : new Date()
        });

        return res.status(201).json({ success: true, productId, newStock, inventory: inventoryRow });
      });
    } catch (err) {
    
      if (res.headersSent) return;
      next(err);
    }
  }
};
