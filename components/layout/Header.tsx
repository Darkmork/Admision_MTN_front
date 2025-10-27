
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const navLinkClasses = "text-gris-piedra hover:text-azul-monte-tabor font-semibold transition-colors duration-200";
    const activeLinkClasses = "text-azul-monte-tabor";
    const [isAdmin, setIsAdmin] = useState(false);
    const [isProfessorLoggedIn, setIsProfessorLoggedIn] = useState(false);
    const [isAnyUserLoggedIn, setIsAnyUserLoggedIn] = useState(false);

    // Verificar si el usuario actual es admin, profesor o cualquier usuario autenticado
    useEffect(() => {
        const checkAuthStatus = () => {
            // Verificar múltiples fuentes de autenticación
            const currentProfessor = localStorage.getItem('currentProfessor');
            const authToken = localStorage.getItem('auth_token');
            const professorToken = localStorage.getItem('professor_token');
            const apoderadoToken = localStorage.getItem('apoderado_token');

            // Verificar si hay profesor autenticado
            const hasProfessorAuth = !!(professorToken && currentProfessor);
            setIsProfessorLoggedIn(hasProfessorAuth);

            // Verificar si hay CUALQUIER usuario autenticado
            const hasAnyAuth = !!(authToken || professorToken || apoderadoToken);
            setIsAnyUserLoggedIn(hasAnyAuth);

            // Solo mostrar admin si hay un token válido Y datos de profesor admin
            if ((authToken || professorToken) && currentProfessor) {
                try {
                    const professorData = JSON.parse(currentProfessor);
                    setIsAdmin(professorData.isAdmin === true);
                } catch (error) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAuthStatus();

        // Escuchar cambios en localStorage
        const handleStorageChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);

        // También verificar cuando cambie el contenido actual
        const interval = setInterval(checkAuthStatus, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Función para hacer logout completo
    const handleLogoutAndGoHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Solo hacer logout si hay un usuario autenticado
        if (isAnyUserLoggedIn) {
            e.preventDefault(); // Prevenir navegación predeterminada

            // Limpiar TODOS los tokens y datos de autenticación
            localStorage.removeItem('auth_token');
            localStorage.removeItem('professor_token');
            localStorage.removeItem('apoderado_token');
            localStorage.removeItem('currentProfessor');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentApoderado');

            // Actualizar estados locales
            setIsAdmin(false);
            setIsProfessorLoggedIn(false);
            setIsAnyUserLoggedIn(false);

            // Navegar a la página de inicio
            navigate('/');

            // Forzar recarga para limpiar cualquier estado en memoria
            window.location.reload();
        }
        // Si no hay usuario autenticado, dejar que el link funcione normalmente
    };

    return (
        <header className="bg-blanco-pureza shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" onClick={handleLogoutAndGoHome} className="flex items-center gap-3">
                    <img src="/images/logoMTN.png" alt="Logo Colegio Monte Tabor y Nazaret" className="h-12" />
                    <span className="text-xl font-bold text-azul-monte-tabor font-serif">
                        Colegio Monte Tabor y Nazaret
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    <NavLink
                        to="/"
                        onClick={handleLogoutAndGoHome}
                        className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}
                    >
                        Inicio
                    </NavLink>
                    <NavLink to="/examenes" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}>Exámenes</NavLink>
                    <NavLink to="/apoderado/login" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}>Portal Familia</NavLink>
                    {/* Ocultar "Profesores" si hay un profesor autenticado (para evitar que salga de su sesión) */}
                    {!isProfessorLoggedIn && (
                        <NavLink to="/profesor/login" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}>Profesores</NavLink>
                    )}
                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) => isActive ?
                                `${navLinkClasses} ${activeLinkClasses} bg-dorado-nazaret/10 px-3 py-1 rounded-lg border border-dorado-nazaret/20` :
                                `${navLinkClasses} hover:bg-dorado-nazaret/10 px-3 py-1 rounded-lg transition-all duration-200`
                            }
                        >
                            ⚙️ Admin
                        </NavLink>
                    )}
                </nav>
                <div className="flex items-center gap-4">
                     {/* Ocultar "Iniciar Postulación" si hay CUALQUIER usuario autenticado */}
                     {!isAnyUserLoggedIn && (
                        <Link to="/postulacion">
                            <Button variant="primary">
                                Iniciar Postulación
                            </Button>
                        </Link>
                     )}
                </div>
            </div>
        </header>
    );
};

export default Header;