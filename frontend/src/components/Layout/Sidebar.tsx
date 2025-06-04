import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Map as MapIcon, 
  Eye, 
  EyeOff, 
  Sun, 
  Mountain, 
  Image,
  BarChart2,
  Settings,
  FileText,
  Users,
  AlertTriangle,
  Home,
  FolderOpen
} from 'lucide-react';
import { useMap } from '../../contexts/MapContext';
import { MapViewType } from '../../types';
import { toast } from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  setCurrentView: (view: 'map' | 'analytics' | 'quick-access') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, setCurrentView }) => {
  const { mapLayers, toggleLayer, mapView, setMapView, isMapLoaded } = useMap();

  const handleMapViewChange = (view: MapViewType) => {
    setMapView(view);
    toast.success(`Map view changed to ${view}`);
  };

  const handleLayerToggle = (layerId: string) => {
    if (isMapLoaded) {
      toggleLayer(layerId);
      toast.success(`${layerId} layer ${mapLayers.find(l => l.id === layerId)?.isVisible ? 'hidden' : 'shown'}`);
    } else {
      toast.error('Please wait for the map to load');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-200"
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <MapIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 font-semibold text-lg text-gray-900 dark:text-gray-100">City Planner</span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Map Views</h3>
                <div className="space-y-2">
                  {['standard', 'satellite', 'terrain'].map((view) => (
                    <motion.button 
                      key={view}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMapViewChange(view as MapViewType)}
                      disabled={!isMapLoaded}
                      className={`flex items-center p-2 rounded-md w-full transition-colors duration-150 ${
                        mapView === view 
                          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {view === 'standard' && <MapIcon className="h-5 w-5" />}
                      {view === 'satellite' && <Image className="h-5 w-5" />}
                      {view === 'terrain' && <Mountain className="h-5 w-5" />}
                      <span className="ml-3 capitalize">{view}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Map Layers</h3>
                <div className="space-y-2">
                  {mapLayers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => handleLayerToggle(layer.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors duration-200
                        ${layer.isVisible
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        } hover:bg-blue-50 dark:hover:bg-blue-800`}
                    >
                      <span className="flex items-center gap-2">
                        {layer.icon === 'car' && <MapIcon className="h-5 w-5" />}
                        {layer.icon === 'parking' && <BarChart2 className="h-5 w-5" />}
                        {layer.icon === 'building' && <Settings className="h-5 w-5" />}
                        {layer.name}
                      </span>
                      {layer.isVisible ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Access</h3>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView('map')}
                    className="flex items-center p-2 rounded-md w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <MapIcon className="h-5 w-5" />
                    <span className="ml-3">Map View</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView('quick-access')}
                    className="flex items-center p-2 rounded-md w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <FolderOpen className="h-5 w-5" />
                    <span className="ml-3">Projects</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView('analytics')}
                    className="flex items-center p-2 rounded-md w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <BarChart2 className="h-5 w-5" />
                    <span className="ml-3">Analytics</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.success('Reports feature coming soon!')}
                    className="flex items-center p-2 rounded-md w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="ml-3">Reports</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.success('Team management coming soon!')}
                    className="flex items-center p-2 rounded-md w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <Users className="h-5 w-5" />
                    <span className="ml-3">Team</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.success('Alerts center coming soon!')}
                    className="flex items-center p-2 rounded-md w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span className="ml-3">Alerts</span>
                  </motion.button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.success('Settings panel coming soon!')}
                className="flex items-center p-2 rounded-md w-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <Settings className="h-5 w-5" />
                <span className="ml-3">Settings</span>
              </motion.button>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                <p>City Planner Pro v1.0.0</p>
                <p className="mt-1">© 2025 All rights reserved</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;