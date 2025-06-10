import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { MapProvider } from './contexts/MapContext';
import { ThemeProvider } from './contexts/ThemeContext';
import GoogleMap from './components/Map/GoogleMap';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ProjectList from './components/Projects/ProjectList';
import DataDashboard from './components/Dashboard/DataDashboard';
import AnalyticsOverview from './components/Analytics/AnalyticsOverview';
import DarkModeToggle from './components/DarkModeToggle';
import ProjectsPage from './components/Projects/ProjectsPage';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAoH0FX8uQBoOHRIUnghIJBQUaNF-Bw-uQ';

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<'map' | 'analytics' | 'quick-access'>('map');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
        setCurrentView={setCurrentView}
        currentView={currentView}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentView === 'map' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="container mx-auto px-6 py-8 space-y-6"
              >
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-[500px]">
                    <GoogleMap apiKey={GOOGLE_MAPS_API_KEY} />
                  </div>
                  <ProjectList />
                  <DataDashboard />
                </div>
              </motion.div>
            ) : currentView === 'analytics' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="container mx-auto px-6 py-8"
              >
                <AnalyticsOverview />
              </motion.div>
            ) : (
              <motion.div
                key="quick-access"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="container mx-auto px-6 py-8"
              >
                <ProjectsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

const App = () => {
  React.useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      toast.error('Google Maps API key is required. Please add your API key in the App.tsx file.', {
        duration: 5000,
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <MapProvider>
        <AppContent />
        <DarkModeToggle />
      </MapProvider>
    </ThemeProvider>
  );
};

export default App;