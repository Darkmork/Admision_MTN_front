/**
 * Gateway Service Integration Example
 * Demonstrates complete workflow mapping to new gateway endpoints
 */

import React, { useState, useEffect } from 'react';
import profileService, { type UserProfile } from '../services/profileService';
import applicationWorkflowService, { type ApplicationDraft } from '../services/applicationWorkflowService';
import documentGatewayService from '../services/documentGatewayService';
import evaluationWorkflowService, { type EvaluationAssignment } from '../services/evaluationWorkflowService';
import interviewWorkflowService, { type InterviewSchedulingRequest } from '../services/interviewWorkflowService';
import notificationTemplateService, { type EmailTemplate } from '../services/notificationTemplateService';

// Example 1: User Profile Management (/api/users/me)
const ProfileManagementExample: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Gateway extracts roles from JWT token automatically
      const userProfile = await profileService.getCurrentUser();
      setProfile(userProfile);
      
      console.log('✅ Profile loaded with roles from token:', userProfile.role);
      console.log('📋 User permissions:', userProfile.permissions);
    } catch (error: any) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    if (!profile) return;
    
    try {
      const updatedProfile = await profileService.updatePreferences({
        language: 'es',
        timezone: 'America/Santiago',
        theme: 'light',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      });
      
      setProfile(updatedProfile);
      console.log('✅ Preferences updated');
    } catch (error: any) {
      console.error('❌ Error updating preferences:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">👤 Profile Management (/api/users/me)</h2>
      
      {loading ? (
        <p>Loading profile...</p>
      ) : profile ? (
        <div className="border rounded p-4 space-y-2">
          <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Permissions:</strong> {profile.permissions?.join(', ')}</p>
          {profile.subject && <p><strong>Subject:</strong> {profile.subject}</p>}
          {profile.educationalLevel && <p><strong>Level:</strong> {profile.educationalLevel}</p>}
          
          <button
            onClick={updatePreferences}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Preferences
          </button>
        </div>
      ) : (
        <p>No profile data</p>
      )}
    </div>
  );
};

