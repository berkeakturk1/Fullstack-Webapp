const request = require('supertest');
const express = require('express');
const WorkspaceController = require('../controllers/WorkspaceController');
const { Workspace } = require('../models');

const app = express();
app.use(express.json());

// Define routes for testing
app.get('/workspace', WorkspaceController.getWorkspaceId);

jest.mock('../models'); // Mock the Workspace model to prevent actual database interaction

describe('WorkspaceController', () => {
  describe('GET /workspace', () => {
    it('should return the workspace ID for a valid user ID', async () => {
      const mockWorkspace = { id: 1 };
      Workspace.findOne.mockResolvedValue(mockWorkspace);

      const res = await request(app).get('/workspace').query({ userId: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ workspaceId: mockWorkspace.id });
    });

    it('should return 404 if the workspace is not found', async () => {
      Workspace.findOne.mockResolvedValue(null);

      const res = await request(app).get('/workspace').query({ userId: 1 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Workspace not found for user' });
    });

    it('should return 500 if there is a server error', async () => {
      Workspace.findOne.mockRejectedValue(new Error('Server error'));

      const res = await request(app).get('/workspace').query({ userId: 1 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Server error' });
    });
  });
});
