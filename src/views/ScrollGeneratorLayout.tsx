import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Scroll, Settings2, Bookmark } from 'lucide-react';

export default function ScrollGeneratorLayout() {
  return (
    <div className="space-y-6">
      <nav className="flex space-x-1 border border-app bg-surface rounded-full p-1 shadow-sm w-max mb-6">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center space-x-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
        >
          <Scroll size={16} />
          <span className="hidden sm:inline">Generator</span>
        </NavLink>
        <NavLink
          to="/customization"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
        >
          <Settings2 size={16} />
          <span className="hidden sm:inline">Customization</span>
        </NavLink>
        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `flex items-center space-x-2 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-main hover:bg-gray-100 dark:hover:bg-gray-800'
            }`
          }
        >
          <Bookmark size={16} />
          <span className="hidden sm:inline">Saved</span>
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
