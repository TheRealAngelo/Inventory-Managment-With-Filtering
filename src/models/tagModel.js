const db = require('./db');

module.exports = {
  createTag: (name) => {
    return db('tags').insert({ tag_name: name }).returning('*');
  },

  getOrCreateTagsByName: async (names = [], trx) => {
    if (!names || !names.length) return [];
    const existing = await db('tags').whereIn('tag_name', names).select('*');
    const existingNames = existing.map(t => t.tag_name);
    const toCreate = names.filter(n => !existingNames.includes(n));
    if (toCreate.length) {
      const q = trx ? trx('tags') : db('tags');
      await q.insert(toCreate.map(name => ({ tag_name: name })));
    }
    const all = await db('tags').whereIn('tag_name', names).select('*');
    return all;
  },

  linkTagsToProduct: (productId, tagIds = [], trx) => {
    if (!tagIds || !tagIds.length) return [];
    const q = trx ? trx('product_tags') : db('product_tags');
    const rows = tagIds.map(tagId => ({ product_id: productId, tag_id: tagId }));
    return q.insert(rows).returning('*');
  }
};
