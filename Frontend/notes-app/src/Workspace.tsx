import React, { useEffect, useState } from 'react';
import { Container, Grid, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import WorkspaceCard from './WorkspaceCard';
import UserPopup from './userPopUp'; // Import the UserPopup component

interface Workspace {
  taskboardId: number;
  id: number;
  name: string;
  description: string;
  start: string;
  end: string;
  completed: number;
  remaining: number;
  inReview: number;
  revising: number;
  iscurrent: boolean;
  isGuest: boolean;
}

const WorkspacePage: React.FC = () => {
  const [data, setData] = useState<Workspace[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTaskboardId, setSelectedTaskboardId] = useState<number | null>(null);

  const handleOpenPopup = (taskboardId: number) => {
    console.log(`Opening popup for taskboard ID: ${taskboardId}`);
    setSelectedTaskboardId(taskboardId);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    console.log('Closing popup');
    setIsPopupOpen(false);
    setSelectedTaskboardId(null);
  };

  useEffect(() => {
    const fetchTaskboards = async () => {
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');
      const token = localStorage.getItem('token'); // Get the token from localStorage
  
      if (!userId || !userType || !token) {
        console.error('userId, userType, or token is missing from local storage');
        return;
      }
  
      try {
        // Fetch guest taskboards
        const guestTaskboardsResponse = await fetch(`http://localhost:3001/api/taskboards?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,  // Pass the token in the header
          }
        });
        if (!guestTaskboardsResponse.ok) {
          throw new Error(`Failed to fetch guest taskboards: ${guestTaskboardsResponse.statusText}`);
        }
        const guestTaskboards = await guestTaskboardsResponse.json();
  
        // Fetch host taskboards (workspaces)
        const hostTaskboardsResponse = await fetch(`http://localhost:3001/api/workspaces?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,  // Pass the token in the header
          }
        });
        if (!hostTaskboardsResponse.ok) {
          throw new Error(`Failed to fetch host taskboards: ${hostTaskboardsResponse.statusText}`);
        }
        const hostTaskboards = await hostTaskboardsResponse.json();

      //  console.log('Host Taskboards:', hostTaskboards);
  
        const combinedData = [];
  
        // Process guest taskboards
        for (const taskboard of guestTaskboards) {
          const tasksResponse = await fetch(`http://localhost:3001/api/tasks?taskboardId=${taskboard.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,  // Pass the token in the header
            }
          });
          if (!tasksResponse.ok) {
            throw new Error(`Failed to fetch tasks for taskboard ${taskboard.id}: ${tasksResponse.statusText}`);
          }
          const tasks = await tasksResponse.json();
  
          const completed = tasks.filter((task: any) => task.status === 'Done').length;
          const remaining = tasks.filter((task: any) => 
            task.status === 'To Do' || task.status === 'In Progress').length;
          const inReview = tasks.filter((task: any) => task.status === 'Code Review').length;
          const revising = tasks.filter((task: any) => task.status === 'In Progress').length;

          combinedData.push({
            taskboardId: taskboard.id,
            id: taskboard.id,
            name: taskboard.title,
            description: taskboard.description,
            start: taskboard.created_at,
            end: taskboard.created_at,  // Placeholder, same as start
            completed: completed,
            remaining: remaining,
            inReview: inReview,
            revising: revising,
            iscurrent: false, // Placeholder for now
            isGuest: true,
          });
        }
  
        // Process host taskboards
        for (const taskboard of hostTaskboards) {
          console.log('Host Taskboard_id:', taskboard.id);
          const tasksResponse = await fetch(`http://localhost:3001/api/tasks?taskboardId=${taskboard.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,  // Pass the token in the header
            }
          });
          if (!tasksResponse.ok) {
            throw new Error(`Failed to fetch tasks for taskboard ${taskboard.id}: ${tasksResponse.statusText}`);
          }
          const tasks = await tasksResponse.json();
  
          const completed = tasks.filter((task: any) => task.status === 'done').length;
          const remaining = tasks.filter((task: any) => 
            task.status === 'todo' || task.status === 'in progress').length;
          const inReview = tasks.filter((task: any) => task.status === 'codeReview').length;
          const revising = tasks.filter((task: any) => task.status === 'inProgress').length;

          // Debugging: Log host taskboard data
          console.log('Host Taskboard:', taskboard);
  
          combinedData.push({
            taskboardId: taskboard.id,
            id: taskboard.id,
            name: taskboard.title,
            description: taskboard.description,
            start: taskboard.created_at,
            end: taskboard.created_at,  // Placeholder, same as start
            completed: completed,
            remaining: remaining,
            inReview: inReview,
            revising: revising,
            iscurrent: false, // Placeholder for now
            isGuest: false,
          });
        }
  
        setData(combinedData);
      } catch (error) {
        console.error('Error fetching taskboards:', error);
      }
    };
  
    fetchTaskboards();
  }, []);
  
  return (
    <Container sx={{ padding: '20px' }}>
      <Grid container spacing={3}>
        {data.map((item, index) => (
          <Grid item xs={12} md={6} key={item.taskboardId}>
            <Box sx={{ padding: '10px', cursor: 'pointer', position: 'relative' }}>
              <Link to={`/taskboard/${item.taskboardId}`} style={{ textDecoration: 'none', display: 'block' }}>
                <WorkspaceCard {...item} />
              </Link>
              {!item.isGuest && (
                <Button
                  color="primary"
                  sx={{ position: 'absolute', top: 10, right: 0 }}
                  onClick={() => handleOpenPopup(item.taskboardId)}
                >
                  ➕
                </Button>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
      {selectedTaskboardId !== null && (
        <UserPopup open={isPopupOpen} onClose={handleClosePopup} taskboardId={selectedTaskboardId} />
      )}
    </Container>
  );
};

export default WorkspacePage;
