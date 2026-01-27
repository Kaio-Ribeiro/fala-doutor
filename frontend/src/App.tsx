import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { ListPage } from './pages/List';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list/:module" element={<ListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
