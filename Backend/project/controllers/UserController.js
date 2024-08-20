// controllers/UserController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async registerUser(req, res) {
    try {
      const { username, password, userType, email, fname, lname } = req.body;
      const fullname = `${fname} ${lname}`;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserService.createUser({
        username,
        password_hash: hashedPassword,
        user_type: userType,
        email,
        full_name: fullname
      });

      res.status(201).send('User registered successfully');
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async loginUser(req, res) {
    try {
      const { username, password } = req.body;
      const user = await UserService.getUserByUsername(username);
  
      if (!user) {
        console.error('User not found:', username);
        return res.status(401).send('Invalid credentials');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        console.error('Password mismatch for user:', username);
        return res.status(401).send('Invalid credentials');
      }
  
      const token = jwt.sign({ userId: user.id, userType: user.user_type }, 'secret_key', { expiresIn: '1h' });
      res.json({ token, userType: user.user_type, userId: user.id });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
  

  async getUserType(req, res) {
    try {
      const { username } = req.body;
      const user = await UserService.getUserType(username);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ userType: user.user_type });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = new UserController();
