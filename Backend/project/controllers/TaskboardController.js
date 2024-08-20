const { Taskboard, UserTaskboard, Workspace, Task, User } = require('../models');
const TaskboardService = require('../services/TaskboardService');
class TaskboardController {
  // Fetch taskboards where the user is a guest
  async getGuestTaskboards(req, res) {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const taskboards = await Taskboard.findAll({
        include: [{
          model: UserTaskboard,
          where: { user_id: userId },
          attributes: []
        }]
      });

      //console.log('Fetched GUEST taskboards:', taskboards);

      res.json(taskboards);
    } catch (error) {
      console.error('Error fetching guest taskboards:', error);
      res.status(500).json({ error: 'Failed to fetch guest taskboards' });
    }
  }

  

// Fetch taskboards where the user is a host (via Workspace)
async getHostTaskboards(req, res) {
  const { userId} = req.query;  // Destructure both userId and userType

  // Validate presence of both userId and userType
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Fetch taskboards where the associated workspace has the specified user as the host
    const taskboards = await Taskboard.findAll({
      include: {
        model: Workspace,
        where: { user_id: userId } // Filter workspaces by user ID (host)
      }
    });
    

    // Send the taskboards as the response
    res.json(taskboards);
  } catch (error) {
    console.error('Error fetching host taskboards:', error);
    res.status(500).json({ error: 'Failed to fetch host taskboards' });
  }
}

async flagTask(req, res) {
  try {
    const { taskId } = req.params;
    const updatedTask = await TaskService.flagTask(taskId);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error flagging task for review:', error);
    res.status(500).json({ error: 'Failed to flag task for review' });
  }
}



  // Fetch tasks for a specific taskboard
  async getTasksForTaskboard(req, res) {
    const taskboardId = req.query.taskboardId;
    if (!taskboardId) {
      return res.status(400).json({ error: 'Taskboard ID is required' });
    }

    try {
      const tasks = await Task.findAll({
        where: { taskboard_id: taskboardId }
      });

      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
}

module.exports = new TaskboardController();
