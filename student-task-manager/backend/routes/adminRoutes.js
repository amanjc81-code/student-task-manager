const express = require('express');
const { createTask, getAllTasks, updateTask, deleteTask, getStudents } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles('admin'));

router.post('/tasks', createTask);
router.get('/tasks', getAllTasks);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.get('/students', getStudents);

module.exports = router;
