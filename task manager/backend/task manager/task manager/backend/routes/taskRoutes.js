const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }
    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : ''
    });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }
    if (status && !['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router;
