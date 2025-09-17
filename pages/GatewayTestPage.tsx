/**
 * Gateway Test Page
 * Central testing interface for all gateway services
 */

import React, { useState } from 'react';
import GatewayIntegrationTest from '../components/testing/GatewayIntegrationTest';
import { GatewayServiceIntegrationDemo } from '../examples/GatewayServiceIntegration';
import { TypedApiUsageDemo } from '../examples/TypedApiUsage';
import { useAuth } from '../context/AuthContext';

type TabType = 'integration' | 'workflow' | 'typed-api';

const GatewayTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('integration');
  const { isAuthenticated, user } = useAuth();

  const tabs = [
    {
      id: 'integration' as TabType,
      label: '🧪 Integration Tests',
      description: 'Automated tests for all gateway endpoints'
    },
    {
      id: 'workflow' as TabType,
      label: '🔄 Workflow Demo',
      description: 'Interactive workflow demonstrations'
    },
    {
      id: 'typed-api' as TabType,
      label: '📝 Typed API Demo',
      description: 'TypeScript API client demonstrations'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'integration':
        return <GatewayIntegrationTest />;
      case 'workflow':
        return <GatewayServiceIntegrationDemo />;
      case 'typed-api':
        return <TypedApiUsageDemo />;
      default:
        return <GatewayIntegrationTest />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🌐 Gateway Integration Testing Suite
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Complete testing environment for MTN Admission System gateway services
                </p>
              </div>
              
              {isAuthenticated && user && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    👤 {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Role: {user.role} | Email: {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span>{tab.label}</span>
                    <span className="text-xs mt-1 opacity-75">{tab.description}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Authentication Check */}
            {!isAuthenticated ? (
              <div className="text-center py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🔒</div>
                  <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                    Authentication Required
                  </h2>
                  <p className="text-yellow-700 mb-4">
                    Please log in to access the Gateway Testing Suite
                  </p>
                  <div className="space-y-2 text-sm text-yellow-600">
                    <p>• Test user profiles and permissions</p>
                    <p>• Verify application workflows</p>
                    <p>• Check document upload patterns</p>
                    <p>• Validate evaluation and interview systems</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : (
              // Render active tab content
              renderTabContent()
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            🎯 Gateway Architecture Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🔄 Request Flow</h4>
              <div className="space-y-1">
                <p>• Frontend → API Gateway</p>
                <p>• JWT token validation</p>
                <p>• Feature flag routing</p>
                <p>• Monolith/Microservice selection</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">🛡️ Security Features</h4>
              <div className="space-y-1">
                <p>• Bearer token authentication</p>
                <p>• Role extraction from JWT</p>
                <p>• Correlation ID tracking</p>
                <p>• Request timeout management</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Resilience Patterns</h4>
              <div className="space-y-1">
                <p>• Exponential backoff retries</p>
                <p>• Circuit breaker protection</p>
                <p>• Automatic error mapping</p>
                <p>• Graceful degradation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayTestPage;