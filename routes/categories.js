const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SavedCategory = require('../models/SavedCategory');

// Get saved categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await SavedCategory.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Save a category
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, factors } = req.body;
    const category = new SavedCategory({ name, description, factors, createdBy: req.user.id });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete saved category
router.delete('/:id', auth, async (req, res) => {
  try {
    await SavedCategory.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
