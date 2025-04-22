import  { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Service, Hospital } from '../../types';
import { Calendar, Clock, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { format, addDays, isBefore, isToday } from 'date-fns';

type FormData = {
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string;
  time: string;
};

const ScheduleAppointment = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<FormData>();
  const selectedServiceId = watch('serviceId');
  
  // Get pre-selected patient from location state (if navigated from patient details)
  const preSelectedPatientId = location.state?.patientId;
  
  // Calculate min and max dates for appointment scheduling (today to 30 days in the future)
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const maxDate = format(addDays(today, 30), 'yyyy-MM-dd');
  
  // Available time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }
      
      try {
        if (userProfile.hospitalId) {
          // Fetch hospital data to get services
          const hospitalDoc = await getDoc(doc(db, 'hospitals', userProfile.hospitalId));
          
          if (hospitalDoc.exists()) {
            const hospitalData = hospitalDoc.data() as Hospital;
            // Filter only available services
            const availableServices = (hospitalData.services || []).filter(s => s.isAvailable);
            setServices(availableServices);
          }
          
          // Fetch doctors for this hospital
          const doctorsQuery = query(
            collection(db, 'users'),
            where('hospitalId', '==', userProfile.hospitalId),
            where('role', '==', 'doctor')
          );
          
          const doctorsSnapshot = await getDocs(doctorsQuery);
          const doctorsList = doctorsSnapshot.docs.map(doc => ({
            id: doc.data().id,
            name: doc.data().name
          }));
          setDoctors(doctorsList);
          
          // Fetch patients for selection (only for admin and receptionist)
          if (userProfile.role === 'admin' || userProfile.role === 'receptionist') {
            const patientsQuery = query(
              collection(db, 'patients'),
              where('hospitalId', '==', userProfile.hospitalId)
            );
            
            const patientsSnapshot = await getDocs(patientsQuery);
            const patientsList = patientsSnapshot.docs.map(doc => ({
              id: doc.data().id,
              name: doc.data().name
            }));
            setPatients(patientsList);
          }
          
          // If there's a pre-selected patient, set it in the form
          if (preSelectedPatientId) {
            setValue('patientId', preSelectedPatientId);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load necessary data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userProfile, preSelectedPatientId]);
  
  useEffect(() => {
    // Update selected service when serviceId changes
    if (selectedServiceId) {
      const service = services.find(s => s.id === selectedServiceId);
      setSelectedService(service || null);
    } else {
      setSelectedService(null);
    }
  }, [selectedServiceId, services]);
  
  const onSubmit = async (data: FormData) => {
    if (!userProfile || !userProfile.hospitalId) {
      setError('You must be logged in to schedule an appointment');
      return;
    }
    
    // Set patient ID to current user if role is patient
    if (userProfile.role === 'patient') {
      data.patientId = userProfile.id;
    }
    
    // Validate required fields
    if (!data.patientId) {
      setError('Patient is required');
      return;
    }
    
    if (!data.serviceId) {
      setError('Service is required');
      return;
    }
    
    if (!data.date) {
      setError('Date is required');
      return;
    }
    
    if (!data.time) {
      setError('Time is required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      // Get patient and doctor names for the appointment
      let patientName = '';
      let doctorName = '';
      let serviceName = '';
      
      // Get patient name
      if (userProfile.role === 'patient') {
        patientName = userProfile.name;
      } else {
        const selectedPatient = patients.find(p => p.id === data.patientId);
        patientName = selectedPatient?.name || '';
      }
      
      // Get doctor name if selected
      if (data.doctorId) {
        const selectedDoctor = doctors.find(d => d.id === data.doctorId);
        doctorName = selectedDoctor?.name || '';
      }
      
      // Get service name
      const selectedService = services.find(s => s.id === data.serviceId);
      serviceName = selectedService?.name || '';
      
      // Create new appointment
      const newAppointment = {
        id: uuidv4(),
        patientId: data.patientId,
        patientName,
        doctorId: data.doctorId || null,
        doctorName: doctorName || null,
        serviceId: data.serviceId,
        serviceName,
        date: new Date(data.date),
        time: data.time,
        status: 'scheduled',
        hospitalId: userProfile.hospitalId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };
      
      await addDoc(collection(db, 'appointments'), newAppointment);
      
      setSuccess('Appointment scheduled successfully');
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/appointments');
      }, 1500);
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      setError('Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-secondary-900">Schedule Appointment</h1>
      
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
        
        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-secondary-900">Appointment Details</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Enter the details for the new appointment.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                {/* Patient selection - Only for admin and receptionist */}
                {(userProfile.role === 'admin' || userProfile.role === 'receptionist') && (
                  <div className="col-span-6">
                    <label htmlFor="patientId" className="block text-sm font-medium text-secondary-700">
                      Patient
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-secondary-400" />
                      </div>
                      <select
                        id="patientId"
                        className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                        {...register('patientId', { required: 'Patient is required' })}
                      >
                        <option value="">Select a patient</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.patientId && (
                      <p className="mt-2 text-sm text-red-600">{errors.patientId.message}</p>
                    )}
                  </div>
                )}
                
                {/* Doctor selection */}
                <div className="col-span-6">
                  <label htmlFor="doctorId" className="block text-sm font-medium text-secondary-700">
                    Doctor (Optional)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-secondary-400" />
                    </div>
                    <select
                      id="doctorId"
                      className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                      {...register('doctorId')}
                    >
                      <option value="">Select a doctor (optional)</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Service selection */}
                <div className="col-span-6">
                  <label htmlFor="serviceId" className="block text-sm font-medium text-secondary-700">
                    Service
                  </label>
                  <select
                    id="serviceId"
                    className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('serviceId', { required: 'Service is required' })}
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  {errors.serviceId && (
                    <p className="mt-2 text-sm text-red-600">{errors.serviceId.message}</p>
                  )}
                </div>
                
                {/* Date selection */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-secondary-700">
                    Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      min={todayStr}
                      max={maxDate}
                      className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                      {...register('date', { required: 'Date is required' })}
                    />
                  </div>
                  {errors.date && (
                    <p className="mt-2 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>
                
                {/* Time selection */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="time" className="block text-sm font-medium text-secondary-700">
                    Time
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-secondary-400" />
                    </div>
                    <select
                      id="time"
                      className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-secondary-300 rounded-md"
                      {...register('time', { required: 'Time is required' })}
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.time && (
                    <p className="mt-2 text-sm text-red-600">{errors.time.message}</p>
                  )}
                </div>
              </div>
              
              {selectedService && (
                <div className="mt-4 rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Service Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>{selectedService.description}</p>
                        <p className="mt-1">Estimated duration: {selectedService.estimatedWaitTime} minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="bg-white py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {submitting ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleAppointment;
 