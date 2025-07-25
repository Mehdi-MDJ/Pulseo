/**
 * ==============================================================================
 * NurseLink AI - Types Centralisés
 * ==============================================================================
 *
 * Définitions TypeScript centralisées pour l'application
 * ==============================================================================
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "NURSE" | "ESTABLISHMENT" | "ADMIN";
  establishmentId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "NURSE" | "ESTABLISHMENT";
  [key: string]: any;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  hourlyRate: number;
  specializations: string[];
  status: "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED";
  establishmentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionApplication {
  id: number;
  missionId: number;
  nurseId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  coverLetter?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  contractNumber: string;
  missionId: number;
  nurseId: string;
  establishmentId: string;
  status: "PENDING" | "NURSE_SIGNED" | "ESTABLISHMENT_SIGNED" | "SIGNED" | "CANCELLED";
  terms: any;
  nurseSignature?: string;
  establishmentSignature?: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NurseProfile {
  id: number;
  userId: string;
  specializations: string[];
  experience: number;
  certifications: string[];
  availability: any;
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstablishmentProfile {
  id: number;
  userId: string;
  name: string;
  type: string;
  address: string;
  description: string;
  specialties: string[];
  createdAt: Date;
  updatedAt: Date;
}
