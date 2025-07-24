import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
    // Verificar si hay un profesor logueado con permisos de admin
    const currentProfessor = localStorage.getItem('currentProfessor');
    
    if (!currentProfessor) {
        // Redirigir al login si no hay profesor autenticado
        return <Navigate to="/profesor/login" replace />;
    }

    try {
        // Verificar que los datos del profesor sean válidos y tenga permisos de admin
        const professorData = JSON.parse(currentProfessor);
        
        if (!professorData.id || !professorData.email) {
            localStorage.removeItem('currentProfessor');
            return <Navigate to="/profesor/login" replace />;
        }

        // Verificar que sea Jorge Gangale (el único admin)
        if (professorData.email !== 'jorge.gangale@mtn.cl' || !professorData.isAdmin) {
            return <Navigate to="/profesor" replace />;
        }

    } catch (error) {
        // Datos corruptos, limpiar y redirigir
        localStorage.removeItem('currentProfessor');
        return <Navigate to="/profesor/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;