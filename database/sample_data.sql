-- Datos de Ejemplo para Sistema de Admisión MTN
-- Este archivo contiene datos de prueba para desarrollo y testing

-- ============================================
-- PROFESORES ADICIONALES
-- ============================================

-- Profesores de Matemática
INSERT INTO professors (id, first_name, last_name, email, password_hash, department, is_admin) VALUES
('PROF-002', 'María Elena', 'González Sánchez', 'maria.gonzalez@mtn.cl', '$2b$10$example_hash', 'Matemática Inicial', FALSE),
('PROF-003', 'Ana Patricia', 'López Rivera', 'ana.lopez@mtn.cl', '$2b$10$example_hash', 'Matemática Intermedia', FALSE),
('PROF-004', 'Eduardo', 'Hernández Vega', 'eduardo.hernandez@mtn.cl', '$2b$10$example_hash', 'Matemática Media', FALSE);

-- Profesores de Lenguaje
INSERT INTO professors (id, first_name, last_name, email, password_hash, department, is_admin) VALUES
('PROF-005', 'Carlos Roberto', 'Ruiz Morales', 'carlos.ruiz@mtn.cl', '$2b$10$example_hash', 'Lenguaje y Comunicación Básica', FALSE),
('PROF-006', 'Roberto', 'Silva Castro', 'roberto.silva@mtn.cl', '$2b$10$example_hash', 'Lenguaje y Comunicación Intermedia', FALSE),
('PROF-007', 'Carmen Gloria', 'Figueroa Díaz', 'carmen.figueroa@mtn.cl', '$2b$10$example_hash', 'Lenguaje y Comunicación Media', FALSE);

-- Profesores de Inglés
INSERT INTO professors (id, first_name, last_name, email, password_hash, department, is_admin) VALUES
('PROF-008', 'Jennifer', 'Thompson Wilson', 'jennifer.thompson@mtn.cl', '$2b$10$example_hash', 'Inglés Básico', FALSE),
('PROF-009', 'Patricia Elena', 'Morales Torres', 'patricia.morales@mtn.cl', '$2b$10$example_hash', 'Inglés Intermedio', FALSE),
('PROF-010', 'Michael James', 'Anderson Smith', 'michael.anderson@mtn.cl', '$2b$10$example_hash', 'Inglés Avanzado', FALSE);

-- ============================================
-- ASIGNACIÓN DE MATERIAS A PROFESORES
-- ============================================

-- Matemática
INSERT INTO professor_subjects (professor_id, subject_id) VALUES
('PROF-002', 'MATH'),
('PROF-003', 'MATH'),
('PROF-004', 'MATH');

-- Lenguaje
INSERT INTO professor_subjects (professor_id, subject_id) VALUES
('PROF-005', 'SPANISH'),
('PROF-006', 'SPANISH'),
('PROF-007', 'SPANISH');

-- Inglés
INSERT INTO professor_subjects (professor_id, subject_id) VALUES
('PROF-008', 'ENGLISH'),
('PROF-009', 'ENGLISH'),
('PROF-010', 'ENGLISH');

-- ============================================
-- ASIGNACIÓN DE NIVELES A PROFESORES
-- ============================================

-- María González - Matemática Inicial (PK a 2° Básico)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-002', 'prekinder'),
('PROF-002', 'kinder'),
('PROF-002', '1basico'),
('PROF-002', '2basico');

-- Ana López - Matemática Intermedia (3° a 6° Básico)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-003', '3basico'),
('PROF-003', '4basico'),
('PROF-003', '5basico'),
('PROF-003', '6basico');

-- Eduardo Hernández - Matemática Media (7° Básico a 2° Medio)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-004', '7basico'),
('PROF-004', '8basico'),
('PROF-004', '1medio'),
('PROF-004', '2medio');

-- Carlos Ruiz - Lenguaje Básico (PK a 3° Básico)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-005', 'prekinder'),
('PROF-005', 'kinder'),
('PROF-005', '1basico'),
('PROF-005', '2basico'),
('PROF-005', '3basico');

-- Roberto Silva - Lenguaje Intermedio (4° a 8° Básico)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-006', '4basico'),
('PROF-006', '5basico'),
('PROF-006', '6basico'),
('PROF-006', '7basico'),
('PROF-006', '8basico');

-- Carmen Figueroa - Lenguaje Media (1° a 4° Medio)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-007', '1medio'),
('PROF-007', '2medio'),
('PROF-007', '3medio'),
('PROF-007', '4medio');

-- Jennifer Thompson - Inglés Básico (PK a 4° Básico)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-008', 'prekinder'),
('PROF-008', 'kinder'),
('PROF-008', '1basico'),
('PROF-008', '2basico'),
('PROF-008', '3basico'),
('PROF-008', '4basico');

