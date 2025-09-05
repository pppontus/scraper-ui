import { useState, useEffect, useCallback, useRef } from "react";
import { DryRunResults, LogEntry, RunStep } from "./DryRunSharedComponents";

interface UseDryRunProps {
  isRunning: boolean;
  onComplete?: (results: DryRunResults) => void;
  onError?: (error: string) => void;
}

export function useDryRun({ isRunning, onComplete, onError }: UseDryRunProps) {
  const [currentStep, setCurrentStep] = useState<RunStep>("discovering");
  const [results, setResults] = useState<DryRunResults | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Use refs to store the latest callback values to avoid recreating the effect
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  // Reset state when starting a new run
  useEffect(() => {
    if (!isRunning) return;

    let isMounted = true;

    const runDryRun = async () => {
      // Reset state
      if (!isMounted) return;
      setCurrentStep("discovering");
      setResults(null);
      setLogs([]);

      try {
        // Step 1: Discovery
        if (!isMounted) return;
        setLogs(prev => [...prev, { 
          timestamp: new Date().toLocaleTimeString(), 
          level: "info", 
          message: "Starting URL discovery..." 
        }]);
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate discovery time
        
        if (!isMounted) return;
        const mockUrls = [
          "https://example.com/jobs/senior-developer-123",
          "https://example.com/jobs/frontend-engineer-456", 
          "https://example.com/jobs/data-scientist-789",
          "https://example.com/jobs/backend-developer-101",
          "https://example.com/jobs/fullstack-developer-202"
        ];

        setLogs(prev => [...prev, { 
          timestamp: new Date().toLocaleTimeString(), 
          level: "success", 
          message: `Found ${mockUrls.length} job URLs` 
        }]);
        
        // Step 2: Extraction
        if (!isMounted) return;
        setCurrentStep("extracting");
        setLogs(prev => [...prev, { 
          timestamp: new Date().toLocaleTimeString(), 
          level: "info", 
          message: "Extracting sample data from discovered URLs..." 
        }]);
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate extraction time

        if (!isMounted) return;
        const mockSamples = [
          {
            url: mockUrls[0],
            data: {
              title: "Senior Developer",
              company: "TechCorp AB",
              location: "Stockholm",
              description: "We are looking for a senior developer with 5+ years of experience...",
              salary: "45000-55000 SEK",
              deadline: "2024-09-15"
            }
          },
          {
            url: mockUrls[1], 
            data: {
              title: "Frontend Engineer",
              company: "StartupCo",
              location: "Göteborg",
              description: "Join our growing team as a frontend engineer...",
              salary: "40000-50000 SEK",
              deadline: "2024-09-20"
            }
          },
          {
            url: mockUrls[2],
            error: "Could not extract salary information"
          }
        ];

        setLogs(prev => [...prev, { 
          timestamp: new Date().toLocaleTimeString(), 
          level: "success", 
          message: `Successfully extracted data from ${mockSamples.filter(s => !s.error).length}/${mockSamples.length} samples` 
        }]);

        // Step 3: Analysis
        if (!isMounted) return;
        setCurrentStep("analyzing");
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!isMounted) return;
        const finalResults: DryRunResults = {
          discovery: {
            success: true,
            urls: mockUrls,
            duration: 2000,
          },
          extraction: {
            success: true,
            samples: mockSamples,
            duration: 3000,
          },
          stats: {
            totalUrls: mockUrls.length,
            successfulExtractions: mockSamples.filter(s => !s.error).length,
            totalDuration: 6000,
          }
        };

        setResults(finalResults);
        setCurrentStep("complete");
        setLogs(prev => [...prev, { 
          timestamp: new Date().toLocaleTimeString(), 
          level: "success", 
          message: "Dry run completed successfully!" 
        }]);

        onCompleteRef.current?.(finalResults);

      } catch (error) {
        if (!isMounted) return;
        setCurrentStep("error");
        const errorMessage = "Dry run failed due to an unexpected error";
        setLogs(prev => [...prev, { 
          timestamp: new Date().toLocaleTimeString(), 
          level: "error", 
          message: errorMessage
        }]);
        onErrorRef.current?.(errorMessage);
      }
    };

    runDryRun();

    return () => {
      isMounted = false;
    };
  }, [isRunning]); // Only depend on isRunning

  const restart = () => {
    setCurrentStep("discovering");
    setResults(null);
    setLogs([]);
  };

  return {
    currentStep,
    results,
    logs,
    restart,
    isComplete: currentStep === "complete",
    isError: currentStep === "error"
  };
}