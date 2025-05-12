import React, { useState } from 'react';

const FixSuggestions = ({ fixes, onApplyFixes }) => {
  const [selectedFixes, setSelectedFixes] = useState({});
  const [isApplying, setIsApplying] = useState(false);

  // Check if there are any fixes
  const hasFixes = fixes && Object.keys(fixes).length > 0;

  if (!hasFixes) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fix Suggestions</h2>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-blue-700">No fixes needed for your dataset.</p>
        </div>
      </div>
    );
  }

  const handleFixSelection = (issueType, column, option) => {
    setSelectedFixes({
      ...selectedFixes,
      [issueType]: {
        ...selectedFixes[issueType],
        [column]: {
          selected: option
        }
      }
    });
  };

  const handleApplyFixes = async () => {
    setIsApplying(true);
    await onApplyFixes(selectedFixes);
    setIsApplying(false);
  };

  const getCompletionPercentage = () => {
    let totalIssues = 0;
    let selectedIssues = 0;

    // Count total issues and selected fixes
    Object.entries(fixes).forEach(([issueType, issueItems]) => {
      Object.keys(issueItems).forEach(column => {
        totalIssues++;
        if (selectedFixes[issueType]?.[column]?.selected) {
          selectedIssues++;
        }
      });
    });

    return totalIssues > 0 ? Math.round((selectedIssues / totalIssues) * 100) : 0;
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Fix Suggestions</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Fix selection progress: {completionPercentage}%
          </span>
          <span className="text-sm text-gray-500">
            {completionPercentage === 100 ? 'All fixes selected!' : 'Select a fix for each issue'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Missing Values Fixes */}
      {fixes.missing_values && (
        <FixSection 
          title="Missing Values Fixes"
          icon={
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          }
        >
          {Object.entries(fixes.missing_values).map(([column, fix]) => (
            <FixOptions
              key={column}
              title={`Column: ${column}`}
              options={fix.options}
              selected={selectedFixes.missing_values?.[column]?.selected}
              onSelect={(option) => handleFixSelection('missing_values', column, option)}
            />
          ))}
        </FixSection>
      )}
      
      {/* Duplicates Fixes */}
      {fixes.duplicates && fixes.duplicates.rows && (
        <FixSection 
          title="Duplicates Fixes"
          icon={
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          }
        >
          <FixOptions
            title="Duplicate Rows"
            options={fixes.duplicates.rows.options}
            selected={selectedFixes.duplicates?.rows?.selected}
            onSelect={(option) => handleFixSelection('duplicates', 'rows', option)}
          />
        </FixSection>
      )}
      
      {/* Outliers Fixes */}
      {fixes.outliers && (
        <FixSection 
          title="Outliers Fixes"
          icon={
            <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          }
        >
          {Object.entries(fixes.outliers).map(([column, fix]) => (
            <FixOptions
              key={column}
              title={`Column: ${column}`}
              options={fix.options}
              selected={selectedFixes.outliers?.[column]?.selected}
              onSelect={(option) => handleFixSelection('outliers', column, option)}
            />
          ))}
        </FixSection>
      )}
      
      {/* Inconsistent Formats Fixes */}
      {fixes.inconsistent_formats && (
        <FixSection 
          title="Format Standardization"
          icon={
            <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          }
        >
          {Object.entries(fixes.inconsistent_formats).map(([column, fix]) => (
            <FixOptions
              key={column}
              title={`Column: ${column}`}
              options={fix.options}
              selected={selectedFixes.inconsistent_formats?.[column]?.selected}
              onSelect={(option) => handleFixSelection('inconsistent_formats', column, option)}
            />
          ))}
        </FixSection>
      )}
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleApplyFixes}
          disabled={completionPercentage < 100 || isApplying}
          className={`py-2 px-6 rounded-lg font-medium ${
            completionPercentage < 100 || isApplying
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 transition-colors'
          }`}
        >
          {isApplying ? 'Applying Fixes...' : 'Apply Selected Fixes'}
        </button>
      </div>
    </div>
  );
};

// Helper components
const FixSection = ({ title, icon, children }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800 ml-2">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

const FixOptions = ({ title, options, selected, onSelect }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-800 mb-3">{title}</h4>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div 
            key={index}
            className={`p-3 rounded-md border cursor-pointer transition-colors ${
              selected?.method === option.method
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onSelect(option)}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selected?.method === option.method
                  ? 'border-blue-500'
                  : 'border-gray-400'
              }`}>
                {selected?.method === option.method && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div className="ml-3">
                <div className="font-medium">{option.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FixSuggestions; 