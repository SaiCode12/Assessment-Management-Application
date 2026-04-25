const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const SavedCategory = require('../models/SavedCategory');

// Get all assessments
router.get('/', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ createdBy: req.user.id })
      .select('-categories.factors.questions')
      .sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all assessments (for launch pad - all users)
router.get('/all', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get single assessment
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create assessment
router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, categories, settings } = req.body;
    const assessment = new Assessment({
      title,
      description,
      categories,
      settings,
      createdBy: req.user.id
    });
    await assessment.save();

    // Save categories for reuse
    for (const cat of categories) {
      const existing = await SavedCategory.findOne({ name: cat.name, createdBy: req.user.id });
      if (!existing) {
        const savedCat = new SavedCategory({
          name: cat.name,
          description: cat.description,
          factors: cat.factors,
          createdBy: req.user.id
        });
        await savedCat.save();
      }
    }

    res.status(201).json(assessment);
  } catch (err) {
    console.log("error",err)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update assessment
router.put('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete assessment
router.delete('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json({ message: 'Assessment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
