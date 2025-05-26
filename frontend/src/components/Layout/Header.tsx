import React, { useState } from 'react';
import { Search, Bell, Menu, X, MapPin, Settings, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useMap } from '../../contexts/MapContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [areaType, setAreaType] = useState('district');
    const [areaName, setAreaName] = useState('');
    const [timestamp, setTimestamp] = useState('');
    const { mapInstance: map } = useMap();

    const areaOptions = [
        'Market Street',
        'Downtown',
        'Mission District', // DEFAULT_DISTRICT = "Mission District, San Francisco, California, USA"
        'Nob Hill',
        'SOMA'
    ];
  // Date & Time pickers
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)  // YYYY-MM-DD
  );
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const h = new Date().getHours().toString().padStart(2, '0');
    return `${h}:00`;
  });
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
    }
  };


  const handlePredict = async () => {
    const fullTimestamp = `${selectedDate} ${selectedTime}`; // e.g., "2025-05-24 14:00"

    try {

        const response = await fetch('http://127.0.0.1:8001/predict', {

            method: 'POST',

            headers: {

              'Content-Type': 'application/json',

              'Accept': 'application/json'

            },

            body: JSON.stringify({

              area_type: areaType,

              area_name: areaName,

              timestamp: fullTimestamp

            }),

            mode: 'cors'

          });

        

        const result = await response.json();
        console.log(result)
        if (!map) {
            console.error("Map instance not found");
            return;
          }
          const toastId = toast.success((t) => (
            <div className="flex justify-between items-start gap-4">
              <div>{result.summary}</div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
          ), {
            duration: Infinity,
          });
        const colors = { 1: 'green', 2: 'orange', 3: 'red', 4: 'darkred' };
        const data = result.predictions;
        
        data.forEach(({ level, path }) => {
            console.log(`Drawing path for level ${level}:`, path);
            const coords = path.map(([lat, lng]) => ({ lat, lng }));
            map?.panTo(coords[0])
            new google.maps.Polyline({
              map,
              path: coords,
              geodesic: true,
              strokeColor: colors[level] || 'gray',
              strokeOpacity: 0.6,
              strokeWeight: 3,
              zIndex: 100 + level
            });
          });
    } catch (err) {

        console.error('Prediction error:', err);

    }

    };
  const handleDateChange = (

    e: React.ChangeEvent<HTMLInputElement>

  ) => {

    setSelectedDate(e.target.value);

    toast.success(`Date set to ${e.target.value}`);

  };



  const handleTimeChange = (

    e: React.ChangeEvent<HTMLInputElement>

  ) => {

    setTimestamp(e.target.value);
    console.log(`Time set to ${e.target.value}`);
    console.log(timestamp);
    toast.success(`Time set to ${e.target.value}`);

  };

  const notifications = [
    { id: 1, title: 'Traffic Alert', message: 'Heavy congestion on Market Street', time: '5m ago' },
    { id: 2, title: 'Project Update', message: 'Downtown renovation phase 1 complete', time: '1h ago' },
    { id: 3, title: 'System Update', message: 'New features available', time: '2h ago' }
  ];
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
            
            <div className="ml-4 flex items-center">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Pigeon</h1>
            </div>
          </div>

          {/* Search + Date + Time */}

          <div className="flex-1 flex items-center mx-4 space-x-4">

            {/* Search */}

            <div className="flex items-center gap-2 w-full">
  {/* Dropdown */}
  <select
    value={areaName}
    onChange={(e) => setAreaName(e.target.value)}
    className="pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white text-sm w-60"
  >
    <option value="" disabled>Select a district or street</option>
    {areaOptions.map((area) => (
      <option key={area} value={area}>{area}</option>
    ))}
  </select>

  {/* Predict Button */}
  <button
    type="button"
    onClick={handlePredict}
    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition text-sm"
  >
    Predict
  </button>

</div>


            {/* Date Picker */}

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                <Calendar className="h-5 w-5 text-gray-400" />

              </div>

              <input

                type="date"

                value={selectedDate}

                onChange={handleDateChange}

                className="block pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"

              />

            </div>



            {/* Time Picker (whole-hour only) */}

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                <Clock className="h-5 w-5 text-gray-400" />

              </div>

              <input

                type="time"

                step="3600"

                min="00:00"

                max="23:00"

                value={selectedTime}

                onChange={handleTimeChange}

                className="block pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"

              />

            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none relative"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50"
                  >
                    {notifications.map((n) => (

                    <div

                    key={n.id}

                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"

                    >

                    <p className="text-sm font-medium text-gray-900">

                        {n.title}

                    </p>

                    <p className="text-sm text-gray-500">

                        {n.message}

                    </p>

                    <p className="text-xs text-gray-400 mt-1">

                        {n.time}

                    </p>

                    </div>
                    ))}
                    <div className="border-t border-gray-100 mt-1">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                      >
                        View all notifications
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => toast.success('Settings panel coming soon!')}
            >
              <Settings className="h-6 w-6" />
            </motion.button>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white cursor-pointer"
              >
                CP
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;