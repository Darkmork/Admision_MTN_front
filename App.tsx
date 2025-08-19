
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ToastContainer from './components/ui/ToastContainer';
import HomePage from './pages/HomePage';
import ApplicationForm from './pages/ApplicationForm';
import FamilyDashboard from './pages/FamilyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/AdminLoginPage';
import ApoderadoLogin from './pages/ApoderadoLogin';
import ExamPortal from './pages/ExamPortal';
import ExamSubjectDetail from './pages/ExamSubjectDetail';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProfessorLoginPage from './pages/ProfessorLoginPage';
import ExamEvaluation from './pages/ExamEvaluation';
import StudentProfile from './pages/StudentProfile';
import ProtectedProfessorRoute from './components/auth/ProtectedProfessorRoute';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import ProtectedApoderadoRoute from './components/auth/ProtectedApoderadoRoute';
import CalendarNotifications from './pages/CalendarNotifications';
import InterviewModule from './pages/InterviewModule';

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <div className="flex flex-col min-h-screen font-sans bg-blanco-pureza text-gray-800">
                    <Header />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/postulacion" element={
                                <ProtectedApoderadoRoute>
                                    <ApplicationForm />
                                </ProtectedApoderadoRoute>
                            } />
                            <Route path="/apoderado/login" element={<ApoderadoLogin />} />
                            <Route path="/dashboard-apoderado" element={
                                <ProtectedApoderadoRoute>
                                    <FamilyDashboard />
                                </ProtectedApoderadoRoute>
                            } />
                            <Route path="/familia" element={<FamilyDashboard />} />
                            <Route path="/familia/login" element={<LoginPage />} />
                            <Route path="/admin" element={
                                <ProtectedAdminRoute>
                                    <AdminDashboard />
                                </ProtectedAdminRoute>
                            } />
                            <Route path="/examenes" element={<ExamPortal />} />
                            <Route path="/examenes/:subjectId" element={<ExamSubjectDetail />} />
                            <Route path="/profesor/login" element={<ProfessorLoginPage />} />
                            <Route path="/profesor" element={
                                <ProtectedProfessorRoute>
                                    <ProfessorDashboard />
                                </ProtectedProfessorRoute>
                            } />
                            <Route path="/profesor/evaluar/:examId" element={
                                <ProtectedProfessorRoute>
                                    <ExamEvaluation />
                                </ProtectedProfessorRoute>
                            } />
                            <Route path="/profesor/estudiante/:studentId" element={
                                <ProtectedProfessorRoute>
                                    <StudentProfile />
                                </ProtectedProfessorRoute>
                            } />
                            {/* Nuevas rutas */}
                            <Route path="/calendario" element={<CalendarNotifications />} />
                            <Route path="/entrevistas" element={<InterviewModule />} />
                        </Routes>
                    </main>
                    <Footer />
                    <ToastContainer />
                </div>
            </AppProvider>
        </AuthProvider>
    );
}

export default App;