// Example 2: Application Workflow (Draft → Submit → Status)
const ApplicationWorkflowExample: React.FC = () => {
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('No application');

  const createDraft = async () => {
    try {
      // POST /api/applications (create draft)
      const newDraft = await applicationWorkflowService.createDraft({
        firstName: 'Joaquín',
        lastName: 'González',
        rut: '12345678-9',
        birthDate: '2018-03-15',
        gradeApplying: '1° Básico'
      });
      
      setDraft(newDraft);
      setApplicationId(newDraft.id!);
      setStatus('Draft created');
      
      console.log('✅ Draft created:', newDraft.id);
    } catch (error: any) {
      console.error('❌ Error creating draft:', error);
    }
  };

  const submitApplication = async () => {
    if (!applicationId) return;
    
    try {
      // POST /api/applications/{id}/submit
      const submission = await applicationWorkflowService.submitApplication(applicationId, {
        parentalConsent: true,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        submissionNotes: 'Postulación completada por padres'
      });
      
      setStatus(`Submitted - Code: ${submission.confirmationCode}`);
      console.log('✅ Application submitted:', submission.confirmationCode);
    } catch (error: any) {
      console.error('❌ Error submitting application:', error);
    }
  };

  const checkStatus = async () => {
    if (!applicationId) return;
    
    try {
      // GET /api/applications/{id}
      const appStatus = await applicationWorkflowService.getApplicationStatus(applicationId);
      setStatus(`Status: ${appStatus.status} (${appStatus.currentStageProgress.percentage}% complete)`);
      
      console.log('📊 Application status:', appStatus);
      console.log('📝 Next steps:', appStatus.nextSteps);
    } catch (error: any) {
      console.error('❌ Error checking status:', error);
    }
  };

  const getHistory = async () => {
    if (!applicationId) return;
    
    try {
      // GET /api/applications/{id}/transitions
      const history = await applicationWorkflowService.getApplicationHistory(applicationId);
      console.log('📜 Application history:', history.transitions);
      console.log('⏰ Timeline:', history.timeline);
    } catch (error: any) {
      console.error('❌ Error getting history:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">📝 Application Workflow</h2>
      
      <div className="flex gap-2">
        <button
          onClick={createDraft}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Draft
        </button>
        
        <button
          onClick={submitApplication}
          disabled={!applicationId}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Submit Application
        </button>
        
        <button
          onClick={checkStatus}
          disabled={!applicationId}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
        >
          Check Status
        </button>
        
        <button
          onClick={getHistory}
          disabled={!applicationId}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          Get History
        </button>
      </div>
      
      <div className="border rounded p-4">
        <p><strong>Status:</strong> {status}</p>
        {draft && (
          <div className="mt-2">
            <p><strong>Application ID:</strong> {draft.id}</p>
            <p><strong>Completion:</strong> {draft.completionPercentage}%</p>
            <p><strong>Last Modified:</strong> {new Date(draft.lastModified).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Example 3: Document Management (Monolith → Gateway pattern)
const DocumentManagementExample: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState<string>('Ready to upload');
  const [documents, setDocuments] = useState<string[]>([]);

  const uploadDocument = async (file: File) => {
    try {
      setUploadProgress('Uploading to monolith...');
      
      // Hybrid workflow: binary to monolith → metadata to gateway
      const documentMetadata = await documentGatewayService.uploadDocument({
        file,
        documentType: 'BIRTH_CERTIFICATE',
        applicationId: 123,
        description: 'Certificado de nacimiento del estudiante'
      });
      
      setUploadProgress(`✅ Uploaded! External ID: ${documentMetadata.externalId}`);
      setDocuments(prev => [...prev, documentMetadata.externalId]);
      
      console.log('📄 Document uploaded:', documentMetadata);
    } catch (error: any) {
      setUploadProgress(`❌ Upload failed: ${error.message}`);
      console.error('❌ Document upload error:', error);
    }
  };

  const validateDocument = async (externalId: string) => {
    try {
      const validation = await documentGatewayService.validateDocument(
        externalId,
        'BIRTH_CERTIFICATE',
        true // strict validation
      );
      
      console.log('🔍 Document validation:', validation);
      alert(`Validation: ${validation.isValid ? 'VALID' : 'INVALID'}\n${validation.validationMessage || ''}`);
    } catch (error: any) {
      console.error('❌ Validation error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">📄 Document Management (Hybrid Pattern)</h2>
      
      <div className="space-y-2">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        <p className="text-sm text-gray-600">{uploadProgress}</p>
      </div>
      
      {documents.length > 0 && (
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Uploaded Documents:</h3>
          {documents.map(externalId => (
            <div key={externalId} className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-mono">{externalId}</span>
              <button
                onClick={() => validateDocument(externalId)}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                Validate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example 4: Evaluation Management (Teachers/Psychologists)
const EvaluationManagementExample: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationAssignment[]>([]);
  const [workload, setWorkload] = useState<any>(null);

  const loadEvaluations = async () => {
    try {
      // GET /api/evaluations?status=ASSIGNED
      const assignments = await evaluationWorkflowService.getAssignedEvaluations({
        status: 'ASSIGNED',
        includeStudentInfo: true
      });
      
      setEvaluations(assignments);
      console.log('📋 Assigned evaluations:', assignments);
    } catch (error: any) {
      console.error('❌ Error loading evaluations:', error);
    }
  };

  const loadWorkload = async () => {
    try {
      const currentWorkload = await evaluationWorkflowService.getEvaluatorWorkload();
      setWorkload(currentWorkload);
      console.log('📊 Evaluator workload:', currentWorkload);
    } catch (error: any) {
      console.error('❌ Error loading workload:', error);
    }
  };

  const startEvaluation = async (evaluationId: number) => {
    try {
      // POST /api/evaluations/{id}/start
      const started = await evaluationWorkflowService.startEvaluation(evaluationId, {
        startNotes: 'Iniciando evaluación académica',
        sessionType: 'IN_PERSON'
      });
      
      console.log('▶️ Evaluation started:', started);
      await loadEvaluations(); // Refresh list
    } catch (error: any) {
      console.error('❌ Error starting evaluation:', error);
    }
  };

  const completeEvaluation = async (evaluationId: number) => {
    try {
      // POST /api/evaluations/{id}/complete
      const completed = await evaluationWorkflowService.completeEvaluation(evaluationId, {
        finalScore: 85,
        maxScore: 100,
        finalRecommendations: 'Estudiante con buen potencial académico',
        evaluationSummary: 'Evaluación completada satisfactoriamente'
      });
      
      console.log('✅ Evaluation completed:', completed);
      console.log('📝 Next steps:', completed.nextSteps);
      await loadEvaluations(); // Refresh list
    } catch (error: any) {
      console.error('❌ Error completing evaluation:', error);
    }
  };

  useEffect(() => {
    loadEvaluations();
    loadWorkload();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">🎯 Evaluation Management</h2>
      
      {workload && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">📊 Current Workload</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>Pending: {workload.assignedEvaluations.pending}</div>
            <div>In Progress: {workload.assignedEvaluations.inProgress}</div>
            <div>Completed: {workload.assignedEvaluations.completed}</div>
            <div>Load: {workload.availability.loadPercentage}%</div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {evaluations.map(evaluation => (
          <div key={evaluation.evaluationId} className="border rounded p-3">
            <div className="flex justify-between items-start">
              <div>
                <strong>{evaluation.studentInfo.firstName} {evaluation.studentInfo.lastName}</strong>
                <span className="ml-2 text-sm text-gray-600">
                  ({evaluation.evaluationType} - {evaluation.subject})
                </span>
                <p className="text-sm text-gray-500">
                  Grade: {evaluation.studentInfo.gradeApplying} | Age: {evaluation.studentInfo.age}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => startEvaluation(evaluation.evaluationId)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Start
                </button>
                <button
                  onClick={() => completeEvaluation(evaluation.evaluationId)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 5: Interview Scheduling (Cycle Directors)
const InterviewManagementExample: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [scheduling, setScheduling] = useState<string>('Ready to schedule');

  const scheduleInterview = async () => {
    try {
      setScheduling('Scheduling interview...');
      
      const request: InterviewSchedulingRequest = {
        applicationId: 123,
        interviewerId: 1,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        duration: 60,
        location: 'Sala de Entrevistas - Campus Principal',
        type: 'FAMILY',
        interviewMode: 'IN_PERSON',
        participants: [
          { role: 'STUDENT', name: 'Joaquín González', email: 'padre@example.com', required: true },
          { role: 'FATHER', name: 'Carlos González', email: 'padre@example.com', required: true },
          { role: 'MOTHER', name: 'María López', email: 'madre@example.com', required: true }
        ],
        notes: 'Primera entrevista familiar'
      };
      
      // POST /api/interviews
      const scheduled = await interviewWorkflowService.scheduleInterview(request);
      
      setScheduling(`✅ Scheduled! Code: ${scheduled.confirmationCode}`);
      console.log('📅 Interview scheduled:', scheduled);
      console.log('📧 Invitations sent to:', scheduled.invitationsSent);
    } catch (error: any) {
      setScheduling(`❌ Scheduling failed: ${error.message}`);
      console.error('❌ Interview scheduling error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">🤝 Interview Management</h2>
      
      <div className="space-y-2">
        <button
          onClick={scheduleInterview}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Schedule Interview
        </button>
        
        <p className="text-sm text-gray-600">{scheduling}</p>
      </div>
    </div>
  );
};

// Example 6: Notification Templates (Admin)
const NotificationTemplateExample: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // GET /api/notifications/admin/templates
      const response = await notificationTemplateService.getTemplates({
        category: 'INTERVIEW',
        isActive: true
      });
      
      setTemplates(response.templates);
      console.log('📧 Notification templates:', response);
    } catch (error: any) {
      console.error('❌ Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const previewTemplate = async (templateId: string) => {
    try {
      const preview = await notificationTemplateService.previewTemplate(templateId, {
        'student.firstName': 'Joaquín',
        'user.firstName': 'María',
        'interview.date': '25 de Febrero, 2025',
        'interview.time': '10:00 AM'
      });
      
      console.log('👀 Template preview:', preview);
      alert(`Subject: ${preview.previewSubject}\n\nContent: ${preview.previewText.substring(0, 200)}...`);
    } catch (error: any) {
      console.error('❌ Error previewing template:', error);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">📨 Notification Templates (Admin)</h2>
      
      {loading ? (
        <p>Loading templates...</p>
      ) : (
        <div className="space-y-2">
          {templates.map(template => (
            <div key={template.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <strong>{template.name}</strong>
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {template.category}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  <p className="text-xs text-gray-400">Used {template.usage.timesUsed} times</p>
                </div>
                <button
                  onClick={() => previewTemplate(template.id)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main demonstration component
export const GatewayServiceIntegrationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: '👤 Profile', component: ProfileManagementExample },
    { id: 'application', label: '📝 Applications', component: ApplicationWorkflowExample },
    { id: 'documents', label: '📄 Documents', component: DocumentManagementExample },
    { id: 'evaluations', label: '🎯 Evaluations', component: EvaluationManagementExample },
    { id: 'interviews', label: '🤝 Interviews', component: InterviewManagementExample },
    { id: 'templates', label: '📨 Templates', component: NotificationTemplateExample }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileManagementExample;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🌐 Gateway Service Integration Demo</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Active Component */}
      <div className="mt-6">
        <ActiveComponent />
      </div>
      
      {/* Integration Summary */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-4">🎯 Gateway Integration Summary</h3>
        <div className="grid grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">✅ Implemented Endpoints:</h4>
            <ul className="space-y-1">
              <li>• <code>/api/users/me</code> - Profile with roles in token</li>
              <li>• <code>POST /api/applications</code> - Create draft</li>
              <li>• <code>POST /api/applications/{'{id}'}/submit</code> - Submit application</li>
              <li>• <code>GET /api/applications/{'{id}'}}</code> - Get status + history</li>
              <li>• <code>POST /api/applications/{'{id}'}/documents</code> - Add metadata</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🔄 Workflow Features:</h4>
            <ul className="space-y-1">
              <li>• Document hybrid pattern (monolith → gateway)</li>
              <li>• Evaluation lifecycle (start → scores → complete)</li>
              <li>• Interview scheduling with confirmations</li>
              <li>• Notification template management</li>
              <li>• Feature flags handled by gateway</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayServiceIntegrationDemo;