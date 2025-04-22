import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Patient, Service } from '../types';
import { Activity, Clock, User, Edit, ArrowLeft } from 'lucide-react';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  const [newStatus, setNewStatus] = useState('');
  const [newService, setNewService] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userProfile || !userProfile.hospitalId) return;
      
      try {
        // Fetch patient data
        const patientDoc = await getDoc(doc(db, 'patients', id));
        if (patientDoc.exists()) {
          const patientData = patientDoc.data() as Patient;
          setPatient(patientData);
          setNewStatus(patientData.currentStatus);
          setNewService(patientData.assignedService || '');
        }
        
        // Fetch hospital services
        const hospitalDoc = await getDoc(doc(db, 'hospitals', userProfile.hospitalId));
        if (hospitalDoc.exists()) {
          const hospitalData = hospitalDoc.data();
          setServices(hospitalData.services || []);
        }
      } catch (error) {
        console.error('Error fetching patient details:', error);
        setError('Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, userProfile]);
  
  const handleStatusUpdate = async () => {
    if (!patient || !id) return;
    
    try {
      setUpdating(true);
      setError('');
      
      const updates: Partial<Patient> = {
        currentStatus: newStatus as 'waiting' | 'in-progress' | 'completed' | 'cancelled',
      };
      
      if (newService && newService !== patient.assignedService) {
        updates.assignedService = newService;
      }
      
      await updateDoc(doc(db, 'patients', id), updates);
      
      // Update local state
      setPatient(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient status');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-secondary-900">Patient not found</h2>
        <p className="mt-2 text-secondary-500">
          The patient you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary-900">Patient Details</h1>
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </button>
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
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              {patient.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary-500">
              ID: {patient.id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span 
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                ${patient.severity === 'low' ? 'bg-green-100 text-green-800' :
                  patient.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  patient.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'}
              `}
            >
              {patient.severity.charAt(0).toUpperCase() + patient.severity.slice(1)} Severity
            </span>
            <span 
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
            </span>
          </div>
        </div>
        <div className="border-t border-secondary-200">
          <dl>
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Personal Info</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                <div className="flex space-x-6">
                  <div>
                    <p><span className="font-medium">Age:</span> {patient.age}</p>
                    <p><span className="font-medium">Gender:</span> {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Phone:</span> {patient.phoneNumber}</p>
                    <p><span className="font-medium">Emergency Contact:</span> {patient.emergencyContact}</p>
                  </div>
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Address</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.address}
              </dd>
            </div>
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Assigned Service</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.assignedService ? (
                  services.find(s => s.id === patient.assignedService)?.name || 'Unknown Service'
                ) : (
                  'Not assigned to a service'
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Medical History</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.medicalHistory || 'No medical history provided'}
              </dd>
            </div>
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Registration Date</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.createdAt ? new Date(patient.createdAt).toLocaleString() : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Update status section */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-secondary-900">
            Update Patient Status
          </h3>
        </div>
        <div className="border-t border-secondary-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-secondary-700">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="waiting">Waiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-secondary-700">
                Assigned Service
              </label>
              <select
                id="service"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
              >
                <option value="">None</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {updating ? (
                'Updating...'
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Update Patient
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
 