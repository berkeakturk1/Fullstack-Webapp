const request = require('supertest');
const express = require('express');
const UserTaskboardController = require('../controllers/UserTaskboardController');
const UserTaskboardService = require('../services/UserTaskboardService');

const app = express();
app.use(express.json());

// Define routes for testing
app.post('/usertaskboards', UserTaskboardController.addUserToTaskboard);
app.get('/usertaskboards/workforce', UserTaskboardController.getWorkforce);

jest.mock('../services/UserTaskboardService'); // Mock the UserTaskboardService to prevent actual database interaction

describe('UserTaskboardController', () => {
  describe('POST /usertaskboards', () => {
    it('should add a user to the taskboard', async () => {
      const mockUserTaskboard = {
        user_id: 1,
        taskboard_id: 2,
        role: 'editor',
      };
      UserTaskboardService.addUserToTaskboard.mockResolvedValue(mockUserTaskboard);

      const res = await request(app)
        .post('/usertaskboards')
        .send({ user_id: 1, taskboard_id: 2, role: 'editor' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(mockUserTaskboard);
    });

    it('should return 400 if user_id or taskboard_id is missing', async () => {
      const res = await request(app)
        .post('/usertaskboards')
        .send({ role: 'editor' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'User ID and Taskboard ID are required' });
    });

    it('should return 500 if there is an error adding user to taskboard', async () => {
      UserTaskboardService.addUserToTaskboard.mockRejectedValue(new Error('Failed to add user to taskboard'));

      const res = await request(app)
        .post('/usertaskboards')
        .send({ user_id: 1, taskboard_id: 2, role: 'editor' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to add user to taskboard' });
    });
  });

  describe('GET /usertaskboards/workforce', () => {
    it('should fetch the workforce for a taskboard', async () => {
      const mockWorkforce = [
        { user_id: 1, taskboard_id: 2, role: 'editor' },
        { user_id: 2, taskboard_id: 2, role: 'viewer' },
      ];
      UserTaskboardService.getWorkforce.mockResolvedValue(mockWorkforce);

      const res = await request(app)
        .get('/usertaskboards/workforce')
        .query({ taskboard_id: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockWorkforce);
    });

    it('should return 400 if there is an error fetching the workforce', async () => {
      UserTaskboardService.getWorkforce.mockRejectedValue(new Error('Taskboard not found'));

      const res = await request(app)
        .get('/usertaskboards/workforce')
        .query({ taskboard_id: 2 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Taskboard not found' });
    });

    it('should return 404 if taskboard_id is missing', async () => {
      const res = await request(app)
        .get('/usertaskboards/workforce');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Taskboard not found' });
    });
  });
});
