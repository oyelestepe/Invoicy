import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { TextField, Button, Container, Typography, Box, Link } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Send welcome email (don't block registration if email fails)
      try {
        const response = await fetch('http://localhost:5000/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name
          })
        });
        
        if (response.ok) {
          console.log('Welcome email sent successfully');
        } else {
          console.warn('Failed to send welcome email, but registration succeeded');
        }
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
        // Continue with registration flow even if email fails
      }
      navigate('/login');
    } catch (error) {
      alert('Kayıt sırasında hata oluştu: ' + error.message);
    }
  };

  return (
    <>
      <Navbar/>
      <Container maxWidth="sm">
        <Box sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Create New Account
          </Typography>
          
          <Box component="form" onSubmit={handleSignUp} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              inputProps={{ minLength: 6 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              inputProps={{ minLength: 6 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Register
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Log In
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Register;