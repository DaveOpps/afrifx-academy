import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonViewer from './pages/LessonViewer';
import Certificates from './pages/Certificates';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Meetings from './pages/Meetings';
import Signals from './pages/Signals';
import StudentIdCard from './pages/StudentIdCard';
import Verify from './pages/Verify';
import Resources from './pages/Resources';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Performance from './pages/Performance';
import Markets from './pages/Markets';
import Trade from './pages/Trade';
import MyAccount from './pages/MyAccount';
import PartnerIB from './pages/PartnerIB';
import PartnerBroker from './pages/PartnerBroker';
import PartnerSeminar from './pages/PartnerSeminar';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDash from './pages/admin/AdminDash';
import AdminStudents from './pages/admin/AdminStudents';
import AdminStudent from './pages/admin/AdminStudent';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCerts from './pages/admin/AdminCerts';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminPerformance from './pages/admin/AdminPerformance';
import AdminMeetings from './pages/admin/AdminMeetings';
import AdminSignals from './pages/admin/AdminSignals';
import AdminApplications from './pages/admin/AdminApplications';
function Guard({ children, role }) {
    const { user, token } = useAuth();
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (role === 'admin' && user?.role !== 'admin')
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    return children;
}
export default function App() {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/landing", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/forgot", element: _jsx(ForgotPassword, {}) }), _jsx(Route, { path: "/reset/:token", element: _jsx(ResetPassword, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), _jsx(Route, { path: "/resources", element: _jsx(Resources, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(Pricing, {}) }), _jsx(Route, { path: "/performance", element: _jsx(Performance, {}) }), _jsx(Route, { path: "/markets", element: _jsx(Markets, {}) }), _jsx(Route, { path: "/trade", element: _jsx(Trade, {}) }), _jsx(Route, { path: "/partners/ib", element: _jsx(PartnerIB, {}) }), _jsx(Route, { path: "/partners/broker", element: _jsx(PartnerBroker, {}) }), _jsx(Route, { path: "/partners/seminar", element: _jsx(PartnerSeminar, {}) }), _jsx(Route, { path: "/verify/:code", element: _jsx(Verify, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Guard, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/courses", element: _jsx(Courses, {}) }), _jsx(Route, { path: "/courses/:id", element: _jsx(CourseDetail, {}) }), _jsx(Route, { path: "/learn/:courseId/:lessonId", element: _jsx(Guard, { children: _jsx(LessonViewer, {}) }) }), _jsx(Route, { path: "/certificates", element: _jsx(Guard, { children: _jsx(Certificates, {}) }) }), _jsx(Route, { path: "/leaderboard", element: _jsx(Guard, { children: _jsx(Leaderboard, {}) }) }), _jsx(Route, { path: "/meetings", element: _jsx(Guard, { children: _jsx(Meetings, {}) }) }), _jsx(Route, { path: "/signals", element: _jsx(Guard, { children: _jsx(Signals, {}) }) }), _jsx(Route, { path: "/student-id", element: _jsx(Guard, { children: _jsx(StudentIdCard, {}) }) }), _jsx(Route, { path: "/my-account", element: _jsx(Guard, { children: _jsx(MyAccount, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(Guard, { children: _jsx(Profile, {}) }) }), _jsx(Route, { path: "/admin/login", element: _jsx(AdminLogin, {}) }), _jsx(Route, { path: "/admin", element: _jsx(Guard, { role: "admin", children: _jsx(AdminDash, {}) }) }), _jsx(Route, { path: "/admin/students", element: _jsx(Guard, { role: "admin", children: _jsx(AdminStudents, {}) }) }), _jsx(Route, { path: "/admin/students/:id", element: _jsx(Guard, { role: "admin", children: _jsx(AdminStudent, {}) }) }), _jsx(Route, { path: "/admin/courses", element: _jsx(Guard, { role: "admin", children: _jsx(AdminCourses, {}) }) }), _jsx(Route, { path: "/admin/announcements", element: _jsx(Guard, { role: "admin", children: _jsx(AdminAnnouncements, {}) }) }), _jsx(Route, { path: "/admin/analytics", element: _jsx(Guard, { role: "admin", children: _jsx(AdminAnalytics, {}) }) }), _jsx(Route, { path: "/admin/performance", element: _jsx(Guard, { role: "admin", children: _jsx(AdminPerformance, {}) }) }), _jsx(Route, { path: "/admin/meetings", element: _jsx(Guard, { role: "admin", children: _jsx(AdminMeetings, {}) }) }), _jsx(Route, { path: "/admin/certificates", element: _jsx(Guard, { role: "admin", children: _jsx(AdminCerts, {}) }) }), _jsx(Route, { path: "/admin/signals", element: _jsx(Guard, { role: "admin", children: _jsx(AdminSignals, {}) }) }), _jsx(Route, { path: "/admin/applications", element: _jsx(Guard, { role: "admin", children: _jsx(AdminApplications, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }));
}
