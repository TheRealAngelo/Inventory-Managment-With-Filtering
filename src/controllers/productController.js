const db = require('../models/db');
const productModel = require('../models/productModel');
const tagModel = require('../models/tagModel');

module.exports = {
  // transactional
  createProduct: async (req, res, next) => {
    const { name, description = null, initial_stock = 0, tags = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    if (!Number.isInteger(initial_stock) || initial_stock < 0) return res.status(400).json({ error: 'initial_stock must be >= 0' });

    try {
      const result = await db.transaction(async (trx) => {
        const [product] = await trx('products')
          .insert({ name, description, current_stock: initial_stock })
          .returning('*');

        // ensure tags exist and link
        for (const tName of (tags || [])) {
          const tagName = String(tName).trim();
          if (!tagName) continue;
          // get or create tag
          let tag = await trx('tags').where({ tag_name: tagName }).first();
          if (!tag) {
            const [newTag] = await trx('tags').insert({ tag_name: tagName }).returning('*');
            tag = newTag;
          }
          // link product <-> tag
          await trx('product_tags').insert({ product_id: product.id, tag_id: tag.id }).onConflict(['product_id', 'tag_id']).ignore();
        }

        // initial_stock > 0
        if (initial_stock > 0) {
          await trx('inventory').insert({ product_id: product.id, type: 'in', quantity: initial_stock });
        }

        return product;
      });

      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  // tags and current_stock
  getProductById: async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      const product = await db('products').where({ id }).first();
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const tags = await db('product_tags')
        .join('tags', 'product_tags.tag_id', 'tags.id')
        .where('product_tags.product_id', id)
        .select('tags.id', 'tags.tag_name');

      return res.json({ ...product, tags });
    } catch (err) {
      next(err);
    }
  },

  // (tag, min_stock, name)
  getAllProducts: async (req, res, next) => {
    const { tag, min_stock, name } = req.query;
    try {
      const q = db('products')
        .select('products.*')
        .leftJoin('product_tags', 'products.id', 'product_tags.product_id')
        .leftJoin('tags', 'product_tags.tag_id', 'tags.id')
        .groupBy('products.id');

      if (tag) q.where('tags.tag_name', tag);
      if (min_stock !== undefined) {
        const n = Number(min_stock);
        if (!Number.isNaN(n)) q.where('products.current_stock', '>=', n);
      }
      if (name) {
        // case-insensitive partial match
        if (typeof q.whereILike === 'function') {
          q.whereILike('products.name', `%${name}%`);
        } else {
          q.whereRaw('LOWER(products.name) LIKE ?', [`%${String(name).toLowerCase()}%`]);
        }
      }

      const products = await q;

      // attach tags for returned products
      const ids = products.map(p => p.id);
      if (ids.length === 0) return res.json([]);

      const tagRows = await db('product_tags')
        .join('tags', 'product_tags.tag_id', 'tags.id')
        .whereIn('product_tags.product_id', ids)
        .select('product_tags.product_id', 'tags.id as tag_id', 'tags.tag_name');

      const tagMap = {};
      for (const row of tagRows) {
        tagMap[row.product_id] = tagMap[row.product_id] || [];
        tagMap[row.product_id].push({ id: row.tag_id, tag_name: row.tag_name });
      }

      const out = products.map(p => ({ ...p, tags: tagMap[p.id] || [] }));
      return res.json(out);
    } catch (err) {
      next(err);
    }
  },

  // Update product (name, description)
  updateProduct: async (req, res, next) => {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Nothing to update' });

    try {
      const [updated] = await db('products').where({ id }).update(update).returning('*');
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  // Delete (transactional)
  deleteProduct: async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      await db.transaction(async (trx) => {
        await trx('product_tags').where({ product_id: id }).del();
        await trx('inventory').where({ product_id: id }).del();
        const deleted = await trx('products').where({ id }).del();
        if (!deleted) return res.status(404).json({ error: 'Product not found' });
      });
      return res.status(204).send();
    } catch (err) {
      if (res.headersSent) return;
      next(err);
    }
  }
};
