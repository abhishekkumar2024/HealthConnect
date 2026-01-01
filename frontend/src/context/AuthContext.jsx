import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Token exists, verify it's valid by checking user profile
        // You can add a verify endpoint or decode the token
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { accessToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      // Refresh token is stored in httpOnly cookie by backend

      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true, data: response.data };
    } catch (error) {
      let message = 'Registration failed';
      let fieldErrors = {}; // Object to map field names to error messages
      
      // Handle validation errors from backend
      if (error.response?.data?.message) {
        message = error.response.data.message;
        
        // Try to parse validation errors if they're in JSON format
        if (message.includes('Validation failed:')) {
          try {
            const jsonMatch = message.match(/Validation failed:\s*(\[.*\])/s);
            if (jsonMatch) {
              const validationErrors = JSON.parse(jsonMatch[1]);
              if (Array.isArray(validationErrors) && validationErrors.length > 0) {
                // Map errors to field names
                validationErrors.forEach((err) => {
                  if (err.field && err.message) {
                    fieldErrors[err.field] = err.message;
                  }
                });
                
                // Show first validation error in toast
                message = validationErrors[0].message || message;
                // Log all errors for debugging
                console.error('Validation errors:', validationErrors);
              }
            }
          } catch (parseError) {
            console.error('Error parsing validation errors:', parseError);
          }
        }
      } else if (error.response?.data?.message && !message.includes('Validation failed:')) {
        // Handle other error messages (e.g., "User with this email already exists")
        message = error.response.data.message;
      }
      
      // Only show toast if there are no field-specific errors (to avoid duplicate messages)
      if (Object.keys(fieldErrors).length === 0) {
        toast.error(message);
      }
      
      return { 
        success: false, 
        error: message,
        fieldErrors: fieldErrors // Return field-specific errors
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      // Refresh token is in httpOnly cookie, backend clears it
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

