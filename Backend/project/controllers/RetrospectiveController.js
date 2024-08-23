const { RetrospectiveItem } = require('../models');

class RetrospectiveController {
  // Fetch all retrospective items for a specific taskboard
  async getRetrospectiveItems(req, res) {
    const { taskboardId } = req.params;
    try {
      const items = await RetrospectiveItem.findAll({ where: { taskboard_id: taskboardId } });
      res.json(items);
    } catch (error) {
      console.error('Error fetching retrospective items:', error);
      res.status(500).json({ error: 'Failed to fetch retrospective items' });
    }
  }

  // Add a new retrospective item
  async addRetrospectiveItem(req, res) {
    const { taskboardId } = req.params;
    const { type, cont } = req.body;
    try {
      const item = await RetrospectiveItem.create({
        taskboard_id: taskboardId,
        type,
        cont,
      });
      res.json(item);
    } catch (error) {
      console.error('Error adding retrospective item:', error);
      res.status(500).json({ error: 'Failed to add retrospective item' });
    }
  }

  // Delete a retrospective item by ID
  async deleteRetrospectiveItem(req, res) {
    const { itemId } = req.params;
    try {
      await RetrospectiveItem.destroy({ where: { id: itemId } });
      res.status(204).send(); // No content response
    } catch (error) {
      console.error('Error deleting retrospective item:', error);
      res.status(500).json({ error: 'Failed to delete retrospective item' });
    }
  }
}

module.exports = new RetrospectiveController();
