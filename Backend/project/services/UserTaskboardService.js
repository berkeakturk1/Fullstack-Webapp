// services/UserTaskboardService.js

const { UserTaskboard } = require('../models');

class UserTaskboardService {
  async addUserToTaskboard(user_id, taskboard_id, role = 'editor') {
    try {
      const userTaskboard = await UserTaskboard.create(
        {
          user_id,
          taskboard_id,
          role,
        },
        {
          returning: ['user_id', 'taskboard_id', 'role'], // Specify fields to return explicitly
        }
      );
      return userTaskboard;
    } catch (error) {
      throw new Error('Failed to add user to taskboard');
    }
  }
}

module.exports = new UserTaskboardService();
