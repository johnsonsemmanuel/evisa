"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { countries } from "@/lib/countries";
import { Globe, CheckCircle, AlertTriangle, ArrowRight, Home, Upload, User, UserCheck, Plane, Shield } from "lucide-react";
import axios from "axios";

interface EtaFormData {
  visa_type_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  passport_number: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  issuing_authority: string;
  email: string;
  phone: string;
  residential_address: string;
  intended_arrival_date: string;
  port_of_entry: string;
  airline: string;
  flight_number: string;
  address_in_ghana: string;
  host_name: string;
  host_phone: string;
  denied_entry_before: boolean;
  criminal_conviction: boolean;
  previous_ghana_visa: boolean;
  travel_history: string;
}

export default function EtaApplicationPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EtaApplicationPageContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EtaApplicationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nationality = searchParams.get('nationality') || '';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [passportValidation, setPassportValidation] = useState<any>(null);
  const [issuingAuthorities, setIssuingAuthorities] = useState<string[]>([]);
  const [etaTypes, setEtaTypes] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<EtaFormData>({
    visa_type_id: 0,
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    nationality: nationality,
    passport_number: '',
    passport_issue_date: '',
    passport_expiry_date: '',
    issuing_authority: '',
    email: '',
    phone: '',
    residential_address: '',
    intended_arrival_date: '',
    port_of_entry: '',
    airline: '',
    flight_number: '',
    address_in_ghana: '',
    host_name: '',
    host_phone: '',
    denied_entry_before: false,
    criminal_conviction: false,
    previous_ghana_visa: false,
    travel_history: '',
  });

  // Load ETA types and issuing authorities on mount
  useEffect(() => {
    if (nationality) {
      loadEtaTypes();
      loadIssuingAuthorities();
    }
  }, [nationality]);

  const loadEtaTypes = async () => {
    try {
      const response = await axios.get(`/api/eta/eligible?nationality=${nationality}`);
      if (response.data.is_eligible) {
        setEtaTypes(response.data.eta_types);
        if (response.data.eta_types.length > 0) {
          setFormData(prev => ({ ...prev, visa_type_id: response.data.eta_types[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to load ETA types:', error);
    }
  };

  const loadIssuingAuthorities = async () => {
    try {
      const response = await axios.get(`/api/eta/issuing-authorities?nationality=${nationality}`);
      setIssuingAuthorities(response.data.issuing_authorities);
    } catch (error) {
      console.error('Failed to load issuing authorities:', error);
    }
  };

  // Validate passport number in real-time
  const validatePassportNumber = async (passportNumber: string) => {
    if (passportNumber.length < 6) return;
    
    try {
      const response = await axios.post('/api/eta/validate-passport', {
        passport_number: passportNumber,
        nationality: formData.nationality
      });
      setPassportValidation(response.data);
    } catch (error) {
      console.error('Passport validation failed:', error);
    }
  };

  const handleInputChange = (field: keyof EtaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time passport validation
    if (field === 'passport_number') {
      validatePassportNumber(value);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/eta/apply', formData);
      
      // Redirect to success page with application details
      router.push(`/apply/eta/success?ref=${response.data.reference_number}`);
    } catch (error: any) {
      console.error('ETA application failed:', error);
      alert(error.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal Information", icon: <User size={20} /> },
    { number: 2, title: "Passport Information", icon: <UserCheck size={20} /> },
    { number: 3, title: "Travel Information", icon: <Plane size={20} /> },
    { number: 4, title: "Security Declarations", icon: <Shield size={20} /> },
    { number: 5, title: "Review & Submit", icon: <CheckCircle size={20} /> },
  ];

  const getCountryName = (code: string) => {
    return countries.find(c => c.code === code)?.name || code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Globe size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Ghana ETA Application</h1>
                <p className="text-xs text-text-muted">Electronic Travel Authorization</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<Home size={14} />} onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center gap-3 ${currentStep >= step.number ? 'text-primary' : 'text-text-muted'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <CheckCircle size={20} /> : step.icon}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${currentStep > step.number ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-2">Personal Information</h2>
                  <p className="text-text-secondary">Please provide your personal details as they appear on your passport</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Nationality *</label>
                  <input
                    type="text"
                    value={getCountryName(formData.nationality)}
                    disabled
                    className="w-full px-4 py-3 border border-border rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Residential Address</label>
                  <textarea
                    value={formData.residential_address}
                    onChange={(e) => handleInputChange('residential_address', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    rows={3}
                    placeholder="Enter your residential address"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Passport Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-2">Passport Information</h2>
                  <p className="text-text-secondary">Enter your passport details exactly as they appear on your passport</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Passport Number *</label>
                  <input
                    type="text"
                    value={formData.passport_number}
                    onChange={(e) => handleInputChange('passport_number', e.target.value.toUpperCase())}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      passportValidation?.valid_format === false ? 'border-red-500' : 
                      passportValidation?.valid_format === true ? 'border-green-500' : 'border-border'
                    }`}
                    placeholder="Enter your passport number"
                  />
                  {passportValidation && (
                    <div className={`mt-2 text-sm ${passportValidation.valid_format ? 'text-green-600' : 'text-red-600'}`}>
                      {passportValidation.message}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Issue Date *</label>
                    <input
                      type="date"
                      value={formData.passport_issue_date}
                      onChange={(e) => handleInputChange('passport_issue_date', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.passport_expiry_date}
                      onChange={(e) => handleInputChange('passport_expiry_date', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Issuing Authority *</label>
                  <select
                    value={formData.issuing_authority}
                    onChange={(e) => handleInputChange('issuing_authority', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select Issuing Authority</option>
                    {issuingAuthorities.map((authority) => (
                      <option key={authority} value={authority}>
                        {authority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < 5 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={currentStep === 1 && (!formData.first_name || !formData.last_name || !formData.email)}
                  >
                    Next <ArrowRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    className="bg-success hover:bg-success/90"
                  >
                    Submit ETA Application
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}