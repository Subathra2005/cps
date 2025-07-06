import React, { useState } from 'react';
import axios from 'axios';

const allConcepts = [
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
  HashTables: "Hash Tables",
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

interface Props {
  userId: string;
  language: string;
  onNext: () => void;
}

const Step2_Assessment: React.FC<Props> = ({ userId, language, onNext }) => {
  const [known, setKnown] = useState<string[]>([]);

  const toggleKnown = (concept: string) => {
    setKnown((prev) =>
      prev.includes(concept)
        ? prev.filter((c) => c !== concept)
        : [...prev, concept]
    );
  };

  const handleSubmit = async () => {
    // Map known concepts to backend course names
    const completedCourses = known.map((concept) => {
      const backendName = Object.keys(displayNameMap).find(
        (key) => displayNameMap[key] === concept
      );
      return backendName || concept; // Fallback to concept if no mapping found
    });

    console.log('Submitting assessment with completed courses:', completedCourses);
    try {
      const res = await axios.post(`/api/users/${userId}/update-user-courses?status=enrolled`, {
        completedCourses: completedCourses
      });
      if (res.status === 200) {
        console.log('Assessment saved successfully:', res.data);
        onNext();
      } else {
        console.error('Assessment submission failed:', res.data);
        alert(`Failed to submit assessment: ${res.data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      if (error.response) {
        console.error('Assessment submission failed:', error.response.data);
        alert(`Failed to submit assessment: ${error.response.data.error || 'Unknown error'}`);
      } else {
        console.error('Network error:', error);
        alert("Network error. Please check your connection and try again.");
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">Assessment</h1>
        <p className="lead text-muted">Choose your topics to get started</p>
      </div>
      
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {/* Known Concepts Section */}
          <div className="mb-5">
            <h3 className="h4 fw-bold mb-4">What topics do you already know?</h3>
            <div className="row g-3">
              {allConcepts.map((c) => (
                <div key={c} className="col-md-4 col-sm-6">
                  <div 
                    className={`card border-2 cursor-pointer h-100 ${known.includes(c) ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => toggleKnown(c)}
                    onMouseEnter={(e) => {
                      if (!known.includes(c)) {
                        e.currentTarget.style.borderColor = '#0d6efd';
                        e.currentTarget.style.backgroundColor = '#f8f9ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!known.includes(c)) {
                        e.currentTarget.style.borderColor = '#dee2e6';
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div className="card-body py-4 text-center">
                      <h5 className="card-title mb-0 fw-semibold">{c}</h5>
                      {known.includes(c) && (
                        <div className="mt-2">
                          <span className="badge bg-primary">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="d-flex gap-3 justify-content-end">
            <button
              className="btn btn-primary btn-lg px-4"
              disabled={known.length === 0}
              onClick={handleSubmit}
              style={{
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2_Assessment;