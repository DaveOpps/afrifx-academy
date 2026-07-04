const BASE = '/api';

function getToken() { return localStorage.getItem('afrifx_token'); }

async function req(method: string, path: string, body?: unknown) {
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
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function upload(path: string, formData: FormData) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export const api = {
  // Auth
  register: (b: unknown) => req('POST', '/auth/register', b),
  login:    (b: unknown) => req('POST', '/auth/login', b),
  me:       ()           => req('GET',  '/auth/me'),
  updateMe: (b: unknown) => req('PUT',  '/auth/me', b),
  changePassword: (b: unknown) => req('PUT', '/auth/password', b),
  forgotPassword: (email: string) => req('POST', '/auth/forgot', { email }),
  resetPassword:  (token: string, newPassword: string) => req('POST', '/auth/reset', { token, newPassword }),

  // Courses
  getCourses:  ()        => req('GET',  '/courses'),
  getCourse:   (id: number) => req('GET', `/courses/${id}`),
  createCourse:(b: unknown) => req('POST','/courses', b),
  updateCourse:(id: number, b: unknown) => req('PUT', `/courses/${id}`, b),
  deleteCourse:(id: number) => req('DELETE', `/courses/${id}`),
  addModule:   (courseId: number, b: unknown) => req('POST', `/courses/${courseId}/modules`, b),
  deleteModule:(courseId: number, moduleId: number) => req('DELETE', `/courses/${courseId}/modules/${moduleId}`),

  // Lessons
  getLesson:   (id: number) => req('GET',  `/lessons/${id}`),
  addLesson:   (b: unknown) => req('POST', '/lessons', b),
  updateLesson:(id: number, b: unknown) => req('PUT', `/lessons/${id}`, b),
  deleteLesson:(id: number) => req('DELETE', `/lessons/${id}`),

  // Enrollments
  enroll:      (courseId: number) => req('POST', '/enrollments', { courseId }),
  myEnrollments: ()               => req('GET',  '/enrollments/my'),

  // Progress
  markWatched: (lessonId: number) => req('POST', '/progress', { lessonId }),
  myProgress:  (courseId: number) => req('GET',  `/progress/my/${courseId}`),

  // Quizzes
  getQuiz:     (id: number)       => req('GET',  `/quizzes/${id}`),
  submitQuiz:  (id: number, answers: number[]) => req('POST', `/quizzes/${id}/submit`, { answers }),
  createQuiz:  (b: unknown)       => req('POST', '/quizzes', b),
  updateQuiz:  (id: number, questions: unknown) => req('PUT', `/quizzes/${id}`, { questions }),
  deleteQuiz:  (id: number)       => req('DELETE', `/quizzes/${id}`),

  // Certificates
  myCerts:     ()                 => req('GET',  '/certificates/my'),
  claimCert:   (courseId: number) => req('POST', '/certificates/claim', { courseId }),

  // Reviews
  courseReviews: (courseId: number) => req('GET', `/reviews/course/${courseId}`),
  myReview:      (courseId: number) => req('GET', `/reviews/my/${courseId}`),
  submitReview:  (b: unknown)       => req('POST', '/reviews', b),

  // Announcements
  announcements:      ()           => req('GET',  '/announcements'),
  markAnnRead:        (id: number) => req('POST', `/announcements/${id}/read`),
  markAllAnnRead:     ()           => req('POST', '/announcements/read-all'),
  allAnnouncements:   ()           => req('GET',  '/announcements/all'),
  createAnnouncement: (b: unknown) => req('POST', '/announcements', b),
  deleteAnnouncement: (id: number) => req('DELETE', `/announcements/${id}`),

  // Gamification
  myGamification: () => req('GET', '/gamification/me'),
  myActivity:     () => req('GET', '/gamification/activity'),
  leaderboard:    () => req('GET', '/gamification/leaderboard'),

  // Resources
  lessonResources: (lessonId: number) => req('GET', `/resources/lesson/${lessonId}`),
  uploadResource:  (fd: FormData)      => upload('/resources/upload', fd),
  addResourceLink: (b: unknown)        => req('POST', '/resources/link', b),
  deleteResource:  (id: number)        => req('DELETE', `/resources/${id}`),

  // Meetings
  meetings:        ()           => req('GET',  '/meetings'),
  nextMeeting:     ()           => req('GET',  '/meetings/next'),
  createMeeting:   (b: unknown) => req('POST', '/meetings', b),
  deleteMeeting:   (id: number) => req('DELETE', `/meetings/${id}`),
  googleStatus:    ()           => req('GET',  '/meetings/google/status'),
  googleAuthUrl:   ()           => req('GET',  '/meetings/google/auth'),
  googleDisconnect:()           => req('POST', '/meetings/google/disconnect'),

  // Signals
  getSignals:   (params?: string)  => req('GET',  `/signals${params ? '?' + params : ''}`),
  getLatestSignals: ()             => req('GET',  '/signals/latest'),
  createSignal: (b: unknown)       => req('POST', '/signals', b),
  updateSignal: (id: number, b: unknown) => req('PUT', `/signals/${id}`, b),
  deleteSignal: (id: number)       => req('DELETE', `/signals/${id}`),

  signalPerformance: ()            => req('GET',  '/signals/performance'),

  // Certificate verification (public)
  verifyCert:   (code: string)     => req('GET',  `/certificates/verify/${code}`),

  // Personal dashboard full snapshot
  meFull: () => req('GET', '/auth/me/full'),

  // Assignments
  moduleAssignments: (moduleId: number) => req('GET', `/assignments/module/${moduleId}`),
  submitAssignment:  (id: number, content: string, fileUrl?: string) => req('POST', `/assignments/${id}/submit`, { content, fileUrl }),
  createAssignment:  (b: unknown) => req('POST', '/assignments', b),
  assignmentSubmissions: (id: number) => req('GET', `/assignments/${id}/submissions`),
  gradeSubmission:   (id: number, grade: number, feedback: string) => req('PUT', `/assignments/submissions/${id}/grade`, { grade, feedback }),

  // Membership & subscriptions
  membershipStatus: ()             => req('GET',  '/membership/status'),
  upgradeTier:      (tier: string) => req('POST', '/membership/upgrade', { tier }),
  subscribeSignals: ()             => req('POST', '/membership/subscribe-signals'),
  myPayments:       ()             => req('GET',  '/membership/payments'),

  // Applications (partnerships)
  submitApplication: (b: unknown)  => req('POST', '/applications', b),
  listApplications:  ()            => req('GET',  '/applications'),
  setApplicationStatus: (id: number, status: string) => req('PUT', `/applications/${id}`, { status }),
  deleteApplication: (id: number)  => req('DELETE', `/applications/${id}`),

  // Admin
  adminStats:   ()                 => req('GET',  '/admin/stats'),
  setStudentRole: (id: number, role: string) => req('POST', `/admin/students/${id}/role`, { role }),
  adminAnalytics: ()               => req('GET',  '/admin/analytics'),
  adminStudents:()                 => req('GET',  '/admin/students'),
  adminStudent: (id: number)       => req('GET',  `/admin/students/${id}`),
  adminStudentTrades: (id: number) => req('GET',  `/admin/students/${id}/trades`),
  adminQuizPerformance: ()         => req('GET',  '/admin/quiz-performance'),
  adminCerts:   ()                 => req('GET',  '/admin/certificates'),
  issueCert:    (b: unknown)       => req('POST', '/admin/certificates/issue', b),
  resetStudentPassword: (id: number, newPassword: string) => req('POST', `/admin/students/${id}/reset-password`, { newPassword }),

  // Paper trading (demo)
  paperInstruments: () => req('GET', '/paper/instruments'),
  paperAccount:     () => req('GET', '/paper/account'),
  paperPositions:   () => req('GET', '/paper/positions'),
  paperPending:     () => req('GET', '/paper/pending'),
  paperHistory:     () => req('GET', '/paper/history'),
  paperLeaderboard: () => req('GET', '/paper/leaderboard'),
  paperOpen:  (b: { symbol: string; side: string; lots: number; sl?: number | null; tp?: number | null; orderType?: string; price?: number; limitPrice?: number }) => req('POST', '/paper/open', b),
  paperModify: (id: number, b: { sl?: number | null; tp?: number | null }) => req('POST', `/paper/modify/${id}`, b),
  paperClose: (id: number) => req('POST', `/paper/close/${id}`),
  paperCancel: (id: number) => req('POST', `/paper/cancel/${id}`),
  paperReset: () => req('POST', '/paper/reset'),
};
