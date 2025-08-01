
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'individual' | 'retail' | 'wholesale' | 'lab';
  // Common fields
  phone?: string;
  address?: string;
  isApproved?: boolean;
  createdAt?: string;
  
  // Individual user fields
  dateOfBirth?: string;
  emergencyContact?: string;
  
  // Retail pharmacy fields
  pharmacyName?: string;
  licenseNumber?: string;
  pharmacistName?: string;
  
  // Wholesale pharmacy fields
  businessName?: string;
  businessLicense?: string;
  taxId?: string;
  
  // Lab fields
  labName?: string;
  labLicense?: string;
  specializations?: string[];
  operatingHours?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Initialize demo users for all stakeholder types
const initializeDemoUsers = () => {
  const existingUsers = localStorage.getItem('bepawa_users');
  if (!existingUsers) {
    const demoUsers = [
      {
        id: '1',
        email: 'admin@bepawa.com',
        password: 'admin123',
        name: 'System Admin',
        role: 'admin',
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'individual@test.com',
        password: 'password123',
        name: 'John Doe',
        role: 'individual',
        phone: '+255123456789',
        address: 'Dar es Salaam, Tanzania',
        dateOfBirth: '1990-01-01',
        emergencyContact: '+255987654321',
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'retail@test.com',
        password: 'password123',
        name: 'Jane Smith',
        role: 'retail',
        pharmacyName: 'City Pharmacy',
        address: 'Kisutu Street, Dar es Salaam',
        phone: '+255111222333',
        licenseNumber: 'PHA-2024-001',
        pharmacistName: 'Dr. Jane Smith',
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        email: 'wholesale@test.com',
        password: 'password123',
        name: 'Ahmed Hassan',
        role: 'wholesale',
        businessName: 'MediSupply Wholesale',
        address: 'Industrial Area, Dar es Salaam',
        phone: '+255444555666',
        businessLicense: 'WHS-2024-001',
        taxId: 'TAX123456789',
        isApproved: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        email: 'lab@test.com',
        password: 'password123',
        name: 'Dr. Sarah Johnson',
        role: 'lab',
        labName: 'HealthLab Diagnostics',
        address: 'Upanga, Dar es Salaam',
        phone: '+255777888999',
        labLicense: 'LAB-2024-001',
        specializations: ['Blood Tests', 'Urine Analysis', 'X-Ray', 'Ultrasound'],
        operatingHours: '8:00 AM - 6:00 PM',
        isApproved: true,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('bepawa_users', JSON.stringify(demoUsers));
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize demo users on first load
    initializeDemoUsers();
    
    // Check for stored user on app load
    try {
      const storedUser = localStorage.getItem('bepawa_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('bepawa_user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('bepawa_users') || '[]');
      const foundUser = users.find((u: User & { password: string }) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!foundUser) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }

      if (!foundUser.isApproved && foundUser.role !== 'individual' && foundUser.role !== 'admin') {
        setIsLoading(false);
        return { success: false, error: 'Your account is pending approval. Please contact the administrator.' };
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('bepawa_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'An error occurred during login. Please try again.' };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem('bepawa_users') || '[]');
      const existingUser = users.find((u: User) => u.email.toLowerCase() === userData.email?.toLowerCase());
      
      if (existingUser) {
        setIsLoading(false);
        return { success: false, error: 'Email already exists' };
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        isApproved: userData.role === 'admin' || userData.role === 'individual' ? true : false, // Auto-approve individuals and admins
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('bepawa_users', JSON.stringify(users));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false, error: 'An error occurred during registration. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bepawa_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
