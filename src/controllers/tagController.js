const tagModel = require('../models/tagModel');

module.exports = {
  createTag: async (req, res, next) => {
    const { tag_name } = req.body;
    if (!tag_name) return res.status(400).json({ error: 'tag_name required' });
    try {
      const [tag] = await tagModel.createTag(tag_name);
      res.status(201).json(tag);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Tag already exists' });
      next(err);
    }
  }
};
