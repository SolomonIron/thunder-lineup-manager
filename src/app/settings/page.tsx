"use client";

import { useState } from 'react';
import { FaSave, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';

// Mock settings data
const mockSettings = {
  lineupRules: {
    minInningsInfield: 2,
    maxInningsInfield: 4,
    rotateOutfield: true,
    balancePositions: true,
    respectPreferences: true,
    benchRotation: true,
  },
  positions: [
    { id: 'pitcher', name: 'Pitcher', abbreviation: 'P', enabled: true },
    { id: 'catcher', name: 'Catcher', abbreviation: 'C', enabled: true },
    { id: 'first_base', name: '1st Base', abbreviation: '1B', enabled: true },
    { id: 'second_base', name: '2nd Base', abbreviation: '2B', enabled: true },
    { id: 'third_base', name: '3rd Base', abbreviation: '3B', enabled: true },
    { id: 'shortstop', name: 'Shortstop', abbreviation: 'SS', enabled: true },
    { id: 'left_field', name: 'Left Field', abbreviation: 'LF', enabled: true },
    { id: 'left_center_field', name: 'Left-Center Field', abbreviation: 'LCF', enabled: true },
    { id: 'right_center_field', name: 'Right-Center Field', abbreviation: 'RCF', enabled: true },
    { id: 'right_field', name: 'Right Field', abbreviation: 'RF', enabled: true },
    { id: 'bench', name: 'Bench', abbreviation: 'Bench', enabled: true },
  ],
  difficultyLevels: [
    { 
      level: 1, 
      name: 'Easy/Weak', 
      rules: {
        description: 'Weaker players get more time in preferred positions',
        rotateHighSkill: true,
        prioritizeLowSkill: true,
      }
    },
    { 
      level: 3, 
      name: 'Fair/Average', 
      rules: {
        description: 'Balance skill distribution across positions',
        rotateHighSkill: true,
        prioritizeLowSkill: false,
      }
    },
    { 
      level: 5, 
      name: 'Good/Strong', 
      rules: {
        description: 'Stronger players in key positions',
        rotateHighSkill: false,
        prioritizeLowSkill: false,
      }
    },
  ],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'positions' | 'rules' | 'database'>('general');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<string>('');
  
  // Function to handle saving settings
  const saveSettings = () => {
    // Here you would save the settings to your backend
    alert('Settings saved successfully!');
  };
  
  // Function to handle position toggle
  const togglePosition = (id: string) => {
    setSettings({
      ...settings,
      positions: settings.positions.map(pos => 
        pos.id === id ? { ...pos, enabled: !pos.enabled } : pos
      ),
    });
  };
  
  // Function to show confirmation dialog
  const confirmAction = (action: string) => {
    setConfirmationAction(action);
    setShowConfirmation(true);
  };
  
  // Function to execute the confirmed action
  const executeAction = () => {
    switch (confirmationAction) {
      case 'reset':
        // Here you would reset the app data
        alert('All app data has been reset.');
        break;
      case 'backup':
        // Here you would export the data
        alert('Data exported successfully.');
        break;
      case 'restore':
        // Here you would import the data
        alert('Data imported successfully.');
        break;
      default:
        break;
    }
    
    setShowConfirmation(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-thunder-dark">Settings</h1>
        <p className="text-gray-600 mt-1">Configure the application settings</p>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            className={`py-3 px-6 text-center font-medium text-sm focus:outline-none ${
              activeTab === 'general'
                ? 'text-thunder-primary border-b-2 border-thunder-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`py-3 px-6 text-center font-medium text-sm focus:outline-none ${
              activeTab === 'positions'
                ? 'text-thunder-primary border-b-2 border-thunder-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('positions')}
          >
            Positions
          </button>
          <button
            className={`py-3 px-6 text-center font-medium text-sm focus:outline-none ${
              activeTab === 'rules'
                ? 'text-thunder-primary border-b-2 border-thunder-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rules')}
          >
            Lineup Rules
          </button>
          <button
            className={`py-3 px-6 text-center font-medium text-sm focus:outline-none ${
              activeTab === 'database'
                ? 'text-thunder-primary border-b-2 border-thunder-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('database')}
          >
            Data Management
          </button>
        </div>
        
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-2">Default Lineup Settings</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Minimum Innings in Infield
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      className="mt-1 sm:mt-0 w-full sm:w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                      value={settings.lineupRules.minInningsInfield}
                      onChange={(e) => setSettings({
                        ...settings,
                        lineupRules: {
                          ...settings.lineupRules,
                          minInningsInfield: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Maximum Innings in Infield
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      className="mt-1 sm:mt-0 w-full sm:w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                      value={settings.lineupRules.maxInningsInfield}
                      onChange={(e) => setSettings({
                        ...settings,
                        lineupRules: {
                          ...settings.lineupRules,
                          maxInningsInfield: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Rotate Players Through Outfield
                    </label>
                    <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={settings.lineupRules.rotateOutfield}
                        onChange={() => setSettings({
                          ...settings,
                          lineupRules: {
                            ...settings.lineupRules,
                            rotateOutfield: !settings.lineupRules.rotateOutfield
                          }
                        })}
                      />
                      <span
                        className={`block w-6 h-6 rounded-full transition-transform ${
                          settings.lineupRules.rotateOutfield
                            ? 'bg-thunder-primary transform translate-x-6'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Balance Position Distribution
                    </label>
                    <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={settings.lineupRules.balancePositions}
                        onChange={() => setSettings({
                          ...settings,
                          lineupRules: {
                            ...settings.lineupRules,
                            balancePositions: !settings.lineupRules.balancePositions
                          }
                        })}
                      />
                      <span
                        className={`block w-6 h-6 rounded-full transition-transform ${
                          settings.lineupRules.balancePositions
                            ? 'bg-thunder-primary transform translate-x-6'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Respect Player Position Preferences
                    </label>
                    <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={settings.lineupRules.respectPreferences}
                        onChange={() => setSettings({
                          ...settings,
                          lineupRules: {
                            ...settings.lineupRules,
                            respectPreferences: !settings.lineupRules.respectPreferences
                          }
                        })}
                      />
                      <span
                        className={`block w-6 h-6 rounded-full transition-transform ${
                          settings.lineupRules.respectPreferences
                            ? 'bg-thunder-primary transform translate-x-6'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Bench Rotation (Equal Time)
                    </label>
                    <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={settings.lineupRules.benchRotation}
                        onChange={() => setSettings({
                          ...settings,
                          lineupRules: {
                            ...settings.lineupRules,
                            benchRotation: !settings.lineupRules.benchRotation
                          }
                        })}
                      />
                      <span
                        className={`block w-6 h-6 rounded-full transition-transform ${
                          settings.lineupRules.benchRotation
                            ? 'bg-thunder-primary transform translate-x-6'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Position Management</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enable or disable positions for your team. Disabled positions won't be available when creating lineups.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.positions.map((position) => (
                  <div 
                    key={position.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      position.enabled 
                        ? 'border-thunder-primary bg-thunder-primary/10' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        position.enabled
                          ? 'bg-thunder-primary text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {position.abbreviation}
                      </span>
                      <span className="ml-3 font-medium">{position.name}</span>
                    </div>
                    <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={position.enabled}
                        onChange={() => togglePosition(position.id)}
                      />
                      <span
                        className={`block w-6 h-6 rounded-full transition-transform ${
                          position.enabled
                            ? 'bg-thunder-primary transform translate-x-6'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center"
              >
                <FaSave className="mr-2" />
                Save Positions
              </button>
            </div>
          </div>
        )}
        
        {/* Lineup Rules Tab */}
        {activeTab === 'rules' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Difficulty Level Rules</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure how the auto-lineup generator works based on opponent difficulty.
            </p>
            
            <div className="space-y-6">
              {settings.difficultyLevels.map((level) => (
                <div key={level.level} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-md font-medium flex items-center">
                      <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                        level.level === 1 ? 'bg-green-500' :
                        level.level === 3 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></span>
                      Level {level.level}: {level.name}
                    </h3>
                    <div className="mt-2 sm:mt-0 text-sm text-gray-600">
                      {level.rules.description}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Rotate High-Skill Players
                      </label>
                      <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={level.rules.rotateHighSkill}
                          onChange={() => {
                            const newLevels = settings.difficultyLevels.map(l => 
                              l.level === level.level 
                                ? { 
                                    ...l, 
                                    rules: { 
                                      ...l.rules, 
                                      rotateHighSkill: !l.rules.rotateHighSkill 
                                    } 
                                  }
                                : l
                            );
                            setSettings({ ...settings, difficultyLevels: newLevels });
                          }}
                        />
                        <span
                          className={`block w-6 h-6 rounded-full transition-transform ${
                            level.rules.rotateHighSkill
                              ? 'bg-thunder-primary transform translate-x-6'
                              : 'bg-white'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Prioritize Low-Skill Players
                      </label>
                      <div className="relative inline-block w-12 h-6 bg-gray-200 rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={level.rules.prioritizeLowSkill}
                          onChange={() => {
                            const newLevels = settings.difficultyLevels.map(l => 
                              l.level === level.level 
                                ? { 
                                    ...l, 
                                    rules: { 
                                      ...l.rules, 
                                      prioritizeLowSkill: !l.rules.prioritizeLowSkill 
                                    } 
                                  }
                                : l
                            );
                            setSettings({ ...settings, difficultyLevels: newLevels });
                          }}
                        />
                        <span
                          className={`block w-6 h-6 rounded-full transition-transform ${
                            level.rules.prioritizeLowSkill
                              ? 'bg-thunder-primary transform translate-x-6'
                              : 'bg-white'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save Rules
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Data Management Tab */}
        {activeTab === 'database' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Data Management</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium mb-3">Backup & Restore</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Export Data</p>
                    <p className="text-sm text-gray-600">Save all your data to a file</p>
                  </div>
                  <button
                    onClick={() => confirmAction('backup')}
                    className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-thunder-secondary text-thunder-dark rounded-lg hover:bg-thunder-secondary/90 flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" />
                    Export Data
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Import Data</p>
                      <p className="text-sm text-gray-600">Restore from a backup file</p>
                    </div>
                    <button
                      onClick={() => confirmAction('restore')}
                      className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center justify-center"
                    >
                      <FaUpload className="mr-2" />
                      Import Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-3 text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                These actions cannot be undone. Please be certain before proceeding.
              </p>
              
              <button
                onClick={() => confirmAction('reset')}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
              >
                <FaTrash className="mr-2" />
                Reset All Data
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
            
            <div className="mb-6">
              {confirmationAction === 'reset' && (
                <>
                  <p className="text-red-600 font-medium">Warning: This action cannot be undone!</p>
                  <p className="mt-2 text-gray-600">
                    You are about to reset all application data, including teams, players, games, and lineups.
                  </p>
                </>
              )}
              
              {confirmationAction === 'backup' && (
                <p className="text-gray-600">
                  This will export all your data as a JSON file that you can save to your device.
                </p>
              )}
              
              {confirmationAction === 'restore' && (
                <>
                  <p className="text-yellow-600 font-medium">Warning: This will overwrite your current data!</p>
                  <p className="mt-2 text-gray-600">
                    Importing data will replace all your current teams, players, games, and lineups.
                  </p>
                </>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 ${
                  confirmationAction === 'reset'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-thunder-primary hover:bg-thunder-primary/90'
                } text-white rounded-lg`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}