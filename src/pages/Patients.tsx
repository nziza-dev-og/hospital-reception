import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Patient } from '../types';
import { Search, Plus, Filter } from 'lucide-react';

const Patients = () => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchPatients = async () => {
      if (!userProfile || !userProfile.hospitalId) {
        setLoading(false);
        return;
      }
      
      try {
        const patientsQuery = query(
          collection(db, 'patients'),
          where('hospitalId', '==', userProfile.hospitalId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(patientsQuery);
        const patientsList = snapshot.docs.map(doc => doc.data() as Patient);
        setPatients(patientsList);
        setFilteredPatients(patientsList);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [userProfile]);
  
  useEffect(() => {
    // Filter patients based on search term and filters
    let filtered = patients;
    
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber.includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.currentStatus === statusFilter);
    }
    
    if (severityFilter !== 'all') {
      filtered = filtered.filter(patient => patient.severity === severityFilter);
    }
    
    setFilteredPatients(filtered);
  }, [searchTerm, statusFilter, severityFilter, patients]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Show a message if the user doesn't have a hospitalId yet
  if (!userProfile?.hospitalId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-secondary-900">Hospital Not Selected</h2>
        <p className="mt-2 text-secondary-500 max-w-md mx-auto">
          You need to register or select a hospital before you can manage patients.
          {userProfile?.role === 'admin' && (
            <Link to="/register-hospital" className="block mt-4 text-primary-600 hover:text-primary-500">
              Register a Hospital
            </Link>
          )}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">Patients</h1>
        
        {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist') && (
          <Link 
            to="/patients/register"
            className="btn btn-primary flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Register New Patient
          </Link>
        )}
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
      <div className="mt-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search patients by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Patients list */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-secondary-200">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <li key={patient.id}>
                <Link 
                  to={`/patients/${patient.id}`}
                  className="block hover:bg-secondary-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {patient.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${patient.currentStatus === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 
                              patient.currentStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              patient.currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'}
                          `}
                        >
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
                          {patient.phoneNumber}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                        <p>
                          Severity: 
                          <span 
                            className={`ml-1 font-medium
                              ${patient.severity === 'low' ? 'text-green-600' :
                                patient.severity === 'medium' ? 'text-yellow-600' :
                                patient.severity === 'high' ? 'text-orange-600' :
                                'text-red-600'}
                            `}
                          >
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
              No patients found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Patients;
 