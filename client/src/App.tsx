import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing        from './pages/Landing';
import Register       from './pages/Register';
import Login          from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Dashboard      from './pages/Dashboard';
import Courses        from './pages/Courses';
import CourseDetail   from './pages/CourseDetail';
import LessonViewer   from './pages/LessonViewer';
import Certificates   from './pages/Certificates';
import Profile        from './pages/Profile';
import Leaderboard    from './pages/Leaderboard';
import Meetings       from './pages/Meetings';
import Signals        from './pages/Signals';
import StudentIdCard  from './pages/StudentIdCard';
import Verify         from './pages/Verify';
import Resources      from './pages/Resources';
import About          from './pages/About';
import Pricing        from './pages/Pricing';
import Performance    from './pages/Performance';
import Markets        from './pages/Markets';
import Trade          from './pages/Trade';
import MyAccount      from './pages/MyAccount';
import PartnerIB      from './pages/PartnerIB';
import PartnerBroker  from './pages/PartnerBroker';
import PartnerSeminar from './pages/PartnerSeminar';
import AdminLogin     from './pages/admin/AdminLogin';
import AdminDash      from './pages/admin/AdminDash';
import AdminStudents  from './pages/admin/AdminStudents';
import AdminStudent   from './pages/admin/AdminStudent';
import AdminCourses   from './pages/admin/AdminCourses';
import AdminCerts     from './pages/admin/AdminCerts';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminMeetings  from './pages/admin/AdminMeetings';
import AdminSignals   from './pages/admin/AdminSignals';
import AdminApplications from './pages/admin/AdminApplications';

function Guard({ children, role }: { children: JSX.Element; role?: string }) {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'admin' && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<Landing />} />
          <Route path="/landing"       element={<Landing />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/forgot"        element={<ForgotPassword />} />
          <Route path="/reset/:token"  element={<ResetPassword />} />
          <Route path="/about"         element={<About />} />
          <Route path="/resources"     element={<Resources />} />
          <Route path="/pricing"       element={<Pricing />} />
          <Route path="/performance"   element={<Performance />} />
          <Route path="/markets"       element={<Markets />} />
          <Route path="/trade"         element={<Trade />} />
          <Route path="/partners/ib"      element={<PartnerIB />} />
          <Route path="/partners/broker"  element={<PartnerBroker />} />
          <Route path="/partners/seminar" element={<PartnerSeminar />} />
          <Route path="/verify/:code"  element={<Verify />} />
          <Route path="/dashboard"     element={<Guard><Dashboard /></Guard>} />
          <Route path="/courses"       element={<Courses />} />
          <Route path="/courses/:id"   element={<CourseDetail />} />
          <Route path="/learn/:courseId/:lessonId" element={<Guard><LessonViewer /></Guard>} />
          <Route path="/certificates"  element={<Guard><Certificates /></Guard>} />
          <Route path="/leaderboard"   element={<Guard><Leaderboard /></Guard>} />
          <Route path="/meetings"      element={<Guard><Meetings /></Guard>} />
          <Route path="/signals"       element={<Guard><Signals /></Guard>} />
          <Route path="/student-id"    element={<Guard><StudentIdCard /></Guard>} />
          <Route path="/my-account"    element={<Guard><MyAccount /></Guard>} />
          <Route path="/profile"       element={<Guard><Profile /></Guard>} />
          <Route path="/admin/login"   element={<AdminLogin />} />
          <Route path="/admin"         element={<Guard role="admin"><AdminDash /></Guard>} />
          <Route path="/admin/students"        element={<Guard role="admin"><AdminStudents /></Guard>} />
          <Route path="/admin/students/:id"    element={<Guard role="admin"><AdminStudent /></Guard>} />
          <Route path="/admin/courses"         element={<Guard role="admin"><AdminCourses /></Guard>} />
          <Route path="/admin/announcements"   element={<Guard role="admin"><AdminAnnouncements /></Guard>} />
          <Route path="/admin/analytics"       element={<Guard role="admin"><AdminAnalytics /></Guard>} />
          <Route path="/admin/meetings"        element={<Guard role="admin"><AdminMeetings /></Guard>} />
          <Route path="/admin/certificates"    element={<Guard role="admin"><AdminCerts /></Guard>} />
          <Route path="/admin/signals"         element={<Guard role="admin"><AdminSignals /></Guard>} />
          <Route path="/admin/applications"    element={<Guard role="admin"><AdminApplications /></Guard>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
