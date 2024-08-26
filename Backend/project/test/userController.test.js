const request = require('supertest');
const express = require('express');
const UserController = require('../controllers/UserController');
const UserService = require('../services/UserService');
const bcrypt = require('bcryptjs'); // Add bcrypt for mocking password comparison

const app = express();
app.use(express.json());

// Define routes for testing
app.get('/users', UserController.getAllUsers);
app.post('/users/register', UserController.registerUser);
app.post('/users/login', UserController.loginUser);
app.post('/users/type', UserController.getUserType);

jest.mock('../services/UserService'); // Mock the UserService to prevent actual database interaction
jest.mock('bcryptjs'); // Mock bcrypt to control its behavior

describe('UserController', () => {
  describe('GET /users', () => {
    it('should fetch all users', async () => {
      const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      UserService.getAllUsers.mockResolvedValue(mockUsers);

      const res = await request(app).get('/users');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUsers);
    });

    it('should return 500 if fetching users fails', async () => {
      UserService.getAllUsers.mockRejectedValue(new Error('Failed to fetch users'));

      const res = await request(app).get('/users');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to fetch users' });
    });
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        username: 'newuser',
        password_hash: 'hashedpassword',
        user_type: 'user',
        email: 'newuser@example.com',
        full_name: 'New User'
      };
      UserService.createUser.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/users/register')
        .send({ username: 'newuser', password: 'password', userType: 'user', email: 'newuser@example.com', fname: 'New', lname: 'User' });

      expect(res.statusCode).toBe(201);
      expect(res.text).toBe('User registered successfully');
    });

    it('should return 500 if registration fails', async () => {
      UserService.createUser.mockRejectedValue(new Error('Registration failed'));

      const res = await request(app)
        .post('/users/register')
        .send({ username: 'newuser', password: 'password', userType: 'user', email: 'newuser@example.com', fname: 'New', lname: 'User' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Registration failed' });
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user with valid credentials', async () => {
      const mockUser = { id: 1, username: 'user1', password_hash: 'hashedpassword', user_type: 'user' };
      UserService.getUserByUsername.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true); // Mock bcrypt.compare to return true

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'user1', password: 'password' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toEqual(expect.objectContaining({
        userType: mockUser.user_type,
        userId: mockUser.id
      }));
    });

    it('should return 401 if credentials are invalid', async () => {
      UserService.getUserByUsername.mockResolvedValue(null);

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'invaliduser', password: 'password' });

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe('Invalid credentials');
    });

    it('should return 500 if login fails', async () => {
      UserService.getUserByUsername.mockRejectedValue(new Error('Login failed'));

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'user1', password: 'password' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Login failed' });
    });
  });

  describe('POST /users/type', () => {
    it('should return the user type for a valid user', async () => {
      const mockUser = { id: 1, username: 'user1', user_type: 'admin' };
      UserService.getUserType.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/users/type')
        .send({ username: 'user1' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ userType: mockUser.user_type });
    });

    it('should return 404 if user is not found', async () => {
      UserService.getUserType.mockResolvedValue(null);

      const res = await request(app)
        .post('/users/type')
        .send({ username: 'invaliduser' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
    });

    it('should return 500 if fetching user type fails', async () => {
      UserService.getUserType.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/users/type')
        .send({ username: 'user1' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Database error' });
    });
  });
});
