const db = require('./db');

module.exports = {
  createInventoryRecord: (productId, type, quantity, trx) => {
    const q = trx ? trx('inventory') : db('inventory');
    return q.insert({
      product_id: productId,
      type,
      quantity
    }).returning('*');
  }
};
