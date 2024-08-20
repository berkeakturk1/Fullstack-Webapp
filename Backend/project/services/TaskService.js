// services/TaskService.js
const { Task, Taskboard } = require('../models');

class TaskService {
  async createTask(data) {
    return Task.create(data);
  }

  async updateTask(id, data) {
    const task = await Task.findByPk(id);
    if (!task) throw new Error('Task not found');
    return task.update(data);
  }

  

  async deleteTask(id) {
    const task = await Task.findByPk(id);
    if (!task) throw new Error('Task not found');
    return task.destroy();
  }

  async getTasksByTaskboardId(taskboardId) {
    return Task.findAll({
      where: { taskboard_id: taskboardId }
    });
  }

  async flagTask(taskId) {
    return this.updateTask(taskId, { status: 'codeReview' });
  }

  async getUserTasks(userId) {
    return Task.findAll({
      include: [{
        model: Taskboard,
        where: { user_id: userId },  // Assuming Taskboard has a user_id field
        attributes: ['title'] // Fetch the taskboard title along with the task
      }],
      attributes: ['id', 'task_title', 'status', 'dueDate', 'dueTime'],
    });
  }
}

module.exports = new TaskService();
