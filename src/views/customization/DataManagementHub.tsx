import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings2, BookA, FileDown, Database, BookOpen, Search, X } from 'lucide-react';
import { useAppContext } from '../../AppContext';

export default function DataManagementHub() {
  const { spellLists, languages, spells } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = [
    {
      title: "Magic & Spells",
      icon: <BookOpen className="text-purple-500" size={24} />,
      links: [
        { name: "Spell Lists", path: "lists", description: `Manage ${spellLists.length} spell lists.`, icon: <Settings2 size={16} /> },
        { name: "Global Spell Library", path: "spells", description: `Browse and edit all ${spells.length} spells.`, icon: <BookA size={16} /> },
      ]
    },
    {
      title: "World Lore",
      icon: <Database className="text-amber-500" size={24} />,
      links: [
        { name: "Language Tables", path: "languages", description: `Adjust probabilities for ${languages.length} languages.`, icon: <BookA size={16} /> },
        { name: "World Type", path: "world-type", description: "Set default campaign setting flavor.", icon: <Settings2 size={16} /> }
      ]
    },
    {
      title: "System",
      icon: <Settings2 className="text-blue-500" size={24} />,
      links: [
        { name: "Import & Export", path: "import-export", description: "Backup and restore via YAML.", icon: <FileDown size={16} /> }
      ]
    }
  ];

  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    links: cat.links.filter(link => 
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.links.length > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-2">
        <div>
          <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Judge Data Management</h2>
          <p className="text-muted text-sm">Organize and customize all generation tables, magic capabilities, and lore specifics for your campaign world.</p>
        </div>
        
        <div className="relative w-full md:w-72 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search data modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-app rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:border-accent transition-colors shadow-sm text-main"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-main"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {filteredCategories.length === 0 ? (
        <div className="py-12 text-center bg-app rounded-2xl border border-dashed border-app">
          <Database size={48} className="mx-auto text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-main mb-1">No data modules found</h3>
          <p className="text-muted text-sm">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, idx) => (
            <div key={idx} className="bg-surface border border-app rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-app rounded-lg border border-app shadow-inner">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-lg text-main">{category.title}</h3>
              </div>
              
              <div className="flex-1 space-y-3 flex flex-col justify-start">
                {category.links.map(link => (
                  <NavLink 
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) => `block p-4 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-accent/5 border-accent shadow-sm' 
                        : 'bg-app border-app hover:border-accent hover:shadow-sm group'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-muted group-hover:text-accent transition-colors">{link.icon}</span>
                      <span className="font-medium text-main group-hover:text-accent transition-colors">{link.name}</span>
                    </div>
                    <p className="text-xs text-muted leading-tight ml-6">{link.description}</p>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
