
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_VISITS } from './constants';
import { Visit, View, VisitStatus, SOAPNote } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RecordingInterface from './components/RecordingInterface';
import ReviewInterface from './components/ReviewInterface';

const App: React.FC = () => {
  // Use session storage for persistence across refreshes
  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = sessionStorage.getItem('sonar_visits');
    return saved ? JSON.parse(saved) : INITIAL_VISITS;
  });

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Persistence effect
  useEffect(() => {
    sessionStorage.setItem('sonar_visits', JSON.stringify(visits));
  }, [visits]);

  const handleStartNewVisit = (patientInfo?: { name: string; complaint: string; type: string }) => {
    const newVisit: Visit = {
      id: `visit_${Date.now()}`,
      patientName: patientInfo?.name || "Anonymous Patient",
      patientAge: 0,
      chiefComplaint: patientInfo?.complaint || "New Assessment",
      visitType: patientInfo?.type || "Initial",
      timestamp: new Date().toISOString(),
      status: 'in_progress',
      duration: 0,
      confidence: 0
    };
    setActiveVisit(newVisit);
    setCurrentView('recording');
  };

  const handleEndRecording = (transcript: string, duration: number, medicalTerms: string[]) => {
    setIsLoading(true);

    // The transcript is already processed by the backend
    // So we can directly update the visit and navigate to review
    if (activeVisit) {
      const updatedVisit: Visit = {
        ...activeVisit,
        transcript,
        duration,
        status: 'pending' as VisitStatus,
      };
      setActiveVisit(updatedVisit);
      setIsLoading(false);
      setCurrentView('review');
    }
  };

  const handleApproveVisit = (id: string, updatedNote: SOAPNote) => {
    if (!activeVisit) return;

    const finalVisit: Visit = {
      ...activeVisit,
      id,
      status: 'approved',
      soapNote: updatedNote,
      confidence: updatedNote.overallConfidence
    };

    setVisits(prev => {
      const exists = prev.find(v => v.id === id);
      if (exists) {
        return prev.map(v => v.id === id ? finalVisit : v);
      }
      return [finalVisit, ...prev];
    });

    setActiveVisit(null);
    setCurrentView('dashboard');
  };

  const handleReviewVisit = (visit: Visit) => {
    setActiveVisit(visit);
    setCurrentView('review');
  };

  const navigateToDashboard = () => {
    setActiveVisit(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentView={currentView} onBack={navigateToDashboard} />
      
      <main className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Processing Audio</h2>
            <p className="text-gray-600 max-w-md">Our AI is analyzing the conversation and structuring your clinical notes. This will just take a moment...</p>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <Dashboard 
                visits={visits} 
                onStartNewVisit={handleStartNewVisit}
                onReviewVisit={handleReviewVisit}
              />
            )}
            
            {currentView === 'recording' && activeVisit && (
              <RecordingInterface 
                activeVisit={activeVisit} 
                onEndRecording={handleEndRecording}
                onCancel={navigateToDashboard}
              />
            )}
            
            {currentView === 'review' && activeVisit && (
              <ReviewInterface 
                visit={activeVisit} 
                onApprove={handleApproveVisit}
                onCancel={navigateToDashboard}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
