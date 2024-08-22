import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MyTasks from '../MyTasks';

global.fetch = jest.fn();

const mockTasks = [
    {
        id: 1,
        task_title: "Task 1",
        taskboard: "Board 1",
        status: "In Progress",
        dueDate: "2024-08-30",
        dueTime: "14:00",
        isLate: false,
        flaggedForReview: false,
    },
    {
        id: 2,
        task_title: "Task 2",
        taskboard: "Board 2",
        status: "Done",
        dueDate: "2024-08-28",
        dueTime: "16:00",
        isLate: true,
        flaggedForReview: false,
    }
];

beforeEach(() => {
    jest.clearAllMocks();
});

const theme = createTheme({
    palette: {
        grey: {
            100: '#f5f5f5',
        },
    },
});

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

test('renders the MyTasks component', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
    });

    renderWithTheme(<MyTasks />);


    await waitFor(() => {
        expect(screen.getByText('Assigned to Me')).toBeInTheDocument();
    });

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
});

test('calculates and displays the correct progress percentage', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
    });

    renderWithTheme(<MyTasks />);

    await waitFor(() => {
        const progressText = screen.getByText(/50%/i);
        expect(progressText).toBeInTheDocument();
    });
});

test('flags a task for review', async () => {
    (fetch as jest.Mock)
        .mockResolvedValueOnce({
            ok: true,
            json: async () => mockTasks,
        })
        .mockResolvedValueOnce({
            ok: true,
        });

    renderWithTheme(<MyTasks />);

    await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const flagButton = screen.getAllByRole('button', { name: /complete task/i })[0];
    fireEvent.click(flagButton);

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/flag-task/1', expect.objectContaining({
            method: 'PUT',
        }));
    });
});

test('displays an error message when fetching tasks fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch"));

    renderWithTheme(<MyTasks />);

    await waitFor(() => {
        expect(screen.queryByText('Assigned to Me')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Error: Failed to fetch tasks')).toBeInTheDocument();
});

test('polls for tasks every 5 seconds', async () => {
    jest.useFakeTimers();
    
    (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTasks,
    });

    renderWithTheme(<MyTasks />);

    await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(5000);

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2); // Initial call + 1 polling call
    });

    jest.useRealTimers();
});
