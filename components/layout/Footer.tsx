import React, { useState } from 'react';

// SVG modernos y oficiales
const FacebookIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692V11.01h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.696h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
    </svg>
);

const InstagramIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.635.401 3.678 1.358 2.721 2.315 2.448 3.451 2.39 4.732 2.332 6.012 2.32 6.421 2.32 12c0 5.579.012 5.988.07 7.268.058 1.281.331 2.417 1.288 3.374.957.957 2.093 1.23 3.374 1.288C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.417-.331 3.374-1.288.957-.957 1.23-2.093 1.288-3.374.058-1.28.07-1.689.07-7.268 0-5.579-.012-5.988-.07-7.268-.058-1.281-.331-2.417-1.288-3.374C19.365.401 18.229.128 16.948.07 15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.25 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" />
    </svg>
);

const Footer: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState("");

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !correo || !mensaje) {
            setError("Todos los campos son obligatorios.");
            return;
        }
        setError("");
        // Simular envío (mailto)
        window.location.href = `mailto:admision@mtn.cl?subject=Contacto%20desde%20web%20MTN&body=Nombre:%20${encodeURIComponent(nombre)}%0ACorreo:%20${encodeURIComponent(correo)}%0AMensaje:%20${encodeURIComponent(mensaje)}`;
        setEnviado(true);
    };

    return (
        <footer className="bg-azul-monte-tabor text-blanco-pureza mt-16">
            <div className="container mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between gap-10">
                    {/* Columna 1: Datos del Colegio */}
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold text-dorado-nazaret mb-4 font-serif">Colegio Monte Tabor y Nazaret</h3>
                        <address className="not-italic text-sm text-gray-300 space-y-1">
                            <p>Avda. Paseo Pie Andino 5894</p>
                            <p>Lo Barnechea</p>
                            <p>Tel: (56-2) 2 7500 900</p>
                            <p>admision@mtn.cl</p>
                        </address>
                    </div>
                    {/* Columna 2: Enlaces y Redes Sociales */}
                    <div className="flex-[1.5] flex flex-col sm:flex-row gap-8">
                        {/* Sub-Col 2a: Enlaces */}
                        <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-dorado-nazaret mb-4 font-serif">Enlaces Rápidos</h3>
                        <ul className="space-y-2">
                                <li><a href="#" className="hover:underline text-sm text-gray-300">Nuestro Proyecto Educativo</a></li>
                                <li><a href="#" className="hover:underline text-sm text-gray-300">Admisión 2025</a></li>
                                <li><button onClick={() => setShowModal(true)} className="hover:underline text-sm text-gray-300 bg-transparent border-none p-0 m-0 cursor-pointer">Contacto</button></li>
                        </ul>
                    </div>
                        {/* Sub-Col 2b: Redes */}
                        <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-dorado-nazaret mb-4 font-serif">Síguenos</h3>
                            <div className="flex justify-center sm:justify-start space-x-6 mt-2">
                               <a href="#" aria-label="Facebook" className="text-gray-300 hover:text-dorado-nazaret transition-colors">
                                   <FacebookIcon />
                               </a>
                               <a href="#" aria-label="Instagram" className="text-gray-300 hover:text-dorado-nazaret transition-colors">
                                   <InstagramIcon />
                               </a>
                               <a href="#" aria-label="LinkedIn" className="text-gray-300 hover:text-dorado-nazaret transition-colors">
                                   <LinkedInIcon />
                               </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-blue-800 mt-10 pt-6 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Colegio Monte Tabor y Nazaret. Todos los derechos reservados.</p>
                </div>
            </div>
            {/* Modal de contacto */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-rojo-sagrado text-2xl" onClick={() => { setShowModal(false); setEnviado(false); setNombre(""); setCorreo(""); setMensaje(""); setError(""); }}>&times;</button>
                        {!enviado ? (
                            <form onSubmit={handleSend} className="space-y-4">
                                <h2 className="text-2xl font-bold text-azul-monte-tabor mb-2">Contacto</h2>
                                <input type="text" className="w-full border rounded p-2" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                                <input type="email" className="w-full border rounded p-2" placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required />
                                <textarea className="w-full border rounded p-2" placeholder="Mensaje" rows={4} value={mensaje} onChange={e => setMensaje(e.target.value)} required />
                                {error && <p className="text-rojo-sagrado text-sm">{error}</p>}
                                <button type="submit" className="w-full bg-dorado-nazaret text-azul-monte-tabor font-bold py-2 rounded hover:bg-amber-400 transition">Enviar</button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <h2 className="text-2xl font-bold text-azul-monte-tabor mb-2">¡Mensaje preparado!</h2>
                                <p className="text-gris-piedra mb-4">Se abrirá tu cliente de correo para enviar el mensaje a <b>admision@mtn.cl</b>.</p>
                                <button className="mt-4 bg-dorado-nazaret text-azul-monte-tabor font-bold py-2 px-6 rounded hover:bg-amber-400 transition" onClick={() => { setShowModal(false); setEnviado(false); setNombre(""); setCorreo(""); setMensaje(""); setError(""); }}>Cerrar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;