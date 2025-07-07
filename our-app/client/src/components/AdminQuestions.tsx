import React, { useEffect, useState } from "react";
import axios from "axios";

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
  questionText: "",
  options: ["", "", "", ""],
  correctOption: "A",
  topic: "",
  level: "",
  language: "",
};

const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = [ "Java", "Python", "C++", "JavaScript"];
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

const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/questions");
      setQuestions(res.data.questions || res.data || []);
    } catch (e) {
      setQuestions([]);
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

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation as needed
    await axios.post("/api/questions", form);
    setShowForm(false);
    setForm({ ...defaultForm });
    fetchQuestions();
  };

  const filteredQuestions = questions.filter(q =>
    (!search || q.questionText.toLowerCase().includes(search.toLowerCase())) &&
    (!filterTopic || q.topic === filterTopic) &&
    (!filterLevel || q.level === filterLevel) &&
    (!filterLanguage || q.language === filterLanguage)
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
      {showForm && (
        <div className="card mb-4 p-3">
          <h5>Add New Question</h5>
          <form onSubmit={handleAddQuestion}>
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
            <button className="btn btn-success mt-2" type="submit">Save</button>
            <button className="btn btn-link mt-2 ms-2" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}
      <div className="card p-3 mb-4">
        <div className="row g-2 align-items-center mb-2 w-100" style={{width: '100%'}}>
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
          <div className="col-md-3 flex-grow-1">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setFilterTopic(""); setFilterLevel(""); setFilterLanguage(""); }}>Clear Filters</button>
          </div>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {filteredQuestions.map(q => (
            <div className="card mb-3" key={q._id}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-2">{q.questionText}</h5>
                    <div className="mb-2">
                      <span className="badge bg-light text-dark me-2">{q.topic}</span>
                      <span className="badge bg-light text-dark me-2">{q.level}</span>
                      <span className="badge bg-light text-dark">{q.language}</span>
                    </div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-secondary me-2" title="Edit"><i className="bi bi-pencil" /></button>
                    <button className="btn btn-sm btn-outline-danger" title="Delete"><i className="bi bi-trash" /></button>
                  </div>
                </div>
                <div className="row mb-2">
                  {q.options.map((opt, idx) => (
                    <div className="col-6 col-md-3 mb-1" key={idx}>
                      <div className={`p-2 rounded ${q.correctOption === String.fromCharCode(65 + idx) ? "bg-success text-white" : "bg-light"}`}>
                        <b>{String.fromCharCode(65 + idx)}.</b> {opt}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-muted" style={{ fontSize: "0.95em" }}>Created: {q.createdAt ? q.createdAt.slice(0, 10) : "-"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
