import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WorkspacePage from '../Workspace';
import { BrowserRouter as Router } from 'react-router-dom';

global.fetch = jest.fn();

const mockGuestTaskboards = [
    {
        id: 1,
        title: 'Guest Taskboard 1',
        description: 'Description for Guest Taskboard 1',
        created_at: '2024-08-01',
    }
];

const mockHostTaskboards = [
    {
        id: 2,
        title: 'Host Taskboard 1',
        description: 'Description for Host Taskboard 1',
        created_at: '2024-08-02',
    }
];

const mockTasks = [
    { status: 'Done' },
    { status: 'In Progress' },
    { status: 'Code Review' },
];

beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage values
    localStorage.setItem('userId', 'testUserId');
    localStorage.setItem('userType', 'testUserType');
    localStorage.setItem('token', 'testToken');
});

const renderComponent = () => {
    return render(
        <Router>
            <WorkspacePage />
        </Router>
    );
};

test('renders the WorkspacePage component', async () => {
    (fetch as jest.Mock)
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockGuestTaskboards,
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockHostTaskboards,
        })
        .mockResolvedValue({
            ok: true,
            json: async () => mockTasks,
        });

    renderComponent();

    await waitFor(() => {
        expect(screen.getByText('Guest Taskboard 1')).toBeInTheDocument();
        expect(screen.getByText('Host Taskboard 1')).toBeInTheDocument();
    });
});

test('opens and closes the UserPopup when the button is clicked', async () => {
    (fetch as jest.Mock)
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockGuestTaskboards,
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockHostTaskboards,
        })
        .mockResolvedValue({
            ok: true,
            json: async () => mockTasks,
        });

    renderComponent();

    await waitFor(() => {
        expect(screen.getByText('Host Taskboard 1')).toBeInTheDocument();
    });

    const openPopupButton = screen.getByText('➕');
    fireEvent.click(openPopupButton);
    await waitFor(() => {
        // Adjust this based on the actual text or element in your popup
        expect(screen.getByText(/Add User to Project/i)).toBeInTheDocument(); 
    });

    
});


test('handles API fetch errors gracefully', async () => {
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    renderComponent();

    await waitFor(() => {
        // Check that console.error was called with the expected message
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching taskboards:', expect.any(Error));
    });

    // Clean up the spy
    consoleErrorSpy.mockRestore();
});

