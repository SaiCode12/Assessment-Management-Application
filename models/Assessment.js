const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['multiple_choice', 'rating', 'text', 'yes_no', 'scale'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, default: undefined },
  marks: { type: Number, default: 1 },
  required: { type: Boolean, default: true }
});

const FactorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema]
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  factors: [FactorSchema]
});

const AssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  passPercent: { type: Number, default: 60 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [CategorySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
