import React, { useState } from 'react';

declare global {
  interface ImportMeta {
    env: {
      VITE_GEMINI_API_KEY: string;
    };
  }
}

const apiKey: string = import.meta.env.VITE_GEMINI_API_KEY;

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

interface ChatbotPageProps {
  isQuizActive: boolean;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ isQuizActive }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Welcome! I can help you with DSA topics and how to use the DSA Recommendation System app. Please ask your question." }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const allowedKeywords: string[] = [
    // DSA topics
    'dsa', 'data structure', 'data structures', 'algorithm', 'algorithms', 'array', 'arrays', 'linked list', 'linked lists', 'stack', 'queue', 'tree', 'trees', 'binary tree', 'binary search tree', 'bst', 'avl tree', 'red black tree', 'heap', 'heaps', 'priority queue', 'graph', 'graphs', 'adjacency list', 'adjacency matrix', 'bfs', 'dfs', 'breadth first search', 'depth first search', 'topological sort', 'dijkstra', 'bellman ford', 'floyd warshall', 'kruskal', 'prim', 'minimum spanning tree', 'mst', 'shortest path', 'hash', 'hash table', 'hash map', 'hashing', 'set', 'map', 'dictionary', 'trie', 'segment tree', 'fenwick tree', 'binary indexed tree', 'suffix tree', 'suffix array', 'disjoint set', 'union find', 'recursion', 'dynamic programming', 'dp', 'memoization', 'tabulation', 'greedy', 'divide and conquer', 'backtracking', 'sliding window', 'two pointer', 'bit manipulation', 'sorting', 'searching', 'binary search', 'linear search', 'merge sort', 'quick sort', 'bubble sort', 'selection sort', 'insertion sort', 'counting sort', 'radix sort', 'bucket sort', 'shell sort', 'top k', 'kth largest', 'kth smallest', 'lru cache', 'lfu cache', 'time complexity', 'space complexity', 'big o', 'big o notation', 'asymptotic', 'complexity', 'optimization', 'coding problem', 'leetcode', 'hackerrank', 'competitive programming',
    // App usage
    'quiz', 'score', 'login', 'signup', 'register', 'language', 'java', 'python', 'c++', 'javascript', 'how to use', 'app', 'recommendation', 'user guide', 'help', 'instructions', 'features', 'usage', 'start', 'account', 'select language', 'choose language', 'test', 'exam', 'assessment', 'easy', 'intermediate', 'difficult', 'hard', 'level', 'levels', 'progress', 'marks', 'grade', 'tracking', 'achievement', 'badge', 'streak', 'performance', 'mode', 'learning mode', 'theory', 'practice', 'theory mode', 'practice mode', 'quiz mode', 'step', 'steps', 'tutorial', 'walkthrough', 'beginner', 'getting started', 'first time', 'new user'
  ];

  const isAllowed = (question: string): boolean => {
    return allowedKeywords.some(keyword => question.toLowerCase().includes(keyword));
  };

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || isQuizActive) return;
    const userMsg: Message = { sender: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    // Out-of-context filter
    if (!isAllowed(input)) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: "Sorry, I can only help with DSA topics or how to use the DSA Recommendation System app." }]);
      setLoading(false);
      return;
    }

    // Add context to short user inputs
    let userInput = input.trim();
    if (userInput.split(/\s+/).length <= 3) {
      userInput = `Explain this in the context of DSA or the app: ${userInput}`;
    }

    try {
      const prompt = `You are an expert assistant for the DSA Recommendation System app. User: ${userInput}`;
      const payload = {
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response.";
      setMessages(msgs => [...msgs, { sender: 'bot', text: botText }]);
    } catch (e) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: "Sorry, there was an error connecting to the assistant." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', fontFamily: 'Segoe UI, sans-serif', border: 'none', minHeight: 0, flex: 1 }}>
      <div style={{ background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)', padding: '12px 20px 8px 20px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: '#fff', fontWeight: 700, letterSpacing: 1, fontSize: 28 }}>DSA Chatbot</h2>
        <div style={{ fontSize: 22, marginTop: 2 }}>🤖</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.95)', padding: '8px 12px', minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', margin: '12px 0' }}>
            <span style={{
              background: msg.sender === 'bot' ? '#f8f9fa' : 'linear-gradient(90deg, #f7971e 0%,rgb(242, 236, 71) 100%)',
              color: msg.sender === 'bot' ? '#333' : '#222',
              padding: '10px 16px',
              borderRadius: msg.sender === 'bot' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
              display: 'inline-block',
              fontWeight: msg.sender === 'bot' ? 700 : 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}>{msg.text}</span>
          </div>
        ))}
        {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Bot is typing...</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.95)', padding: '10px 12px', borderTop: '1px solid #eee', position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
        <input
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #bbb', fontSize: 16, outline: 'none', background: '#f8fafc', color: '#222', fontWeight: 500 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={isQuizActive ? "Chatbot is locked during quiz." : "Ask about DSA or the app..."}
          disabled={loading || isQuizActive}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim() || isQuizActive}
          style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 20px', fontWeight: 700, fontSize: 16, cursor: loading || isQuizActive ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(102,126,234,0.15)' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotPage;