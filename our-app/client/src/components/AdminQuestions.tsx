import React, { useEffect, useState } from "react";
import api from '../utils/api';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctOption: string;
  topic: string;
  level: string;
  language: string;
  createdAt: string;
}

const defaultForm = {
  title: "",
  questionText: "",
  options: ["", "", "", ""],
  correctOption: "A",
  topic: "",
  level: "",
  language: "",
};

const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["Java", "Python", "cpp", "JavaScript"];
const topics = [
  // Beginner Level
  'Arrays',
  'Recursion',
  'Strings',
  'Matrices',
  'Complexity Analysis',

  // Intermediate Level - Data Structures
  'Linked Lists',
  'Stacks',
  'Queues',
  'Hash Tables',
  'Trees',
  'Binary Trees',
  'Binary Search Trees',
  'Heaps',
  'Graphs',

  // Intermediate Level - Algorithms
  'Sorting Algorithms',
  'Searching Algorithms',
  'Binary Search',
  'Two Pointers',
  'Sliding Window',
  'Breadth-First Search (BFS)',
  'Depth-First Search (DFS)',

  // Advanced Level - Algorithm Paradigms
  'Dynamic Programming',
  'Greedy Algorithms',
  'Backtracking',
  'Divide and Conquer',

  // Advanced Level - Advanced Data Structures
  'AVL Trees',
  'Red-Black Trees',
  'B-Trees',
  'Tries',
  'Segment Trees',
  'Fenwick Trees',
  'Disjoint Set Union',
  'Suffix Arrays/Trees',

  // Advanced Level - Graph Algorithms
  "Dijkstra's Algorithm",
  "Bellman-Ford Algorithm",
  "Floyd-Warshall Algorithm",
  "Prim's Algorithm",
  "Kruskal's Algorithm",
  'Topological Sort'
];

const displayNameMap: Record<string, string> = {
  BinaryTrees: "Binary Trees",
  BinarySearchTrees: "Binary Search Trees",
  SortingAlgorithms: "Sorting Algorithms",
  SearchingAlgorithms: "Searching Algorithms",
  BFS: "Breadth-First Search (BFS)",
  DFS: "Depth-First Search (DFS)",
  DivideAndConquer: "Divide and Conquer",
  GreedyAlgorithms: "Greedy Algorithms",
  Backtracking: "Backtracking",
  ComplexityAnalysis: "Complexity Analysis",
  LinkedLists: "Linked Lists",
  HashTables: "Hash Tables",
  DynamicProgramming: "Dynamic Programming",
  DijkstrasAlgorithm: "Dijkstra's Algorithm",
  BellmanFordAlgorithm: "Bellman-Ford Algorithm",
  FloydWarshallAlgorithm: "Floyd-Warshall Algorithm",
  PrimsAlgorithm: "Prim's Algorithm",
  KruskalsAlgorithm: "Kruskal's Algorithm",
  TopologicalSort: "Topological Sort",
  AVLTrees: "AVL Trees",
  RedBlackTrees: "Red-Black Trees",
  BTrees: "B-Trees",
  Tries: "Tries",
  SegmentTrees: "Segment Trees",
  FenwickTrees: "Fenwick Trees",
  DisjointSetUnion: "Disjoint Set Union",
  SuffixArraysTrees: "Suffix Arrays/Trees",
  Strings: "Strings",
  Pointers: "Pointers",
  Matrices: "Matrices",
  BinarySearch: "Binary Search",
  TwoPointers: "Two Pointers",
  SlidingWindow: "Sliding Window",
  BinaryOperations: "Binary Operations"
};

