const TaskService = require('../services/TaskService');

class TaskController {
  async createTask(req, res) {
    try {
      const { title, content, status, importance, dueDate, dueTime, taskboardId, assignedTo } = req.body;

      // Create the task with assigned users
      const task = await TaskService.createTask({
        task_title: title,
        task_content: content,
        status: status || 'todo',
        importance: importance || 'No time Constraint',
        due_date: dueDate || null,
        due_time: dueTime || null,
        taskboard_id: taskboardId,
        assignedTo: assignedTo || [] // Pass the assigned users to the service
      });

      res.json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, content, status, importance, dueDate, dueTime, assignedTo } = req.body;

      // Update the task and reassign users
      const updatedTask = await TaskService.updateTask(id, {
        task_title: title,
        task_content: content,
        status,
        importance,
        due_date: dueDate || null,
        due_time: dueTime || null,
        assignedTo: assignedTo || [] // Pass the assigned users to the service
      });

      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  async getUserTasks(req, res) {
    try {
      const userId = req.user.id || req.user.userId; // Adjust based on the payload structure
      if (!userId) {
        throw new Error('User ID is missing from token');
      }
      const tasks = await TaskService.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      res.status(500).json({ error: 'Failed to fetch user tasks' });
    }
  }

  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      await TaskService.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  async getTasks(req, res) {
    try {
      const { taskboardId } = req.query;
      const tasks = await TaskService.getTasksByTaskboardId(taskboardId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  async flagTask(req, res) {
    try {
      const { taskId } = req.params;
      await TaskService.flagTask(taskId);
      res.status(200).send("Task flagged for review successfully");
    } catch (error) {
      res.status(500).json({ error: 'Failed to flag task' });
    }
  }
}

module.exports = new TaskController();
