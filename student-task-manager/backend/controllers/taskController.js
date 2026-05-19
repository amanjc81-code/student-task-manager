const Task = require('../models/Task');
const { getIO } = require('../socket');

const getMyTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find({}).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { status } = req.body;
    if (!['pending', 'in-progress', 'submitted', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    task.status = status;
    const updatedTask = await task.save();

    const populated = await Task.findById(updatedTask._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');

    const io = getIO();
    io.to('admins').emit('task:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit this task' });
    }

    const { githubLink, deployedLink } = req.body;
    const submissionFile = req.file ? `/uploads/${req.file.filename}` : task.submissionFile;

    task.status = 'submitted';
    task.githubLink = githubLink || task.githubLink;
    task.deployedLink = deployedLink || task.deployedLink;
    if (submissionFile) task.submissionFile = submissionFile;
    task.submittedAt = new Date();

    await task.save();

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');

    const io = getIO();
    io.to('admins').emit('task:submitted', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyTasks, updateTaskStatus, submitTask };
