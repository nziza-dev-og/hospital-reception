export  type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'patient';
  phoneNumber?: string;
  hospitalId?: string;
  createdAt: Date | any;
};

export type Hospital = {
  id: string;
  name: string;
  region: string;
  address: string;
  adminId: string;
  services: Service[];
  createdAt: Date | any;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  estimatedWaitTime: number;
  isAvailable: boolean;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  medicalHistory?: string;
  currentStatus: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  assignedService?: string;
  hospitalId: string;
  createdAt: Date | any;
  waitTime?: number;
  doctorNotes?: string;
  lastUpdated?: Date | any;
};

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  serviceId: string;
  serviceName: string;
  date: Date | any;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  hospitalId: string;
  createdAt: Date | any;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId: string;
  createdAt: Date | any;
};

export type Report = {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  data: any;
  hospitalId: string;
  createdAt: Date | any;
};
 