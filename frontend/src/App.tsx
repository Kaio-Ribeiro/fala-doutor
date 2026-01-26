import { useState } from 'react';
import { HomePage } from './pages/Home';
import { ListPage } from './pages/List';

type ModuleType = 'doctors' | 'patients';

export function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);

  return currentPage === 'home' ? (
    <HomePage
      onSelectModule={(module) => {
        setSelectedModule(module);
        setCurrentPage('list');
      }}
    />
  ) : (
    <ListPage
      module={selectedModule}
      onBack={() => {
        setSelectedModule(null);
        setCurrentPage('home');
      }}
    />
  );
}
