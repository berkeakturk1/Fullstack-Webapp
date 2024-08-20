import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemText, IconButton, Button, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface User {
  id: number;
  full_name: string;
  // other user properties
}

interface UserPopupProps {
  open: boolean;
  onClose: () => void;
  taskboardId: number;
}

const UserPopup: React.FC<UserPopupProps> = ({ open, onClose, taskboardId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleAddUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/user_taskboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          taskboard_id: taskboardId,
          role: 'editor',
        }),
      });

      if (response.ok) {
        setSnackbarMessage(`User added to taskboard successfully`);
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(`Failed to add user to taskboard`);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage(`Error adding user to taskboard`);
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add User to Project</DialogTitle>
        <DialogContent style={{ height: '400px' }}>
          <TextField
            fullWidth
            label="Search Users"
            variant="outlined"
            margin="normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ overflowY: 'auto', height: 'calc(100% - 100px)' }}>
            <List>
              {filteredUsers.map(user => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="add" onClick={() => handleAddUser(user.id)}>
                      <AddIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={user.full_name} />
                </ListItem>
              ))}
            </List>
          </div>
          <Button onClick={onClose} color="primary" variant="contained" fullWidth>
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default UserPopup;
