const express = require('express');
const multer = require('multer');
const path = require('path');
const { getMyTasks, updateTaskStatus, submitTask } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip' || ext === '.rar' || ext === '.7z') {
      cb(null, true);
    } else {
      cb(new Error('Only .zip, .rar, .7z files allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get('/', authMiddleware, getMyTasks);
router.put('/:id/status', authMiddleware, updateTaskStatus);
router.put('/:id/submit', authMiddleware, upload.single('submissionFile'), (err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
  next();
}, submitTask);

module.exports = router;
