const request = require('supertest');
const express = require('express');
const RetrospectiveController = require('../controllers/RetrospectiveController');
const { RetrospectiveItem } = require('../models');

const app = express();
app.use(express.json());

// Define routes for testing
app.get('/retrospective/:taskboardId/items', RetrospectiveController.getRetrospectiveItems);
app.post('/retrospective/:taskboardId/items', RetrospectiveController.addRetrospectiveItem);
app.delete('/retrospective/items/:itemId', RetrospectiveController.deleteRetrospectiveItem);

jest.mock('../models'); // Mock the RetrospectiveItem model to prevent actual database interaction

describe('RetrospectiveController', () => {
  describe('GET /retrospective/:taskboardId/items', () => {
    it('should fetch all retrospective items for a taskboard', async () => {
      const mockItems = [
        { id: 1, taskboard_id: 1, type: 'Positive', cont: 'Good teamwork' },
        { id: 2, taskboard_id: 1, type: 'Negative', cont: 'Missed deadline' },
      ];
      RetrospectiveItem.findAll.mockResolvedValue(mockItems);

      const res = await request(app).get('/retrospective/1/items');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockItems);
    });

    it('should return 500 if there is an error fetching retrospective items', async () => {
      RetrospectiveItem.findAll.mockRejectedValue(new Error('Failed to fetch retrospective items'));

      const res = await request(app).get('/retrospective/1/items');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch retrospective items' });
    });
  });

  describe('POST /retrospective/:taskboardId/items', () => {
    it('should add a new retrospective item', async () => {
      const mockItem = { id: 1, taskboard_id: 1, type: 'Positive', cont: 'Good teamwork' };
      RetrospectiveItem.create.mockResolvedValue(mockItem);

      const res = await request(app)
        .post('/retrospective/1/items')
        .send({ type: 'Positive', cont: 'Good teamwork' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockItem);
    });

    it('should return 500 if there is an error adding a retrospective item', async () => {
      RetrospectiveItem.create.mockRejectedValue(new Error('Failed to add retrospective item'));

      const res = await request(app)
        .post('/retrospective/1/items')
        .send({ type: 'Positive', cont: 'Good teamwork' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to add retrospective item' });
    });
  });

  describe('DELETE /retrospective/items/:itemId', () => {
    it('should delete a retrospective item by ID', async () => {
      RetrospectiveItem.destroy.mockResolvedValue(1); // Mocking that one item was deleted

      const res = await request(app).delete('/retrospective/items/1');

      expect(res.statusCode).toBe(204);
    });

    it('should return 500 if there is an error deleting a retrospective item', async () => {
      RetrospectiveItem.destroy.mockRejectedValue(new Error('Failed to delete retrospective item'));

      const res = await request(app).delete('/retrospective/items/1');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete retrospective item' });
    });
  });
});
