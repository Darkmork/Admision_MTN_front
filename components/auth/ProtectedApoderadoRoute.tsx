import React from 'react';
import { Logger } from '../src/utils/logger';import { Navigate } from 'react-router-dom';
import { Logger } from '../src/utils/logger';import { useAuth } from '../../context/AuthContext';
import { Logger } from '../src/utils/logger';
interface ProtectedApoderadoRouteProps {
    children: React.ReactNode;
}

const ProtectedApoderadoRoute: React.FC<ProtectedApoderadoRouteProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    Logger.info('🛡️ ProtectedApoderadoRoute: Check access -', { isAuthenticated, user: user ? { role: user.role, email: user.email } : null });

    if (!isAuthenticated || !user) {
        Logger.info('❌ ProtectedApoderadoRoute: Not authenticated, redirecting to login');
        return <Navigate to="/apoderado/login" replace />;
    }

    if (user.role !== 'APODERADO') {
        Logger.info('❌ ProtectedApoderadoRoute: Wrong role', user.role, '!== APODERADO, redirecting');
        return <Navigate to="/apoderado/login" replace />;
    }

    Logger.info('✅ ProtectedApoderadoRoute: Access granted');
    return <>{children}</>;
};

export default ProtectedApoderadoRoute;