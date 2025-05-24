import React from 'react';
import { motion } from 'framer-motion';
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
  AlertTriangle
} from 'lucide-react';
import { useMap } from '../../contexts/MapContext';
import { MapViewType } from '../../types';
import { toast } from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const { mapLayers, toggleLayer, mapView, setMapView, isMapLoaded } = useMap();

  const handleMapViewChange = (view: MapViewType) => {
    setMapView(view);
    toast.success(`Map view changed to ${view}`);
  };

  const menuItems = [
    { icon: <BarChart2 className="h-5 w-5" />, label: 'Analytics', onClick: () => toast.success('Analytics coming soon!') },
    { icon: <FileText className="h-5 w-5" />, label: 'Reports', onClick: () => toast.success('Reports feature coming soon!') },
    { icon: <Users className="h-5 w-5" />, label: 'Team', onClick: () => toast.success('Team management coming soon!') },
    { icon: <AlertTriangle className="h-5 w-5" />, label: 'Alerts', onClick: () => toast.success('Alerts center coming soon!') },
  ];

  return (
    <motion.div 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="bg-white h-full w-64 border-r border-gray-200 flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 flex items-center">
        <MapIcon className="h-6 w-6 text-blue-600" />
        <span className="ml-2 font-semibold text-lg">City Planner</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Map Views</h3>
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
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
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

        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Map Layers</h3>
          <div className="space-y-2">
            {mapLayers.map(layer => (
              <motion.button
                key={layer.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleLayer(layer.id)}
                disabled={!isMapLoaded}
                className={`flex items-center p-2 rounded-md w-full transition-colors duration-150 ${
                  layer.isVisible 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {layer.isVisible ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
                <span className="ml-3">{layer.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Access</h3>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={item.onClick}
                className="flex items-center p-2 rounded-md w-full text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toast.success('Settings panel coming soon!')}
          className="flex items-center p-2 rounded-md w-full text-gray-600 hover:bg-gray-50 transition-colors duration-150"
        >
          <Settings className="h-5 w-5" />
          <span className="ml-3">Settings</span>
        </motion.button>
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>City Planner Pro v1.0.0</p>
          <p className="mt-1">© 2025 All rights reserved</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;