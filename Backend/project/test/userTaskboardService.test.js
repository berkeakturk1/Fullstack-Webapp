const UserTaskboardService = require('../services/UserTaskboardService');
const { UserTaskboard, sequelize, Sequelize } = require('../models');

jest.mock('../models'); // Mock the models to isolate service logic

describe('UserTaskboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test pollution
  });

  describe('addUserToTaskboard', () => {
    it('should add a user to a taskboard', async () => {
      const mockUserTaskboard = { user_id: 1, taskboard_id: 1, role: 'editor' };
      UserTaskboard.create.mockResolvedValue(mockUserTaskboard);

      const result = await UserTaskboardService.addUserToTaskboard(1, 1, 'editor');

      expect(UserTaskboard.create).toHaveBeenCalledWith(
        {
          user_id: 1,
          taskboard_id: 1,
          role: 'editor',
        },
        {
          returning: ['user_id', 'taskboard_id', 'role'],
        }
      );
      expect(result).toEqual(mockUserTaskboard);
    });

    it('should throw an error if adding the user to the taskboard fails', async () => {
      UserTaskboard.create.mockRejectedValue(new Error('Failed to add user to taskboard'));

      await expect(UserTaskboardService.addUserToTaskboard(1, 1, 'editor')).rejects.toThrow('Failed to add user to taskboard');
    });
  });

  describe('getWorkforce', () => {
    it('should fetch the workforce for a taskboard', async () => {
      const mockWorkforce = [{ username: 'user1' }, { username: 'user2' }];
      sequelize.query.mockResolvedValue(mockWorkforce);

      const result = await UserTaskboardService.getWorkforce(1);

      expect(sequelize.query).toHaveBeenCalledWith(
        `SELECT DISTINCT u.username FROM user_taskboards ut,users u WHERE ut.taskboard_id = :taskboardId `,
        {
          replacements: { taskboardId: 1 },
          type: Sequelize.QueryTypes.SELECT,
        }
      );
      expect(result).toEqual(mockWorkforce.map(user => ({ username: user.username })));
    });

    it('should throw an error if taskboard_id is not provided', async () => {
      await expect(UserTaskboardService.getWorkforce()).rejects.toThrow('taskboard_id is required');
    });

    it('should throw an error if the taskboard is not found', async () => {
        sequelize.query.mockResolvedValue([]);  // Simulate no results found
      
        await expect(UserTaskboardService.getWorkforce(1)).rejects.toThrow('Taskboard not found');
      });
      
  });
});
