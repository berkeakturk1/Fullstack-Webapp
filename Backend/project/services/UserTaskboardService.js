const { UserTaskboard, sequelize, Sequelize } = require('../models'); // Import Sequelize

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
          returning: ['user_id', 'taskboard_id', 'role'],
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

    const taskboard = await sequelize.query(
      `SELECT DISTINCT u.username FROM user_taskboards ut,users u WHERE ut.taskboard_id = :taskboardId `,
      {
          replacements: { taskboardId },
          type: Sequelize.QueryTypes.SELECT  // Corrected: Use Sequelize.QueryTypes
      }
    );

    if (taskboard.length === 0) {  // Check if the result is empty
      throw new Error('Taskboard not found');
    }

    if (!taskboard) {
        throw new Error('Taskboard not found');
    }

    // Modify according to what you expect to return, this is a placeholder
    return taskboard.map(user => ({
        username: user.username,
    }));
  }
}

module.exports = new UserTaskboardService();
