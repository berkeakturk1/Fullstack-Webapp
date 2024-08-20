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
}

module.exports = new UserTaskboardController();
