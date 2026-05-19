const Task = require('../models/Task');
const User = require('../models/User');
const { getIO } = require('../socket');

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    const student = await User.findById(assignedTo);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Assigned user must be a valid student' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');

    const io = getIO();
    io.to(`user:${populatedTask.assignedTo._id}`).emit('task:created', populatedTask);
    io.to('admins').emit('task:created', populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, assignedTo, dueDate, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) {
      const student = await User.findById(assignedTo);
      if (!student || student.role !== 'student') {
        return res.status(400).json({ message: 'Assigned user must be a valid student' });
      }
      task.assignedTo = assignedTo;
    }
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) {
      if (!['pending', 'in-progress', 'submitted', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      task.status = status;
    }

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');

    const io = getIO();
    if (populatedTask.assignedTo) {
      io.to(`user:${populatedTask.assignedTo._id}`).emit('task:updated', populatedTask);
    }
    io.to('admins').emit('task:updated', populatedTask);

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    const io = getIO();
    if (task.assignedTo) {
      io.to(`user:${task.assignedTo}`).emit('task:deleted', { _id: req.params.id });
    }
    io.to('admins').emit('task:deleted', { _id: req.params.id });

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('_id name email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getAllTasks, updateTask, deleteTask, getStudents };
