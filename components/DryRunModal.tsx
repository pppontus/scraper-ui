import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useDryRun } from "./dry-run/useDryRun";
import { DryRunResultsDisplay } from "./dry-run/DryRunResults";

interface DryRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceName: string;
  sourceId: string;
}

export function DryRunModal({ isOpen, onClose, sourceName }: DryRunModalProps) {
  const [isDryRunning, setIsDryRunning] = useState(false);
  
  console.log("DryRunModal render - isOpen:", isOpen, "sourceName:", sourceName);

  const { currentStep, results, logs, restart } = useDryRun({ 
    isRunning: isDryRunning,
    onComplete: () => {
      setIsDryRunning(false);
    },
    onError: () => {
      setIsDryRunning(false);
    }
  });

  // Start dry run when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsDryRunning(true);
    } else {
      setIsDryRunning(false);
    }
  }, [isOpen]);

  const restartDryRun = () => {
    restart();
    setIsDryRunning(true);
  };

  const handleClose = () => {
    setIsDryRunning(false);
    onClose();
  };

  console.log("Before return - isOpen check:", isOpen);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dry Run Results</h2>
            <p className="text-sm text-gray-500">{sourceName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <DryRunResultsDisplay
            currentStep={currentStep}
            results={results}
            logs={logs}
            variant="modal"
            onRestart={restartDryRun}
            onEditConfig={() => console.log("Edit configuration")}
          />
        </div>

        {/* Footer */}
        {currentStep === "complete" && (
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={restartDryRun}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Run Again
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => console.log("Edit configuration")}
              >
                Edit Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}