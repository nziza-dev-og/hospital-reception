import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Hospital, Patient, Appointment } from '../types';
import { Users, Clock, AlertCircle, CheckCircle, Plus, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    criticalPatients: 0,
    completedToday: 0,
    appointmentsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch hospital data if user is admin or staff and has hospitalId
        if (userProfile.role !== 'patient' && userProfile.hospitalId) {
          try {
            const hospitalDoc = await getDoc(doc(db, 'hospitals', userProfile.hospitalId));
            
            if (hospitalDoc.exists()) {
              setHospital(hospitalDoc.data() as Hospital);
            }
          } catch (err) {
            console.error("Error fetching hospital:", err);
          }
        }
        
        // Get today's date at midnight for date comparisons
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch patients and appointments based on user role
        if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
          if (userProfile.hospitalId) {
            // Get recent patients
            const patientsQuery = query(
              collection(db, 'patients'),
              where('hospitalId', '==', userProfile.hospitalId),
              orderBy('createdAt', 'desc'),
              limit(5)
            );
            
            const patientsSnapshot = await getDocs(patientsQuery);
            const patientsList = patientsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                createdAt: data.createdAt instanceof Timestamp 
                  ? data.createdAt.toDate() 
                  : new Date(data.createdAt)
              } as Patient;
            });
            
            setPatients(patientsList);
            
            // Get today's appointments
            const appointmentsQuery = query(
              collection(db, 'appointments'),
              where('hospitalId', '==', userProfile.hospitalId),
              where('date', '>=', today)
            );
            
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointmentsList = appointmentsSnapshot.docs.map(doc => doc.data() as Appointment);
            
            setAppointments(appointmentsList.slice(0, 5)); // Get only the first 5
            
            // Calculate statistics
            const allPatientsQuery = query(
              collection(db, 'patients'),
              where('hospitalId', '==', userProfile.hospitalId)
            );
            
            const allPatientsSnapshot = await getDocs(allPatientsQuery);
            const allPatients = allPatientsSnapshot.docs.map(doc => doc.data() as Patient);
            
            setStats({
              totalPatients: allPatients.length,
              waitingPatients: allPatients.filter(p => p.currentStatus === 'waiting').length,
              criticalPatients: allPatients.filter(p => p.severity === 'critical').length,
              completedToday: allPatients.filter(p => 
                p.currentStatus === 'completed' && 
                p.lastUpdated instanceof Timestamp && 
                p.lastUpdated.toDate() >= today
              ).length,
              appointmentsToday: appointmentsList.length,
            });
          }
        } else if (userProfile.role === 'doctor' || userProfile.role === 'nurse') {
          if (userProfile.hospitalId) {
            // Get assigned patients for healthcare providers
            const patientsQuery = query(
              collection(db, 'patients'),
              where('hospitalId', '==', userProfile.hospitalId),
              where('currentStatus', 'in', ['waiting', 'in-progress']),
              orderBy('createdAt', 'desc')
            );
            
            const patientsSnapshot = await getDocs(patientsQuery);
            const patientsList = patientsSnapshot.docs.map(doc => doc.data() as Patient);
            
            setPatients(patientsList.slice(0, 5));
            
            // Get today's appointments for this provider
            const appointmentsQuery = query(
              collection(db, 'appointments'),
              where('hospitalId', '==', userProfile.hospitalId),
              where('doctorId', '==', userProfile.id),
              where('date', '>=', today)
            );
            
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointmentsList = appointmentsSnapshot.docs.map(doc => doc.data() as Appointment);
            
            setAppointments(appointmentsList.slice(0, 5));
            
            // Set basic stats
            setStats({
              totalPatients: patientsList.length,
              waitingPatients: patientsList.filter(p => p.currentStatus === 'waiting').length,
              criticalPatients: patientsList.filter(p => p.severity === 'critical').length,
              completedToday: 0,
              appointmentsToday: appointmentsList.length,
            });
          }
        } else if (userProfile.role === 'patient') {
          // Get patient's own data
          const patientsQuery = query(
            collection(db, 'patients'),
            where('id', '==', userProfile.id)
          );
          
          const patientsSnapshot = await getDocs(patientsQuery);
          const patientsList = patientsSnapshot.docs.map(doc => doc.data() as Patient);
          
          if (patientsList.length > 0) {
            setPatients(patientsList);
            
            // Get patient's appointments
            const appointmentsQuery = query(
              collection(db, 'appointments'),
              where('patientId', '==', userProfile.id),
              orderBy('date', 'asc')
            );
            
            const appointmentsSnapshot = await getDocs(appointmentsQuery);
            const appointmentsList = appointmentsSnapshot.docs.map(doc => doc.data() as Appointment);
            
            setAppointments(appointmentsList.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error loading dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userProfile]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader" />
      </div>
    );
  }
  
  // Different dashboard layouts based on user role
  if (userProfile?.role === 'patient') {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900">Patient Dashboard</h1>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {/* Patient welcome card */}
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-secondary-900">
            Welcome, {userProfile.name}!
          </h2>
          <p className="mt-1 text-secondary-500">
            Here's your current health status and upcoming appointments
          </p>
        </div>
        
        {/* Patient status card */}
        {patients.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-primary-50">
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Your Current Status
              </h3>
            </div>
            <div className="border-t border-secondary-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-secondary-500">Status</dt>
                  <dd className="mt-1 text-sm text-secondary-900">
                    <span className={`status-${patients[0].currentStatus}`}>
                      {patients[0].currentStatus === 'waiting' ? 'Waiting' : 
                       patients[0].currentStatus === 'in-progress' ? 'In Progress' :
                       patients[0].currentStatus === 'completed' ? 'Completed' : 'Cancelled'}
                    </span>
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-secondary-500">Severity</dt>
                  <dd className="mt-1 text-sm text-secondary-900">
                    <span className={`severity-${patients[0].severity}`}>
                      {patients[0].severity.charAt(0).toUpperCase() + patients[0].severity.slice(1)}
                    </span>
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-secondary-500">Hospital</dt>
                  <dd className="mt-1 text-sm text-secondary-900">
                    {hospital?.name || 'Not assigned'}
                  </dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-secondary-500">Assigned Service</dt>
                  <dd className="mt-1 text-sm text-secondary-900">
                    {patients[0].assignedService || 'Not assigned yet'}
                  </dd>
                </div>
                
                {patients[0].currentStatus === 'waiting' && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-secondary-500">Estimated Wait Time</dt>
                    <dd className="mt-1 text-sm text-secondary-900">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-secondary-400" />
                        <span>{patients[0].waitTime} minutes</span>
                      </div>
                      <div className="mt-2 w-full bg-secondary-200 rounded-full h-2.5">
                        <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
        
        {/* Upcoming appointments */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-secondary-900">Your Appointments</h2>
            <Link 
              to="/appointments/schedule"
              className="btn btn-primary text-sm flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" /> New Appointment
            </Link>
          </div>
          
          <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-md">
            {appointments.length > 0 ? (
              <ul className="divide-y divide-secondary-200">
                {appointments.map((appointment) => (
                  <li key={appointment.id}>
                    <Link to={`/appointments/${appointment.id}`} className="block hover:bg-secondary-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="sm:flex sm:items-center">
                            <Calendar className="h-5 w-5 text-primary-500 mr-2 hidden sm:block" />
                            <p className="font-medium text-primary-600">
                              {format(new Date(appointment.date), 'MMMM d, yyyy')} at {appointment.time}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}
                            `}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-secondary-500">
                              <span>Service: {appointment.serviceName}</span>
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                            <p>
                              {appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'No doctor assigned'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-4 text-center text-secondary-500">
                You don't have any appointments scheduled.
                <div className="mt-2">
                  <Link to="/appointments/schedule" className="text-primary-600 hover:text-primary-500 font-medium">
                    Schedule an appointment
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Admin and Staff dashboard
  return (
    <div>
      <h1 className="text-2xl font-semibold text-secondary-900">Dashboard</h1>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Welcome message */}
      <div className="mt-4 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-secondary-900">
          Welcome, {userProfile?.name || 'User'}!
        </h2>
        <p className="mt-1 text-secondary-500">
          {userProfile?.role === 'admin' 
            ? 'Here\'s an overview of your hospital\'s current status' 
            : userProfile?.role === 'receptionist'
            ? 'Here\'s an overview of today\'s patient activity'
            : 'Here\'s an overview of your assigned patients'}
        </p>
      </div>
      
      {/* Stats - Only show if user is admin/receptionist and has a hospitalId */}
      {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist') && userProfile?.hospitalId && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Total Patients
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-secondary-900">
                        {stats.totalPatients}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Waiting
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-secondary-900">
                        {stats.waitingPatients}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Critical
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-secondary-900">
                        {stats.criticalPatients}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Completed Today
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-secondary-900">
                        {stats.completedToday}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Today's Appointments
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-secondary-900">
                        {stats.appointmentsToday}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hospital selection message for admins without a hospital */}
      {userProfile?.role === 'admin' && !userProfile?.hospitalId && (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please register or select a hospital to manage from the settings menu.
              </p>
              <div className="mt-3">
                <Link 
                  to="/register-hospital"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="mr-1 h-3 w-3" /> Register Hospital
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent activity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent patients */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-secondary-900">Recent Patients</h2>
            {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist') && (
              <Link 
                to="/patients/register"
                className="btn btn-primary text-sm flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" /> New Patient
              </Link>
            )}
          </div>
          <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-secondary-200">
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <li key={patient.id}>
                    <Link to={`/patients/${patient.id}`} className="block hover:bg-secondary-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {patient.name}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`status-${patient.currentStatus}`}>
                              {patient.currentStatus === 'waiting' ? 'Waiting' : 
                               patient.currentStatus === 'in-progress' ? 'In Progress' :
                               patient.currentStatus === 'completed' ? 'Completed' : 'Cancelled'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-secondary-500">
                              {patient.gender}, {patient.age} years
                            </p>
                            <p className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0 sm:ml-6">
                              {patient.assignedService || 'No service assigned'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                            <p>
                              <span className={`severity-${patient.severity}`}>
                                {patient.severity.charAt(0).toUpperCase() + patient.severity.slice(1)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-center text-secondary-500">
                  No patients to display
                </li>
              )}
            </ul>
            <div className="bg-secondary-50 px-4 py-3 border-t border-secondary-200 text-right">
              <Link to="/patients" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all patients
              </Link>
            </div>
          </div>
        </div>
        
        {/* Today's appointments */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-secondary-900">Today's Appointments</h2>
            {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist') && (
              <Link 
                to="/appointments/schedule"
                className="btn btn-primary text-sm flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" /> Schedule
              </Link>
            )}
          </div>
          <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-secondary-200">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <li key={appointment.id}>
                    <Link to={`/appointments/${appointment.id}`} className="block hover:bg-secondary-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {appointment.patientName}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}
                            `}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-secondary-500">
                              <Clock className="mr-1 h-4 w-4 text-secondary-400" />
                              {appointment.time}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0 sm:ml-6">
                              {appointment.serviceName}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                            <p>
                              {appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'No doctor assigned'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6 text-center text-secondary-500">
                  No appointments scheduled for today
                </li>
              )}
            </ul>
            <div className="bg-secondary-50 px-4 py-3 border-t border-secondary-200 text-right">
              <Link to="/appointments" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all appointments
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity chart for admin */}
      {userProfile?.role === 'admin' && userProfile?.hospitalId && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-secondary-900">Patient Flow Activity</h2>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-3 w-3 rounded-full bg-primary-500"></span>
              <span className="text-xs text-secondary-500">New Patients</span>
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 ml-2"></span>
              <span className="text-xs text-secondary-500">Completed</span>
            </div>
          </div>
          <div className="relative h-64">
            <Activity className="absolute inset-0 h-full w-full text-secondary-200 opacity-50" />
            <div className="absolute bottom-0 left-0 text-xs text-secondary-500">
              This is a placeholder for the activity chart
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
 