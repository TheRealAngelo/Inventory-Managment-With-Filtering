const db = require('./db');

module.exports = {
  createProduct: (data, trx) => {
    const q = trx ? trx('products') : db('products');
    return q.insert({
      name: data.name,
      description: data.description || null,
      current_stock: data.current_stock || 0
    }).returning('*');
  },

  getProductById: async (id) => {
    const product = await db('products').where({ id }).first();
    if (!product) return null;
    const tags = await db('tags')
      .join('product_tags', 'tags.id', 'product_tags.tag_id')
      .where('product_tags.product_id', id)
      .select('tags.id', 'tags.tag_name');
    return { ...product, tags };
  },

  getAllProductsWithFilters: async ({ tag, min_stock, name }) => {
    const q = db('products').select('products.*');

    if (tag) {
      q.join('product_tags', 'products.id', 'product_tags.product_id')
       .join('tags', 'product_tags.tag_id', 'tags.id')
       .where('tags.tag_name', tag);
    }

    if (name) {
      q.whereRaw('LOWER(products.name) LIKE ?', [`%${name.toLowerCase()}%`]);
    }

    if (min_stock !== undefined) {
      q.where('products.current_stock', '>=', Number(min_stock));
    }

    q.groupBy('products.id');

    const products = await q;
    const results = await Promise.all(products.map(async (p) => {
      const tags = await db('tags')
        .join('product_tags', 'tags.id', 'product_tags.tag_id')
        .where('product_tags.product_id', p.id)
        .select('tags.id', 'tags.tag_name');
      return { ...p, tags };
    }));
    return results;
  },

  updateProduct: (id, data) => {
    return db('products').where({ id }).update({
      name: data.name,
      description: data.description
    }).returning('*');
  },

  deleteProduct: (id, trx) => {
    const q = trx ? trx('products') : db('products');
    return q.where({ id }).del();
  }
};
