import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Patient, Service, Hospital } from '../../types';
import { ArrowLeft, Edit, Save, Calendar, Clock, AlertCircle, CheckCircle, User, Phone, MapPin, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userProfile || !userProfile.hospitalId) return;
      
      try {
        // Fetch patient data
        const patientDoc = await getDoc(doc(db, 'patients', id));
        if (patientDoc.exists()) {
          const patientData = patientDoc.data() as Patient;
          setPatient(patientData);
          
          // Set form values
          reset({
            currentStatus: patientData.currentStatus,
            assignedService: patientData.assignedService || '',
            doctorNotes: patientData.doctorNotes || ''
          });
        } else {
          setError('Patient not found');
        }
        
        // Fetch hospital data
        const hospitalDoc = await getDoc(doc(db, 'hospitals', userProfile.hospitalId));
        if (hospitalDoc.exists()) {
          const hospitalData = hospitalDoc.data() as Hospital;
          setHospital(hospitalData);
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
  
  const onSubmit = async (data: any) => {
    if (!patient || !id) return;
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      const updates: Partial<Patient> = {
        currentStatus: data.currentStatus as 'waiting' | 'in-progress' | 'completed' | 'cancelled',
        lastUpdated: serverTimestamp(),
      };
      
      if (data.assignedService) {
        updates.assignedService = data.assignedService;
      }
      
      if (data.doctorNotes) {
        updates.doctorNotes = data.doctorNotes;
      }
      
      await updateDoc(doc(db, 'patients', id), updates);
      
      // Update local state
      setPatient(prev => prev ? { ...prev, ...updates } : null);
      setSuccess('Patient information updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient information');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loader" />
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
      
      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-primary-500 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                {patient.name}
              </h3>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-secondary-500">
              Patient ID: {patient.id}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`severity-${patient.severity}`}>
              {patient.severity.charAt(0).toUpperCase() + patient.severity.slice(1)} Severity
            </span>
            <span className={`status-${patient.currentStatus}`}>
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
                <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <p className="flex items-center">
                      <span className="font-medium">Age:</span> 
                      <span className="ml-2">{patient.age}</span>
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center">
                      <span className="font-medium">Gender:</span> 
                      <span className="ml-2">{patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</span>
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 text-secondary-400 mr-1" />
                      <span className="font-medium">Phone:</span> 
                      <span className="ml-2">{patient.phoneNumber}</span>
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 text-secondary-400 mr-1" />
                      <span className="font-medium">Emergency Contact:</span> 
                      <span className="ml-2">{patient.emergencyContact}</span>
                    </p>
                  </div>
                </div>
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Address</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2 flex items-start">
                <MapPin className="h-4 w-4 text-secondary-400 mr-1 mt-0.5" />
                {patient.address}
              </dd>
            </div>
            
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Hospital</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {hospital?.name || 'Not specified'}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Assigned Service</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.assignedService ? (
                  services.find(s => s.id === patient.assignedService)?.name || 'Unknown Service'
                ) : (
                  'Not assigned to a service'
                )}
              </dd>
            </div>
            
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Medical History</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.medicalHistory || 'No medical history provided'}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Doctor Notes</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {patient.doctorNotes || 'No notes provided'}
              </dd>
            </div>
            
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <div className="flex items-center space-x-2">
                  {patient.currentStatus === 'waiting' ? (
                    <>
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Waiting</span>
                      {patient.waitTime && (
                        <span className="text-secondary-500">
                          (Est. wait: {patient.waitTime} minutes)
                        </span>
                      )}
                    </>
                  ) : patient.currentStatus === 'in-progress' ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <span className="text-blue-600 font-medium">In Progress</span>
                    </>
                  ) : patient.currentStatus === 'completed' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Completed</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-500" />
                      <span className="text-red-600 font-medium">Cancelled</span>
                    </>
                  )}
                </div>
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Registration Date</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2 flex items-center">
                <Calendar className="h-4 w-4 text-secondary-400 mr-1" />
                {patient.createdAt ? format(new Date(patient.createdAt), 'PPpp') : 'Unknown'}
              </dd>
            </div>
            
            {patient.lastUpdated && (
              <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-secondary-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2 flex items-center">
                  <Clock className="h-4 w-4 text-secondary-400 mr-1" />
                  {format(new Date(patient.lastUpdated), 'PPpp')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      {/* Update patient status section */}
      {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist' || 
        userProfile?.role === 'doctor' || userProfile?.role === 'nurse') && (
        <div className="mt-6">
          {!isEditing ? (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Update Patient Information
                </h3>
                <div className="mt-2 max-w-xl text-sm text-secondary-500">
                  <p>
                    Update the patient's status, assigned service, or add medical notes.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Edit className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                    Update Patient
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900">
                    Update Patient Information
                  </h3>
                  
                  <div className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-secondary-700">
                        Status
                      </label>
                      <select
                        id="status"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                        defaultValue={patient.currentStatus}
                        {...register('currentStatus', { required: true })}
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
                        className="mt-1 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                        defaultValue={patient.assignedService || ''}
                        {...register('assignedService')}
                      >
                        <option value="">None</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="doctorNotes" className="block text-sm font-medium text-secondary-700">
                        Doctor Notes
                      </label>
                      <textarea
                        id="doctorNotes"
                        rows={3}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                        defaultValue={patient.doctorNotes || ''}
                        {...register('doctorNotes')}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-white py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {updating ? (
                        'Updating...'
                      ) : (
                        <>
                          <Save className="mr-2 -ml-1 h-5 w-5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      
      {/* Schedule appointment button */}
      <div className="mt-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Schedule an Appointment
            </h3>
            <div className="mt-2 max-w-xl text-sm text-secondary-500">
              <p>
                Create a new appointment for this patient with a doctor.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => navigate('/appointments/schedule', { state: { patientId: patient.id } })}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
              >
                <Calendar className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
 