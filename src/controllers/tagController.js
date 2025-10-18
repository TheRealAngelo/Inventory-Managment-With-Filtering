const tagModel = require('../models/tagModel');
const db = require('../models/db');

module.exports = {
  createTag: async (req, res, next) => {
    const { tag_name } = req.body;
    if (!tag_name) return res.status(400).json({ error: 'tag_name required' });

    try {
      // if available, fallback to direct knex insert
      if (tagModel && typeof tagModel.createTag === 'function') {
        const [tag] = await tagModel.createTag(tag_name);
        return res.status(201).json(tag);
      }

      const [tag] = await db('tags').insert({ tag_name }).returning('*');
      return res.status(201).json(tag);
    } catch (err) {
      // violation
      if (err && err.code === '23505') {
        return res.status(409).json({ error: 'Tag already exists' });
      }
      next(err);
    }
  },

  listTags: async (req, res, next) => {
    try {
      const tags = await db('tags').select('*').orderBy('id', 'asc');
      return res.status(200).json({ success: true, tags });
    } catch (err) {
      next(err);
    }
  }
};
