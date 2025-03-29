import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChatProvider } from './hooks/useChat';
import { ChatPage } from './pages/ChatPage';
import { UploadPage } from './pages/UploadPage';

function App() {
  return (
    <ChatProvider>
      <Router>
        <nav>
          <Link to="/">Chat</Link>
          <Link to="/upload">Upload PDF</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
}

export default App;