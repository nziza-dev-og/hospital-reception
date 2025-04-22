import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Patient } from '../../types';
import { Search, Plus, Filter, RefreshCw, AlertCircle } from 'lucide-react';

const Patients = () => {
  const { userProfile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [error, setError] = useState('');
  
  const fetchPatients = async () => {
    if (!userProfile || !userProfile.hospitalId) {
      setLoading(false);
      return;
    }
    
    try {
      setRefreshing(true);
      
      // Create query based on user role
      let patientsQuery;
      
      if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
        patientsQuery = query(
          collection(db, 'patients'),
          where('hospitalId', '==', userProfile.hospitalId),
          orderBy('createdAt', 'desc')
        );
      } else if (userProfile.role === 'doctor' || userProfile.role === 'nurse') {
        // For healthcare providers, show patients that are waiting or in progress
        patientsQuery = query(
          collection(db, 'patients'),
          where('hospitalId', '==', userProfile.hospitalId),
          where('currentStatus', 'in', ['waiting', 'in-progress']),
          orderBy('createdAt', 'desc')
        );
      }
      
      if (patientsQuery) {
        const snapshot = await getDocs(patientsQuery);
        const patientsList = snapshot.docs.map(doc => doc.data() as Patient);
        setPatients(patientsList);
        setFilteredPatients(patientsList);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
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
      <div className="flex items-center justify-center h-64">
        <div className="loader" />
      </div>
    );
  }
  
  // Show a message if the user doesn't have a hospitalId yet
  if (!userProfile?.hospitalId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-2 text-xl font-medium text-secondary-900">Hospital Not Selected</h2>
        <p className="mt-2 text-secondary-500 max-w-md mx-auto">
          You need to register or select a hospital before you can manage patients.
          {userProfile?.role === 'admin' && (
            <Link to="/register-hospital" className="block mt-4 text-primary-600 hover:text-primary-500 font-medium">
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
        
        <div className="flex space-x-2">
          <button
            onClick={fetchPatients}
            className="btn btn-secondary text-sm flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
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
              placeholder="Search patients by name or phone"
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
                <option value="waiting">Waiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="relative">
              <label htmlFor="severity-filter" className="block text-xs font-medium text-secondary-500 mb-1">
                Severity
              </label>
              <select
                id="severity-filter"
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
            
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSeverityFilter('all');
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
      
      {/* Patients list */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Age/Gender</th>
                <th className="table-header-cell">Phone</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Severity</th>
                <th className="table-header-cell">Service</th>
                <th className="table-header-cell"></th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-secondary-900">{patient.name}</div>
                    </td>
                    <td className="table-cell">
                      {patient.age} / {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                    </td>
                    <td className="table-cell">{patient.phoneNumber}</td>
                    <td className="table-cell">
                      <span className={`status-${patient.currentStatus}`}>
                        {patient.currentStatus === 'waiting' ? 'Waiting' : 
                         patient.currentStatus === 'in-progress' ? 'In Progress' :
                         patient.currentStatus === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`severity-${patient.severity}`}>
                        {patient.severity.charAt(0).toUpperCase() + patient.severity.slice(1)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {patient.assignedService || 'Not assigned'}
                    </td>
                    <td className="table-cell text-right">
                      <Link 
                        to={`/patients/${patient.id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-secondary-500">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
 