/**
 * Gateway Integration Test Component
 * Tests all new gateway services with real API calls
 */

import React, { useState, useEffect } from 'react';
import useUserProfile from '../../hooks/useUserProfile';
import applicationWorkflowService from '../../services/applicationWorkflowService';
import documentGatewayService from '../../services/documentGatewayService';
import evaluationWorkflowService from '../../services/evaluationWorkflowService';
import interviewWorkflowService from '../../services/interviewWorkflowService';
import notificationTemplateService from '../../services/notificationTemplateService';
import { useAuth } from '../../context/AuthContext';

interface TestResult {
  service: string;
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
  data?: any;
}

const GatewayIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const { isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useUserProfile();

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...updates } : result
    ));
  };

  const testProfileService = async (): Promise<void> => {
    const startTime = Date.now();
    const testIndex = testResults.length;
    
    addTestResult({
      service: 'Profile Service',
      endpoint: 'GET /api/users/me',
      status: 'pending',
      message: 'Testing profile retrieval with JWT roles...'
    });

    try {
      setCurrentTest('Profile Service - /api/users/me');
      await refreshProfile();
      
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'success',
        message: `Profile loaded successfully! Role: ${profile?.role}, Permissions: ${profile?.permissions?.length || 0}`,
        duration,
        data: {
          role: profile?.role,
          permissions: profile?.permissions,
          emailVerified: profile?.emailVerified
        }
      });
      
      console.log('✅ Profile Service Test:', profile);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'error',
        message: `Failed: ${error.message}`,
        duration
      });
      
      console.error('❌ Profile Service Test Failed:', error);
    }
  };

  const testApplicationWorkflow = async (): Promise<void> => {
    const startTime = Date.now();
    const testIndex = testResults.length;
    
    addTestResult({
      service: 'Application Workflow',
      endpoint: 'POST /api/applications (draft)',
      status: 'pending',
      message: 'Testing application draft creation...'
    });

    try {
      setCurrentTest('Application Workflow - Draft Creation');
      
      // Create draft
      const draft = await applicationWorkflowService.createDraft({
        firstName: 'Test Student',
        lastName: 'Gateway',
        rut: '12345678-9',
        birthDate: '2018-03-15',
        gradeApplying: '1° Básico',
        currentSchool: 'Jardín Infantil Test'
      });
      
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'success',
        message: `Draft created! ID: ${draft.id}, Completion: ${draft.completionPercentage}%`,
        duration,
        data: {
          draftId: draft.id,
          completion: draft.completionPercentage,
          status: draft.status
        }
      });
      
      console.log('✅ Application Workflow Test:', draft);
      
      // Test submission if draft was created successfully
      if (draft.id) {
        await testApplicationSubmission(draft.id);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'error',
        message: `Failed: ${error.message}`,
        duration
      });
      
      console.error('❌ Application Workflow Test Failed:', error);
    }
  };

  const testApplicationSubmission = async (draftId: number): Promise<void> => {
    const startTime = Date.now();
    const testIndex = testResults.length;
    
    addTestResult({
      service: 'Application Workflow',
      endpoint: `POST /api/applications/${draftId}/submit`,
      status: 'pending',
      message: 'Testing application submission...'
    });

    try {
      setCurrentTest('Application Workflow - Submission');
      
      const submission = await applicationWorkflowService.submitApplication(draftId, {
        parentalConsent: true,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        submissionNotes: 'Test submission from Gateway Integration Test'
      });
      
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'success',
        message: `Submitted! Confirmation: ${submission.confirmationCode}`,
        duration,
        data: {
          confirmationCode: submission.confirmationCode,
          submissionDate: submission.submissionDate
        }
      });
      
      console.log('✅ Application Submission Test:', submission);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'error',
        message: `Failed: ${error.message}`,
        duration
      });
      
      console.error('❌ Application Submission Test Failed:', error);
    }
  };

  const testDocumentService = async (): Promise<void> => {
    const startTime = Date.now();
    const testIndex = testResults.length;
    
    addTestResult({
      service: 'Document Gateway',
      endpoint: 'Hybrid: Monolith + Gateway',
      status: 'pending',
      message: 'Testing document hybrid upload pattern...'
    });

    try {
      setCurrentTest('Document Gateway - Hybrid Upload');
      
      // Create a test file (blob)
      const testFile = new File(['Test document content'], 'test-document.pdf', {
        type: 'application/pdf'
      });
      
      const documentMetadata = await documentGatewayService.uploadDocument({
        file: testFile,
        documentType: 'BIRTH_CERTIFICATE',
        applicationId: 123, // Test application ID
        description: 'Test document upload via Gateway'
      });
      
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'success',
        message: `Uploaded! External ID: ${documentMetadata.externalId}`,
        duration,
        data: {
          externalId: documentMetadata.externalId,
          fileName: documentMetadata.fileName,
          fileSize: documentMetadata.fileSize
        }
      });
      
      console.log('✅ Document Service Test:', documentMetadata);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'error',
        message: `Failed: ${error.message}`,
        duration
      });
      
      console.error('❌ Document Service Test Failed:', error);
    }
  };

  const testEvaluationService = async (): Promise<void> => {
    const startTime = Date.now();
    const testIndex = testResults.length;
    
    addTestResult({
      service: 'Evaluation Workflow',
      endpoint: 'GET /api/evaluations?status=ASSIGNED',
      status: 'pending',
      message: 'Testing evaluation assignment retrieval...'
    });

    try {
      setCurrentTest('Evaluation Workflow - Assignments');
      
      const assignments = await evaluationWorkflowService.getAssignedEvaluations({
        status: 'ASSIGNED',
        includeStudentInfo: true
      });
      
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'success',
        message: `Retrieved ${assignments.length} assigned evaluations`,
        duration,
        data: {
          assignmentCount: assignments.length,
          evaluationTypes: assignments.map(a => a.evaluationType)
        }
      });
      
      console.log('✅ Evaluation Service Test:', assignments);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'error',
        message: `Failed: ${error.message}`,
        duration
      });
      
      console.error('❌ Evaluation Service Test Failed:', error);
    }
  };

  const testInterviewService = async (): Promise<void> => {
    const startTime = Date.now();
    const testIndex = testResults.length;
    
    addTestResult({
      service: 'Interview Workflow',
      endpoint: 'GET /api/users/me/interview-dashboard',
      status: 'pending',
      message: 'Testing interview dashboard retrieval...'
    });

    try {
      setCurrentTest('Interview Workflow - Dashboard');
      
      const dashboard = await interviewWorkflowService.getInterviewerDashboard();
      
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'success',
        message: `Dashboard loaded: ${dashboard.upcomingInterviews.length} upcoming interviews`,
        duration,
        data: {
          upcomingCount: dashboard.upcomingInterviews.length,
          todaysCount: dashboard.todaysInterviews.length,
          pendingActions: dashboard.pendingActions.length
        }
      });
      
      console.log('✅ Interview Service Test:', dashboard);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'error',
        message: `Failed: ${error.message}`,
        duration
      });
      
      console.error('❌ Interview Service Test Failed:', error);
    }
  };

  const testNotificationService = async (): Promise<void> => {
    const startTime = Date.now();
    const testIndex = testResults.length;
    
    addTestResult({
      service: 'Notification Templates',
      endpoint: 'GET /api/notifications/admin/templates',
      status: 'pending',
      message: 'Testing notification templates retrieval...'
    });

    try {
      setCurrentTest('Notification Templates - List');
      
      const templates = await notificationTemplateService.getTemplates({
        isActive: true
      });
      
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'success',
        message: `Retrieved ${templates.templates.length} active templates`,
        duration,
        data: {
          templateCount: templates.templates.length,
          categories: [...new Set(templates.templates.map(t => t.category))]
        }
      });
      
      console.log('✅ Notification Service Test:', templates);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testIndex, {
        status: 'error',
        message: `Failed: ${error.message}`,
        duration
      });
      
      console.error('❌ Notification Service Test Failed:', error);
    }
  };

  const runAllTests = async (): Promise<void> => {
    if (testing || !isAuthenticated) return;
    
    setTesting(true);
    setTestResults([]);
    setCurrentTest('');
    
    console.log('🏁 Starting Gateway Integration Tests...');
    
    try {
      await testProfileService();
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      
      await testApplicationWorkflow();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testDocumentService();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testEvaluationService();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testInterviewService();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testNotificationService();
      
      console.log('🎉 All Gateway Integration Tests Complete!');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      setTesting(false);
      setCurrentTest('');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">🔒 Authentication Required</h2>
          <p className="text-yellow-700">Please log in to test the gateway integration services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌐 Gateway Integration Tests</h1>
        <p className="text-gray-600">Testing all new gateway services with real API calls</p>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">🏁 Test Suite</h2>
          <div className="space-x-3">
            <button
              onClick={runAllTests}
              disabled={testing}
              className={`px-4 py-2 rounded font-medium ${
                testing 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {testing ? '🔄 Testing...' : '🚀 Run All Tests'}
            </button>
            <button
              onClick={clearResults}
              disabled={testing}
              className="px-4 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 disabled:bg-gray-300"
            >
              🗑️ Clear Results
            </button>
          </div>
        </div>

        {currentTest && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-blue-800 font-medium">🔄 Currently testing: {currentTest}</p>
          </div>
        )}

        {/* User Profile Info */}
        {profile && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">👤 Current User Profile</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Role:</strong> {profile.role}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Permissions:</strong> {profile.permissions?.length || 0} permissions</p>
              <p><strong>Email Verified:</strong> {profile.emailVerified ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Test Results</h2>
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.service}</h3>
                      <p className="text-sm text-gray-600">{result.endpoint}</p>
                    </div>
                  </div>
                  {result.duration && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {result.duration}ms
                    </span>
                  )}
                </div>
                
                <p className={`text-sm ${getStatusColor(result.status)} mb-2`}>
                  {result.message}
                </p>
                
                {result.data && (
                  <details className="text-xs">
                    <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                      View Response Data
                    </summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-green-700">Successful</div>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {testResults.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayIntegrationTest;