const mongoose = require('mongoose');

const SavedCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  factors: [{
    name: { type: String, required: true },
    description: { type: String },
    questions: [{
      text: { type: String, required: true },
      type: { type: String },
      options: [{ type: String }],
      required: { type: Boolean, default: true }
    }]
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedCategory', SavedCategorySchema);
