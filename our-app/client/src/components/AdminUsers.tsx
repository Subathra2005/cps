import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status?: string;
  quizzes?: any[];
  customQuizzes?: any[];
  recommendedPath?: any;
}

const getStatus = (user: User) => {
  // Example: status field or fallback to 'Active' if not present
  return user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Active";
};

const getQuestionsCount = (user: User) => {
  return user.quizzes ? user.quizzes.length : 0;
};

const getAvgScore = (user: User) => {
  if (!user.quizzes || user.quizzes.length === 0) return "-";
  const total = user.quizzes.reduce((sum, q) => sum + (q.userScore || 0), 0);
  return Math.round((total / user.quizzes.length) * 100) / 100 + "%";
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizInfoMap, setQuizInfoMap] = useState<Record<string, any>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [customQuizInfoMap, setCustomQuizInfoMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/users");
        // Filter out users with role 'admin'
        const filteredUsers = (res.data.users || res.data || []).filter((u: User) => u.role !== 'admin');
        setUsers(filteredUsers);
      } catch (e) {
        setUsers([]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Fetch quiz details for all quizzes of all users
  useEffect(() => {
    const fetchQuizInfos = async () => {
      const quizIds = Array.from(new Set(users.flatMap(u => (u.quizzes || []).map(q => q.quizId?.$oid || q.quizId))));
      const infoMap: Record<string, any> = {};
      await Promise.all(
        quizIds.map(async (id) => {
          if (!id) return;
          try {
            const res = await axios.get(`/api/quizzes/${id}`);
            infoMap[id] = res.data;
          } catch {
            // ignore
          }
        })
      );
      setQuizInfoMap(infoMap);
    };
    if (users.length > 0) fetchQuizInfos();
  }, [users]);

  // Fetch custom quiz details for all users
  useEffect(() => {
    const fetchCustomQuizInfos = async () => {
      const customQuizIds = Array.from(new Set(users.flatMap(u => (u.customQuizzes || []).map(q => q.quizId?.$oid || q.quizId))));
      const infoMap: Record<string, any> = {};
      await Promise.all(
        customQuizIds.map(async (id) => {
          if (!id) return;
          try {
            const res = await axios.get(`/api/custom-quizzes/${id}`);
            infoMap[id] = res.data;
          } catch {
            // ignore
          }
        })
      );
      setCustomQuizInfoMap(infoMap);
    };
    if (users.length > 0) fetchCustomQuizInfos();
  }, [users]);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Manage Users</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="row g-4">
          {selectedUser ? (
            <div className="col-12">
              <button className="btn btn-outline-primary mb-3" onClick={() => setSelectedUser(null)}>
                <i className="bi bi-arrow-left" /> Back to Users
              </button>
              <div className="card shadow-lg border-0 mb-4" style={{ background: '#f8f9fa' }}>
                <div className="card-body">
                  <h3 className="mb-2 fw-bold text-primary">{selectedUser.name}</h3>
                  <div className="mb-1 text-muted fs-5">{selectedUser.email}</div>
                  <div className="mb-3"><b>Current Learning Path:</b> <span className="badge bg-info text-dark fs-6" style={{ wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '100%', display: 'inline-block', overflowWrap: 'anywhere', lineHeight: 2 }}>{selectedUser.recommendedPath?.path?.join(' → ') || 'N/A'}</span></div>
                  <div className="row mb-3">
                    <div className="col-md-4 mb-2"><b>Total Quizzes:</b> <span className="badge bg-secondary fs-6">{getQuestionsCount(selectedUser)}</span></div>
                    <div className="col-md-4 mb-2"><b>Total Violations:</b> <span className="badge bg-danger fs-6">{(selectedUser.quizzes ? selectedUser.quizzes.filter(q => q.violation).length : 0) + (selectedUser.customQuizzes ? selectedUser.customQuizzes.filter(q => q.violation).length : 0)}</span></div>
                    <div className="col-md-4 mb-2"><b>Avg Score:</b> <span className="badge bg-success fs-6">{getAvgScore(selectedUser)}</span></div>
                  </div>
                  <div className="mb-2"><b>Quiz Scores</b></div>
                  <ul className="mb-1 ps-0" style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {selectedUser.quizzes?.map((q, idx) => {
                      const quizId = q.quizId?.$oid || q.quizId;
                      const quizInfo = quizInfoMap[quizId];
                      const quizTitle = quizInfo?.title || quizInfo?.questionText || 'Quiz';
                      const quizTopic = quizInfo?.topic?.courseName || quizInfo?.topic || '-';
                      return (
                        <li key={quizId || idx} className="p-3 rounded shadow-sm border bg-white" style={{ minWidth: 220, maxWidth: 320 }}>
                          <div className="fw-semibold text-primary">{quizTitle}</div>
                          <div className="text-muted small">({quizTopic})</div>
                          <div className="mt-1">Score: <b>{q.userScore}</b> {q.violation ? <span className="badge bg-danger ms-2">Violation</span> : null}</div>
                        </li>
                      );
                    })}
                    {selectedUser.customQuizzes?.map((q, idx) => {
                      const quizId = q.quizId?.$oid || q.quizId;
                      const quizInfo = customQuizInfoMap[quizId];
                      const quizTitle = quizInfo?.customQuiz?.title || 'Custom Quiz';
                      return (
                        <li key={quizId || idx} className="p-3 rounded shadow-sm border bg-light" style={{ minWidth: 220, maxWidth: 320 }}>
                          <div className="fw-semibold text-info">{quizTitle}</div>
                          <div className="mt-1">Score: <b>{q.userScore}</b> {q.violation ? <span className="badge bg-danger ms-2">Violation</span> : null}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            users.map((user) => (
              <div className="col-12 col-md-6 col-lg-4" key={user._id}>
                <div className="card shadow h-100 border-0" style={{ cursor: 'pointer' }} onClick={() => setSelectedUser(user)}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0 text-primary fw-bold">{user.name}</h5>
                      <span className={`badge ${getStatus(user) === "Active" ? "bg-success" : "bg-secondary"}`}>{getStatus(user)}</span>
                    </div>
                    <div className="mb-1 text-muted fs-6">{user.email}</div>
                    <div className="mb-2"><b>Current Learning Path:</b> <span className="badge bg-info text-dark" style={{ wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '100%', display: 'inline-block', overflowWrap: 'anywhere', lineHeight: 2 }}>{user.recommendedPath?.path?.join(' → ') || 'N/A'}</span></div>
                    <div className="mb-2"><b>Total Quizzes:</b> <span className="badge bg-secondary">{getQuestionsCount(user)}</span></div>
                    <div className="mb-2"><b>Total Violations:</b> <span className="badge bg-danger">{(user.quizzes ? user.quizzes.filter(q => q.violation).length : 0) + (user.customQuizzes ? user.customQuizzes.filter(q => q.violation).length : 0)}</span></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
