const { User } = require('../models');

class UserService {
  async getAllUsers() {
    return User.findAll();
  }

  async getUserById(id) {
    return User.findByPk(id);
  }

  async createUser(data) {
    return User.create(data);
  }

  async updateUser(id, data) {
    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found');
    return user.update(data);
  }

  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found');
    return user.destroy();
  }

  async getUserType(username) {
    return User.findOne({ where: { username }, attributes: ['user_type'] });
  }

  // Add this method to get the user by username
  async getUserByUsername(username) {
    return User.findOne({ where: { username } });
  }
}

module.exports = new UserService();
