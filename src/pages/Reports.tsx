import  { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Report } from '../types';
import { FileText, Download, Calendar, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const Reports = () => {
  const { userProfile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [error, setError] = useState('');
  
  const fetchReports = async () => {
    if (!userProfile?.hospitalId) {
      setLoading(false);
      return;
    }
    
    try {
      setRefreshing(true);
      
      let reportsQuery = query(
        collection(db, 'reports'),
        where('hospitalId', '==', userProfile.hospitalId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(reportsQuery);
      const reportsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
        } as Report;
      });
      
      setReports(reportsList);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchReports();
  }, [userProfile]);
  
  const filteredReports = typeFilter === 'all' 
    ? reports 
    : reports.filter(report => report.type === typeFilter);
  
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
        <FileText className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-2 text-xl font-medium text-secondary-900">Reports Access Restricted</h2>
        <p className="mt-2 text-secondary-500 max-w-md mx-auto">
          {!userProfile?.hospitalId 
            ? 'You need to register or select a hospital to access reports.'
            : 'You need administrator privileges to access reports.'}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">Reports</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={fetchReports}
            className="btn btn-secondary text-sm flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
      
      {/* Report Filter */}
      <div className="mt-4 bg-white shadow p-4 rounded-lg">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <label htmlFor="report-type" className="block text-xs font-medium text-secondary-500 mb-1">
              Report Type
            </label>
            <select
              id="report-type"
              className="block w-full pl-3 pr-10 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Reports</option>
              <option value="daily">Daily Reports</option>
              <option value="weekly">Weekly Reports</option>
              <option value="monthly">Monthly Reports</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => setTypeFilter('all')}
              className="py-2 px-4 border border-secondary-300 rounded-md text-sm text-secondary-700 hover:bg-secondary-50"
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Sample report dashboard */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden p-6">
        <h2 className="text-lg font-medium text-secondary-900 mb-4">Hospital Performance Overview</h2>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="bg-primary-50 p-6 rounded-lg h-64 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGFuYWx5dGljcyUyMGRhc2hib2FyZCUyMHJlcG9ydHMlMjBjaGFydHN8ZW58MHx8fHwxNzQ1MzU0Mjc2fDA"
                alt="Analytics dashboard visualization"
                className="max-h-full object-contain rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-secondary-500 text-center">
              Patient flow and waiting time analysis for the current month
            </p>
          </div>
          
          <div className="lg:w-1/3 space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 text-sm">Average Wait Time</h3>
              <p className="text-2xl font-bold text-green-900 mt-1">24 min</p>
              <p className="text-sm text-green-600">↓ 12% from last month</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 text-sm">Patients Served</h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">487</p>
              <p className="text-sm text-blue-600">↑ 8% from last month</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 text-sm">Staff Efficiency</h3>
              <p className="text-2xl font-bold text-purple-900 mt-1">92%</p>
              <p className="text-sm text-purple-600">↑ 5% from last month</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reports list */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-secondary-900 mb-4">Available Reports</h2>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredReports.length > 0 ? (
            <ul className="divide-y divide-secondary-200">
              {/* Sample reports since we don't have real data */}
              <li className="px-4 py-4 sm:px-6 hover:bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-primary-600">Monthly Patient Flow Analysis</p>
                      <p className="text-sm text-secondary-500">
                        <Calendar className="inline-block h-4 w-4 mr-1 text-secondary-400" />
                        {format(new Date(), 'MMMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-800">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6 hover:bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-primary-600">Weekly Staff Performance Report</p>
                      <p className="text-sm text-secondary-500">
                        <Calendar className="inline-block h-4 w-4 mr-1 text-secondary-400" />
                        Last 7 days
                      </p>
                    </div>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-800">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6 hover:bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-primary-600">Daily Patient Satisfaction Survey</p>
                      <p className="text-sm text-secondary-500">
                        <Calendar className="inline-block h-4 w-4 mr-1 text-secondary-400" />
                        Today
                      </p>
                    </div>
                  </div>
                  <div>
                    <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-800">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-secondary-400" />
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No Reports Found</h3>
              <p className="mt-1 text-sm text-secondary-500">
                {typeFilter !== 'all' 
                  ? `No ${typeFilter} reports are available.` 
                  : 'No reports are available yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
 