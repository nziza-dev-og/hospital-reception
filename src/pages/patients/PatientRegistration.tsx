import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { Service, Hospital } from '../../types';
import { Save, AlertCircle } from 'lucide-react';

type FormData = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  medicalHistory?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  assignedService?: string;
};

const PatientRegistration = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  useEffect(() => {
    const fetchHospitalData = async () => {
      if (!userProfile || !userProfile.hospitalId) return;
      
      try {
        const hospitalsQuery = query(
          collection(db, 'hospitals'),
          where('id', '==', userProfile.hospitalId)
        );
        
        const snapshot = await getDocs(hospitalsQuery);
        if (!snapshot.empty) {
          const hospitalData = snapshot.docs[0].data() as Hospital;
          setHospital(hospitalData);
          
          // Filter only available services
          const availableServices = (hospitalData.services || []).filter(s => s.isAvailable);
          setServices(availableServices);
        }
      } catch (error) {
        console.error('Error fetching hospital data:', error);
        setError('Failed to load hospital services');
      }
    };
    
    fetchHospitalData();
  }, [userProfile]);
  
  const onSubmit = async (data: FormData) => {
    if (!userProfile || !userProfile.hospitalId) {
      setError('You must be logged in and associated with a hospital');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const newPatient = {
        id: uuidv4(),
        ...data,
        currentStatus: 'waiting',
        hospitalId: userProfile.hospitalId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        // Calculate estimated wait time based on severity
        waitTime: calculateWaitTime(data.severity, data.assignedService)
      };
      
      await addDoc(collection(db, 'patients'), newPatient);
      navigate('/patients');
    } catch (err) {
      setError('Failed to register patient');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateWaitTime = (severity: string, serviceId?: string) => {
    // Base wait time in minutes
    let baseTime = 30;
    
    // Adjust based on severity
    switch (severity) {
      case 'critical':
        baseTime = 0; // Immediate attention
        break;
      case 'high':
        baseTime = 10;
        break;
      case 'medium':
        baseTime = 20;
        break;
      case 'low':
        baseTime = 30;
        break;
      default:
        baseTime = 30;
    }
    
    // Adjust based on service if available
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        baseTime += service.estimatedWaitTime;
      }
    }
    
    return baseTime;
  };
  
  // If user doesn't have a hospital assigned, show a message
  if (!userProfile?.hospitalId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-secondary-900">Hospital Not Selected</h2>
        <p className="mt-2 text-secondary-500 max-w-md mx-auto">
          You need to register or select a hospital before you can register patients.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-secondary-900">Register New Patient</h1>
      
      {hospital && (
        <div className="mt-2 text-sm text-secondary-500">
          Hospital: {hospital.name}
        </div>
      )}
      
      <div className="mt-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-secondary-900">Personal Information</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Basic information about the patient.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="col-span-6 sm:col-span-1">
                  <label htmlFor="age" className="block text-sm font-medium text-secondary-700">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                    {...register('age', { 
                      required: 'Age is required',
                      min: { value: 0, message: 'Age must be positive' },
                      max: { value: 120, message: 'Age cannot exceed 120' }
                    })}
                  />
                  {errors.age && (
                    <p className="mt-2 text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>
                
                <div className="col-span-6 sm:col-span-1">
                  <label htmlFor="gender" className="block text-sm font-medium text-secondary-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('gender', { required: 'Gender is required' })}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-secondary-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-secondary-700">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                    {...register('emergencyContact', { required: 'Emergency contact is required' })}
                  />
                  {errors.emergencyContact && (
                    <p className="mt-2 text-sm text-red-600">{errors.emergencyContact.message}</p>
                  )}
                </div>
                
                <div className="col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-secondary-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                    {...register('address', { required: 'Address is required' })}
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-5">
              <div className="border-t border-secondary-200"></div>
            </div>
          </div>
          
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-secondary-900">Medical Information</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Medical details and service assignment.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-secondary-700">
                    Medical History (optional)
                  </label>
                  <textarea
                    id="medicalHistory"
                    rows={3}
                    className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                    {...register('medicalHistory')}
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="severity" className="block text-sm font-medium text-secondary-700">
                    Severity
                  </label>
                  <select
                    id="severity"
                    className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('severity', { required: 'Severity is required' })}
                  >
                    <option value="">Select Severity</option>
                    <option value="low">Low (Routine)</option>
                    <option value="medium">Medium (Non-urgent)</option>
                    <option value="high">High (Urgent)</option>
                    <option value="critical">Critical (Emergency)</option>
                  </select>
                  {errors.severity && (
                    <p className="mt-2 text-sm text-red-600">{errors.severity.message}</p>
                  )}
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="assignedService" className="block text-sm font-medium text-secondary-700">
                    Assign to Service
                  </label>
                  <select
                    id="assignedService"
                    className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('assignedService')}
                  >
                    <option value="">Select Service (Optional)</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="bg-white py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? (
                  'Registering...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Register Patient
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
 