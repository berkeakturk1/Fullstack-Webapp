import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Paper, 
  IconButton, 
  Box, 
  Divider 
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import { FaThumbsUp, FaThumbsDown, FaTasks, FaTrashAlt } from 'react-icons/fa';

interface RetrospectiveItem {
  id: number;
  type: 'positive' | 'negative' | 'action';
  cont: string; // Updated to match the API response field
}

interface Taskboard {
  id: number;
  title: string;
}

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  textAlign: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderLeft: `6px solid ${theme.palette.divider}`,
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
}));

const SprintRetrospectivePage: React.FC = () => {
  const [items, setItems] = useState<RetrospectiveItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState<'positive' | 'negative' | 'action'>('positive');
  const [taskboards, setTaskboards] = useState<Taskboard[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<number | string>('');

  useEffect(() => {
    const fetchTaskboards = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        console.error('userId or token is missing from local storage');
        return;
      }

      try {
        const combinedTaskboards: Taskboard[] = [];

        // Fetch guest taskboards
        const guestTaskboardsResponse = await fetch(`http://localhost:3001/api/taskboards?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (!guestTaskboardsResponse.ok) {
          throw new Error(`Failed to fetch guest taskboards: ${guestTaskboardsResponse.statusText}`);
        }
        const guestTaskboards: Taskboard[] = await guestTaskboardsResponse.json();

        // Fetch host taskboards (workspaces)
        const hostTaskboardsResponse = await fetch(`http://localhost:3001/api/workspaces?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (!hostTaskboardsResponse.ok) {
          throw new Error(`Failed to fetch host taskboards: ${hostTaskboardsResponse.statusText}`);
        }
        const hostTaskboards: Taskboard[] = await hostTaskboardsResponse.json();

        // Combine guest and host taskboards for dropdown
        guestTaskboards.forEach((taskboard) => {
          combinedTaskboards.push({
            id: taskboard.id,
            title: taskboard.title
          });
        });

        hostTaskboards.forEach((taskboard) => {
          combinedTaskboards.push({
            id: taskboard.id,
            title: taskboard.title
          });
        });

        setTaskboards(combinedTaskboards);
        if (combinedTaskboards.length > 0) {
          setSelectedSprint(combinedTaskboards[0].id); // Automatically select the first taskboard
        }
      } catch (error) {
        console.error('Error fetching taskboards:', error);
      }
    };

    fetchTaskboards();
  }, []);

  // Fetch retrospective items when selectedSprint changes
  useEffect(() => {
    const fetchRetrospectiveItems = async () => {
      if (!selectedSprint) return;

      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:3001/api/taskboards/${selectedSprint}/retrospective`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch retrospective items: ${response.statusText}`);
        }
        const retrospectiveItems: RetrospectiveItem[] = await response.json();
        setItems(retrospectiveItems);
      } catch (error) {
        console.error('Error fetching retrospective items:', error);
      }
    };

    fetchRetrospectiveItems();
  }, [selectedSprint]);

  const handleAddItem = async () => {
    if (inputText.trim() === '') return;

    try {
      const response = await fetch(`http://localhost:3001/api/taskboards/${selectedSprint}/retrospective`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type: inputType, cont: inputText }), // Use 'cont' instead of 'text'
      });
      if (!response.ok) {
        throw new Error(`Failed to add retrospective item: ${response.statusText}`);
      }
      const newItem = await response.json();
      setItems([...items, newItem]);
      setInputText('');
    } catch (error) {
      console.error('Error adding retrospective item:', error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/retrospective/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete retrospective item: ${response.statusText}`);
      }
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting retrospective item:', error);
    }
  };

  const renderItems = (type: 'positive' | 'negative' | 'action') => {
    return items
      .filter((item) => item.type === type)
      .map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <StyledCard
            sx={{
              borderLeftColor: `${
                type === 'positive'
                  ? '#4caf50'
                  : type === 'negative'
                  ? '#f44336'
                  : '#2196f3'
              }`,
              mb: 2,
            }}
          >
            <CardContent>
              <Grid container alignItems="center">
                <Grid item xs={10}>
                  <Typography variant="body1">{item.cont}</Typography> {/* Use 'cont' instead of 'text' */}
                  <Typography
                    variant="caption"
                    color={
                      type === 'positive'
                        ? 'green'
                        : type === 'negative'
                        ? 'red'
                        : 'blue'
                    }
                  >
                    {type === 'positive'
                      ? 'Went well'
                      : type === 'negative'
                      ? "Didn't go well"
                      : 'Action Item'}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => handleDeleteItem(item.id)}
                    aria-label="delete"
                    color="error"
                  >
                    <FaTrashAlt />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </motion.div>
      ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Sprint Retrospective
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="select-sprint-label">Select Board</InputLabel>
              <Select
                labelId="select-sprint-label"
                id="select-sprint"
                value={selectedSprint}
                label="Select Board"
                onChange={(e) => setSelectedSprint(e.target.value as number)}
              >
                {taskboards.map((taskboard) => (
                  <MenuItem key={taskboard.id} value={taskboard.id}>
                    {taskboard.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              label="Add a point"
              variant="outlined"
              fullWidth
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledButton
              variant="contained"
              color={inputType === 'positive' ? 'primary' : 'inherit'}
              fullWidth
              onClick={() => setInputType('positive')}
            >
              <IconWrapper>
                <FaThumbsUp />
              </IconWrapper>
              What went well
            </StyledButton>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledButton
              variant="contained"
              color={inputType === 'negative' ? 'secondary' : 'inherit'}
              fullWidth
              onClick={() => setInputType('negative')}
            >
              <IconWrapper>
                <FaThumbsDown />
              </IconWrapper>
              What didn't go well
            </StyledButton>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledButton
              variant="contained"
              color={inputType === 'action' ? 'success' : 'inherit'}
              fullWidth
              onClick={() => setInputType('action')}
            >
              <IconWrapper>
                <FaTasks />
              </IconWrapper>
              Action Items
            </StyledButton>
          </Grid>
          <Grid item xs={12}>
            <StyledButton variant="contained" color="primary" fullWidth onClick={handleAddItem}>
              Add
            </StyledButton>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <SectionTitle variant="h6">
              What went well
            </SectionTitle>
            {renderItems('positive')}
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionTitle variant="h6">
              What didn't go well
            </SectionTitle>
            {renderItems('negative')}
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionTitle variant="h6">
              Action Items
            </SectionTitle>
            {renderItems('action')}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SprintRetrospectivePage;
