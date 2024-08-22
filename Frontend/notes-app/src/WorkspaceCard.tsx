import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import MenuBookIcon from '@mui/icons-material/MenuBook'; // Import the book icon

interface WorkspaceCardProps {
  name: string;
  description: string;
  start: string;
  end: string;
  completed: number;
  remaining: number;
  inReview: number;
  revising: number;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  name: source,
  description: target,
  start,
  end,
  completed,
  remaining: warning,
  inReview: inReview,
  revising: skipped,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleClickOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users?query=${searchQuery}`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <Card sx={{ mb: 2, width: '100%', position: 'relative' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{source}</Typography>
          <Typography color="text.secondary" gutterBottom>{target}</Typography>
          <Box display="flex" alignItems="center" mt={2} mb={2} width="100%">
            <IconButton>
              <PlayArrowIcon color="primary" />
            </IconButton>
            <Typography color="text.secondary" ml={1}>Completed</Typography>
          </Box>
          <Typography color="text.secondary" gutterBottom>
            Start: {formatDate(start)}
          </Typography>
          <Box display="flex" justifyContent="space-around" mt={2} flexWrap="wrap" width="100%">
            <Chip icon={<CheckCircleIcon />} label={`Completed ${completed}`} color="success" sx={{ mb: 1 }} />
            <Chip icon={<HourglassEmptyIcon />} label={`Remaining ${warning}`} color="warning" sx={{ mb: 1 }} />
            <Chip icon={<MenuBookIcon />} label={`In Review ${inReview}`} color="error" sx={{ mb: 1 }} />
            <Chip icon={<ReplayIcon />} label={`Revision ${skipped}`} sx={{ mb: 1 }} />
          </Box>
        </CardContent>
        
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Search Users</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search"
            type="text"
            fullWidth
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSearch} sx={{ mt: 2 }}>
            Search
          </Button>
          <Box sx={{ marginTop: '20px' }}>
            {searchResults.map((user, index) => (
              <Typography key={index}>{user.name}</Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkspaceCard;
