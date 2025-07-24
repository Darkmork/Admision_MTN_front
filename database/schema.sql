-- Schema de Base de Datos para Sistema de Admisión MTN
-- Colegio Monte Tabor y Nazaret
-- Creado: 2024

-- ============================================
-- 1. USUARIOS Y AUTENTICACIÓN
-- ============================================

-- Tabla de Profesores
CREATE TABLE professors (
    id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Materias/Asignaturas
CREATE TABLE subjects (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de Niveles Educativos
CREATE TABLE grade_levels (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Pre-Kínder', '1° Básico', etc.
    code VARCHAR(20) NOT NULL, -- 'prekinder', '1basico', etc.
    level_order INT NOT NULL, -- Para ordenamiento
    is_active BOOLEAN DEFAULT TRUE
);

-- Relación Profesores-Materias
CREATE TABLE professor_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professor_id VARCHAR(20) NOT NULL,
    subject_id VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_professor_subject (professor_id, subject_id)
);

-- Relación Profesores-Niveles Asignados
CREATE TABLE professor_grade_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professor_id VARCHAR(20) NOT NULL,
    grade_level_id VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
    FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_professor_grade (professor_id, grade_level_id)
);

-- ============================================
-- 2. POSTULANTES Y FAMILIAS
-- ============================================

-- Tabla de Familias
CREATE TABLE families (
    id VARCHAR(20) PRIMARY KEY,
    family_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Postulantes/Estudiantes
CREATE TABLE students (
    id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    grade_level_id VARCHAR(20) NOT NULL,
    family_id VARCHAR(20) NOT NULL,
    rut VARCHAR(12) UNIQUE,
    gender ENUM('M', 'F', 'Other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id),
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

-- Tabla de Postulaciones
CREATE TABLE applications (
    id VARCHAR(20) PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    status ENUM('DRAFT', 'SUBMITTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED', 'WAITLIST') DEFAULT 'DRAFT',
    submission_date TIMESTAMP NULL,
    interview_date TIMESTAMP NULL,
    interview_notes TEXT,
    admission_year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Tabla de Documentos de Postulación
CREATE TABLE application_documents (
    id VARCHAR(20) PRIMARY KEY,
    application_id VARCHAR(20) NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    status ENUM('pending', 'submitted', 'approved', 'rejected') DEFAULT 'pending',
    notes TEXT,
    uploaded_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES professors(id)
);

-- ============================================
-- 3. EXÁMENES Y EVALUACIONES
-- ============================================

-- Tabla de Horarios de Examen
CREATE TABLE exam_schedules (
    id VARCHAR(20) PRIMARY KEY,
    subject_id VARCHAR(20) NOT NULL,
    grade_level_id VARCHAR(20) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200),
    max_capacity INT DEFAULT 30,
    current_enrollment INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id)
);

-- Tabla de Exámenes de Estudiantes
CREATE TABLE student_exams (
    id VARCHAR(20) PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject_id VARCHAR(20) NOT NULL,
    schedule_id VARCHAR(20) NOT NULL,
    status ENUM('NOT_STARTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED') DEFAULT 'SCHEDULED',
    score DECIMAL(5,2) NULL,
    max_score DECIMAL(5,2) NULL,
    time_spent_minutes INT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (schedule_id) REFERENCES exam_schedules(id)
);

-- Tabla de Evaluaciones de Exámenes (Por Profesores)
CREATE TABLE exam_evaluations (
    id VARCHAR(20) PRIMARY KEY,
    exam_id VARCHAR(20) NOT NULL,
    professor_id VARCHAR(20) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    grade VARCHAR(10) NOT NULL, -- Nota chilena (1.0 - 7.0)
    
    -- Evaluaciones cualitativas
    exam_adaptation TEXT NOT NULL,
    behavior_observations TEXT NOT NULL,
    general_comments TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    
    -- Seguimiento
    requires_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (exam_id) REFERENCES student_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professors(id),
    UNIQUE KEY unique_exam_evaluation (exam_id)
);

-- Tabla de Fortalezas del Estudiante
CREATE TABLE evaluation_strengths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id VARCHAR(20) NOT NULL,
    strength_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES exam_evaluations(id) ON DELETE CASCADE
);

-- Tabla de Debilidades/Áreas a Mejorar
CREATE TABLE evaluation_weaknesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id VARCHAR(20) NOT NULL,
    weakness_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES exam_evaluations(id) ON DELETE CASCADE
);

