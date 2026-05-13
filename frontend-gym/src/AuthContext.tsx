import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from './types';

const API_BASE = 'http://localhost:5000/api';

interface AuthContextType {
  user: Customer | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<Customer & { password: string }>) => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; address?: string; birth_date?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;   // admin hoặc staff → có quyền vào trang quản trị
  isOwner: boolean;   // chỉ admin → xem báo cáo, quản lý nhân viên
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Thử đăng nhập khách hàng qua API Backend
    const res = await fetch(`${API_BASE}/auth/login/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Nếu không phải customer, thử đăng nhập staff/admin
      const staffRes = await fetch(`${API_BASE}/auth/login/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const staffData = await staffRes.json();

      if (!staffRes.ok) {
        throw new Error(data.error || 'Email hoặc mật khẩu không đúng');
      }

      // Đăng nhập staff/admin thành công
      // Dùng customer_id = -staff_id (số âm) để TRÁNH trùng với customer_id thật
      const staffUser: Customer = {
        customer_id: -(staffData.user.staff_id),
        name: staffData.user.full_name,
        email: staffData.user.username,
        password_hash: '',
        phone: '',
        address: '',
        birth_date: '',
        gender: 'other',
        status: 'active',
        register_date: staffData.user.created_at || new Date().toISOString(),
        role: staffData.role || 'admin',
      };
      setUser(staffUser);
      return;
    }

    // Đăng nhập customer thành công
    const customerUser: Customer = {
      customer_id: data.user.customer_id,
      name: data.user.name,
      email: data.user.email,
      password_hash: '',
      phone: data.user.phone || '',
      address: data.user.address || '',
      birth_date: data.user.birth_date || '',
      gender: data.user.gender?.toLowerCase() || 'other',
      status: data.user.status?.toLowerCase() || 'active',
      register_date: data.user.register_date || new Date().toISOString(),
      role: data.role || 'customer',
    };
    setUser(customerUser);
  };

  const register = async (userData: Partial<Customer & { password: string }>) => {
    // Gọi API Backend để đăng ký tài khoản thực sự vào database
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password_hash || userData.password, // form gửi password_hash nhưng thực chất là plain password
        phone: userData.phone || null,
        address: userData.address || null,
        birth_date: userData.birth_date || null,
        gender: userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Đăng ký thất bại');
    }

    // Đăng ký thành công → tự động đăng nhập
    const newUser: Customer = {
      customer_id: data.customer_id,
      name: userData.name || '',
      email: userData.email || '',
      password_hash: '',
      phone: userData.phone || '',
      address: userData.address || '',
      birth_date: userData.birth_date || '',
      gender: userData.gender || 'other',
      status: 'active',
      register_date: new Date().toISOString(),
      role: 'customer',
    };
    setUser(newUser);
  };

  const updateProfile = async (data: { name?: string; phone?: string; address?: string; birth_date?: string }) => {
    if (!user) throw new Error('Chưa đăng nhập');

    // Staff/Admin → gọi API staff, không gọi API customers
    if (user.role === 'admin' || user.role === 'staff') {
      const staffId = Math.abs(user.customer_id); // customer_id lưu âm, lấy lại staff_id gốc
      const res = await fetch(`${API_BASE}/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: data.name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Cập nhật thất bại');
      setUser(prev => prev ? { ...prev, name: data.name || prev.name } : prev);
      return;
    }

    // Customer → gọi API customers như bình thường
    const res = await fetch(`${API_BASE}/customers/${user.customer_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Cập nhật thất bại');
    }

    // Cập nhật state local + localStorage
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      updateProfile,
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'staff',
      isOwner: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