-- Patricia Morales - Inglés Intermedio (5° a 8° Básico)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-009', '5basico'),
('PROF-009', '6basico'),
('PROF-009', '7basico'),
('PROF-009', '8basico');

-- Michael Anderson - Inglés Avanzado (1° a 4° Medio)
INSERT INTO professor_grade_assignments (professor_id, grade_level_id) VALUES
('PROF-010', '1medio'),
('PROF-010', '2medio'),
('PROF-010', '3medio'),
('PROF-010', '4medio');

-- ============================================
-- FAMILIAS Y ESTUDIANTES DE EJEMPLO
-- ============================================

-- Familia 1
INSERT INTO families (id, family_name, contact_email, contact_phone, address) VALUES
('FAM-001', 'Familia González Rojas', 'contacto.gonzalez@gmail.com', '+56912345678', 'Av. Providencia 1234, Providencia, Santiago');

INSERT INTO students (id, first_name, last_name, birth_date, grade_level_id, family_id, rut, gender) VALUES
('STU-001', 'Mateo', 'González Rojas', '2018-05-10', '1basico', 'FAM-001', '25123456-7', 'M');

-- Familia 2
INSERT INTO families (id, family_name, contact_email, contact_phone, address) VALUES
('FAM-002', 'Familia Martínez López', 'familia.martinez@gmail.com', '+56987654321', 'Los Espinos 567, Las Condes, Santiago');

INSERT INTO students (id, first_name, last_name, birth_date, grade_level_id, family_id, rut, gender) VALUES
('STU-002', 'Sofía', 'Martínez López', '2017-09-22', 'kinder', 'FAM-002', '24987654-3', 'F');

-- Familia 3
INSERT INTO families (id, family_name, contact_email, contact_phone, address) VALUES
('FAM-003', 'Familia Silva Castro', 'silva.familia@hotmail.com', '+56911223344', 'Camino Las Flores 890, Ñuñoa, Santiago');

INSERT INTO students (id, first_name, last_name, birth_date, grade_level_id, family_id, rut, gender) VALUES
('STU-003', 'Lucas', 'Silva Castro', '2019-01-30', 'prekinder', 'FAM-003', '26111222-8', 'M');

-- Estudiantes para Jorge Gangale (8° Básico a 4° Medio)
INSERT INTO families (id, family_name, contact_email, contact_phone, address) VALUES
('FAM-004', 'Familia Mendoza Silva', 'mendoza.contacto@gmail.com', '+56944556677', 'Av. Apoquindo 2345, Las Condes'),
('FAM-005', 'Familia Espinoza Torres', 'espinoza.familia@yahoo.com', '+56933445566', 'Santa Rosa 1122, Santiago Centro'),
('FAM-006', 'Familia Pérez Vargas', 'perez.vargas@outlook.com', '+56922334455', 'Los Álamos 678, Maipú'),
('FAM-007', 'Familia Morales Díaz', 'morales.diaz@gmail.com', '+56955667788', 'Las Perdices 345, La Reina'),
('FAM-008', 'Familia Castillo Ruiz', 'castillo.ruiz@hotmail.com', '+56966778899', 'El Bosque 789, Vitacura');

INSERT INTO students (id, first_name, last_name, birth_date, grade_level_id, family_id, rut, gender) VALUES
('STU-004', 'Nicolás', 'Mendoza Silva', '2010-08-12', '8basico', 'FAM-004', '21081234-5', 'M'),
('STU-005', 'Camila', 'Espinoza Torres', '2009-04-25', '1medio', 'FAM-005', '20042567-8', 'F'),
('STU-006', 'Martina', 'Pérez Vargas', '2008-03-20', '2medio', 'FAM-006', '19032089-1', 'F'),
('STU-007', 'Sebastián', 'Morales Díaz', '2007-11-15', '3medio', 'FAM-007', '18111534-6', 'M'),
('STU-008', 'Fernanda', 'Castillo Ruiz', '2006-06-08', '4medio', 'FAM-008', '17060823-4', 'F');

-- ============================================
-- POSTULACIONES
-- ============================================

INSERT INTO applications (id, student_id, status, submission_date, admission_year) VALUES
('APP-001', 'STU-001', 'SUBMITTED', '2024-08-15 10:30:00', 2025),
('APP-002', 'STU-002', 'INTERVIEW_SCHEDULED', '2024-08-16 09:15:00', 2025),
('APP-003', 'STU-003', 'SUBMITTED', '2024-08-17 14:45:00', 2025),
('APP-004', 'STU-004', 'SUBMITTED', '2024-08-18 11:20:00', 2025),
('APP-005', 'STU-005', 'SUBMITTED', '2024-08-19 16:30:00', 2025),
('APP-006', 'STU-006', 'SUBMITTED', '2024-08-20 08:45:00', 2025),
('APP-007', 'STU-007', 'SUBMITTED', '2024-08-21 13:15:00', 2025),
('APP-008', 'STU-008', 'SUBMITTED', '2024-08-22 10:00:00', 2025);