-- Tabla de Elementos Específicos a Mejorar
CREATE TABLE evaluation_improvement_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id VARCHAR(20) NOT NULL,
    improvement_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES exam_evaluations(id) ON DELETE CASCADE
);

-- Tabla de Puntajes por Área Específica
CREATE TABLE evaluation_area_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id VARCHAR(20) NOT NULL,
    area_name VARCHAR(200) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES exam_evaluations(id) ON DELETE CASCADE
);

-- ============================================
-- 4. CONTENIDO EDUCATIVO
-- ============================================

-- Tabla de Materiales de Estudio
CREATE TABLE study_materials (
    id VARCHAR(20) PRIMARY KEY,
    subject_id VARCHAR(20) NOT NULL,
    grade_level_id VARCHAR(20) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    material_type ENUM('pdf', 'video', 'link', 'document') NOT NULL,
    file_path VARCHAR(500),
    url VARCHAR(500),
    is_downloadable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id)
);

-- Tabla de Temas por Materia y Nivel
CREATE TABLE curriculum_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id VARCHAR(20) NOT NULL,
    grade_level_id VARCHAR(20) NOT NULL,
    topic_name VARCHAR(300) NOT NULL,
    topic_order INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id)
);

-- ============================================
-- 5. CONFIGURACIÓN DEL SISTEMA
-- ============================================

-- Tabla de Configuraciones Generales
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Logs de Auditoría
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) NULL,
    user_type ENUM('professor', 'family', 'system') NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NULL,
    record_id VARCHAR(20) NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_action (user_id, action),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- 6. DATOS INICIALES
-- ============================================

-- Insertar Materias
INSERT INTO subjects (id, name, description) VALUES
('MATH', 'Matemática', 'Evaluación de competencias matemáticas adaptada por nivel'),
('SPANISH', 'Lenguaje y Comunicación', 'Comprensión lectora, gramática y expresión escrita'),
('ENGLISH', 'Inglés', 'Gramática, vocabulario y comprensión del idioma inglés');

-- Insertar Niveles Educativos
INSERT INTO grade_levels (id, name, code, level_order) VALUES
('prekinder', 'Pre-Kínder', 'prekinder', 1),
('kinder', 'Kínder', 'kinder', 2),
('1basico', '1° Básico', '1basico', 3),
('2basico', '2° Básico', '2basico', 4),
('3basico', '3° Básico', '3basico', 5),
('4basico', '4° Básico', '4basico', 6),
('5basico', '5° Básico', '5basico', 7),
('6basico', '6° Básico', '6basico', 8),
('7basico', '7° Básico', '7basico', 9),
('8basico', '8° Básico', '8basico', 10),
('1medio', '1° Medio', '1medio', 11),
('2medio', '2° Medio', '2medio', 12),
('3medio', '3° Medio', '3medio', 13),
('4medio', '4° Medio', '4medio', 14);

-- Insertar Profesor Administrador (Jorge Gangale)
INSERT INTO professors (id, first_name, last_name, email, password_hash, department, is_admin) VALUES
('PROF-001', 'Jorge', 'Gangale', 'jorge.gangale@mtn.cl', '$2b$10$example_hash', 'Matemática Avanzada', TRUE);

-- Asignar materias a Jorge
INSERT INTO professor_subjects (professor_id, subject_id) VALUES
('PROF-001', 'MATH');

-- Asignar niveles a Jorge (8° Básico a IV° Medio)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-001', '8basico'),
('PROF-001', '1medio'),
('PROF-001', '2medio'),
('PROF-001', '3medio'),
('PROF-001', '4medio');

