import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MapPin, Clipboard } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type FormData = {
  name: string;
  region: string;
  address: string;
};

const regions = [
  'Kigali', 
  'Northern Province', 
  'Southern Province', 
  'Eastern Province', 
  'Western Province',
  'Other'
];

const RegisterHospital = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    if (!userProfile) {
      setError('You must be logged in to register a hospital');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Create a unique ID for the hospital
      const hospitalId = uuidv4();
      
      const newHospital = {
        id: hospitalId,
        name: data.name,
        region: data.region,
        address: data.address,
        adminId: userProfile.id,
        services: [],
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'hospitals'), newHospital);
      
      // Update the admin user with the hospitalId
      await updateUserProfile({ hospitalId });
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to register hospital');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Register Your Hospital
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Fill in the details below to register your hospital in our system
          </p>
        </div>
        
        <div className="mt-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                  Hospital Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="e.g. Kigali Central Hospital"
                    {...register('name', { required: 'Hospital name is required' })}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-secondary-700">
                  Region
                </label>
                <div className="mt-1">
                  <select
                    id="region"
                    className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('region', { required: 'Region is required' })}
                  >
                    <option value="">Select a region</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="mt-2 text-sm text-red-600">{errors.region.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-secondary-700">
                  Address
                </label>
                <div className="mt-1">
                  <textarea
                    id="address"
                    rows={3}
                    className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Full address of the hospital"
                    {...register('address', { required: 'Address is required' })}
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-secondary-500">
                <MapPin className="h-5 w-5 text-primary-500" />
                <span>Your hospital location will help us configure region-specific services</span>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {loading ? (
                    'Registering...'
                  ) : (
                    <>
                      <Clipboard className="mr-2 h-4 w-4" /> Register Hospital
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterHospital;
 