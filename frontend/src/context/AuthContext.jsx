import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('esim_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('esim_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('esim_token');
      if (storedToken) {
        try {
          const res = await getCurrentUser();
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('esim_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Stored session invalid or expired');
          logout(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      if (res.data.success) {
        const { token: newToken, user: authUser } = res.data;
        setToken(newToken);
        setUser(authUser);
        localStorage.setItem('esim_token', newToken);
        localStorage.setItem('esim_user', JSON.stringify(authUser));
        toast.success(res.data.message || 'Login successful!');
        return { success: true, user: authUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      if (res.data.success) {
        const { token: newToken, user: authUser } = res.data;
        setToken(newToken);
        setUser(authUser);
        localStorage.setItem('esim_token', newToken);
        localStorage.setItem('esim_user', JSON.stringify(authUser));
        toast.success('Registration successful! Welcome.');
        return { success: true, user: authUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = (showToast = true) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('esim_token');
    localStorage.removeItem('esim_user');
    if (showToast) {
      toast.success('Logged out successfully.');
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
