// services/UserTaskboardService.js

const { UserTaskboard, User } = require('../models');

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

  async getWorkforce(taskboardId) {
    if (!taskboardId) {
        throw new Error('taskboard_id is required');
    }

    const taskboard = await UserTaskboard.findOne({
        where: { id: taskboardId },
        include: {
            model: User,
            attributes: ['username'], // Only select the username field
        }
    });

    if (!taskboard) {
        throw new Error('Taskboard not found');
    }

    return taskboard.Users.map(user => ({
        username: user.username
    }));
}


}

module.exports = new UserTaskboardService();
