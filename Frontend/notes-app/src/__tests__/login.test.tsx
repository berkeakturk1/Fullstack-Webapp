import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Import this to use matchers like toBeInTheDocument and toHaveValue
import Login from '../login';
import axios from 'axios';
import userEvent from '@testing-library/user-event';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Login Component', () => {
  const onLoginMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('renders the login form', () => {
    render(<Login onLogin={onLoginMock} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('calls the API with username and password when form is submitted', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: 'fake-token', userType: 'admin', userId: 1 },
    });

    render(<Login onLogin={onLoginMock} />);

    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/login', {
        username: 'testuser',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', '1');
      expect(localStorage.setItem).toHaveBeenCalledWith('userType', 'admin');
      expect(onLoginMock).toHaveBeenCalledWith('admin');
    });
  });

  test('displays an error message when the login fails', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: 'Invalid credentials',
      },
    });

    render(<Login onLogin={onLoginMock} />);

    userEvent.type(screen.getByLabelText(/username/i), 'wronguser');
    userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:3001/login', {
        username: 'wronguser',
        password: 'wrongpassword',
      });
    });

    expect(screen.getByLabelText(/username/i)).toHaveValue('wronguser');
    expect(screen.getByLabelText(/password/i)).toHaveValue('wrongpassword');
  });
});
