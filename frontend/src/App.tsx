import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { MapProvider } from './contexts/MapContext';
import GoogleMap from './components/Map/GoogleMap';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ProjectList from './components/Projects/ProjectList';
import DataDashboard from './components/Dashboard/DataDashboard';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_MAPS_API_KEY = '';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  React.useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      toast.error('Google Maps API key is required. Please add your API key in the App.tsx file.', {
        duration: 5000,
      });
    }
  }, []);

  return (
    <MapProvider>
      <div className="flex h-screen bg-gray-100">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-shrink-0"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[500px]">
                <GoogleMap apiKey={GOOGLE_MAPS_API_KEY} />
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-4"
              >
                <ProjectList />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <DataDashboard />
              </motion.div>
            </motion.div>
          </main>
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </MapProvider>
  );
}

export default App;