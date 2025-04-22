import  { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Save, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Settings = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      theme: 'light',
      notifications: true,
      emailNotifications: true,
      language: 'en'
    }
  });
  
  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // In a real app, we would save these settings to the user profile
      console.log('Saving settings:', data);
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccess('Settings saved successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
      console.error(err);
    } finally {
      setSaving(false);
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
      <h1 className="text-2xl font-semibold text-secondary-900">Settings</h1>
      
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
        {/* Application Settings */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-secondary-900">
                Application Settings
              </h3>
              <p className="mt-1 text-sm text-secondary-500">
                Configure your application appearance and behavior.
              </p>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="theme" className="block text-sm font-medium text-secondary-700">
                    Theme
                  </label>
                  <select
                    id="theme"
                    className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('theme')}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="language" className="block text-sm font-medium text-secondary-700">
                    Language
                  </label>
                  <select
                    id="language"
                    className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('language')}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="rw">Kinyarwanda</option>
                  </select>
                </div>
                
                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notifications"
                        type="checkbox"
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                        {...register('notifications')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifications" className="font-medium text-secondary-700">
                        Push Notifications
                      </label>
                      <p className="text-secondary-500">Receive notifications within the application.</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="emailNotifications"
                        type="checkbox"
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                        {...register('emailNotifications')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emailNotifications" className="font-medium text-secondary-700">
                        Email Notifications
                      </label>
                      <p className="text-secondary-500">Receive email notifications about important events.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hospital Settings - Only for admin */}
        {userProfile.role === 'admin' && (
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-secondary-900">
                  Hospital Settings
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Configure hospital-specific settings.
                </p>
              </div>
              
              <div className="mt-5 md:mt-0 md:col-span-2">
                {userProfile.hospitalId ? (
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="workingHoursStart" className="block text-sm font-medium text-secondary-700">
                        Working Hours Start
                      </label>
                      <select
                        id="workingHoursStart"
                        className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="8">8:00 AM</option>
                        <option value="9">9:00 AM</option>
                        <option value="10">10:00 AM</option>
                      </select>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="workingHoursEnd" className="block text-sm font-medium text-secondary-700">
                        Working Hours End
                      </label>
                      <select
                        id="workingHoursEnd"
                        className="mt-1 block w-full py-2 px-3 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="17">5:00 PM</option>
                        <option value="18">6:00 PM</option>
                        <option value="19">7:00 PM</option>
                      </select>
                    </div>
                    
                    <div className="col-span-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="allowWalkIns"
                            type="checkbox"
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="allowWalkIns" className="font-medium text-secondary-700">
                            Allow Walk-ins
                          </label>
                          <p className="text-secondary-500">Allow patients to register without an appointment.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No Hospital Selected</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            You need to register or select a hospital before you can configure hospital settings.
                          </p>
                          <p className="mt-2">
                            <a href="/register-hospital" className="font-medium text-yellow-700 underline hover:text-yellow-600">
                              Register a hospital
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
 