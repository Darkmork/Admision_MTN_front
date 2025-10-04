/**
 * Typed API Usage Example
 * Demonstrates the new OpenAPI-generated types and clients
 */

import React, { useState, useEffect } from 'react';
import { 
  apiClient,
  usersClient,
  applicationsClient,
  evaluationsClient,
  type User,
  type Application,
  type Evaluation,
  type UserSearchParams,
  type ApplicationSearchParams
} from '../src/api';

// Example 1: Using individual service clients
const UserManagementExample: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchUsers = async (params: UserSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fully typed API call
      const response = await usersClient.getUsers(params);
      setUsers(response.content);
      
      console.log('✅ Users loaded:', response.totalElements, 'total');
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    rut: string;
    role: User['role'];
  }) => {
    try {
      // Type-safe user creation
      const newUser = await usersClient.createUser({
        ...userData,
        password: 'generated-password' // Optional, auto-generated
      });
      
      console.log('✅ User created:', newUser.id);
      
      // Refresh list
      await handleSearchUsers({});
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">👥 User Management (Typed)</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={() => handleSearchUsers({ role: 'TEACHER' })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load Teachers
        </button>
        
        <button
          onClick={() => handleSearchUsers({ active: true })}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Load Active Users
        </button>
        
        <button
          onClick={() => handleCreateUser({
            firstName: 'Test',
            lastName: 'Teacher',
            email: `teacher${Date.now()}@mtn.cl`,
            rut: '12345678-9',
            role: 'TEACHER'
          })}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Create Test Teacher
        </button>
      </div>
      
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="p-3 border rounded">
              <strong>{user.firstName} {user.lastName}</strong>
              <span className="ml-2 text-sm text-gray-600">({user.role})</span>
              <br />
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example 2: Using unified API client
const ApplicationManagementExample: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<any>(null);

  const loadApplications = async (status?: Application['status']) => {
    try {
      // Using the unified client with full typing
      const searchParams: ApplicationSearchParams = {
        status,
        page: 0,
        size: 10,
        sort: 'submissionDate',
        direction: 'desc'
      };
      
      const response = await apiClient.applications.getApplications(searchParams);
      setApplications(response.content);
      
      console.log('✅ Applications loaded:', response.totalElements);
    } catch (err: any) {
      console.error('❌ Error loading applications:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get comprehensive system statistics
      const systemStats = await apiClient.getSystemStatistics();
      setStats(systemStats);
      
      console.log('📊 System statistics loaded:', systemStats);
    } catch (err: any) {
      console.error('❌ Error loading statistics:', err);
    }
  };

  useEffect(() => {
    loadApplications();
    loadStatistics();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">📋 Application Management (Unified Client)</h2>
      
      <div className="flex gap-2">
        <button
          onClick={() => loadApplications('PENDING')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Pending Applications
        </button>
        
        <button
          onClick={() => loadApplications('APPROVED')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Approved Applications
        </button>
        
        <button
          onClick={() => loadApplications()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          All Applications
        </button>
      </div>
      
      {stats && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">📊 System Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Users:</strong> {stats.users?.totalUsers || 'N/A'}
            </div>
            <div>
              <strong>Applications:</strong> {stats.applications?.totalApplications || 'N/A'}
            </div>
            <div>
              <strong>Evaluations:</strong> {stats.evaluations?.totalEvaluations || 'N/A'}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {applications.map(app => (
          <div key={app.id} className="p-3 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <strong>Application #{app.id}</strong>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {app.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(app.submissionDate).toLocaleDateString()}
              </span>
            </div>
            {app.student && (
              <p className="text-sm mt-1">
                Student: {app.student.firstName} {app.student.lastName} - {app.student.gradeApplying}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 3: Using evaluations with type safety
const EvaluationManagementExample: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluatorId] = useState<number>(1); // Mock evaluator ID

  const loadEvaluatorEvaluations = async () => {
    try {
      // Get pending evaluations for current evaluator with full typing
      const pending = await evaluationsClient.getPendingEvaluations(selectedEvaluatorId);
      const completed = await evaluationsClient.getCompletedEvaluations(selectedEvaluatorId);
      
      setEvaluations([...pending, ...completed]);
      
      console.log(`✅ Loaded ${pending.length} pending and ${completed.length} completed evaluations`);
    } catch (err: any) {
      console.error('❌ Error loading evaluations:', err);
    }
  };

  const completeEvaluation = async (evaluationId: number) => {
    try {
      // Complete evaluation with type-safe data
      await evaluationsClient.completeEvaluation(evaluationId, {
        score: 85,
        maxScore: 100,
        comments: 'Excellent performance',
        recommendations: 'Recommend for admission'
      });
      
      console.log('✅ Evaluation completed');
      
      // Refresh list
      await loadEvaluatorEvaluations();
    } catch (err: any) {
      console.error('❌ Error completing evaluation:', err);
    }
  };

  useEffect(() => {
    loadEvaluatorEvaluations();
  }, [selectedEvaluatorId]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">📝 Evaluation Management (Type-Safe)</h2>
      
      <div className="space-y-2">
        {evaluations.map(eval => (
          <div key={eval.id} className="p-3 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <strong>{eval.type} Evaluation</strong>
                {eval.subject && <span className="ml-2 text-sm text-gray-600">({eval.subject})</span>}
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  eval.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  eval.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  eval.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {eval.status}
                </span>
              </div>
              {eval.status === 'PENDING' && (
                <button
                  onClick={() => completeEvaluation(eval.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Complete
                </button>
              )}
            </div>
            {eval.score !== null && eval.score !== undefined && (
              <p className="text-sm mt-1">
                Score: {eval.score}/{eval.maxScore} ({Math.round((eval.score / (eval.maxScore || 100)) * 100)}%)
              </p>
            )}
            {eval.comments && (
              <p className="text-sm text-gray-600 mt-1">{eval.comments}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main demonstration component
export const TypedApiUsageDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔧 Typed API Usage Examples</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', label: '👥 Users' },
              { id: 'applications', label: '📋 Applications' },
              { id: 'evaluations', label: '📝 Evaluations' }
            ].map(tab => (
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
      
      <div className="mt-6">
        {activeTab === 'users' && <UserManagementExample />}
        {activeTab === 'applications' && <ApplicationManagementExample />}
        {activeTab === 'evaluations' && <EvaluationManagementExample />}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 Type Safety Benefits</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Full TypeScript intellisense and autocomplete</li>
          <li>✅ Compile-time error detection</li>
          <li>✅ Consistent API response handling</li>
          <li>✅ Automatic Bearer token and correlation ID injection</li>
          <li>✅ Exponential backoff retry logic</li>
          <li>✅ Centralized error mapping and handling</li>
        </ul>
      </div>
    </div>
  );
};

export default TypedApiUsageDemo;