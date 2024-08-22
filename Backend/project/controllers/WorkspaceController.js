const { Workspace } = require('../models'); // Assuming Workspace is your Sequelize model

class WorkspaceController {
  async getWorkspaceId(req, res) {
    const userId = req.query.userId;

    // Log the incoming request (for debugging purposes)
    // console.log(`Received request for workspaceId with userId: ${userId}`);

    try {
      // Find the workspace by user_id using Sequelize
      const workspace = await Workspace.findOne({
        where: { user_id: userId },
        attributes: ['id'],
      });

      if (!workspace) {
        console.log('Workspace not found for user:', userId);
        return res.status(404).json({ error: 'Workspace not found for user' });
      }

      // Log the found workspace ID (for debugging purposes)
      // console.log('Workspace found:', workspace.id);

      // Respond with the workspace ID
      res.json({ workspaceId: workspace.id });
    } catch (error) {
      console.error('Error fetching workspace ID:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new WorkspaceController();
