/**
 * Gateway Integration Test Script
 * Tests the new gateway services integration with real API calls
 */

// Simple fetch test to verify backend connectivity
const testBackendConnection = async () => {
    console.log('🔌 Testing backend connection...');
    
    try {
        const response = await fetch('http://localhost:8080/actuator/health');
        const data = await response.json();
        
        if (data.status === 'UP') {
            console.log('✅ Backend is healthy and running');
            return true;
        } else {
            console.log('❌ Backend health check failed:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return false;
    }
};

// Test authentication flow
const testAuthentication = async () => {
    console.log('🔐 Testing authentication...');
    
    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'gateway.test@mtn.cl',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
            console.log('✅ Authentication successful');
            console.log('  📧 Email:', data.email);
            console.log('  👤 Name:', data.firstName, data.lastName);
            console.log('  🔑 Role:', data.role);
            console.log('  🎟️ Token:', data.token.substring(0, 20) + '...');
            return data.token;
        } else {
            console.log('❌ Authentication failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Authentication error:', error);
        return null;
    }
};

// Test public API endpoints (no auth required)
const testPublicEndpoints = async () => {
    console.log('🌐 Testing public endpoints...');
    
    try {
        const response = await fetch('http://localhost:8080/api/applications/public/all');
        const applications = await response.json();
        
        console.log(`✅ Found ${applications.length} applications in database`);
        if (applications.length > 0) {
            console.log('  📄 Sample application:', {
                id: applications[0].id,
                student: applications[0].student.fullName,
                status: applications[0].status
            });
        }
        return applications;
    } catch (error) {
        console.error('❌ Public endpoint test failed:', error);
        return [];
    }
};

// Test protected endpoint (requires auth)
const testProtectedEndpoint = async (token) => {
    if (!token) {
        console.log('⏭️ Skipping protected endpoint test (no token)');
        return;
    }
    
    console.log('🔒 Testing protected endpoints...');
    
    try {
        // Try to access applications with authentication
        const response = await fetch('http://localhost:8080/api/applications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Correlation-Id': crypto.randomUUID(),
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Protected endpoint accessible with JWT');
            console.log(`  📊 Data returned:`, data.length ? `${data.length} records` : 'Empty response');
        } else {
            console.log('❌ Protected endpoint failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Protected endpoint error:', error);
    }
};

// Main test runner
const runIntegrationTests = async () => {
    console.log('🚀 Starting Gateway Integration Tests');
    console.log('=====================================');
    
    // Test 1: Backend Connection
    const backendUp = await testBackendConnection();
    if (!backendUp) {
        console.log('❌ Cannot proceed without backend connection');
        return;
    }
    
    console.log('');
    
    // Test 2: Authentication
    const token = await testAuthentication();
    
    console.log('');
    
    // Test 3: Public Endpoints
    const applications = await testPublicEndpoints();
    
    console.log('');
    
    // Test 4: Protected Endpoints
    await testProtectedEndpoint(token);
    
    console.log('');
    console.log('✅ Gateway Integration Tests Complete');
    console.log('=====================================');
    
    // Return test results
    return {
        backendHealthy: backendUp,
        authenticationWorking: !!token,
        publicEndpointsWorking: applications.length > 0,
        token: token
    };
};

// Export for browser testing
if (typeof window !== 'undefined') {
    window.testGatewayIntegration = runIntegrationTests;
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runIntegrationTests };
    
    // Auto-run tests in Node.js
    if (require.main === module) {
        runIntegrationTests();
    }
} else {
    // Self-executing for browser console
    console.log('🧪 Gateway Integration Test Script Loaded');
    console.log('Run: testGatewayIntegration() to execute tests');
}