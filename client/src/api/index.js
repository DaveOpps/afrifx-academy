const BASE = '/api';
function getToken() { return localStorage.getItem('afrifx_token'); }
async function req(method, path, body) {
    const token = getToken();
    const res = await fetch(BASE + path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await res.json();
    if (!res.ok)
        throw new Error(data.error || 'Request failed');
    return data;
}
async function upload(path, formData) {
    const token = getToken();
    const res = await fetch(BASE + path, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData
    });
    const data = await res.json();
    if (!res.ok)
        throw new Error(data.error || 'Upload failed');
    return data;
}
export const api = {
    // Auth
    register: (b) => req('POST', '/auth/register', b),
    login: (b) => req('POST', '/auth/login', b),
    me: () => req('GET', '/auth/me'),
    updateMe: (b) => req('PUT', '/auth/me', b),
    changePassword: (b) => req('PUT', '/auth/password', b),
    forgotPassword: (email) => req('POST', '/auth/forgot', { email }),
    resetPassword: (token, newPassword) => req('POST', '/auth/reset', { token, newPassword }),
    // Courses
    getCourses: () => req('GET', '/courses'),
    getCourse: (id) => req('GET', `/courses/${id}`),
    createCourse: (b) => req('POST', '/courses', b),
    updateCourse: (id, b) => req('PUT', `/courses/${id}`, b),
    deleteCourse: (id) => req('DELETE', `/courses/${id}`),
    addModule: (courseId, b) => req('POST', `/courses/${courseId}/modules`, b),
    deleteModule: (courseId, moduleId) => req('DELETE', `/courses/${courseId}/modules/${moduleId}`),
    // Lessons
    getLesson: (id) => req('GET', `/lessons/${id}`),
    addLesson: (b) => req('POST', '/lessons', b),
    updateLesson: (id, b) => req('PUT', `/lessons/${id}`, b),
    deleteLesson: (id) => req('DELETE', `/lessons/${id}`),
    // Enrollments
    enroll: (courseId) => req('POST', '/enrollments', { courseId }),
    myEnrollments: () => req('GET', '/enrollments/my'),
    // Progress
    markWatched: (lessonId) => req('POST', '/progress', { lessonId }),
    myProgress: (courseId) => req('GET', `/progress/my/${courseId}`),
    // Quizzes
    getQuiz: (id) => req('GET', `/quizzes/${id}`),
    submitQuiz: (id, answers) => req('POST', `/quizzes/${id}/submit`, { answers }),
    createQuiz: (b) => req('POST', '/quizzes', b),
    updateQuiz: (id, questions) => req('PUT', `/quizzes/${id}`, { questions }),
    deleteQuiz: (id) => req('DELETE', `/quizzes/${id}`),
    // Certificates
    myCerts: () => req('GET', '/certificates/my'),
    claimCert: (courseId) => req('POST', '/certificates/claim', { courseId }),
    // Reviews
    courseReviews: (courseId) => req('GET', `/reviews/course/${courseId}`),
    myReview: (courseId) => req('GET', `/reviews/my/${courseId}`),
    submitReview: (b) => req('POST', '/reviews', b),
    // Announcements
    announcements: () => req('GET', '/announcements'),
    markAnnRead: (id) => req('POST', `/announcements/${id}/read`),
    markAllAnnRead: () => req('POST', '/announcements/read-all'),
    allAnnouncements: () => req('GET', '/announcements/all'),
    createAnnouncement: (b) => req('POST', '/announcements', b),
    deleteAnnouncement: (id) => req('DELETE', `/announcements/${id}`),
    // Gamification
    myGamification: () => req('GET', '/gamification/me'),
    myActivity: () => req('GET', '/gamification/activity'),
    leaderboard: () => req('GET', '/gamification/leaderboard'),
    // Resources
    lessonResources: (lessonId) => req('GET', `/resources/lesson/${lessonId}`),
    uploadResource: (fd) => upload('/resources/upload', fd),
    addResourceLink: (b) => req('POST', '/resources/link', b),
    deleteResource: (id) => req('DELETE', `/resources/${id}`),
    // Meetings
    meetings: () => req('GET', '/meetings'),
    nextMeeting: () => req('GET', '/meetings/next'),
    createMeeting: (b) => req('POST', '/meetings', b),
    deleteMeeting: (id) => req('DELETE', `/meetings/${id}`),
    googleStatus: () => req('GET', '/meetings/google/status'),
    googleAuthUrl: () => req('GET', '/meetings/google/auth'),
    googleDisconnect: () => req('POST', '/meetings/google/disconnect'),
    // Signals
    getSignals: (params) => req('GET', `/signals${params ? '?' + params : ''}`),
    getLatestSignals: () => req('GET', '/signals/latest'),
    createSignal: (b) => req('POST', '/signals', b),
    updateSignal: (id, b) => req('PUT', `/signals/${id}`, b),
    deleteSignal: (id) => req('DELETE', `/signals/${id}`),
    signalPerformance: () => req('GET', '/signals/performance'),
    // Certificate verification (public)
    verifyCert: (code) => req('GET', `/certificates/verify/${code}`),
    // Personal dashboard full snapshot
    meFull: () => req('GET', '/auth/me/full'),
    // Assignments
    moduleAssignments: (moduleId) => req('GET', `/assignments/module/${moduleId}`),
    submitAssignment: (id, content, fileUrl) => req('POST', `/assignments/${id}/submit`, { content, fileUrl }),
    createAssignment: (b) => req('POST', '/assignments', b),
    assignmentSubmissions: (id) => req('GET', `/assignments/${id}/submissions`),
    gradeSubmission: (id, grade, feedback) => req('PUT', `/assignments/submissions/${id}/grade`, { grade, feedback }),
    // Membership & subscriptions
    membershipStatus: () => req('GET', '/membership/status'),
    upgradeTier: (tier) => req('POST', '/membership/upgrade', { tier }),
    subscribeSignals: () => req('POST', '/membership/subscribe-signals'),
    myPayments: () => req('GET', '/membership/payments'),
    // Applications (partnerships)
    submitApplication: (b) => req('POST', '/applications', b),
    listApplications: () => req('GET', '/applications'),
    setApplicationStatus: (id, status) => req('PUT', `/applications/${id}`, { status }),
    deleteApplication: (id) => req('DELETE', `/applications/${id}`),
    // Admin
    adminStats: () => req('GET', '/admin/stats'),
    setStudentRole: (id, role) => req('POST', `/admin/students/${id}/role`, { role }),
    adminAnalytics: () => req('GET', '/admin/analytics'),
    adminStudents: () => req('GET', '/admin/students'),
    adminAccounts: () => req('GET', '/admin/accounts'),
    adminStudent: (id) => req('GET', `/admin/students/${id}`),
    adminStudentTrades: (id) => req('GET', `/admin/students/${id}/trades`),
    adminQuizPerformance: () => req('GET', '/admin/quiz-performance'),
    adminCerts: () => req('GET', '/admin/certificates'),
    issueCert: (b) => req('POST', '/admin/certificates/issue', b),
    resetStudentPassword: (id, newPassword) => req('POST', `/admin/students/${id}/reset-password`, { newPassword }),
    // Paper trading (demo)
    paperInstruments: () => req('GET', '/paper/instruments'),
    paperAccount: () => req('GET', '/paper/account'),
    paperPositions: () => req('GET', '/paper/positions'),
    paperPending: () => req('GET', '/paper/pending'),
    paperHistory: () => req('GET', '/paper/history'),
    paperLeaderboard: () => req('GET', '/paper/leaderboard'),
    paperOpen: (b) => req('POST', '/paper/open', b),
    paperModify: (id, b) => req('POST', `/paper/modify/${id}`, b),
    paperClose: (id) => req('POST', `/paper/close/${id}`),
    paperCancel: (id) => req('POST', `/paper/cancel/${id}`),
    paperReset: () => req('POST', '/paper/reset'),
};
