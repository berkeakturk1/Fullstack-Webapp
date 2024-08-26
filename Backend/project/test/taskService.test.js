const TaskService = require('../services/TaskService');
const { Task, User, UserTask, Taskboard, sequelize } = require('../models');

jest.mock('../models'); // Mock the models to isolate service logic

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test pollution
  });

  describe('createTask', () => {
    it('should create a task and assign users to it', async () => {
      const mockTask = { m_id: 1, task_title: 'Test Task' };
      Task.create.mockResolvedValue(mockTask);
      jest.spyOn(TaskService, 'assignUsersToTask').mockResolvedValue();

      const data = {
        task_title: 'Test Task',
        assignedTo: ['user1', 'user2'],
      };

      const result = await TaskService.createTask(data);

      expect(Task.create).toHaveBeenCalledWith({ task_title: 'Test Task' });
      expect(TaskService.assignUsersToTask).toHaveBeenCalledWith(['user1', 'user2'], mockTask.m_id);
      expect(result).toEqual(mockTask);
    });

    it('should create a task without assigning users if no users are provided', async () => {
      const mockTask = { m_id: 1, task_title: 'Test Task' };
      Task.create.mockResolvedValue(mockTask);

      const data = {
        task_title: 'Test Task',
      };

      const result = await TaskService.createTask(data);

      expect(Task.create).toHaveBeenCalledWith({ task_title: 'Test Task' });
      expect(TaskService.assignUsersToTask).not.toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should update the task and reassign users', async () => {
      const mockTask = { m_id: 1, task_title: 'Test Task', update: jest.fn() };
      Task.findByPk.mockResolvedValue(mockTask);
      jest.spyOn(TaskService, 'updateUsersForTask').mockResolvedValue();

      const data = {
        task_title: 'Updated Task',
        assignedTo: ['user1', 'user2'],
      };

      const result = await TaskService.updateTask(1, data);

      expect(mockTask.update).toHaveBeenCalledWith({ task_title: 'Updated Task' });
      expect(TaskService.updateUsersForTask).toHaveBeenCalledWith(['user1', 'user2'], mockTask.m_id);
      expect(result).toEqual(mockTask);
    });

    it('should throw an error if the task is not found', async () => {
      Task.findByPk.mockResolvedValue(null);

      await expect(TaskService.updateTask(1, {})).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTask', () => {
    it('should delete the task by ID', async () => {
      const mockTask = { m_id: 1, destroy: jest.fn() };
      Task.findByPk.mockResolvedValue(mockTask);

      const result = await TaskService.deleteTask(1);

      expect(mockTask.destroy).toHaveBeenCalled();
      expect(result).toEqual(undefined); // No return value expected from destroy
    });

    it('should throw an error if the task is not found', async () => {
      Task.findByPk.mockResolvedValue(null);

      await expect(TaskService.deleteTask(1)).rejects.toThrow('Task not found');
    });
  });

  describe('getTasksByTaskboardId', () => {
    it('should fetch all tasks by taskboard ID', async () => {
      const mockTasks = [
        {
          m_id: 1,
          task_title: 'Task 1',
          UserTasks: [{ User: { username: 'user1' } }],
        },
      ];
      Task.findAll.mockResolvedValue(mockTasks);

      const result = await TaskService.getTasksByTaskboardId(1);

      expect(Task.findAll).toHaveBeenCalledWith({
        where: { taskboard_id: 1 },
        include: [
          {
            model: UserTask,
            attributes: ['task_id'],
            include: [
              {
                model: User,
                attributes: ['username'],
              },
            ],
          },
        ],
        attributes: ['m_id', 'task_title', 'task_content', 'status', 'importance', 'due_date', 'due_time'],
        order: [['m_id', 'ASC']],
      });
      expect(result).toEqual([
        {
          m_id: 1,
          task_title: 'Task 1',
          task_content: undefined,
          status: undefined,
          importance: undefined,
          due_date: undefined,
          due_time: undefined,
          assigned_users: ['user1'],
        },
      ]);
    });

    it('should throw an error if fetching tasks fails', async () => {
      Task.findAll.mockRejectedValue(new Error('Failed to fetch tasks'));

      await expect(TaskService.getTasksByTaskboardId(1)).rejects.toThrow('Failed to fetch tasks for the taskboard');
    });
  });

  describe('getUserTasks', () => {
    it('should fetch all tasks assigned to a user', async () => {
      const mockTasks = [
        {
          m_id: 1,
          task_title: 'Task 1',
          status: 'todo',
          due_date: new Date('2023-01-01'),
          Taskboard: { title: 'Taskboard 1' },
        },
      ];
      Task.findAll.mockResolvedValue(mockTasks);

      const result = await TaskService.getUserTasks(1);

      expect(Task.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: UserTask,
            where: { user_id: 1 },
            attributes: [],
          },
          {
            model: Taskboard,
            attributes: ['title'],
          },
        ],
        attributes: ['m_id', 'task_title', 'status', 'due_date', 'due_time'],
      });
      expect(result).toEqual([
        {
          id: 1,
          task_title: 'Task 1',
          taskboard: 'Taskboard 1',
          status: 'To Do',
          dueDate: new Date('2023-01-01'),
          dueTime: undefined,
          isLate: true,
          flaggedForReview: false,
        },
      ]);
    });

    
  });

  describe('flagTask', () => {
    it('should flag a task for review by updating its status to codeReview', async () => {
      jest.spyOn(TaskService, 'updateTask').mockResolvedValue({ status: 'codeReview' });

      const result = await TaskService.flagTask(1);

      expect(TaskService.updateTask).toHaveBeenCalledWith(1, { status: 'codeReview' });
      expect(result).toEqual({ status: 'codeReview' });
    });
  });
});
