import  { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { User } from '../types';
import { useForm } from 'react-hook-form';
import { Users, Plus, User as UserIcon, AlertCircle, Trash, Phone, Mail } from 'lucide-react';

type StaffFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'receptionist' | 'doctor' | 'nurse';
  phoneNumber: string;
};

const Staff = () => {
  const { userProfile } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<StaffFormData>();
  const password = watch('password');
  
  const fetchStaff = async () => {
    if (!userProfile?.hospitalId) {
      setLoading(false);
      return;
    }
    
    try {
      const staffQuery = query(
        collection(db, 'users'),
        where('hospitalId', '==', userProfile.hospitalId)
      );
      
      const snapshot = await getDocs(staffQuery);
      const staffList = snapshot.docs.map(doc => doc.data() as User);
      setStaff(staffList);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStaff();
  }, [userProfile]);
  
  const onSubmit = async (data: StaffFormData) => {
    if (!userProfile || !userProfile.hospitalId) {
      setError('You must be logged in as a hospital admin');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      // Create new user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Add user profile to Firestore
      await addDoc(collection(db, 'users'), {
        id: user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        hospitalId: userProfile.hospitalId,
        createdAt: serverTimestamp()
      });
      
      // Update local state
      setStaff([...staff, {
        id: user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        hospitalId: userProfile.hospitalId,
        createdAt: new Date()
      }]);
      
      setSuccess('Staff member added successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error adding staff:', err);
      setError(err.message || 'Failed to add staff member. The email may already be in use.');
    } finally {
      setSubmitting(false);
    }
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
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-secondary-900">Hospital Not Selected</h2>
        <p className="mt-2 text-secondary-500 max-w-md mx-auto">
          You need to register a hospital before you can manage staff members.
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
        <h1 className="text-2xl font-semibold text-secondary-900">Staff Management</h1>
        
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
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
              Add New Staff Member
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-secondary-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('role', { required: 'Role is required' })}
                    >
                      <option value="admin">Admin</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                    </select>
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-secondary-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="phoneNumber"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('phoneNumber', { required: 'Phone number is required' })}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id="password"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id="confirmPassword"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
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
                    'Adding...'
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Add Staff Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Staff list */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Phone</th>
                <th className="table-header-cell"></th>
              </tr>
            </thead>
            <tbody className="table-body">
              {staff.length > 0 ? (
                staff.map((member) => (
                  <tr key={member.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-secondary-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          member.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                          member.role === 'nurse' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'}
                      `}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-secondary-400 mr-2" />
                        {member.email}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-secondary-400 mr-2" />
                        {member.phoneNumber || 'No phone number'}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => {/* Implement delete staff functionality */}}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-secondary-500">
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Staff;
 