-- Configuraciones iniciales del sistema
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('app_name', 'Sistema de Admisión MTN', 'string', 'Nombre de la aplicación'),
('admission_year', '2025', 'number', 'Año de admisión actual'),
('max_applications_per_family', '3', 'number', 'Máximo de postulaciones por familia'),
('exam_duration_minutes', '120', 'number', 'Duración estándar de exámenes en minutos'),
('enable_notifications', 'true', 'boolean', 'Habilitar notificaciones del sistema');

-- ============================================
-- 7. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para mejorar rendimiento
CREATE INDEX idx_students_grade ON students(grade_level_id);
CREATE INDEX idx_students_family ON students(family_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_year ON applications(admission_year);
CREATE INDEX idx_student_exams_student ON student_exams(student_id);
CREATE INDEX idx_student_exams_subject ON student_exams(subject_id);
CREATE INDEX idx_student_exams_status ON student_exams(status);
CREATE INDEX idx_evaluations_professor ON exam_evaluations(professor_id);
CREATE INDEX idx_evaluations_date ON exam_evaluations(evaluated_at);
CREATE INDEX idx_exam_schedules_date ON exam_schedules(exam_date);
CREATE INDEX idx_study_materials_subject_grade ON study_materials(subject_id, grade_level_id);

-- ============================================
-- 8. TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ============================================

DELIMITER //

-- Trigger para auditar cambios en evaluaciones
CREATE TRIGGER audit_exam_evaluations_update
    AFTER UPDATE ON exam_evaluations
    FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, user_type, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.professor_id, 'professor', 'UPDATE', 'exam_evaluations', NEW.id, 
            JSON_OBJECT('score', OLD.score, 'percentage', OLD.percentage),
            JSON_OBJECT('score', NEW.score, 'percentage', NEW.percentage));
END//

-- Trigger para auditar cambios en postulaciones
CREATE TRIGGER audit_applications_update
    AFTER UPDATE ON applications
    FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_logs (user_type, action, table_name, record_id, old_values, new_values)
        VALUES ('system', 'STATUS_CHANGE', 'applications', NEW.id,
                JSON_OBJECT('status', OLD.status),
                JSON_OBJECT('status', NEW.status));
    END IF;
END//

DELIMITER ;

-- ============================================
-- 9. VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista de estudiantes con información completa
CREATE VIEW v_students_complete AS
SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.birth_date,
    gl.name as grade_name,
    gl.code as grade_code,
    f.family_name,
    f.contact_email,
    a.status as application_status,
    a.submission_date,
    s.created_at
FROM students s
JOIN grade_levels gl ON s.grade_level_id = gl.id
JOIN families f ON s.family_id = f.id
LEFT JOIN applications a ON s.id = a.student_id;

-- Vista de exámenes con evaluaciones
CREATE VIEW v_exams_with_evaluations AS
SELECT 
    se.id as exam_id,
    s.first_name,
    s.last_name,
    subj.name as subject_name,
    gl.name as grade_name,
    se.status as exam_status,
    se.completed_at,
    ee.percentage,
    ee.grade,
    p.first_name as professor_first_name,
    p.last_name as professor_last_name,
    ee.evaluated_at
FROM student_exams se
JOIN students s ON se.student_id = s.id
JOIN subjects subj ON se.subject_id = subj.id
JOIN grade_levels gl ON s.grade_level_id = gl.id
LEFT JOIN exam_evaluations ee ON se.id = ee.exam_id
LEFT JOIN professors p ON ee.professor_id = p.id;

-- Vista de estadísticas por profesor
CREATE VIEW v_professor_stats AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.department,
    COUNT(DISTINCT se.id) as total_exams,
    COUNT(DISTINCT ee.id) as evaluated_exams,
    COUNT(DISTINCT CASE WHEN se.status = 'COMPLETED' AND ee.id IS NULL THEN se.id END) as pending_evaluations,
    AVG(ee.percentage) as average_percentage
FROM professors p
JOIN professor_subjects ps ON p.id = ps.professor_id
JOIN student_exams se ON ps.subject_id = se.subject_id
LEFT JOIN exam_evaluations ee ON se.id = ee.exam_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.first_name, p.last_name, p.department;