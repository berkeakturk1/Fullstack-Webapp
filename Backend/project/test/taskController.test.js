const request = require('supertest');
const express = require('express');
const TaskController = require('../controllers/TaskController');
const TaskService = require('../services/TaskService');

// Create an Express application for testing
const app = express();
app.use(express.json());

// Add this before defining the routes
app.use((req, res, next) => {
    req.user = { id: 1 }; // Mocking the user object
    next();
  });
  
  // Define routes for testing
  app.post('/tasks', TaskController.createTask);
  app.put('/tasks/:id', TaskController.updateTask);
  app.get('/tasks/user', TaskController.getUserTasks);
  app.delete('/tasks/:id', TaskController.deleteTask);
  app.get('/tasks', TaskController.getTasks);
  app.post('/tasks/:taskId/flag', TaskController.flagTask);
  

jest.mock('../services/TaskService'); // Mock the TaskService to prevent actual database interaction

describe('TaskController', () => {
  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const mockTask = { id: 1, task_title: 'New Task', task_content: 'Test content' };
      TaskService.createTask.mockResolvedValue(mockTask);

      const res = await request(app)
        .post('/tasks')
        .send({ title: 'New Task', content: 'Test content', taskboardId: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTask);
    });

    it('should return 500 if there is an error creating the task', async () => {
      TaskService.createTask.mockRejectedValue(new Error('Failed to create task'));

      const res = await request(app)
        .post('/tasks')
        .send({ title: 'New Task', content: 'Test content', taskboardId: 1 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to create task' });
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update an existing task', async () => {
      const mockUpdatedTask = { id: 1, task_title: 'Updated Task', task_content: 'Updated content' };
      TaskService.updateTask.mockResolvedValue(mockUpdatedTask);

      const res = await request(app)
        .put('/tasks/1')
        .send({ title: 'Updated Task', content: 'Updated content' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUpdatedTask);
    });

    it('should return 500 if there is an error updating the task', async () => {
      TaskService.updateTask.mockRejectedValue(new Error('Failed to update task'));

      const res = await request(app)
        .put('/tasks/1')
        .send({ title: 'Updated Task', content: 'Updated content' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update task' });
    });
  });

  describe('GET /tasks/user', () => {
    it('should fetch user tasks', async () => {
      const mockTasks = [{ id: 1, task_title: 'User Task 1' }];
      TaskService.getUserTasks.mockResolvedValue(mockTasks);
  
      // Mocking req.user
      app.use((req, res, next) => {
        req.user = { id: 1 };
        next();
      });
  
      const res = await request(app)
        .get('/tasks/user')
        .set('Authorization', 'Bearer token'); // Mocking authorization
  
      console.error(res.body); // For debugging purposes
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTasks);
    });
  });
  

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      TaskService.deleteTask.mockResolvedValue();

      const res = await request(app).delete('/tasks/1');

      expect(res.statusCode).toBe(204);
    });

    it('should return 500 if there is an error deleting the task', async () => {
      TaskService.deleteTask.mockRejectedValue(new Error('Failed to delete task'));

      const res = await request(app).delete('/tasks/1');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete task' });
    });
  });

  describe('GET /tasks', () => {
    it('should fetch tasks by taskboard ID', async () => {
      const mockTasks = [{ id: 1, task_title: 'Task 1' }];
      TaskService.getTasksByTaskboardId.mockResolvedValue(mockTasks);

      const res = await request(app).get('/tasks').query({ taskboardId: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTasks);
    });

    it('should return 500 if there is an error fetching tasks', async () => {
      TaskService.getTasksByTaskboardId.mockRejectedValue(new Error('Failed to fetch tasks'));

      const res = await request(app).get('/tasks').query({ taskboardId: 1 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch tasks' });
    });
  });

  describe('POST /tasks/:taskId/flag', () => {
    it('should flag a task for review', async () => {
      TaskService.flagTask.mockResolvedValue();

      const res = await request(app).post('/tasks/1/flag');

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Task flagged for review successfully");
    });

    it('should return 500 if there is an error flagging the task', async () => {
      TaskService.flagTask.mockRejectedValue(new Error('Failed to flag task'));

      const res = await request(app).post('/tasks/1/flag');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to flag task' });
    });
  });
});
