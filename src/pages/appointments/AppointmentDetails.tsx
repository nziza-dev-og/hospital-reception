import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Appointment } from '../../types';
import { ArrowLeft, Calendar, Clock, User, MapPin, Edit, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id || !userProfile) return;
      
      try {
        const appointmentDoc = await getDoc(doc(db, 'appointments', id));
        if (appointmentDoc.exists()) {
          const appointmentData = appointmentDoc.data() as Appointment;
          setAppointment(appointmentData);
          
          // Set form values
          reset({
            status: appointmentData.status
          });
        } else {
          setError('Appointment not found');
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointment();
  }, [id, userProfile]);
  
  const onSubmit = async (data: any) => {
    if (!appointment || !id) return;
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      const updates: Partial<Appointment> = {
        status: data.status as 'scheduled' | 'completed' | 'cancelled' | 'missed',
        lastUpdated: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'appointments', id), updates);
      
      // Update local state
      setAppointment(prev => prev ? { ...prev, ...updates } : null);
      setSuccess('Appointment updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment');
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
  
  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-secondary-900">Appointment not found</h2>
        <p className="mt-2 text-secondary-500">
          The appointment you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate('/appointments')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary-900">Appointment Details</h1>
        <button
          onClick={() => navigate('/appointments')}
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
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary-500 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Appointment on {format(new Date(appointment.date), 'MMMM d, yyyy')}
              </h3>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-secondary-500">
              {appointment.time}
            </p>
          </div>
          <div>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
              ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'}
            `}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="border-t border-secondary-200">
          <dl>
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Patient</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2 flex items-center">
                <User className="h-4 w-4 text-secondary-400 mr-1" />
                <Link to={`/patients/${appointment.patientId}`} className="text-primary-600 hover:text-primary-900">
                  {appointment.patientName}
                </Link>
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Doctor</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2 flex items-center">
                <User className="h-4 w-4 text-secondary-400 mr-1" />
                {appointment.doctorName 
                  ? appointment.doctorName 
                  : 'No doctor assigned'}
              </dd>
            </div>
            
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Service</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                {appointment.serviceName}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Status</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2">
                <span className={`
                  ${appointment.status === 'scheduled' ? 'text-blue-600' : 
                    appointment.status === 'completed' ? 'text-green-600' :
                    appointment.status === 'cancelled' ? 'text-red-600' :
                    'text-yellow-600'}
                  font-medium
                `}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </dd>
            </div>
            
            <div className="bg-secondary-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-secondary-500">Created At</dt>
              <dd className="mt-1 text-sm text-secondary-900 sm:mt-0 sm:col-span-2 flex items-center">
                <Clock className="h-4 w-4 text-secondary-400 mr-1" />
                {appointment.createdAt ? format(new Date(appointment.createdAt), 'PPpp') : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Update appointment status - Only for admin, receptionist, or doctor */}
      {(userProfile?.role === 'admin' || userProfile?.role === 'receptionist' || 
        (userProfile?.role === 'doctor' && userProfile.id === appointment.doctorId)) && (
        <div className="mt-6">
          {!isEditing ? (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Update Appointment Status
                </h3>
                <div className="mt-2 max-w-xl text-sm text-secondary-500">
                  <p>
                    Change the status of this appointment.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Edit className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900">
                    Update Appointment Status
                  </h3>
                  
                  <div className="mt-5">
                    <label htmlFor="status" className="block text-sm font-medium text-secondary-700">
                      Status
                    </label>
                    <select
                      id="status"
                      className="mt-1 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                      defaultValue={appointment.status}
                      {...register('status', { required: true })}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="missed">Missed</option>
                    </select>
                    {errors.status && (
                      <p className="mt-2 text-sm text-red-600">Status is required</p>
                    )}
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
    </div>
  );
};

export default AppointmentDetails;
 