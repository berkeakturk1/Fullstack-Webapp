const UserService = require('../services/UserService');
const { User } = require('../models');

jest.mock('../models'); // Mock the User model to isolate service logic

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test to avoid cross-test pollution
  });

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      User.findAll.mockResolvedValue(mockUsers);

      const users = await UserService.getAllUsers();

      expect(User.findAll).toHaveBeenCalled();
      expect(users).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by ID', async () => {
      const mockUser = { id: 1, username: 'user1' };
      User.findByPk.mockResolvedValue(mockUser);

      const user = await UserService.getUserById(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(user).toEqual(mockUser);
    });

    it('should return null if the user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const user = await UserService.getUserById(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = { id: 1, username: 'newuser' };
      const userData = { username: 'newuser', password: 'password' };
      User.create.mockResolvedValue(mockUser);

      const createdUser = await UserService.createUser(userData);

      expect(User.create).toHaveBeenCalledWith(userData);
      expect(createdUser).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const mockUser = { id: 1, username: 'user1', update: jest.fn() };
      const updatedData = { username: 'updateduser' };
      mockUser.update.mockResolvedValue({ ...mockUser, ...updatedData });
      User.findByPk.mockResolvedValue(mockUser);

      const updatedUser = await UserService.updateUser(1, updatedData);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith(updatedData);
      expect(updatedUser).toEqual({ ...mockUser, ...updatedData });
    });

    it('should throw an error if the user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(UserService.updateUser(1, { username: 'updateduser' })).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const mockUser = { id: 1, username: 'user1', destroy: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);

      await UserService.deleteUser(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw an error if the user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(UserService.deleteUser(1)).rejects.toThrow('User not found');
    });
  });

  describe('getUserType', () => {
    it('should fetch the user type by username', async () => {
      const mockUserType = { user_type: 'admin' };
      User.findOne.mockResolvedValue(mockUserType);

      const userType = await UserService.getUserType('user1');

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'user1' }, attributes: ['user_type'] });
      expect(userType).toEqual(mockUserType);
    });

    it('should return null if the user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const userType = await UserService.getUserType('nonexistentuser');

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'nonexistentuser' }, attributes: ['user_type'] });
      expect(userType).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should fetch a user by username', async () => {
      const mockUser = { id: 1, username: 'user1' };
      User.findOne.mockResolvedValue(mockUser);

      const user = await UserService.getUserByUsername('user1');

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'user1' } });
      expect(user).toEqual(mockUser);
    });

    it('should return null if the user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const user = await UserService.getUserByUsername('nonexistentuser');

      expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'nonexistentuser' } });
      expect(user).toBeNull();
    });
  });
});