-- ============================================
-- HORARIOS DE EXÁMENES
-- ============================================

-- Exámenes de Matemática
INSERT INTO exam_schedules (id, subject_id, grade_level_id, exam_date, start_time, end_time, location, max_capacity) VALUES
('SCH-MATH-001', 'MATH', '1basico', '2024-09-15', '09:00:00', '10:30:00', 'Sala A101', 25),
('SCH-MATH-002', 'MATH', 'kinder', '2024-09-15', '11:00:00', '12:00:00', 'Sala A102', 20),
('SCH-MATH-003', 'MATH', '8basico', '2024-09-16', '09:00:00', '11:00:00', 'Sala B201', 30),
('SCH-MATH-004', 'MATH', '1medio', '2024-09-16', '14:00:00', '16:00:00', 'Sala B202', 25),
('SCH-MATH-005', 'MATH', '2medio', '2024-09-17', '09:00:00', '11:00:00', 'Sala B203', 25),
('SCH-MATH-006', 'MATH', '3medio', '2024-09-17', '14:00:00', '16:00:00', 'Sala C301', 20),
('SCH-MATH-007', 'MATH', '4medio', '2024-09-18', '09:00:00', '11:00:00', 'Sala C302', 20);

-- Exámenes de Lenguaje
INSERT INTO exam_schedules (id, subject_id, grade_level_id, exam_date, start_time, end_time, location, max_capacity) VALUES
('SCH-SPAN-001', 'SPANISH', '1basico', '2024-09-20', '09:00:00', '10:30:00', 'Sala A103', 25),
('SCH-SPAN-002', 'SPANISH', 'kinder', '2024-09-20', '11:00:00', '12:00:00', 'Sala A104', 20);

-- Exámenes de Inglés
INSERT INTO exam_schedules (id, subject_id, grade_level_id, exam_date, start_time, end_time, location, max_capacity) VALUES
('SCH-ENG-001', 'ENGLISH', '1basico', '2024-09-22', '09:00:00', '10:30:00', 'Sala D401', 25),
('SCH-ENG-002', 'ENGLISH', 'kinder', '2024-09-22', '11:00:00', '12:00:00', 'Sala D402', 20);

-- ============================================
-- EXÁMENES RENDIDOS (PARA JORGE GANGALE)
-- ============================================

-- Exámenes completados para evaluación por Jorge
INSERT INTO student_exams (id, student_id, subject_id, schedule_id, status, score, max_score, time_spent_minutes, completed_at) VALUES
('EXAM-001', 'STU-004', 'MATH', 'SCH-MATH-003', 'COMPLETED', 22, 30, 95, '2024-09-16 10:30:00'),
('EXAM-002', 'STU-005', 'MATH', 'SCH-MATH-004', 'COMPLETED', 28, 35, 87, '2024-09-16 15:45:00'),
('EXAM-003', 'STU-006', 'MATH', 'SCH-MATH-005', 'COMPLETED', 26, 35, 102, '2024-09-17 10:50:00'),
('EXAM-004', 'STU-007', 'MATH', 'SCH-MATH-006', 'COMPLETED', 30, 40, 110, '2024-09-17 15:30:00'),
('EXAM-005', 'STU-008', 'MATH', 'SCH-MATH-007', 'COMPLETED', 24, 40, 118, '2024-09-18 10:45:00');

-- Otros exámenes para otros profesores
INSERT INTO student_exams (id, student_id, subject_id, schedule_id, status, score, max_score, time_spent_minutes, completed_at) VALUES
('EXAM-006', 'STU-001', 'MATH', 'SCH-MATH-001', 'COMPLETED', 25, 30, 85, '2024-09-15 10:15:00'),
('EXAM-007', 'STU-002', 'MATH', 'SCH-MATH-002', 'COMPLETED', 18, 25, 55, '2024-09-15 11:45:00');

-- ============================================
-- MATERIALES DE ESTUDIO
-- ============================================

-- Materiales de Matemática por nivel
INSERT INTO study_materials (id, subject_id, grade_level_id, title, description, material_type, file_path, is_downloadable) VALUES
('MAT-PK-001', 'MATH', 'prekinder', 'Números del 1 al 10', 'Guía de números básicos con ejercicios', 'pdf', '/materials/math/prekinder/numeros_1_10.pdf', TRUE),
('MAT-PK-002', 'MATH', 'prekinder', 'Formas Geométricas', 'Introducción a formas básicas', 'pdf', '/materials/math/prekinder/formas_geometricas.pdf', TRUE),
('MAT-1B-001', 'MATH', '1basico', 'Suma y Resta Básica', 'Operaciones fundamentales hasta 20', 'pdf', '/materials/math/1basico/suma_resta.pdf', TRUE),
('MAT-8B-001', 'MATH', '8basico', 'Ecuaciones Lineales', 'Resolución de ecuaciones de primer grado', 'pdf', '/materials/math/8basico/ecuaciones_lineales.pdf', TRUE),
('MAT-1M-001', 'MATH', '1medio', 'Funciones', 'Introducción a funciones matemáticas', 'pdf', '/materials/math/1medio/funciones.pdf', TRUE);

