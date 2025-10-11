import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { FiEdit2, FiEye, FiSave, FiX, FiMail, FiAlertCircle } from 'react-icons/fi';
import { useNotifications } from '../../context/AppContext';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: 'application' | 'interview' | 'evaluation' | 'decision' | 'general';
    variables: string[];
    description: string;
    lastModified: string;
}

const EmailTemplateManager: React.FC = () => {
    const { addNotification } = useNotifications();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [editedSubject, setEditedSubject] = useState('');
    const [editedBody, setEditedBody] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Cargar templates iniciales (mock data)
    useEffect(() => {
        const initialTemplates: EmailTemplate[] = [
            {
                id: 'welcome',
                name: 'Bienvenida - Postulación Recibida',
                subject: 'Bienvenido/a a Monte Tabor y Nazaret - Postulación Recibida',
                body: `Estimado/a {{nombre_apoderado}},

Nos complace confirmar que hemos recibido exitosamente la postulación de {{nombre_estudiante}} para {{curso_postulado}} en el año académico {{año_academico}}.

Número de postulación: {{numero_postulacion}}
Fecha de recepción: {{fecha_postulacion}}

Próximos pasos:
1. Revisión de documentación (3-5 días hábiles)
2. Evaluación académica (si corresponde)
3. Entrevista familiar (agendaremos contacto)

Puede revisar el estado de su postulación en: {{link_portal}}

Saludos cordiales,
Equipo de Admisión
Monte Tabor y Nazaret`,
                category: 'application',
                variables: ['nombre_apoderado', 'nombre_estudiante', 'curso_postulado', 'año_academico', 'numero_postulacion', 'fecha_postulacion', 'link_portal'],
                description: 'Confirmación automática al recibir una postulación',
                lastModified: new Date().toISOString()
            },
            {
                id: 'interview_scheduled',
                name: 'Entrevista Programada',
                subject: 'Entrevista Programada - {{nombre_estudiante}}',
                body: `Estimado/a {{nombre_apoderado}},

Nos complace informarle que hemos programado la entrevista para {{nombre_estudiante}}.

Detalles de la entrevista:
📅 Fecha: {{fecha_entrevista}}
🕐 Hora: {{hora_entrevista}}
📍 Lugar: {{lugar_entrevista}}
👤 Entrevistador/a: {{nombre_entrevistador}}

Por favor confirme su asistencia respondiendo a este correo.

En caso de necesitar reagendar, contáctenos con al menos 48 horas de anticipación.

Saludos cordiales,
Equipo de Admisión`,
                category: 'interview',
                variables: ['nombre_apoderado', 'nombre_estudiante', 'fecha_entrevista', 'hora_entrevista', 'lugar_entrevista', 'nombre_entrevistador'],
                description: 'Notificación de entrevista programada',
                lastModified: new Date().toISOString()
            },
            {
                id: 'evaluation_completed',
                name: 'Evaluación Completada',
                subject: 'Evaluación Completada - {{tipo_evaluacion}}',
                body: `Estimado/a {{nombre_apoderado}},

Le informamos que {{nombre_estudiante}} ha completado la {{tipo_evaluacion}}.

Fecha de evaluación: {{fecha_evaluacion}}
Evaluador/a: {{nombre_evaluador}}

Los resultados serán considerados en el proceso de admisión. Le notificaremos cuando tengamos la decisión final.

Puede revisar el estado actualizado en: {{link_portal}}

Saludos cordiales,
Equipo de Admisión`,
                category: 'evaluation',
                variables: ['nombre_apoderado', 'nombre_estudiante', 'tipo_evaluacion', 'fecha_evaluacion', 'nombre_evaluador', 'link_portal'],
                description: 'Confirmación de evaluación completada',
                lastModified: new Date().toISOString()
            },
            {
                id: 'decision_approved',
                name: 'Decisión - Aprobado',
                subject: '¡Felicitaciones! - Postulación Aprobada',
                body: `Estimado/a {{nombre_apoderado}},

¡Tenemos excelentes noticias! 🎉

Nos complace informarle que {{nombre_estudiante}} ha sido aceptado/a en {{curso_postulado}} para el año académico {{año_academico}}.

Próximos pasos para completar la matrícula:
1. Firmar contrato de matrícula (adjunto)
2. Pagar matrícula (plazo: {{plazo_pago}})
3. Entregar documentación final (lista adjunta)

Fecha límite para confirmar matrícula: {{fecha_limite}}

Portal de matrícula: {{link_matricula}}

¡Bienvenidos a la familia Monte Tabor y Nazaret!

Saludos cordiales,
Dirección de Admisión`,
                category: 'decision',
                variables: ['nombre_apoderado', 'nombre_estudiante', 'curso_postulado', 'año_academico', 'plazo_pago', 'fecha_limite', 'link_matricula'],
                description: 'Notificación de aprobación de postulación',
                lastModified: new Date().toISOString()
            },
            {
                id: 'decision_rejected',
                name: 'Decisión - No Aprobado',
                subject: 'Decisión de Postulación - {{nombre_estudiante}}',
                body: `Estimado/a {{nombre_apoderado}},

Agradecemos sinceramente su interés en Monte Tabor y Nazaret.

Después de una cuidadosa evaluación, lamentamos informarle que en esta ocasión no podemos ofrecer un cupo para {{nombre_estudiante}} en {{curso_postulado}}.

Esta decisión se debe a: {{motivo_rechazo}}

Le animamos a postular nuevamente en el próximo proceso de admisión. Valoramos su confianza en nuestra institución.

Quedamos a su disposición para cualquier consulta.

Saludos cordiales,
Dirección de Admisión`,
                category: 'decision',
                variables: ['nombre_apoderado', 'nombre_estudiante', 'curso_postulado', 'motivo_rechazo'],
                description: 'Notificación de rechazo de postulación',
                lastModified: new Date().toISOString()
            },
            {
                id: 'document_missing',
                name: 'Documentación Incompleta',
                subject: 'Documentación Pendiente - {{nombre_estudiante}}',
                body: `Estimado/a {{nombre_apoderado}},

Durante la revisión de la postulación de {{nombre_estudiante}}, hemos detectado que faltan los siguientes documentos:

{{lista_documentos_faltantes}}

Por favor, ingrese al portal y cargue los documentos pendientes a la brevedad: {{link_portal}}

Plazo máximo: {{fecha_limite_documentos}}

Si tiene alguna dificultad, no dude en contactarnos.

Saludos cordiales,
Equipo de Admisión`,
                category: 'application',
                variables: ['nombre_apoderado', 'nombre_estudiante', 'lista_documentos_faltantes', 'link_portal', 'fecha_limite_documentos'],
                description: 'Solicitud de documentos faltantes',
                lastModified: new Date().toISOString()
            }
        ];

        setTemplates(initialTemplates);
    }, []);

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setEditedSubject(template.subject);
        setEditedBody(template.body);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!selectedTemplate) return;

        const updatedTemplates = templates.map(t =>
            t.id === selectedTemplate.id
                ? {
                    ...t,
                    subject: editedSubject,
                    body: editedBody,
                    lastModified: new Date().toISOString()
                }
                : t
        );

        setTemplates(updatedTemplates);
        setIsEditing(false);
        setSelectedTemplate(null);

        addNotification({
            type: 'success',
            title: 'Template actualizado',
            message: `El template "${selectedTemplate.name}" ha sido actualizado exitosamente`
        });
    };

    const handlePreview = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setIsPreviewOpen(true);
    };

    const getCategoryBadge = (category: string) => {
        const categoryConfig: Record<string, { label: string; variant: 'blue' | 'green' | 'yellow' | 'purple' | 'gray' }> = {
            application: { label: 'Postulación', variant: 'blue' },
            interview: { label: 'Entrevista', variant: 'green' },
            evaluation: { label: 'Evaluación', variant: 'yellow' },
            decision: { label: 'Decisión', variant: 'purple' },
            general: { label: 'General', variant: 'gray' }
        };

        const config = categoryConfig[category] || categoryConfig.general;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const filteredTemplates = filterCategory === 'all'
        ? templates
        : templates.filter(t => t.category === filterCategory);

    return (
        <div className="space-y-6">
            {/* Header con filtros */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Templates de Correo Electrónico</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Gestiona las plantillas de correos enviados automáticamente en el proceso de admisión
                        </p>
                    </div>
                    <FiMail className="w-8 h-8 text-blue-500" />
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterCategory === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Todos ({templates.length})
                    </button>
                    <button
                        onClick={() => setFilterCategory('application')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterCategory === 'application'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Postulación ({templates.filter(t => t.category === 'application').length})
                    </button>
                    <button
                        onClick={() => setFilterCategory('interview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterCategory === 'interview'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Entrevista ({templates.filter(t => t.category === 'interview').length})
                    </button>
                    <button
                        onClick={() => setFilterCategory('evaluation')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterCategory === 'evaluation'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Evaluación ({templates.filter(t => t.category === 'evaluation').length})
                    </button>
                    <button
                        onClick={() => setFilterCategory('decision')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterCategory === 'decision'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Decisión ({templates.filter(t => t.category === 'decision').length})
                    </button>
                </div>
            </Card>

            {/* Lista de templates */}
            <div className="grid grid-cols-1 gap-4">
                {filteredTemplates.map((template) => (
                    <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                    {getCategoryBadge(template.category)}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500">Asunto:</span>
                                        <p className="text-sm text-gray-700 mt-1">{template.subject}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500">Variables disponibles:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {template.variables.map((variable) => (
                                                <code key={variable} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                    {`{{${variable}}}`}
                                                </code>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Última modificación: {new Date(template.lastModified).toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePreview(template)}
                                >
                                    <FiEye className="w-4 h-4 mr-2" />
                                    Vista Previa
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleEdit(template)}
                                >
                                    <FiEdit2 className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <Card className="p-12 text-center">
                    <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay templates en esta categoría</p>
                </Card>
            )}

            {/* Modal de Edición */}
            <Modal
                isOpen={isEditing}
                onClose={() => {
                    setIsEditing(false);
                    setSelectedTemplate(null);
                }}
                title={`Editar Template: ${selectedTemplate?.name}`}
                size="xl"
            >
                <div className="space-y-4">
                    {/* Asunto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asunto del correo
                        </label>
                        <input
                            type="text"
                            value={editedSubject}
                            onChange={(e) => setEditedSubject(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Cuerpo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cuerpo del correo
                        </label>
                        <textarea
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                            rows={15}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        />
                    </div>

                    {/* Variables disponibles */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 mb-2">Variables disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedTemplate?.variables.map((variable) => (
                                <code
                                    key={variable}
                                    className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200 cursor-pointer hover:bg-blue-100"
                                    onClick={() => {
                                        const textarea = document.querySelector('textarea');
                                        if (textarea) {
                                            const cursorPos = textarea.selectionStart;
                                            const textBefore = editedBody.substring(0, cursorPos);
                                            const textAfter = editedBody.substring(cursorPos);
                                            setEditedBody(`${textBefore}{{${variable}}}${textAfter}`);
                                        }
                                    }}
                                >
                                    {`{{${variable}}}`}
                                </code>
                            ))}
                        </div>
                        <p className="text-xs text-blue-700 mt-2">Haz clic en una variable para insertarla en el cursor</p>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setSelectedTemplate(null);
                            }}
                        >
                            <FiX className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                        >
                            <FiSave className="w-4 h-4 mr-2" />
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Vista Previa */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false);
                    setSelectedTemplate(null);
                }}
                title={`Vista Previa: ${selectedTemplate?.name}`}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">De:</p>
                        <p className="text-sm text-gray-600">admision@montetabornazaret.cl</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Asunto:</p>
                        <p className="text-sm text-gray-900">{selectedTemplate?.subject}</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                            {selectedTemplate?.body}
                        </pre>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Nota:</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Las variables mostradas como {`{{variable}}`} se reemplazarán automáticamente con los datos reales al enviar el correo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsPreviewOpen(false);
                                setSelectedTemplate(null);
                            }}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EmailTemplateManager;
