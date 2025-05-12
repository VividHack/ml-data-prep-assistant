import React, { useState } from 'react';
import axios from 'axios';
import UploadCSV from './components/UploadCSV';
import DataSummary from './components/DataSummary';
import IssueTable from './components/IssueTable';
import FixSuggestions from './components/FixSuggestions';
import ReportDownload from './components/ReportDownload';
import './App.css';

function App() {
  // State for the application flow
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState(null);
  const [dataSummary, setDataSummary] = useState(null);
  const [issues, setIssues] = useState(null);
  const [fixes, setFixes] = useState(null);
  const [appliedFixes, setAppliedFixes] = useState(null);
  const [cleanedFilepath, setCleanedFilepath] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle successful CSV upload
  const handleUploadSuccess = (data) => {
    setUploadData(data);
    setDataSummary(data.summary);
    setCurrentStep(2);
    
    // Automatically proceed to detect issues
    detectIssues(data.filepath);
  };

  // Detect issues in the uploaded CSV
  const detectIssues = async (filepath) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/detect-issues', {
        filepath: filepath
      });
      
      setIssues(response.data.issues);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error detecting issues:', error);
      setError(error.response?.data?.error || 'Error detecting issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get fix suggestions for the detected issues
  const handleSelectFixes = async (detectedIssues) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/suggest-fixes', {
        filepath: uploadData.filepath,
        issues: detectedIssues
      });
      
      setFixes(response.data.fixes);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error suggesting fixes:', error);
      setError(error.response?.data?.error || 'Error suggesting fixes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply the selected fixes
  const handleApplyFixes = async (selectedFixes) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/apply-fixes', {
        filepath: uploadData.filepath,
        fixes: selectedFixes
      });
      
      setAppliedFixes(response.data.applied_fixes);
      setCleanedFilepath(response.data.output_filepath);
      setCurrentStep(5);
    } catch (error) {
      console.error('Error applying fixes:', error);
      setError(error.response?.data?.error || 'Error applying fixes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ML Data Prep Assistant</h1>
            {currentStep > 1 && (
              <div className="flex space-x-2 text-sm">
                <span 
                  className={`cursor-pointer ${currentStep === 2 ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                >
                  Data Summary
                </span>
                <span className="text-gray-400">/</span>
                <span 
                  className={`cursor-pointer ${currentStep === 3 ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => currentStep >= 3 && setCurrentStep(3)}
                >
                  Issues
                </span>
                <span className="text-gray-400">/</span>
                <span 
                  className={`cursor-pointer ${currentStep === 4 ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => currentStep >= 4 && setCurrentStep(4)}
                >
                  Fixes
                </span>
                <span className="text-gray-400">/</span>
                <span 
                  className={`cursor-pointer ${currentStep === 5 ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => currentStep >= 5 && setCurrentStep(5)}
                >
                  Report
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex">
              <svg 
                className="h-6 w-6 text-red-500 mr-3" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Processing...</span>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Prepare Your Data for Machine Learning
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Upload your CSV file to detect and fix common data issues. 
                Our assistant helps you clean missing values, remove duplicates, 
                handle outliers, and standardize formats.
              </p>
            </div>

            <UploadCSV onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {currentStep >= 2 && dataSummary && (
          <DataSummary 
            summary={dataSummary} 
            className={currentStep !== 2 ? 'hidden' : ''}
          />
        )}

        {currentStep >= 3 && issues && (
          <IssueTable 
            issues={issues} 
            onSelectFixes={handleSelectFixes}
            className={currentStep !== 3 ? 'hidden' : ''}
          />
        )}

        {currentStep >= 4 && fixes && (
          <FixSuggestions 
            fixes={fixes} 
            onApplyFixes={handleApplyFixes}
            className={currentStep !== 4 ? 'hidden' : ''}
          />
        )}

        {currentStep >= 5 && appliedFixes && (
          <ReportDownload 
            originalFilepath={uploadData?.filepath}
            cleanedFilepath={cleanedFilepath}
            appliedFixes={appliedFixes}
            className={currentStep !== 5 ? 'hidden' : ''}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            ML Data Prep Assistant &copy; {new Date().getFullYear()} 
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
