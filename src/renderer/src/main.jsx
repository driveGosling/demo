import './styles.css';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { Routes, Route, HashRouter } from 'react-router';
import App from './App';
import CreatePartner from './CreatePartner';
import UpdatePartner from './UpdatePartner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/update" element={<UpdatePartner />} />
        <Route path="/create" element={<CreatePartner />} />
      </Routes>
    </StrictMode>
  </HashRouter>
);
