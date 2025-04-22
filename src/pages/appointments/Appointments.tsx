import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Appointment } from '../../types';
import { Calendar, Search, Plus, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { format, isToday, isThisWeek, isAfter } from 'date-fns';

const Appointments = () => {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState('');
  
  const fetchAppointments = async () => {
    if (!userProfile) {
      setLoading(false);
      return;
    }
    
    try {
      setRefreshing(true);
      
      // Create query based on user role
      let appointmentsQuery;
      
      if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
        if (userProfile.hospitalId) {
          appointmentsQuery = query(
            collection(db, 'appointments'),
            where('hospitalId', '==', userProfile.hospitalId),
            orderBy('date', 'desc')
          );
        }
      } else if (userProfile.role === 'doctor' || userProfile.role === 'nurse') {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', userProfile.id),
          orderBy('date', 'desc')
        );
      } else if (userProfile.role === 'patient') {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', userProfile.id),
          orderBy('date', 'desc')
        );
      }
      
      if (appointmentsQuery) {
        const snapshot = await getDocs(appointmentsQuery);
        const appointmentsList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            date: data.date instanceof Timestamp 
              ? data.date.toDate() 
              : new Date(data.date)
          } as Appointment;
        });
        setAppointments(appointmentsList);
        setFilteredAppointments(appointmentsList);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchAppointments();
  }, [userProfile]);
  
  useEffect(() => {
    // Filter appointments based on search term and filters
    let filtered = appointments;
    
    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    if (dateFilter !== 'all') {
      const today = new Date();
      if (dateFilter === 'today') {
        filtered = filtered.filter(appointment => isToday(new Date(appointment.date)));
      } else if (dateFilter === 'upcoming') {
        filtered = filtered.filter(appointment => isAfter(new Date(appointment.date), today));
      } else if (dateFilter === 'thisWeek') {
        filtered = filtered.filter(appointment => isThisWeek(new Date(appointment.date)));
      }
    }
    
    setFilteredAppointments(filtered);
  }, [searchTerm, statusFilter, dateFilter, appointments]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">Appointments</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={fetchAppointments}
            className="btn btn-secondary text-sm flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist' || userProfile?.role === 'patient') && (
            <Link 
              to="/appointments/schedule"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and filters */}
      <div className="mt-4 bg-white shadow p-4 rounded-lg">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search by patient or doctor name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <label htmlFor="status-filter" className="block text-xs font-medium text-secondary-500 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            
            <div className="relative">
              <label htmlFor="date-filter" className="block text-xs font-medium text-secondary-500 mb-1">
                Date
              </label>
              <select
                id="date-filter"
                className="block w-full pl-3 pr-10 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                className="py-2 px-4 border border-secondary-300 rounded-md text-sm text-secondary-700 hover:bg-secondary-50"
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">Clear filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Appointments list */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        {filteredAppointments.length > 0 ? (
          <ul className="divide-y divide-secondary-200">
            {filteredAppointments.map((appointment) => (
              <li key={appointment.id}>
                <Link to={`/appointments/${appointment.id}`} className="block hover:bg-secondary-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-primary-600">
                            {format(new Date(appointment.date), 'MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-secondary-500">
                            {appointment.time}
                          </p>
                        </div>
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
                          <span className="font-medium mr-1">Patient:</span>
                          {appointment.patientName}
                        </p>
                        {appointment.doctorName && (
                          <p className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0 sm:ml-6">
                            <span className="font-medium mr-1">Doctor:</span>
                            {appointment.doctorName}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                        <span className="font-medium mr-1">Service:</span>
                        {appointment.serviceName}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No appointments found</h3>
            <p className="mt-1 text-sm text-secondary-500">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by scheduling an appointment'}
            </p>
            {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist' || userProfile?.role === 'patient') && (
              <div className="mt-6">
                <Link
                  to="/appointments/schedule"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Schedule Appointment
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
 