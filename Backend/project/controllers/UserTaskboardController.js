// controllers/UserTaskboardController.js

const UserTaskboardService = require('../services/UserTaskboardService');

class UserTaskboardController {
  async addUserToTaskboard(req, res) {
    const { user_id, taskboard_id, role } = req.body;

    if (!user_id || !taskboard_id) {
      return res.status(400).json({ error: 'User ID and Taskboard ID are required' });
    }

    try {
      const userTaskboard = await UserTaskboardService.addUserToTaskboard(user_id, taskboard_id, role);
      res.status(201).json(userTaskboard);
    } catch (error) {
      console.error('Error adding user to taskboard:', error);
      res.status(500).json({ error: 'Failed to add user to taskboard' });
    }
  }

  async getWorkforce(req, res) {
    const { taskboard_id } = req.query;

    try {
      const workforce = await UserTaskboardService.getWorkforce(taskboard_id);
      res.json(workforce);
    } catch (error) {
      console.error('Error fetching workforce:', error);
      const statusCode = error.message === 'Taskboard not found' ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = new UserTaskboardController();
