import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UsersIcon, CalendarIcon, ClockIcon } from '../components/icons/Icons';

const InterviewModule: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-azul-monte-tabor">
                            Módulo de Entrevistas
                        </h1>
                        <Link to="/">
                            <Button variant="outline">Volver al Inicio</Button>
                        </Link>
                    </div>
                    <p className="text-gris-piedra">
                        Programa y gestiona las entrevistas familiares del proceso de admisión
                    </p>
                </div>

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-6 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6" />
                        Próximamente
                    </h2>
                    <p className="text-gris-piedra">
                        Esta funcionalidad estará disponible próximamente. 
                        Aquí podrás programar y gestionar las entrevistas familiares.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default InterviewModule;