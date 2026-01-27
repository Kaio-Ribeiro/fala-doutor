import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { ListPage } from './pages/List';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list/:module" element={<ListPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
