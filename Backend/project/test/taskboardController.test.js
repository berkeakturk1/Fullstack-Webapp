const request = require('supertest');
const express = require('express');
const TaskboardController = require('../controllers/TaskboardController.js');
const { Taskboard, UserTaskboard, Workspace, Task } = require('../models/index.js');

// Create an Express application for testing
const app = express();
app.use(express.json());

// Define routes for testing
app.get('/taskboards/guest', TaskboardController.getGuestTaskboards);
app.post('/taskboards', TaskboardController.createTaskboard);
app.get('/taskboards/host', TaskboardController.getHostTaskboards);
app.get('/taskboards/tasks', TaskboardController.getTasksForTaskboard);

jest.mock('../models'); // Mock the models to prevent actual database interaction

describe('TaskboardController', () => {
  describe('GET /taskboards/guest', () => {
    it('should return guest taskboards for the user', async () => {
      const mockTaskboards = [{ id: 1, title: 'Taskboard 1' }];
      Taskboard.findAll.mockResolvedValue(mockTaskboards);

      const res = await request(app).get('/taskboards/guest').query({ userId: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTaskboards);
    });

    it('should return 400 if userId is not provided', async () => {
      const res = await request(app).get('/taskboards/guest');

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'User ID is required' });
    });
  });

  describe('POST /taskboards', () => {
    it('should create a new taskboard', async () => {
      const mockTaskboard = { id: 1, title: 'New Taskboard', description: 'A test taskboard', workspace_id: 1 };
      Taskboard.create.mockResolvedValue(mockTaskboard);

      const res = await request(app)
        .post('/taskboards')
        .send({ title: 'New Taskboard', description: 'A test taskboard', workspace_id: 1 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(mockTaskboard);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/taskboards')
        .send({ title: 'New Taskboard' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Title, description, and workspace ID are required' });
    });
  });

  describe('GET /taskboards/host', () => {
    it('should return host taskboards for the user', async () => {
      const mockTaskboards = [{ id: 2, title: 'Host Taskboard' }];
      Taskboard.findAll.mockResolvedValue(mockTaskboards);

      const res = await request(app).get('/taskboards/host').query({ userId: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTaskboards);
    });

    it('should return 400 if userId is not provided', async () => {
      const res = await request(app).get('/taskboards/host');

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'User ID is required' });
    });
  });

  describe('GET /taskboards/tasks', () => {
    it('should return tasks for a specific taskboard', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1' }];
      Task.findAll.mockResolvedValue(mockTasks);

      const res = await request(app).get('/taskboards/tasks').query({ taskboardId: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockTasks);
    });

    it('should return 400 if taskboardId is not provided', async () => {
      const res = await request(app).get('/taskboards/tasks');

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Taskboard ID is required' });
    });
  });

 
});
