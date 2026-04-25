const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  questionText:  { type: String },
  categoryName:  { type: String },
  factorName:    { type: String },
  answer:        { type: mongoose.Schema.Types.Mixed },
  questionType:  { type: String },
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  isCorrect:     { type: Boolean, default: null },   // null = not evaluated (text)
  marksAwarded:  { type: Number, default: 0 },
  maxMarks:      { type: Number, default: 1 }
});

const CategoryScoreSchema = new mongoose.Schema({
  name:     { type: String },
  score:    { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 }
});

const ResponseSchema = new mongoose.Schema({
  assessmentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  assessmentTitle: { type: String },
  submittedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers:         [AnswerSchema],
  totalScore:      { type: Number, default: 0 },
  maxScore:        { type: Number, default: 0 },
  percentage:      { type: Number, default: 0 },
  passed:          { type: Boolean, default: null },
  categoryScores:  [CategoryScoreSchema],
  submittedAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);
