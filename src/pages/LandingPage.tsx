import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Shield, Activity, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span className="ml-2 text-xl font-bold text-primary-600">PatientFlow</span>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-6">
              <a href="#features" className="text-base font-medium text-secondary-500 hover:text-secondary-900">
                Features
              </a>
              <a href="#about" className="text-base font-medium text-secondary-500 hover:text-secondary-900">
                About
              </a>
              <a href="#contact" className="text-base font-medium text-secondary-500 hover:text-secondary-900">
                Contact
              </a>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Sign up
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on mobile menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#features"
                className="block py-2 px-3 text-base font-medium text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#about"
                className="block py-2 px-3 text-base font-medium text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="block py-2 px-3 text-base font-medium text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link
                to="/login"
                className="block py-2 px-3 text-base font-medium text-primary-600 hover:bg-primary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block py-2 px-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534679541758-8dc76ff8081d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMHJlY2VwdGlvbnxlbnwwfHx8fDE3NDUzNTU5ODB8MA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800"
            alt="Modern hospital reception"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary-700 mix-blend-multiply opacity-60" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            PatientFlow
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-white">
            A modern hospital reception and patient management system designed to reduce wait times, 
            streamline patient flows, and improve overall healthcare delivery in Rwanda and beyond.
          </p>
          <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="btn btn-accent"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary text-secondary-900"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div id="features" className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-secondary-900 sm:text-4xl">
              Streamline Your Hospital's Reception
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-secondary-500 mx-auto">
              Our system helps hospitals manage patient flow efficiently, reducing wait times 
              and improving patient satisfaction.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-secondary-900 tracking-tight">
                      Multi-Hospital Support
                    </h3>
                    <p className="mt-5 text-base text-secondary-500">
                      Manage multiple hospital locations with a single system. Each hospital has its 
                      own customized services.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-secondary-900 tracking-tight">
                      Smart Queue System
                    </h3>
                    <p className="mt-5 text-base text-secondary-500">
                      Automatic triage of patients based on severity. Prioritizes critical cases to avoid 
                      life-threatening delays.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-secondary-900 tracking-tight">
                      Secure Data Storage
                    </h3>
                    <p className="mt-5 text-base text-secondary-500">
                      Patient data is securely stored with Firebase, ensuring privacy and HIPAA 
                      compliance for all medical information.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <Activity className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-secondary-900 tracking-tight">
                      Real-Time Analytics
                    </h3>
                    <p className="mt-5 text-base text-secondary-500">
                      Monitor wait times, patient satisfaction, and staff efficiency with 
                      real-time dashboards and reports.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rest of the page remains the same */}
      {/* Testimonial section */}
      <div id="about" className="bg-primary-50 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-secondary-900 sm:text-4xl">
              Trusted by Healthcare Facilities Across Rwanda
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-secondary-500 mx-auto">
              See how PatientFlow is transforming healthcare delivery
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <blockquote>
                  <p className="text-lg text-secondary-800">
                    "PatientFlow has reduced our average wait times by 40%. Our patients are happier and our staff can focus on delivering care."
                  </p>
                  <footer className="mt-6">
                    <p className="font-medium text-secondary-900">Dr. Jean Mugabo</p>
                    <p className="text-secondary-500">Medical Director, Kigali Central Hospital</p>
                  </footer>
                </blockquote>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <blockquote>
                  <p className="text-lg text-secondary-800">
                    "The smart queue system ensures critical patients receive immediate attention, potentially saving lives every day."
                  </p>
                  <footer className="mt-6">
                    <p className="font-medium text-secondary-900">Nurse Marie Uwimana</p>
                    <p className="text-secondary-500">Head Nurse, Emergency Department</p>
                  </footer>
                </blockquote>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <blockquote>
                  <p className="text-lg text-secondary-800">
                    "Managing multiple facilities has never been easier. We can monitor performance across all locations from a single dashboard."
                  </p>
                  <footer className="mt-6">
                    <p className="font-medium text-secondary-900">Emmanuel Ndayisaba</p>
                    <p className="text-secondary-500">Hospital Administrator</p>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div id="contact" className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to transform your patient experience?
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Start using PatientFlow today and see the difference in your hospital's efficiency.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-800"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="mt-8 flex justify-center space-x-6">
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <p className="mt-8 text-center text-base text-secondary-400">
            &copy; 2023 PatientFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
 