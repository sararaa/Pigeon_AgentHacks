// frontend/src/components/Layout/Header.tsx

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  MapPin,
  Settings,
  Calendar,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  isSidebarOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

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

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedDate(e.target.value);
    toast.success(`Date set to ${e.target.value}`);
  };

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedTime(e.target.value);
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

          {/* Sidebar toggle + logo */}
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
            <div className="ml-4 flex items-center">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                City Planner Pro
              </h1>
            </div>
          </div>

          {/* Search + Date + Time */}
          <div className="flex-1 flex items-center mx-4 space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations, projects, or reports…"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              />
            </form>

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

          {/* Notifications, Settings, Avatar */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
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

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => toast.success('Settings panel coming soon!')}
            >
              <Settings className="h-6 w-6" />
            </motion.button>

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white cursor-pointer"
            >
              CP
            </motion.div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