-- Materiales de Lenguaje
INSERT INTO study_materials (id, subject_id, grade_level_id, title, description, material_type, file_path, is_downloadable) VALUES
('LEN-PK-001', 'SPANISH', 'prekinder', 'Vocales', 'Reconocimiento y trazado de vocales', 'pdf', '/materials/spanish/prekinder/vocales.pdf', TRUE),
('LEN-1B-001', 'SPANISH', '1basico', 'Comprensión Lectora Básica', 'Textos simples con preguntas', 'pdf', '/materials/spanish/1basico/comprension_basica.pdf', TRUE);

-- Materiales de Inglés
INSERT INTO study_materials (id, subject_id, grade_level_id, title, description, material_type, file_path, is_downloadable) VALUES
('ENG-PK-001', 'ENGLISH', 'prekinder', 'Basic Colors and Numbers', 'Colores y números en inglés', 'pdf', '/materials/english/prekinder/colors_numbers.pdf', TRUE),
('ENG-1B-001', 'ENGLISH', '1basico', 'Family Members', 'Vocabulario de familia', 'pdf', '/materials/english/1basico/family_members.pdf', TRUE);

-- ============================================
-- TEMAS DEL CURRÍCULUM
-- ============================================

-- Temas de Matemática 8° Básico (para Jorge)
INSERT INTO curriculum_topics (subject_id, grade_level_id, topic_name, topic_order, description) VALUES
('MATH', '8basico', 'Números Enteros', 1, 'Operaciones con números enteros'),
('MATH', '8basico', 'Potencias y Raíces', 2, 'Cálculo de potencias y raíces cuadradas'),
('MATH', '8basico', 'Ecuaciones Lineales', 3, 'Resolución de ecuaciones de primer grado'),
('MATH', '8basico', 'Proporcionalidad', 4, 'Razones, proporciones y porcentajes'),
('MATH', '8basico', 'Geometría Plana', 5, 'Área y perímetro de figuras'),
('MATH', '8basico', 'Estadística Básica', 6, 'Medidas de tendencia central');

-- Temas de Matemática 1° Medio (para Jorge)
INSERT INTO curriculum_topics (subject_id, grade_level_id, topic_name, topic_order, description) VALUES
('MATH', '1medio', 'Números Reales', 1, 'Conjunto de números reales'),
('MATH', '1medio', 'Álgebra Básica', 2, 'Expresiones algebraicas y factorización'),
('MATH', '1medio', 'Ecuaciones y Sistemas', 3, 'Sistemas de ecuaciones lineales'),
('MATH', '1medio', 'Funciones Lineales', 4, 'Gráficos y ecuaciones de rectas'),
('MATH', '1medio', 'Geometría Analítica', 5, 'Coordenadas y distancias'),
('MATH', '1medio', 'Estadística y Probabilidad', 6, 'Análisis de datos y probabilidades');

-- ============================================
-- CONFIGURACIONES ADICIONALES
-- ============================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('contact_email', 'admisiones@mtn.cl', 'string', 'Email de contacto para admisiones'),
('phone_number', '+56-2-2234-5678', 'string', 'Teléfono de admisiones'),
('address', 'Av. Providencia 2594, Providencia, Santiago', 'string', 'Dirección del colegio'),
('exam_results_available_days', '7', 'number', 'Días después del examen para ver resultados'),
('application_deadline', '2024-09-30', 'string', 'Fecha límite de postulaciones'),
('interview_period_start', '2024-10-01', 'string', 'Inicio período de entrevistas'),
('interview_period_end', '2024-10-15', 'string', 'Fin período de entrevistas'),
('results_publication_date', '2024-11-01', 'string', 'Fecha de publicación de resultados');

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Contar registros creados
SELECT 'Profesores' as tabla, COUNT(*) as registros FROM professors
UNION ALL
SELECT 'Estudiantes', COUNT(*) FROM students
UNION ALL
SELECT 'Familias', COUNT(*) FROM families
UNION ALL
SELECT 'Postulaciones', COUNT(*) FROM applications
UNION ALL
SELECT 'Exámenes', COUNT(*) FROM student_exams
UNION ALL
SELECT 'Horarios', COUNT(*) FROM exam_schedules
UNION ALL
SELECT 'Materiales', COUNT(*) FROM study_materials
UNION ALL
SELECT 'Temas Currículum', COUNT(*) FROM curriculum_topics;