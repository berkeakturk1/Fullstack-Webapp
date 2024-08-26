const { Task, Taskboard, UserTask, User, sequelize } = require('../models'); // Ensure sequelize is imported here

class TaskService {
  // Create a task and assign users to it
  async createTask(data) {
    const { assignedTo, ...taskData } = data;

    // Create the task
    const task = await Task.create(taskData);

    // Assign users to the task if there are any
    if (assignedTo && assignedTo.length > 0) {
      await this.assignUsersToTask(assignedTo, task.m_id);
    }

    return task;
  }

  async updateTask(id, data) {
    const { assignedTo, ...taskData } = data;

    const task = await Task.findByPk(id);
    if (!task) throw new Error('Task not found');

    // Update the task details
    await task.update(taskData);

    // Update the assigned users
    if (assignedTo && assignedTo.length > 0) {
      await this.updateUsersForTask(assignedTo, task.m_id);
    }

    return task;
  }

  async updateUsersForTask(assignedTo, taskId) {
    if (!assignedTo || assignedTo.length === 0) {
        return;
    }

    try {
        const userIds = await this.getUserIdsFromUsernames(assignedTo);

        if (userIds.length > 0) {
            // Delete old user assignments using a raw SQL query
            await sequelize.query(
                `DELETE FROM user_tasks WHERE task_id = :taskId`,
                {
                    replacements: { taskId },
                    type: sequelize.QueryTypes.DELETE
                }
            );

            // Insert new user assignments using a raw SQL query
            const assignmentQueries = userIds.map(userId =>
                sequelize.query(
                    `INSERT INTO user_tasks (user_id, task_id, role, assigned_at) 
                    VALUES (:userId, :taskId, :role, :assignedAt)`,
                    {
                        replacements: {
                            userId,
                            taskId,
                            role: 'assignee',
                            assignedAt: new Date(),
                        },
                        type: sequelize.QueryTypes.INSERT
                    }
                )
            );

            await Promise.all(assignmentQueries);
        }
    } catch (error) {
        console.error('Error updating users for task:', error);
        throw new Error('Failed to update users for the task');
    }
}


  async deleteTask(id) {
    const task = await Task.findByPk(id);
    if (!task) throw new Error('Task not found');
    return task.destroy();
  }

  // New function to get user IDs from usernames
  async getUserIdsFromUsernames(usernames) {
    const userIds = [];
    for (const username of usernames) {
      const result = await User.findOne({
        where: { username },
        attributes: ['id'],
      });
      if (result) {
        userIds.push(result.id);
      }
    }
    return userIds;
  }

  async assignUsersToTask(usernames, taskId) {
    try {
      const userIds = await this.getUserIdsFromUsernames(usernames);
  
      if (userIds.length > 0) {
        const assignmentQueries = userIds.map(userId => {
          const query = `
            INSERT INTO user_tasks (user_id, task_id, role, assigned_at)
            VALUES (:userId, :taskId, :role, :assignedAt)
          `;
          
          return sequelize.query(query, {
            replacements: {
              userId,
              taskId,
              role: 'assignee', // Assuming this is the role you're assigning
              assignedAt: new Date(), // Assign the current date/time
            },
            type: sequelize.QueryTypes.INSERT, // Specifies that this is an INSERT query
          });
        });
  
        await Promise.all(assignmentQueries);
      }
    } catch (error) {
      console.error('Error assigning users to task:', error);
      throw new Error('Failed to assign users to the task');
    }
  } 
  

  async getTasksByTaskboardId(taskboardId) {
    try {
      const tasks = await Task.findAll({
        where: { taskboard_id: taskboardId },
        include: [
          {
            model: UserTask,
            attributes: ['task_id'],
            include: [
              {
                model: User,
                attributes: ['username'],
              },
            ],
          },
        ],
        attributes: ['m_id', 'task_title', 'task_content', 'status', 'importance', 'due_date', 'due_time'],
        order: [['m_id', 'ASC']],
      });

      return tasks.map(task => ({
        m_id: task.m_id,
        task_title: task.task_title,
        task_content: task.task_content,
        status: task.status,
        importance: task.importance,
        due_date: task.due_date,
        due_time: task.due_time,
        assigned_users: task.UserTasks.map(ut => ut.User.username), // Get usernames of assigned users
      }));
    } catch (error) {
      console.error('Error fetching tasks by taskboardId:', error);
      throw new Error('Failed to fetch tasks for the taskboard');
    }
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
