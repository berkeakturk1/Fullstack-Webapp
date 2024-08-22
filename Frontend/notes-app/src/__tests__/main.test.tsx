import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Main from '../main';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import * as router from 'react-router';
import MyAppBar from '../Appbar';
import Loading from '../loading';
import Login from '../login';
import Register from '../register';
import WorkspacePage from '../Workspace';
import App from '../App';
import RegularUserApp from '../RegularUserApp';

jest.mock('../Appbar', () => jest.fn(() => <div>AppBar</div>));
jest.mock('../loading', () => jest.fn(() => <div>Loading...</div>));
jest.mock('../login', () => jest.fn(({ onLogin }) => (
  <div>
    <button onClick={() => onLogin('admin')}>Login as Admin</button>
    <button onClick={() => onLogin('user')}>Login as User</button>
  </div>
)));
jest.mock('../register', () => jest.fn(() => <div>Register</div>));
jest.mock('../Workspace', () => jest.fn(() => <div>WorkspacePage</div>));
jest.mock('../App', () => jest.fn(() => <div>Admin App</div>));
jest.mock('../RegularUserApp', () => jest.fn(() => <div>RegularUserApp</div>));
jest.mock('../MyTasks', () => jest.fn(() => <div>MyTasks</div>));
jest.mock('../SprintManagement', () => jest.fn(() => <div>SprintManagement</div>));
jest.mock('../Teams', () => jest.fn(() => <div>Teams</div>));

describe('Main Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });


  test('redirects to workspace after login as admin', async () => {
    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login as Admin')).toBeInTheDocument();
    });

    userEvent.click(screen.getByText('Login as Admin'));

    await waitFor(() => {
      expect(localStorage.getItem('user_type')).toBe('admin');
      expect(screen.getByText('AppBar')).toBeInTheDocument();
      expect(screen.getByText('WorkspacePage')).toBeInTheDocument();
    });
  });

  test('renders AppBar and routes correctly when authenticated as admin', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_type', 'admin');

    render(
      <MemoryRouter initialEntries={['/workspace']}>
        <Main />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AppBar')).toBeInTheDocument();
      expect(screen.getByText('WorkspacePage')).toBeInTheDocument();
    });
  });

  

  test('navigates to register page', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Main />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
  });

  test('navigates to taskboard as admin', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_type', 'admin');

    render(
      <MemoryRouter initialEntries={['/taskboard/1']}>
        <Main />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin App')).toBeInTheDocument();
    });
  });

  test('navigates to taskboard as regular user', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_type', 'user');

    render(
      <MemoryRouter initialEntries={['/taskboard/1']}>
        <Main />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('RegularUserApp')).toBeInTheDocument();
    });
  });
});
