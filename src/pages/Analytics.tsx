import  { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Activity, Clock, Users, Calendar, AlertCircle, Clipboard, FileText } from 'lucide-react';

const Analytics = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    patientsToday: 0,
    patientsThisWeek: 0,
    patientsThisMonth: 0,
    averageWaitTime: 0,
    completionRate: 0,
    criticalCases: 0
  });
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userProfile?.hospitalId) {
        setLoading(false);
        return;
      }
      
      try {
        // In a real app, we would fetch actual analytics data from the backend
        // For demo purposes, we're using mock data
        
        // Wait a bit to simulate loading
        setTimeout(() => {
          setStats({
            patientsToday: 42,
            patientsThisWeek: 287,
            patientsThisMonth: 1243,
            averageWaitTime: 24,
            completionRate: 92,
            criticalCases: 18
          });
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [userProfile]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader" />
      </div>
    );
  }
  
  // Show message if not an admin or no hospital assigned
  if (userProfile?.role !== 'admin' || !userProfile?.hospitalId) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-2 text-xl font-medium text-secondary-900">Analytics Access Restricted</h2>
        <p className="mt-2 text-secondary-500 max-w-md mx-auto">
          {!userProfile?.hospitalId 
            ? 'You need to register or select a hospital to access analytics.'
            : 'You need administrator privileges to access analytics.'}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-secondary-900">Analytics Dashboard</h1>
      <p className="text-sm text-secondary-500 mt-1">
        Real-time insights for patient flow management
      </p>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    Patients Today
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-secondary-900">
                      {stats.patientsToday}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-primary-600 hover:text-primary-900">
                {stats.patientsThisWeek} this week
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    Average Wait Time
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-secondary-900">
                      {stats.averageWaitTime} minutes
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600 hover:text-green-900">
                12% better than last month
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    Critical Cases
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-secondary-900">
                      {stats.criticalCases}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-red-600 hover:text-red-900">
                {Math.round((stats.criticalCases / stats.patientsThisWeek) * 100)}% of weekly patients
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Patient Flow Trends</h3>
          <div className="relative h-80 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGFuYWx5dGljcyUyMGRhc2hib2FyZCUyMHJlcG9ydHMlMjBjaGFydHN8ZW58MHx8fHwxNzQ1MzU0Mjc2fDA" 
              alt="Analytics chart" 
              className="object-cover w-full h-full rounded-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <span className="px-4 py-2 bg-white bg-opacity-75 rounded-md text-sm font-medium">
                Interactive chart will appear here
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Service Utilization</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-blue-100 rounded-full w-3 h-3 mr-2"></span>
                  <span className="text-sm text-secondary-700">General Medicine</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">42%</span>
              </div>
              <div className="mt-1 w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-green-100 rounded-full w-3 h-3 mr-2"></span>
                  <span className="text-sm text-secondary-700">Pediatrics</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">28%</span>
              </div>
              <div className="mt-1 w-full bg-green-100 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-yellow-100 rounded-full w-3 h-3 mr-2"></span>
                  <span className="text-sm text-secondary-700">Emergency</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">15%</span>
              </div>
              <div className="mt-1 w-full bg-yellow-100 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-purple-100 rounded-full w-3 h-3 mr-2"></span>
                  <span className="text-sm text-secondary-700">Obstetrics</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">10%</span>
              </div>
              <div className="mt-1 w-full bg-purple-100 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-red-100 rounded-full w-3 h-3 mr-2"></span>
                  <span className="text-sm text-secondary-700">Surgery</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">5%</span>
              </div>
              <div className="mt-1 w-full bg-red-100 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional analytics section */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Staff Performance Metrics
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary-500">
              Efficiency and productivity analysis
            </p>
          </div>
          <div>
            <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200">
              <FileText className="mr-1.5 h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
        
        <div className="border-t border-secondary-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-secondary-200 rounded-lg p-4">
              <h4 className="text-base font-medium text-secondary-900 mb-4">
                Staff Efficiency
              </h4>
              <div className="flex items-center justify-center h-52">
                <img 
                  src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxob3NwaXRhbCUyMGFuYWx5dGljcyUyMGRhc2hib2FyZCUyMHJlcG9ydHMlMjBjaGFydHN8ZW58MHx8fHwxNzQ1MzU0Mjc2fDA"
                  alt="Staff efficiency chart"
                  className="max-h-full object-contain rounded"
                />
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-secondary-500">Efficiency Rate</span>
                <span className="font-medium text-secondary-900">{stats.completionRate}%</span>
              </div>
            </div>
            
            <div className="border border-secondary-200 rounded-lg p-4">
              <h4 className="text-base font-medium text-secondary-900 mb-4">
                Wait Time Analysis
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Morning (8AM-12PM)</span>
                    <span className="font-medium text-secondary-900">35 min</span>
                  </div>
                  <div className="mt-1 w-full bg-secondary-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Afternoon (12PM-5PM)</span>
                    <span className="font-medium text-secondary-900">22 min</span>
                  </div>
                  <div className="mt-1 w-full bg-secondary-100 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Evening (5PM-9PM)</span>
                    <span className="font-medium text-secondary-900">15 min</span>
                  </div>
                  <div className="mt-1 w-full bg-secondary-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Average</span>
                    <span className="font-medium text-secondary-900">{stats.averageWaitTime} min</span>
                  </div>
                  <div className="mt-1 w-full bg-secondary-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
 