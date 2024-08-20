// controllers/TaskController.js
const TaskService = require('../services/TaskService');

class TaskController {
  async createTask(req, res) {
    try {
      const { title, content, status, importance, dueDate, dueTime, taskboardId, assignedTo } = req.body;
      const task = await TaskService.createTask({
        task_title: title,
        task_content: content,
        status: status || 'todo',
        importance: importance || 'No time Constraint',
        due_date: dueDate || null,
        due_time: dueTime || null,
        taskboard_id: taskboardId
      });

      if (assignedTo && assignedTo.length > 0) {
        const userIds = await UserService.getUserIdsFromUsernames(assignedTo);
        await Promise.all(userIds.map(userId =>
          TaskService.assignUserToTask(userId, task.m_id)
        ));
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  async getUserTasks(req, res) {
    try {
      const userId = req.user.id; // Assuming the user ID is extracted from the token in a middleware
      const tasks = await TaskService.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      res.status(500).json({ error: 'Failed to fetch user tasks' });
    }
  }

  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, content, status, importance, dueDate, dueTime, assignedTo } = req.body;

      const updatedTask = await TaskService.updateTask(id, {
        task_title: title,
        task_content: content,
        status,
        importance,
        due_date: dueDate || null,
        due_time: dueTime || null
      });

      if (assignedTo && assignedTo.length > 0) {
        await TaskService.clearTaskAssignments(id);
        const userIds = await UserService.getUserIdsFromUsernames(assignedTo);
        await Promise.all(userIds.map(userId =>
          TaskService.assignUserToTask(userId, id)
        ));
      }

      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task' });
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
