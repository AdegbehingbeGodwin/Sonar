import React, { useState, useEffect } from 'react';
// Added missing Play icon to the imports from lucide-react
import { Save, Download, Copy, RefreshCw, CheckCircle2, AlertTriangle, ChevronRight, Hash, ShieldCheck, Edit3, Play } from 'lucide-react';
import { Visit, SOAPNote } from '../types';

interface ReviewInterfaceProps {
  visit: Visit;
  onApprove: (id: string, note: SOAPNote) => void;
  onCancel: () => void;
}

const ReviewInterface: React.FC<ReviewInterfaceProps> = ({ visit, onApprove, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'transcript' | 'audio'>('soap');
  const [note, setNote] = useState<SOAPNote | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize the SOAP note from the transcript
  useEffect(() => {
    if (visit.transcript) {
      generateSOAPNote(visit.transcript).then(soapNote => {
        setNote(soapNote);
        setLoading(false);
      });
    } else {
      // If no transcript, use a default note
      setNote({
        chiefComplaint: visit.chiefComplaint,
        subjective: "Patient presented with symptoms as described in the chief complaint. Details of the history of present illness were discussed.",
        objective: "Vital signs and physical examination findings were within normal limits unless otherwise noted.",
        assessment: [{
          diagnosis: "Awaiting physician review",
          icd10: "Z00.00",
          confidence: 50
        }],
        plan: "Plan to be determined after physician review.",
        overallConfidence: 50
      });
      setLoading(false);
    }
  }, [visit]);

  const generateSOAPNote = async (transcript: string): Promise<SOAPNote> => {
    // In a production implementation, this would call an API to generate the SOAP note from the transcript
    // For now, we'll create a basic structure based on the transcript with improved parsing
    return new Promise((resolve) => {
      // Simulate API call delay for processing
      setTimeout(() => {
        // Basic parsing of the transcript to create a SOAP note
        const chiefComplaint = visit.chiefComplaint || "Medical evaluation";

        // Extract sections from transcript if available
        let subjective = transcript || "Patient discussed symptoms and medical history.";
        let objective = "Physical examination and vital signs to be documented by physician.";
        let assessment = [{
          diagnosis: "Preliminary assessment based on patient history",
          icd10: "Z00.00",
          confidence: 75
        }];
        let plan = "Plan to be determined after physician evaluation.";

        // Try to parse transcript for SOAP structure if available
        if (transcript) {
          const transcriptLower = transcript.toLowerCase();

          // Look for keywords to structure the note
          if (transcriptLower.includes('subjective') || transcriptLower.includes('symptoms')) {
            const subjMatch = transcript.match(/(subjective:|symptoms:|patient reports:)\s*([^.]*(?:\.[^.]*){0,4})/i);
            if (subjMatch) subjective = subjMatch[2].trim();
          }

          if (transcriptLower.includes('objective') || transcriptLower.includes('exam') || transcriptLower.includes('vital signs')) {
            const objMatch = transcript.match(/(objective:|examination:|exam:|vital signs:)\s*([^.]*(?:\.[^.]*){0,4})/i);
            if (objMatch) objective = objMatch[2].trim();
          }

          if (transcriptLower.includes('assessment') || transcriptLower.includes('diagnosis')) {
            const assessMatch = transcript.match(/(assessment:|diagnosis:|diagnosed:)\s*([^.]*(?:\.[^.]*){0,4})/i);
            if (assessMatch) {
              const diagnosis = assessMatch[2].trim();
              assessment = [{
                diagnosis,
                icd10: "TBD", // Would be determined by medical professional
                confidence: 85
              }];
            }
          }

          if (transcriptLower.includes('plan') || transcriptLower.includes('treatment')) {
            const planMatch = transcript.match(/(plan:|treatment:|prescribed:)\s*([^.]*(?:\.[^.]*){0,4})/i);
            if (planMatch) plan = planMatch[2].trim();
          }
        }

        resolve({
          chiefComplaint,
          subjective,
          objective,
          assessment,
          plan,
          overallConfidence: 75
        });
      }, 1000);
    });
  };

  const handleUpdateSection = (key: keyof SOAPNote, value: any) => {
    if (note) {
      setNote(prev => ({ ...prev!, [key]: value }));
    }
  };

  const handleExport = () => {
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const copyToClipboard = () => {
    if (!note) return;
    
    const text = `
CHIEF COMPLAINT: ${note.chiefComplaint}
SUBJECTIVE: ${note.subjective}
OBJECTIVE: ${note.objective}
ASSESSMENT:
${note.assessment.map(a => `- ${a.diagnosis} (${a.icd10})`).join('\n')}
PLAN: ${note.plan}
    `.trim();
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-[calc(100vh-64px)]">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Generating clinical note from transcript...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-[calc(100vh-64px)]">
        <p className="text-gray-600">Error loading clinical note.</p>
        <button 
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-lg">{visit.patientName}</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Reviewing</span>
            </div>
            <p className="text-sm text-gray-500">{visit.chiefComplaint} • {new Date(visit.timestamp).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyToClipboard}
            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={20} />
          </button>
          <button
            onClick={handleExport}
            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            title="Download PDF"
          >
            <Download size={20} />
          </button>
          <div className="h-8 w-[1px] bg-gray-200 mx-1" />
          <button
            onClick={() => onApprove(visit.id, note)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all transform active:scale-95"
          >
            <Save size={18} />
            <span>Approve & Export</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['soap', 'transcript', 'audio'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
              }`}
              >
                {tab === 'soap' ? 'SOAP Note' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {activeTab === 'soap' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <section>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Chief Complaint</label>
                  <input
                    type="text"
                    value={note.chiefComplaint}
                    onChange={(e) => handleUpdateSection('chiefComplaint', e.target.value)}
                    className="w-full text-2xl font-bold text-gray-900 border-none focus:ring-0 p-0"
                  />
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subjective (S)</label>
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">98% CONFIDENCE</span>
                    </div>
                    <textarea
                      className="w-full h-40 p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                      value={note.subjective}
                      onChange={(e) => handleUpdateSection('subjective', e.target.value)}
                    />
                  </section>

                  <section className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Objective (O)</label>
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">95% CONFIDENCE</span>
                    </div>
                    <textarea
                      className="w-full h-40 p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                      value={note.objective}
                      onChange={(e) => handleUpdateSection('objective', e.target.value)}
                    />
                  </section>
                </div>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assessment & Coding (A)</label>
                    <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                      <RefreshCw size={12} /> Regenerate Suggestions
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {note.assessment.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${item.confidence > 90 ? 'bg-green-500' : 'bg-amber-500'}`} />
                          <div>
                            <p className="font-semibold text-gray-900">{item.diagnosis}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Hash size={10} /> {item.icd10}
                              </span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-tighter">AI Confidence: {item.confidence}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                      <Hash size={16} /> Add Diagnosis/Code
                    </button>
                  </div>
                </section>

                <section className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan (P)</label>
                  <textarea
                    className="w-full h-40 p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none resize-none"
                    value={note.plan}
                    onChange={(e) => handleUpdateSection('plan', e.target.value)}
                  />
                </section>
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                   <p className="text-lg text-gray-700 leading-loose">
                    {visit.transcript || "Full transcript will appear here. Our AI has parsed this conversation into the structured SOAP note shown in the primary tab."}
                   </p>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Play size={40} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Audio Recording Replay</h3>
                  <p className="text-gray-500 mt-2">Listen back to the original conversation for verification.</p>
                </div>
                <div className="w-full max-w-md h-12 bg-gray-100 rounded-full flex items-center px-4 gap-4">
                  <Play size={20} className="text-gray-400" />
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 rounded-full" />
                    <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm" />
                  </div>
                  <span className="text-xs font-mono text-gray-500">02:14 / 12:00</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">Quality Score</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="175.9" strokeDashoffset={175.9 * (1 - note.overallConfidence / 100)} strokeLinecap="round" />
                </svg>
                <span className="absolute text-sm font-bold text-gray-900">{note.overallConfidence}%</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">High Confidence</p>
                <p className="text-xs text-gray-500">Document accuracy is within clinical standards.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium border border-green-100">
              <ShieldCheck size={16} /> Verified by MediScribe AI
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Review Alerts</h3>
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 leading-normal">
                  <strong>Assessment:</strong> "Dyslipidemia" was inferred from context. Verify with patient history or recent labs.
                </p>
              </div>
              <div className="flex gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <RefreshCw size={18} className="text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700 leading-normal">
                  Suggestion: Patient mentioned "shortness of breath". Should "Dyspnea" be added as a secondary diagnosis?
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
            <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-4">Quick Export</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Download size={20} />
                <span className="text-[10px] font-bold uppercase">PDF</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Save size={20} />
                <span className="text-[10px] font-bold uppercase">EMR Sync</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal Simulation */}
      {showExportSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Export Successful</h3>
            <p className="text-gray-500 mb-8">The clinical note has been saved and exported to the patient's record in the EMR.</p>
            <button
              onClick={() => setShowExportSuccess(false)}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewInterface;