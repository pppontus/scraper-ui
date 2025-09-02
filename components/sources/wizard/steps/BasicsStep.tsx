import React from "react";
import { Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceConfig } from "@/lib/types";

interface BasicsStepProps {
  config: SourceConfig;
  setConfig: (config: SourceConfig) => void;
}

export function BasicsStep({ config, setConfig }: BasicsStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Indeed Sverige"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site URL
            </label>
            <input
              type="url"
              value={config.siteUrl}
              onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://se.indeed.com"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Two-Step Scraping Approach</span>
            </div>
            <p className="text-sm text-blue-700">
              This scraper uses a two-step approach: first <strong>Discovery</strong> finds job URLs, 
              then <strong>Extraction</strong> gets details from each job page. You'll configure the 
              technique for each step separately.
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={config.notes || ""}
            onChange={(e) => setConfig({ ...config, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes about this source..."
          />
        </div>
      </div>
    </div>
  );
}