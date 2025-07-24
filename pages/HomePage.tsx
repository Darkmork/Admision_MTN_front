import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { FileTextIcon, UsersIcon, CheckCircleIcon, ClockIcon } from '../components/icons/Icons';

const HomePage: React.FC = () => {
    const admissionSteps = [
        { title: 'Registro y Postulación', description: 'Complete el formulario en línea con los datos del postulante y la familia.', icon: <FileTextIcon className="w-12 h-12 text-dorado-nazaret" /> },
        { title: 'Entrevistas Familiares', description: 'Agende y asista a una entrevista con nuestro equipo de admisiones.', icon: <UsersIcon className="w-12 h-12 text-dorado-nazaret" /> },
        { title: 'Publicación de Resultados', description: 'Consulte los resultados del proceso de admisión en las fechas publicadas.', icon: <CheckCircleIcon className="w-12 h-12 text-dorado-nazaret" /> },
    ];

    const admissionTimeline = [
        { date: '1 de Agosto', event: 'Inicio del Proceso de Postulación', current: true },
        { date: '30 de Septiembre', event: 'Cierre de Postulaciones', current: false },
        { date: '1 al 15 de Octubre', event: 'Periodo de Entrevistas', current: false },
        { date: '1 de Noviembre', event: 'Publicación de Resultados', current: false },
    ];

    return (
        <div className="bg-blanco-pureza">
            {/* Hero Section */}
            <section className="relative text-blanco-pureza py-32 text-center bg-cover bg-center" style={{ backgroundImage: `url('/images/colegio.png')`}}>
                {/* Overlay azul con opacidad 85% */}
                <div className="absolute inset-0 bg-azul-monte-tabor" style={{ opacity: 0.85 }}></div>
                <div className="relative container mx-auto px-6">
                    <h1 className="text-5xl md:text-6xl font-black font-serif mb-4 animate-fade-in-down">Formando Líderes con Espíritu de Servicio</h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">Únase a una comunidad educativa comprometida con la excelencia académica y la formación católica.</p>
                    <Link to="/postulacion">
                        <Button size="lg" variant="primary">
                            Postula Aquí
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-azul-monte-tabor mb-4 font-serif">Proceso de Admisión</h2>
                    <p className="text-gris-piedra mb-12 max-w-2xl mx-auto">Un camino claro y guiado para formar parte de nuestra comunidad educativa.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {admissionSteps.map((step, index) => (
                            <Card key={index} className="text-center p-8">
                                <div className="flex justify-center mb-6">{step.icon}</div>
                                <h3 className="text-xl font-bold text-azul-monte-tabor mb-2">{step.title}</h3>
                                <p className="text-gris-piedra">{step.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Exam Portal Section */}
            <section className="py-20 bg-azul-monte-tabor text-blanco-pureza">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4 font-serif">Portal de Exámenes de Admisión</h2>
                    <p className="text-gray-200 mb-8 max-w-3xl mx-auto text-lg">
                        Una vez completada tu postulación, podrás acceder al portal de exámenes para programar 
                        y rendir las evaluaciones de Matemática, Lenguaje e Inglés.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blanco-pureza bg-opacity-10 p-6 rounded-lg">
                            <div className="text-4xl mb-3">🧮</div>
                            <h3 className="font-bold text-dorado-nazaret mb-2">Matemática</h3>
                            <p className="text-gray-200 text-sm">Evaluación adaptada según tu nivel educativo</p>
                        </div>
                        <div className="bg-blanco-pureza bg-opacity-10 p-6 rounded-lg">
                            <div className="text-4xl mb-3">📚</div>
                            <h3 className="font-bold text-dorado-nazaret mb-2">Lenguaje</h3>
                            <p className="text-gray-200 text-sm">Comprensión lectora y expresión escrita</p>
                        </div>
                        <div className="bg-blanco-pureza bg-opacity-10 p-6 rounded-lg">
                            <div className="text-4xl mb-3">🇺🇸</div>
                            <h3 className="font-bold text-dorado-nazaret mb-2">Inglés</h3>
                            <p className="text-gray-200 text-sm">Gramática, vocabulario y comprensión</p>
                        </div>
                    </div>
                    <Link to="/examenes">
                        <Button size="lg" variant="secondary">
                            Conocer Portal de Exámenes
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-azul-monte-tabor text-center mb-12 font-serif">Calendario de Admisión 2025</h2>
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute left-1/2 h-full w-1 bg-azul-monte-tabor rounded-full transform -translate-x-1/2"></div>
                        {admissionTimeline.map((item, index) => (
                            <div key={index} className={`flex items-center w-full mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                                    <p className="font-bold text-dorado-nazaret">{item.date}</p>
                                    <p className="text-gris-piedra">{item.event}</p>
                                </div>
                                <div className="relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${item.current ? 'bg-dorado-nazaret ring-8 ring-amber-200' : 'bg-azul-monte-tabor'}`}>
                                        <ClockIcon className="w-5 h-5 text-blanco-pureza" />
                                    </div>
                                </div>
                                <div className="w-5/12"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