// Create reverse mapping from display name to backend topic key
const reverseDisplayNameMap: Record<string, string> = Object.entries(displayNameMap).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [filterLanguage, filterLevel, filterTopic]);

  const fetchQuestions = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (filterLanguage && filterLevel && filterTopic) {
        // Convert C++ to cpp for API
        const langParam = filterLanguage === 'C++' ? 'cpp' : filterLanguage.toLowerCase();
        // Map display topic to backend topic key if possible
        let topicParam = reverseDisplayNameMap[filterTopic] || filterTopic;
        // If topic is an object with courseName, use that
        if (typeof filterTopic === 'object' && filterTopic !== null && 'courseName' in filterTopic) {
          topicParam = (filterTopic as any).courseName;
        }
        console.log('Fetching questions with:', { langParam, level: filterLevel.toLowerCase(), topic: topicParam });
        const res = await api.get(`/api/quizzes/lang/${langParam}/level/${filterLevel.toLowerCase()}/topic/${encodeURIComponent(topicParam)}`);
        let data = res.data;
        console.log('Fetched questions data:', data);
        // If data is a quiz object or array of quiz objects, extract questions
        if (Array.isArray(data)) {
          // If quiz objects have questions, flatten; else, treat each as a single-question quiz
          data = data.flatMap(qz => {
            if (qz.questions && Array.isArray(qz.questions)) {
              return qz.questions.map((q: any) => ({
                ...q,
                topic: qz.topic,
                level: qz.quizLevel || qz.level,
                language: qz.lang || qz.language,
                createdAt: qz.createdAt
              }));
            } else {
              // Treat as a single-question quiz object, ensure required fields
              return [{
                _id: qz._id,
                questionText: qz.questionText || '',
                options: qz.options || [],
                correctOption: qz.correctOption || 'A',
                topic: qz.topic,
                level: qz.quizLevel || qz.level,
                language: qz.lang || qz.language,
                createdAt: qz.createdAt
              }];
            }
          });
        } else if (data && data.questions) {
          // Single quiz object
          data = data.questions.map((q: any) => ({
            ...q,
            topic: data.topic,
            level: data.quizLevel || data.level,
            language: data.lang || data.language,
            createdAt: data.createdAt
          }));
        } else if (data && !Array.isArray(data)) {
          // Fallback: wrap in array if it's a single question
          data = [data];
        }
        setQuestions(data || []);
      } else {
        setQuestions([]);
      }
    } catch (e: any) {
      setQuestions([]);
      setError('Failed to fetch questions.');
      console.error('Fetch questions error:', e);
    }
    setLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, idx?: number) => {
    if (typeof idx === "number") {
      const newOptions = [...form.options];
      newOptions[idx] = e.target.value;
      setForm({ ...form, options: newOptions });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
    setForm({
      title: "", // Not used in edit mode
      questionText: question.questionText,
      options: question.options.map(opt => typeof opt === 'object' && opt !== null && 'optionText' in (opt as any) ? (opt as any).optionText : opt),
      correctOption: question.correctOption,
      topic: question.topic,
      level: question.level,
      language: question.language
    });
  };

  const handleDeleteQuestion = async (questionId: string, question: Question) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setLoading(true);
      setMessage(null);
      setError(null);
      try {
        const langParam = (question.language || filterLanguage) === 'C++' ? 'cpp' : (question.language || filterLanguage).toLowerCase();
        const levelParam = (question.level || filterLevel).toLowerCase();
        // Use correct topic string for URL with type guard
        let topicParam;
        if (
          question.topic &&
          typeof question.topic === 'object' &&
          question.topic !== null &&
          'courseName' in question.topic
        ) {
          topicParam = (question.topic as any).courseName;
        } else {
          topicParam = question.topic || filterTopic;
        }
        // Fetch the quiz first
        const getRes = await api.get(`/api/quizzes/lang/${langParam}/level/${levelParam}/topic/${encodeURIComponent(topicParam)}`);
        let payload = getRes.data;
        if (Array.isArray(payload) && payload.length > 0 && payload[0].questions) {
          payload = payload[0];
        }
        if (!payload || !payload.questions) {
          throw new Error("Quiz or questions not found for delete.");
        }
        // Remove the question from the questions array
        function getId(val: any) { return val?.$oid ?? val; }
        let updatedQuestions = payload.questions.filter((q: any) => getId(q._id) !== getId(questionId));
        // Map all options to correct object format before PUT
        const fixOptions = (opts: any[]) => opts.map((opt, i) =>
          typeof opt === 'object' && opt !== null && 'optionText' in opt
            ? opt
            : { optionText: opt, optionTag: String.fromCharCode(65 + i) }
        );
        updatedQuestions = updatedQuestions.map((q: any) => ({
          ...q,
          options: fixOptions(q.options || [])
        }));
        if (updatedQuestions.length === 0) {
          // If no questions left, delete the quiz
          await api.delete(`/api/quizzes/lang/${langParam}/level/${levelParam}/topic/${encodeURIComponent(topicParam)}`);
          setMessage('Quiz deleted as it had no questions left.');
        } else {
          // PUT the updated questions array to the edit endpoint
          await api.put(
            `/api/quizzes/lang/${langParam}/level/${levelParam}/topic/${encodeURIComponent(topicParam)}/edit`,
            { questions: updatedQuestions, role: 'admin' }
          );
          setMessage('Question deleted successfully.');
        }
        await fetchQuestions();
      } catch (e: any) {
        setError('Failed to delete question.');
        if (e.response) {
          console.error('Delete question error:', e.response.data);
        } else {
          console.error('Delete question error:', e);
        }
      }
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const langParam = form.language === 'C++' ? 'cpp' : form.language.toLowerCase();
    const topicParam = reverseDisplayNameMap[form.topic] || form.topic;

    try {
      if (editingQuestion) {
        // 1. fetch the quiz
        const getRes = await api.get(
          `/api/quizzes/lang/${langParam}/level/${form.level.toLowerCase()}/topic/${encodeURIComponent(topicParam)}`
        );
        let payload = getRes.data;

        // 2. Unwrap array if needed
        if (Array.isArray(payload) && payload.length > 0 && payload[0].questions) {
          payload = payload[0];
        }
        if (!payload || !payload.questions) {
          throw new Error("Quiz or questions not found for edit.");
        }

        // 3. Map & update
        function getId(val: any) { return val?.$oid ?? val; }
        const editingId = getId(editingQuestion._id);

        const updatedQuestions = payload.questions.map((q: any) => {
          const qid = getId(q._id);
          if (qid === editingId) {
            // rebuild options with their _id & optionTag intact
            const newOptions = (q.options as any[]).map((opt, i) => ({
              ...opt,
              optionText: form.options[i],
              optionTag: String.fromCharCode(65 + i),
            }));
            return {
              ...q,
              questionText: form.questionText,
              options: newOptions,
              correctOption: form.correctOption,
            };
          }
          return q;
        });

        // 4. Send your PUT
        await api.put(
          `/api/quizzes/lang/${langParam}/level/${form.level.toLowerCase()}/topic/${encodeURIComponent(topicParam)}/edit`,
          { questions: updatedQuestions, role: 'admin' }
        );

        await fetchQuestions();
        setMessage('Question updated successfully.');
        setEditingQuestion(null);
        setShowForm(false);
      } else {
        // Add mode: check if quiz exists for this lang/level/topic
        const getRes = await api.get(
          `/api/quizzes/lang/${langParam}/level/${form.level.toLowerCase()}/topic/${encodeURIComponent(topicParam)}`
        );
        let quizData = getRes.data;
        // Unwrap array if needed
        if (Array.isArray(quizData) && quizData.length > 0 && quizData[0].questions) {
          quizData = quizData[0];
        }
        const mappedOptions = form.options.map((opt, i) => ({
          optionText: opt,
          optionTag: String.fromCharCode(65 + i)
        }));
        const newQuestion = {
          questionText: form.questionText,
          options: mappedOptions,
          correctOption: form.correctOption
        };
        if (quizData && quizData.questions) {
          // Quiz exists: append question and PUT
          // Map all questions' options to correct object format
          const fixOptions = (opts: any[]) => opts.map((opt, i) =>
            typeof opt === 'object' && opt !== null && 'optionText' in opt
              ? opt
              : { optionText: opt, optionTag: String.fromCharCode(65 + i) }
          );
          const updatedQuestions = [
            ...quizData.questions.map((q: any) => ({
              ...q,
              options: fixOptions(q.options || [])
            })),
            newQuestion
          ];
          await api.put(
            `/api/quizzes/lang/${langParam}/level/${form.level.toLowerCase()}/topic/${encodeURIComponent(topicParam)}/edit`,
            {
              questions: updatedQuestions,
              role: 'admin'
            }
          );
          setMessage('Question added to existing quiz.');
        } else {
          // No quiz: create new quiz (ensure title is present)
          await api.post(
            `/api/quizzes/lang/${langParam}/level/${form.level.toLowerCase()}/topic/${encodeURIComponent(topicParam)}/submit`,
            {
              title: form.title || `${form.language} ${form.topic} - ${form.level}`,
              lang: langParam,
              quizLevel: form.level.toLowerCase(),
              topic: topicParam,
              questions: [newQuestion],
              role: 'admin'
            }
          );
          setMessage('New quiz created and question added.');
        }
        setShowForm(false);
        setForm({ ...defaultForm });
        await fetchQuestions();
      }
    } catch (err: any) {
      setError(editingQuestion ? 'Failed to update question.' : 'Failed to add question.');
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q =>
    (!search || q.questionText.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Questions Management</h2>
          <div className="text-muted" style={{ fontSize: "1.1em" }}>Manage quiz questions and content</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Question
        </button>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {showForm && (
        <div className="card mb-4 p-3">
          <h5>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h5>
          <form onSubmit={handleAddQuestion}>
            {!editingQuestion && (
              <div className="mb-2">
                <label className="form-label">Quiz Title</label>
                <input className="form-control" name="title" value={form.title} onChange={handleFormChange} required />
              </div>
            )}
            <div className="mb-2">
              <label className="form-label">Question</label>
              <input className="form-control" name="questionText" value={form.questionText} onChange={handleFormChange} required />
            </div>
            <div className="mb-2">
              <label className="form-label">Options</label>
              {form.options.map((opt, idx) => (
                <input
                  key={idx}
                  className="form-control mb-1"
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={e => handleFormChange(e, idx)}
                  required
                />
              ))}
            </div>
            <div className="mb-2">
              <label className="form-label">Correct Option</label>
              <select className="form-select" name="correctOption" value={form.correctOption} onChange={handleFormChange} required>
                {form.options.map((_, idx) => (
                  <option key={idx} value={String.fromCharCode(65 + idx)}>
                    {String.fromCharCode(65 + idx)}
                  </option>
                ))}
              </select>
            </div>
            <div className="row mb-2">
              <div className="col">
                <label className="form-label">Topic</label>
                <select className="form-select" name="topic" value={form.topic} onChange={handleFormChange} required>
                  <option value="">Select Topic</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col">
                <label className="form-label">Level</label>
                <select className="form-select" name="level" value={form.level} onChange={handleFormChange} required>
                  <option value="">Select Level</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="col">
                <label className="form-label">Language</label>
                <select className="form-select" name="language" value={form.language} onChange={handleFormChange} required>
                  <option value="">Select Language</option>
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-success mt-2" type="submit" disabled={loading}>{editingQuestion ? 'Update' : 'Save'}</button>
            {editingQuestion && (
              <button className="btn btn-link mt-2 ms-2" type="button" onClick={() => { setShowForm(false); setEditingQuestion(null); setForm({ ...defaultForm }); }}>Cancel</button>
            )}
            {!editingQuestion && (
              <button className="btn btn-link mt-2 ms-2" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            )}
          </form>
        </div>
      )}
      <div className="card p-3 mb-4">
        <div className="row g-2 align-items-center mb-2 w-100" style={{ width: '100%' }}>
          <div className="col-md-3 flex-grow-1">
            <select className="form-select w-100" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}>
              <option value="">All Topics</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-3 flex-grow-1">
            <select className="form-select w-100" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
              <option value="">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="col-md-3 flex-grow-1">
            <select className="form-select w-100" value={filterLanguage} onChange={e => setFilterLanguage(e.target.value)}>
              <option value="">All Languages</option>
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="col-md-3 flex-grow-1 d-flex gap-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setFilterTopic(""); setFilterLevel(""); setFilterLanguage(""); }}>Clear Filters</button>
            <button className="btn btn-primary w-100" onClick={fetchQuestions}>Get Questions</button>
          </div>
        </div>
      </div>
      <button className="btn btn-sm btn-outline-info mb-2" onClick={fetchQuestions} disabled={loading}>
        Force Refresh
      </button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {filteredQuestions.length === 0 ? (
            <div className="alert alert-info">No questions found for the selected filters.</div>
          ) : (
            filteredQuestions.map(q => (
              <div className="card mb-3" key={q._id}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="mb-2">{q.questionText}</h5>
                      <div className="mb-2">
                        <span className="badge bg-light text-dark me-2">{
                          q.topic && typeof q.topic === 'object' && 'courseName' in q.topic
                            ? (q.topic as any).courseName
                            : q.topic
                        }</span>
                        <span className="badge bg-light text-dark me-2">{q.level}</span>
                        <span className="badge bg-light text-dark">{q.language}</span>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2" title="Edit" onClick={() => handleEditQuestion(q)}><i className="bi bi-pencil" /></button>
                      <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteQuestion(q._id, q)}><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                  <div className="row mb-2">
                    {(q.options || []).map((opt, idx) => {
                      // Support both string and object option
                      const optionText = typeof opt === 'object' && opt !== null && 'optionText' in (opt as any) ? (opt as any).optionText : opt;
                      return (
                        <div className={`col-6 col-md-3 mb-1`} key={idx}>
                          <div className={`p-2 rounded ${q.correctOption === String.fromCharCode(65 + idx) ? "bg-success text-white" : "bg-light"}`}>
                            <b>{String.fromCharCode(65 + idx)}.</b> {optionText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.95em" }}>Created: {q.createdAt ? q.createdAt.slice(0, 10) : "-"}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
