import  { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Patient, Hospital, Service } from '../types';
import { Clock, Clipboard, AlertCircle, Check } from 'lucide-react';

const PatientDashboard = () => {
  const { userProfile } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;
      
      try {
        // Fetch patient data
        const patientsQuery = query(
          collection(db, 'patients'),
          where('id', '==', userProfile.id)
        );
        
        const patientsSnapshot = await getDocs(patientsQuery);
        
        if (!patientsSnapshot.empty) {
          const patientData = patientsSnapshot.docs[0].data() as Patient;
          setPatient(patientData);
          
          // Fetch hospital data
          if (patientData.hospitalId) {
            const hospitalDoc = await getDoc(doc(db, 'hospitals', patientData.hospitalId));
            
            if (hospitalDoc.exists()) {
              const hospitalData = hospitalDoc.data() as Hospital;
              setHospital(hospitalData);
              
              // Find assigned service
              if (patientData.assignedService) {
                const serviceData = hospitalData.services?.find(
                  s => s.id === patientData.assignedService
                );
                
                if (serviceData) {
                  setService(serviceData);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userProfile]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-medium text-secondary-900">No Patient Record Found</h2>
        <p className="mt-2 text-secondary-500 text-center max-w-md">
          We couldn't find your patient record in our system. Please contact the reception desk for assistance.
        </p>
      </div>
    );
  }
  
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
      
      {/* Hospital info */}
      {hospital && (
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-secondary-50">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              {hospital.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary-500">
              {hospital.address}
            </p>
          </div>
        </div>
      )}
      
      {/* Status card */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-secondary-50">
          <h3 className="text-lg leading-6 font-medium text-secondary-900">
            Your Current Status
          </h3>
        </div>
        <div className="border-t border-secondary-200 px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center
                  ${patient.currentStatus === 'waiting' ? 'bg-yellow-100' : 
                    patient.currentStatus === 'in-progress' ? 'bg-blue-100' :
                    patient.currentStatus === 'completed' ? 'bg-green-100' :
                    'bg-red-100'}
                `}
              >
                {patient.currentStatus === 'waiting' ? (
                  <Clock className={`h-6 w-6 text-yellow-600`} />
                ) : patient.currentStatus === 'in-progress' ? (
                  <Clipboard className={`h-6 w-6 text-blue-600`} />
                ) : patient.currentStatus === 'completed' ? (
                  <Check className={`h-6 w-6 text-green-600`} />
                ) : (
                  <AlertCircle className={`h-6 w-6 text-red-600`} />
                )}
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-secondary-900">
                  {patient.currentStatus === 'waiting' ? 'Waiting for service' : 
                   patient.currentStatus === 'in-progress' ? 'Currently being served' :
                   patient.currentStatus === 'completed' ? 'Service completed' :
                   'Service cancelled'}
                </h4>
                <p className="text-sm text-secondary-500">
                  {service ? `Assigned to: ${service.name}` : 'Not assigned to any service yet'}
                </p>
              </div>
            </div>
            <div>
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
        </div>
      </div>
      
      {/* Wait time */}
      {patient.currentStatus === 'waiting' && (
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-secondary-500 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Estimated Wait Time
              </h3>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                      Wait progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary-600">
                      {patient.waitTime ? `${patient.waitTime} minutes` : 'Calculating...'}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                  <div 
                    style={{ width: "30%" }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                  ></div>
                </div>
              </div>
              <p className="text-sm text-secondary-500">
                This is an estimate and may change depending on the complexity of cases ahead of you.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Patient information */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-secondary-50">
          <h3 className="text-lg leading-6 font-medium text-secondary-900">
            Your Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-secondary-500">
            Personal details and medical information
          </p>
        </div>
        <div className="border-t border-secondary-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Full name</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.name}
              </dd>
            </div>
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Phone number</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.phoneNumber}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Severity</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                <span 
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${patient.severity === 'low' ? 'bg-green-100 text-green-800' :
                      patient.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      patient.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'}
                  `}
                >
                  {patient.severity.charAt(0).toUpperCase() + patient.severity.slice(1)}
                </span>
              </dd>
            </div>
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Medical history</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.medicalHistory || 'No medical history provided'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
 