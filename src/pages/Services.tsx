import  { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Service, Hospital } from '../types';
import { useForm } from 'react-hook-form';
import { Clipboard, Plus, Edit, Check, Clock, Trash, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ServiceFormData = {
  name: string;
  description: string;
  estimatedWaitTime: number;
  isAvailable: boolean;
};

const Services = () => {
  const { userProfile } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormData>();
  
  useEffect(() => {
    const fetchHospitalData = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }
      
      // If no hospitalId is set, set loading to false and return
      if (!userProfile.hospitalId) {
        setLoading(false);
        return;
      }
      
      try {
        const hospitalDoc = await getDoc(doc(db, 'hospitals', userProfile.hospitalId));
        
        if (hospitalDoc.exists()) {
          const hospitalData = hospitalDoc.data() as Hospital;
          setHospital(hospitalData);
          setServices(hospitalData.services || []);
        } else {
          setError('Hospital not found. Please contact an administrator.');
        }
      } catch (error) {
        console.error('Error fetching hospital data:', error);
        setError('Failed to load hospital data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospitalData();
  }, [userProfile]);
  
  const onSubmit = async (data: ServiceFormData) => {
    if (!userProfile || !userProfile.hospitalId || !hospital) {
      setError('You must be logged in as a hospital admin');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      let updatedServices = [...services];
      
      if (editingService) {
        // Update existing service
        updatedServices = updatedServices.map(service => 
          service.id === editingService.id 
            ? { ...service, ...data }
            : service
        );
        setSuccess('Service updated successfully');
      } else {
        // Add new service
        updatedServices.push({
          id: uuidv4(),
          ...data
        });
        setSuccess('Service added successfully');
      }
      
      await updateDoc(doc(db, 'hospitals', userProfile.hospitalId), {
        services: updatedServices
      });
      
      setServices(updatedServices);
      reset();
      setEditingService(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error updating services:', err);
      setError('Failed to update services');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEditService = (service: Service) => {
    setEditingService(service);
    reset({
      name: service.name,
      description: service.description,
      estimatedWaitTime: service.estimatedWaitTime,
      isAvailable: service.isAvailable
    });
    setShowForm(true);
  };
  
  const handleDeleteService = async (serviceId: string) => {
    if (!userProfile || !userProfile.hospitalId) return;
    
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      const updatedServices = services.filter(service => service.id !== serviceId);
      
      await updateDoc(doc(db, 'hospitals', userProfile.hospitalId), {
        services: updatedServices
      });
      
      setServices(updatedServices);
      setSuccess('Service deleted successfully');
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
    }
  };
  
  const handleAddNew = () => {
    setEditingService(null);
    reset({
      name: '',
      description: '',
      estimatedWaitTime: 15,
      isAvailable: true
    });
    setShowForm(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
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
        <p className="mt-2 text-secondary-500">
          You need to register a hospital before you can manage services.
        </p>
        <button
          onClick={() => window.location.href = '/register-hospital'}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Register Hospital
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Hospital Services</h1>
          {hospital && (
            <p className="text-sm text-secondary-500 mt-1">
              {hospital.name} ({hospital.region})
            </p>
          )}
        </div>
        
        <button 
          onClick={handleAddNew}
          className="btn btn-primary flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
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
      
      {showForm && (
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                    Service Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('name', { required: 'Service name is required' })}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="estimatedWaitTime" className="block text-sm font-medium text-secondary-700">
                    Estimated Wait Time (minutes)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="estimatedWaitTime"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('estimatedWaitTime', { 
                        required: 'Wait time is required',
                        min: { value: 0, message: 'Wait time cannot be negative' }
                      })}
                    />
                    {errors.estimatedWaitTime && (
                      <p className="mt-2 text-sm text-red-600">{errors.estimatedWaitTime.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      rows={3}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('description', { required: 'Description is required' })}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isAvailable"
                        type="checkbox"
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                        {...register('isAvailable')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isAvailable" className="font-medium text-secondary-700">
                        Service is currently available
                      </label>
                      <p className="text-secondary-500">
                        Unchecking this will hide the service from new patient registrations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {submitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Save Service
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Services list */}
      <div className="mt-6">
        {services.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-secondary-200">
              {services.map((service) => (
                <li key={service.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clipboard className="h-5 w-5 text-primary-600 mr-2" />
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {service.name}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${service.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}
                        >
                          {service.isAvailable ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-secondary-500">
                          {service.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-secondary-500 sm:mt-0">
                        <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-secondary-400" />
                        <p>Est. wait: {service.estimatedWaitTime} minutes</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="inline-flex items-center p-1.5 border border-secondary-300 shadow-sm text-xs font-medium rounded text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="inline-flex items-center p-1.5 border border-secondary-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No Services</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Get started by adding your first service
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddNew}
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add First Service
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
 