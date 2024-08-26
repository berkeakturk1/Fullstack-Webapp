const TaskboardService = require('../services/TaskboardService');
const { Taskboard, UserTaskboard, Workspace, Task } = require('../models');

jest.mock('../models'); // Mock all models

describe('TaskboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe('createTaskboard', () => {
    it('should create a taskboard with the provided data', async () => {
      const mockData = { title: 'New Taskboard', description: 'Test Description', workspace_id: 1 };
      const mockTaskboard = { id: 1, ...mockData };
      Taskboard.create.mockResolvedValue(mockTaskboard);

      const result = await TaskboardService.createTaskboard(mockData);

      expect(Taskboard.create).toHaveBeenCalledWith(mockData);
      expect(result).toEqual(mockTaskboard);
    });
  });

  describe('getTaskboardsByUserId', () => {
    it('should fetch taskboards associated with the user', async () => {
      const mockTaskboards = [
        { id: 1, title: 'Taskboard 1', UserTaskboard: { user_id: 1, role: 'member' } },
        { id: 2, title: 'Taskboard 2', UserTaskboard: { user_id: 1, role: 'member' } }
      ];
      Taskboard.findAll.mockResolvedValue(mockTaskboards);

      const result = await TaskboardService.getTaskboardsByUserId(1);

      expect(Taskboard.findAll).toHaveBeenCalledWith({
        include: [{
          model: UserTaskboard,
          where: { user_id: 1 },
          attributes: ['user_id', 'taskboard_id', 'role']
        }]
      });
      expect(result).toEqual(mockTaskboards);
    });
  });

  describe('getTaskboardById', () => {
    it('should fetch a taskboard by its ID', async () => {
      const mockTaskboard = { id: 1, title: 'Taskboard 1', description: 'Test Description' };
      Taskboard.findByPk.mockResolvedValue(mockTaskboard);

      const result = await TaskboardService.getTaskboardById(1);

      expect(Taskboard.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTaskboard);
    });
  });

  describe('getTasksForTaskboard', () => {
    it('should fetch tasks associated with the given taskboard ID', async () => {
      const mockTasks = [
        { id: 1, task_title: 'Task 1', taskboard_id: 1 },
        { id: 2, task_title: 'Task 2', taskboard_id: 1 }
      ];
      Task.findAll.mockResolvedValue(mockTasks);

      const result = await TaskboardService.getTasksForTaskboard(1);

      expect(Task.findAll).toHaveBeenCalledWith({ where: { taskboard_id: 1 } });
      expect(result).toEqual(mockTasks);
    });

    it('should return an empty array if no taskboardId is provided', async () => {
      const result = await TaskboardService.getTasksForTaskboard(null);

      expect(result).toEqual([]);
      expect(Task.findAll).not.toHaveBeenCalled();
    });
  });

  describe('getTaskboardsByWorkspaceId', () => {
    it('should fetch taskboards associated with the given workspace ID', async () => {
      const mockTaskboards = [
        { id: 1, title: 'Taskboard 1', workspace_id: 1 },
        { id: 2, title: 'Taskboard 2', workspace_id: 1 }
      ];
      Taskboard.findAll.mockResolvedValue(mockTaskboards);

      const result = await TaskboardService.getTaskboardsByWorkspaceId(1);

      expect(Taskboard.findAll).toHaveBeenCalledWith({
        where: { workspace_id: 1 },
        include: [Workspace]
      });
      expect(result).toEqual(mockTaskboards);
    });
  });

});
