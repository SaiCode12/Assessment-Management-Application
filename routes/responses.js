const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const Response = require('../models/Response');
const Assessment = require('../models/Assessment');

/* ── evaluate one answer ──────────────────────────────────────────────── */
const evaluate = (answer, correctAnswer, type, marks) => {
  if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') {
    // no answer key set — text questions or unset
    return { isCorrect: null, marksAwarded: 0 };
  }
  if (answer === undefined || answer === null || answer === '') {
    return { isCorrect: false, marksAwarded: 0 };
  }

  let isCorrect = false;

  if (type === 'multiple_choice' || type === 'yes_no') {
    isCorrect =
      String(answer).trim().toLowerCase() ===
      String(correctAnswer).trim().toLowerCase();
  } else if (type === 'rating') {
    isCorrect = Number(answer) === Number(correctAnswer);
  } else if (type === 'scale') {
    // accept ±1
    isCorrect = Math.abs(Number(answer) - Number(correctAnswer)) <= 1;
  } else {
    // free text — not auto-evaluated
    return { isCorrect: null, marksAwarded: 0 };
  }

  return { isCorrect, marksAwarded: isCorrect ? (marks || 1) : 0 };
};

/* ── POST /api/responses — submit ────────────────────────────────────── */
router.post('/', auth, async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    // Build a lookup: questionId → { correctAnswer, marks, type }
    const qMap = {};
    assessment.categories.forEach(cat =>
      cat.factors.forEach(f =>
        f.questions.forEach(q => {
          qMap[String(q._id)] = {
            correctAnswer: q.correctAnswer,
            marks:         q.marks ?? 1,
            type:          q.type,
            categoryName:  cat.name,
          };
        })
      )
    );

    // Evaluate answers and accumulate scores
    let totalScore = 0;
    let maxScore   = 0;
    const catScoreMap = {}; // catName → { score, maxScore }

    const evaluated = (answers || []).map(a => {
      const meta = qMap[String(a.questionId)] || {};
      const { isCorrect, marksAwarded } = evaluate(
        a.answer, meta.correctAnswer, a.questionType || meta.type, meta.marks
      );
      const maxMarks = meta.marks ?? 1;

      totalScore += marksAwarded;
      maxScore   += maxMarks;

      const catName = a.categoryName || meta.categoryName || 'Unknown';
      if (!catScoreMap[catName]) catScoreMap[catName] = { score: 0, maxScore: 0 };
      catScoreMap[catName].score    += marksAwarded;
      catScoreMap[catName].maxScore += maxMarks;

      return {
        ...a,
        correctAnswer: meta.correctAnswer,
        isCorrect,
        marksAwarded,
        maxMarks,
      };
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passPercent = assessment.passPercent ?? 60;
    const passed = maxScore > 0 ? percentage >= passPercent : null;

    const categoryScores = Object.entries(catScoreMap).map(([name, v]) => ({
      name,
      score:    v.score,
      maxScore: v.maxScore,
    }));

    const response = new Response({
      assessmentId,
      assessmentTitle: assessment.title,
      submittedBy:     req.user.id,
      answers:         evaluated,
      totalScore,
      maxScore,
      percentage,
      passed,
      categoryScores,
    });

    await response.save();
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/responses — all ────────────────────────────────────────── */
router.get('/', auth, async (req, res) => {
  try {
    const responses = await Response.find()
      .populate('submittedBy', 'name email')
      .populate('assessmentId', 'title passPercent')
      .sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/responses/assessment/:id ───────────────────────────────── */
router.get('/assessment/:id', auth, async (req, res) => {
  try {
    const responses = await Response.find({ assessmentId: req.params.id })
      .populate('submittedBy', 'name email')
      .sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/responses/:id ──────────────────────────────────────────── */
router.get('/:id', auth, async (req, res) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assessmentId', 'title passPercent');
    if (!response) return res.status(404).json({ message: 'Response not found' });
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
