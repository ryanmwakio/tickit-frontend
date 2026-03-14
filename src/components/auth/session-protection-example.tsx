"use client";

import { useState, useMemo } from "react";
import { SessionProtectedForm } from "./session-protected-form";
import { useToast } from "@/contexts/toast-context";
import { Save, AlertTriangle } from "lucide-react";

/**
 * Example implementation showing how to add session protection to any form.
 * This demonstrates best practices for:
 * - Detecting unsaved data
 * - Local storage backup
 * - Session expiration handling
 * - API error handling with session awareness
 */
export function SessionProtectionExample() {
  const toast = useToast();
  
  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    price: "",
  });
  
  // Track initial state to detect changes
  const [initialData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);
  
  // Detect if there are unsaved changes
  const hasUnsavedData = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);
  
  // Handle local backup for session protection
  const handleLocalSave = () => {
    if (typeof window !== "undefined") {
      const backupData = {
        formData,
        timestamp: Date.now(),
        url: window.location.pathname,
      };
      localStorage.setItem("form_backup_example", JSON.stringify(backupData));
      toast.success("Work saved locally", "Your changes are backed up");
    }
  };
  
  // Load backup on component mount (you'd typically do this in useEffect)
  const loadBackup = () => {
    if (typeof window !== "undefined") {
      const backup = localStorage.getItem("form_backup_example");
      if (backup) {
        try {
          const { formData: backedUpData, timestamp } = JSON.parse(backup);
          const ageInMinutes = (Date.now() - timestamp) / (1000 * 60);
          
          if (ageInMinutes < 60) { // Only restore if less than 1 hour old
            setFormData(backedUpData);
            toast.info("Work restored", "Your previous work has been restored");
          }
        } catch (error) {
          console.error("Failed to restore backup:", error);
        }
      }
    }
  };
  
  // Clear backup after successful save
  const clearBackup = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("form_backup_example");
    }
  };
  
  // Simulate API call with session awareness
  const handleSubmit = async () => {
    if (!hasUnsavedData) {
      toast.info("No changes", "No changes to save");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random API errors for demo
      const shouldFail = Math.random() < 0.3;
      if (shouldFail) {
        throw { statusCode: Math.random() < 0.5 ? 401 : 500 };
      }
      
      // Success
      clearBackup();
      toast.success("Saved successfully", "Your work has been saved");
      
    } catch (error: any) {
      if (error?.statusCode === 401) {
        // Session expired during save
        handleLocalSave(); // Ensure data is backed up
        toast.error(
          "Session expired during save",
          "Your work is saved locally. Please log in and try again.",
          10000
        );
      } else {
        toast.error("Save failed", "Please try again");
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Session Protection Example
        </h1>
        <p className="text-gray-600">
          This form demonstrates session protection. Try filling it out, then 
          simulate session expiration by clearing your auth tokens.
        </p>
      </div>
      
      <SessionProtectedForm
        hasUnsavedData={hasUnsavedData}
        onSave={handleLocalSave}
        expiredMessage="Your session expired while working on this form! Don't worry - your changes are saved locally."
        inactivityMessage="You've been inactive. Save your work to prevent data loss when your session expires."
        className="space-y-6"
      >
        {/* Status indicator */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              hasUnsavedData ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-gray-700">
              {hasUnsavedData ? 'Unsaved changes detected' : 'All changes saved'}
            </span>
            {hasUnsavedData && (
              <button
                onClick={handleLocalSave}
                className="ml-auto text-blue-600 hover:text-blue-800 font-medium"
              >
                Backup Now
              </button>
            )}
          </div>
        </div>
        
        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter a description..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="concert">Concert</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (KES)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(
                e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              )}
              placeholder="music, event, weekend"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSaving || !hasUnsavedData}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            onClick={handleLocalSave}
            disabled={!hasUnsavedData}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Backup Locally
          </button>
          
          <button
            onClick={loadBackup}
            className="px-6 py-2 border border-blue-300 text-blue-700 font-medium rounded-md hover:bg-blue-50"
          >
            Load Backup
          </button>
        </div>
        
        {/* Demo instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">
                Testing Session Protection
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                To test session protection:
              </p>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Fill out some form fields</li>
                <li>Open browser dev tools → Application → Local Storage</li>
                <li>Delete the "accessToken" and "refreshToken" entries</li>
                <li>Try to submit the form or wait for inactivity warning</li>
                <li>Observe session expiration notifications and local backup</li>
              </ol>
            </div>
          </div>
        </div>
      </SessionProtectedForm>
    </div>
  );
}