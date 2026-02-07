/**
 * Common type definitions
 * Uses PascalCase for interface names
 */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}
