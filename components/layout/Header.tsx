
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Button from '../ui/Button';

const Header: React.FC = () => {
    const navLinkClasses = "text-gris-piedra hover:text-azul-monte-tabor font-semibold transition-colors duration-200";
    const activeLinkClasses = "text-azul-monte-tabor";

    return (
        <header className="bg-blanco-pureza shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/images/Logo_Comunicaciones.jpg" alt="Logo Colegio Monte Tabor y Nazaret" className="h-12" />
                    <span className="text-xl font-bold text-azul-monte-tabor font-serif">
                        Colegio Monte Tabor y Nazaret
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    <NavLink to="/" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}>Inicio</NavLink>
                    <NavLink to="/examenes" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}>Exámenes</NavLink>
                    <NavLink to="/familia/login" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}>Portal Familia</NavLink>
                    <NavLink to="/profesor/login" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}`: navLinkClasses}>Profesores</NavLink>
                </nav>
                <div className="flex items-center gap-4">
                     <Link to="/postulacion">
                        <Button variant="primary">
                            Iniciar Postulación
                        </Button>
                     </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;