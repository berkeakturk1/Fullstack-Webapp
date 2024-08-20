// services/TaskService.js
const { Task, Taskboard, UserTask } = require('../models');

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
    console.log('Fetching tasks for userId:', userId);
    const tasks = await Task.findAll({
      include: [
        {
          model: UserTask,
          where: { user_id: userId },
          attributes: [], // No need to return any fields from UserTask
        },
        {
          model: Taskboard,
          attributes: ['title'], // Include taskboard title
        },
      ],
      attributes: ['m_id', 'task_title', 'status', 'due_date', 'due_time'],
    });

    return tasks.map(task => ({
      id: task.m_id,
      task_title: task.task_title,
      taskboard: task.Taskboard.title, // Use the taskboard title from the association
      status: task.status === "todo" ? "To Do" : task.status === "inProgress" ? "In Progress" : task.status === "codeReview" ? "Code Review" : "Done",
      dueDate: task.due_date,  // Include due_date in response
      dueTime: task.due_time,  // Include due_time in response
      isLate: task.due_date && task.due_date < new Date(),  // Check if the task is late
      flaggedForReview: task.status === 'codeReview', // Assuming flagging is based on status
    }));
  }
}

module.exports = new TaskService();
