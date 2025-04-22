import  { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Edit, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

type ProfileFormData = {
  name: string;
  email: string;
  phoneNumber: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const Profile = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phoneNumber: userProfile?.phoneNumber || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  const newPassword = watch('newPassword');
  
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError('');
      setSuccess('');
      
      // Update profile information
      if (editing) {
        await updateUserProfile({
          name: data.name,
          phoneNumber: data.phoneNumber
        });
        
        setSuccess('Profile updated successfully');
        setEditing(false);
      }
      
      // Update password
      if (changingPassword) {
        // In a real app, we would implement password change logic here
        console.log('Password change:', {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        });
        
        setSuccess('Password updated successfully');
        setChangingPassword(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error(err);
    }
  };
  
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-secondary-900">Your Profile</h1>
      
      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Profile Information */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-secondary-900">
                Profile Information
              </h3>
              <p className="mt-1 text-sm text-secondary-500">
                Your personal information and account settings.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                    Full Name
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-secondary-300 bg-secondary-50 text-secondary-500 sm:text-sm">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      id="name"
                      disabled={!editing}
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-secondary-300 ${
                        editing 
                          ? 'focus:ring-primary-500 focus:border-primary-500' 
                          : 'bg-secondary-50'
                      }`}
                      {...register('name', { required: 'Name is required' })}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                    Email address
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-secondary-300 bg-secondary-50 text-secondary-500 sm:text-sm">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      id="email"
                      disabled
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-secondary-300 bg-secondary-50"
                      {...register('email')}
                    />
                  </div>
                  <p className="mt-2 text-xs text-secondary-500">
                    Email address cannot be changed.
                  </p>
                </div>
                
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-secondary-700">
                    Phone Number
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-secondary-300 bg-secondary-50 text-secondary-500 sm:text-sm">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      disabled={!editing}
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-secondary-300 ${
                        editing 
                          ? 'focus:ring-primary-500 focus:border-primary-500' 
                          : 'bg-secondary-50'
                      }`}
                      {...register('phoneNumber')}
                    />
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-4">
                  <div className="flex items-center space-x-3">
                    <label className="block text-sm font-medium text-secondary-700">
                      Role
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary-100 text-primary-800 capitalize">
                      {userProfile.role}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-4">
                  <div className="flex justify-end">
                    {!editing ? (
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Password Change */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-secondary-900">
                Password
              </h3>
              <p className="mt-1 text-sm text-secondary-500">
                Update your password.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-6">
                {!changingPassword ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setChangingPassword(true)}
                      className="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Change Password
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-secondary-700">
                          Current Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="currentPassword"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            {...register('currentPassword', { required: 'Current password is required' })}
                          />
                          {errors.currentPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-700">
                          New Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="newPassword"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            {...register('newPassword', { 
                              required: 'New password is required',
                              minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                              }
                            })}
                          />
                          {errors.newPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                          Confirm New Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            id="confirmPassword"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                            {...register('confirmPassword', { 
                              required: 'Please confirm your password',
                              validate: value => value === newPassword || 'Passwords do not match'
                            })}
                          />
                          {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setChangingPassword(false)}
                        className="inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Update Password
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
 