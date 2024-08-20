const { Taskboard, UserTaskboard, Workspace, Task } = require('../models');

class TaskboardService {
  async createTaskboard(data) {
    console.log('Creating taskboard with data:', data);
    return Taskboard.create(data);
  }

  // Fetch taskboards for a user based on their association in the UserTaskboard model
  async getTaskboardsByUserId(userId) {
    const taskboards = await Taskboard.findAll({
      include: [{
        model: UserTaskboard,
        where: { user_id: userId },
        attributes: ['user_id', 'taskboard_id', 'role']
      }]
    });
    return taskboards;
  }

  // Fetch a taskboard by its ID
  async getTaskboardById(id) {
   // console.log('Fetching taskboard with id:', id);
    const taskboard = await Taskboard.findByPk(id);
    //console.log('Fetched taskboard:', taskboard);
    return taskboard;
  }



  

  // Fetch tasks for a specific taskboard
  async getTasksForTaskboard(taskboardId) {
    //console.log('Fetching tasks for taskboardId:', taskboardId);
    if (!taskboardId) {
      console.error('No taskboardId provided for fetching tasks');
      return [];
    }
    const tasks = await Task.findAll({
      where: { taskboard_id: taskboardId }
    });
    console.log('Fetched tasks:', tasks);
    return tasks;
  }

  // Fetch taskboards belonging to a specific workspace
  async getTaskboardsByWorkspaceId(workspaceId) {
    //console.log('Fetching taskboards for workspaceId:', workspaceId);
    const taskboards = await Taskboard.findAll({
      where: { workspace_id: workspaceId },
      include: [Workspace]
    });
    //console.log('Fetched taskboards for workspace:', taskboards);
    return taskboards;
  }

  // Fetch taskboards for a user where the user is the host, typically associated through Workspace
  async getTaskboardsByUserAndWorkspace(userId) {
    console.log('Fetching host taskboards for userId:', userId);
    const hostTaskboards = await Taskboard.findAll({
      include: [{
        model: Workspace,
        where: { user_id: userId }
      }]
    });
   // console.log('Fetched host taskboards:', hostTaskboards);

   // console.log('Fetching guest taskboards for userId:', userId);
    const guestTaskboards = await Taskboard.findAll({
      include: [{
        model: UserTaskboard,
        where: { user_id: userId },
        attributes: ['user_id', 'taskboard_id', 'role']
      }]
    });
    //console.log('Fetched guest taskboards:', guestTaskboards);

    // Combine the results from both queries
    const combinedTaskboards = [...hostTaskboards, ...guestTaskboards];
   // console.log('Combined taskboards:', combinedTaskboards);

    // Fetch and attach tasks for each taskboard
    for (const taskboard of combinedTaskboards) {
      const tasks = await this.getTasksForTaskboard(taskboard.id);
      taskboard.dataValues.tasks = tasks;
    }

    return combinedTaskboards;
  }
}

module.exports = new TaskboardService();
