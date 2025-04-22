import  { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  FileText, 
  Users, 
  Phone, 
  Mail 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Support = () => {
  const { userProfile } = useAuth();
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would send this to a backend
    console.log({ category, message });
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setCategory('');
      setMessage('');
      setSubmitted(false);
    }, 3000);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-secondary-900">Help & Support</h1>
      <p className="mt-1 text-secondary-500">
        Get help with using the PatientFlow system
      </p>
      
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Support form */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">
              Contact Support
            </h2>
            
            {submitted ? (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Support request sent</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-secondary-700">
                    Category
                  </label>
                  <select
                    id="category"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select an issue category</option>
                    <option value="account">Account Issues</option>
                    <option value="technical">Technical Problems</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing Questions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      rows={4}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-md"
                      placeholder="Describe your issue or question"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <MessageCircle className="mr-2 -ml-1 h-5 w-5" />
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Quick links */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">
              Help Resources
            </h2>
            
            <div className="space-y-4">
              <div className="bg-secondary-50 p-4 rounded-lg flex">
                <Book className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-secondary-900">Documentation</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Browse our comprehensive documentation to learn more about PatientFlow.
                  </p>
                  <a href="#" className="mt-2 text-sm text-primary-600 hover:text-primary-500 font-medium inline-flex items-center">
                    View documentation
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="bg-secondary-50 p-4 rounded-lg flex">
                <FileText className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-secondary-900">Tutorials</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Step-by-step guides to help you make the most of PatientFlow.
                  </p>
                  <a href="#" className="mt-2 text-sm text-primary-600 hover:text-primary-500 font-medium inline-flex items-center">
                    View tutorials
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div className="bg-secondary-50 p-4 rounded-lg flex">
                <Users className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-secondary-900">Community Forum</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Connect with other users to share tips and solutions.
                  </p>
                  <a href="#" className="mt-2 text-sm text-primary-600 hover:text-primary-500 font-medium inline-flex items-center">
                    Join community
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact information */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex">
              <Phone className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-secondary-900">Phone Support</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Available Monday-Friday, 9AM-5PM
                </p>
                <p className="mt-1 text-sm font-medium">+250 736 369 412</p>
              </div>
            </div>
            
            <div className="flex">
              <Mail className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-secondary-900">Email Support</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  We'll respond within 3 hours
                </p>
                <p className="mt-1 text-sm font-medium">nzizadev@gmail.com</p>
              </div>
            </div>
            
            <div className="flex">
              <MessageCircle className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-secondary-900">Live Chat</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Chat with our support team
                </p>
                <button className="mt-1 text-sm font-medium text-primary-600 hover:text-primary-500">
                  Start chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-secondary-900">How do I register a new patient?</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Go to the Patients section and click on "Register New Patient". Fill out the required information and click "Register Patient".
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-secondary-900">How do I schedule an appointment?</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Navigate to the Appointments section and click "Schedule Appointment". Select a patient, doctor, service, date, and time, then submit the form.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-secondary-900">How can I add a new service?</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Administrators can add new services in the Services section by clicking "Add New Service" and filling out the form.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-secondary-900">How do I add staff members?</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Administrators can add new staff members in the Staff section by clicking "Add Staff Member" and providing their details.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-secondary-900">Can I export reports?</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Yes, administrators can export reports in the Reports section by selecting a report and clicking "Download".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ className, ...props }: { className?: string, [key: string]: any }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default Support;
 
