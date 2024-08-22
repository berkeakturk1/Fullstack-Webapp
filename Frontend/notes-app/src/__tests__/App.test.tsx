import React from "react";
import { render, waitFor } from "@testing-library/react";
import App from "../App";
import { MemoryRouter } from "react-router-dom";
import { act } from 'react';

// Mock fetch globally
global.fetch = jest.fn();

// Mock useParams to return a specific taskboardId
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    taskboardId: '1', // Replace with the taskboardId you expect
  }),
}));

describe("App Component Tests", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to prevent interference between tests
  });

  test("renders the App component without crashing", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test("fetches data from the API", async () => {
    const mockedData = [{ id: 1, title: "Test Task" }]; // Example mocked data

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockedData),
    });

    const { getByText } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/workforce?taskboard_id=1"
      );
    });

    expect(getByText("Test Task")).toBeInTheDocument(); // Assuming the task title is rendered in the DOM
  });

  test("handles API errors", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network request failed"));

    // Spy on console.error to verify error handling
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error fetching workforce:", expect.any(Error));
    });

    consoleErrorSpy.mockRestore(); // Restore original console.error after the test
  });
});
