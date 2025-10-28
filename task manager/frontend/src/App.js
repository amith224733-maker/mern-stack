import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, TextField, List, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required!');
    try {
      await axios.post('/api/tasks', { title, description });
      setTitle('');
      setDescription('');
      fetchTasks();
      alert('Task created successfully!');
    } catch (error) {
      alert('Error creating task');
    }
  };

  const handleToggle = async (id, status) => {
    const newStatus = status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await axios.put(`/api/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      alert('Error updating task');
    }
  };

  const openEdit = (task) => {
    setCurrentTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) return alert('Title cannot be empty!');
    try {
      await axios.put(`/api/tasks/${currentTask._id}`, { title: editTitle, description: editDesc });
      setEditOpen(false);
      fetchTasks();
      alert('Task updated successfully!');
    } catch (error) {
      alert('Error updating task');
    }
  };

  const openDelete = (task) => {
    setCurrentTask(task);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/tasks/${currentTask._id}`);
      setDeleteOpen(false);
      fetchTasks();
      alert('Task deleted successfully!');
    } catch (error) {
      alert('Error deleting task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                         (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, color: '#667eea', mb: 3 }}>
            📝 Task Manager
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, flex: 1, minWidth: 120, backgroundColor: '#e3f2fd' }}>
              <Typography variant="h4" fontWeight="bold">{total}</Typography>
              <Typography variant="body2">Total Tasks</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, minWidth: 120, backgroundColor: '#e8f5e9' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">{completed}</Typography>
              <Typography variant="body2">Completed</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, minWidth: 120, backgroundColor: '#fff3e0' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">{pending}</Typography>
              <Typography variant="body2">Pending</Typography>
            </Paper>
          </Box>

          <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
            <form onSubmit={handleCreate}>
              <TextField fullWidth label="Task Title *" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth label="Description (Optional)" multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ backgroundColor: '#667eea', '&:hover': { backgroundColor: '#5568d3' } }}>
                Add Task
              </Button>
            </form>
          </Paper>

          <Paper elevation={2} sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField size="small" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant={filter === 'All' ? 'contained' : 'outlined'} onClick={() => setFilter('All')}>All</Button>
                <Button variant={filter === 'Pending' ? 'contained' : 'outlined'} color="warning" onClick={() => setFilter('Pending')}>Pending</Button>
                <Button variant={filter === 'Completed' ? 'contained' : 'outlined'} color="success" onClick={() => setFilter('Completed')}>Completed</Button>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Your Tasks ({filteredTasks.length})
          </Typography>

          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">No tasks found. Add a new task to get started!</Typography>
            </Box>
          ) : (
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredTasks.map((task) => (
                <Paper key={task._id} elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, opacity: task.status === 'Completed' ? 0.8 : 1 }}>
                  <IconButton onClick={() => handleToggle(task._id, task.status)} sx={{ color: task.status === 'Completed' ? '#4caf50' : '#9e9e9e' }}>
                    {task.status === 'Completed' ? <CheckCircleIcon fontSize="large" /> : <RadioButtonUncheckedIcon fontSize="large" />}
                  </IconButton>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                        {task.title}
                      </Typography>
                      <Chip label={task.status} size="small" color={task.status === 'Completed' ? 'success' : 'warning'} />
                    </Box>
                    {task.description && <Typography variant="body2" color="text.secondary">{task.description}</Typography>}
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(task.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => openEdit(task)} sx={{ color: '#667eea' }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => openDelete(task)} sx={{ color: '#f44336' }}>
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              ))}
            </List>
          )}

          <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogContent>
              <TextField fullWidth label="Task Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={{ mt: 2, mb: 2 }} />
              <TextField fullWidth label="Description" multiline rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit} variant="contained">Save Changes</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete "{currentTask?.title}"? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
