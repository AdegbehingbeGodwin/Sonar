
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Pause, Play, Square, AlertCircle, Info, Tag, Layers, Upload, AudioLines } from 'lucide-react';
import Waveform from './Waveform';
import { Visit } from '../types';

interface RecordingInterfaceProps {
  activeVisit: Visit;
  onEndRecording: (transcript: string, duration: number, terms: string[]) => void;
  onCancel: () => void;
}

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({ activeVisit, onEndRecording, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [currentSection, setCurrentSection] = useState('Subjective');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [detectedTerms, setDetectedTerms] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    let interval: any;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Initialize audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // Send audio to backend for processing
        setIsProcessing(true);
        try {
          const transcript = await sendAudioToBackend(audioBlob);
          setTranscript(transcript);
          setIsProcessing(false);

          // Extract medical terms (this could be enhanced with NLP processing)
          const terms = extractMedicalTerms(transcript);
          setDetectedTerms(new Set(terms));

          onEndRecording(transcript, elapsedTime, terms);
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsProcessing(false);
          // Fallback: use empty transcript
          onEndRecording('', elapsedTime, []);
        }
      };

      recorder.start();
      setIsRecording(true);
      setAudioChunks([]);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);

      // Stop all audio tracks
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    }
  };

  const togglePause = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
      } else {
        mediaRecorder.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.transcript || '';
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      // Provide a more user-friendly error message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to transcription service. Please check your internet connection.');
      }
      throw error;
    }
  };

  // Simple function to extract medical terms (this could be enhanced)
  const extractMedicalTerms = (text: string): string[] => {
    // This is a basic implementation - in a real app, you'd use NLP to identify medical terms
    const medicalTerms = [
      'hypertension', 'diabetes', 'dyspnea', 'chest pain', 'angina',
      'tachycardia', 'bradycardia', 'arrhythmia', 'myocardial infarction',
      'stroke', 'anemia', 'asthma', 'pneumonia', 'bronchitis', 'arthritis',
      'headache', 'nausea', 'vomiting', 'diarrhea', 'constipation'
    ];

    const foundTerms = medicalTerms.filter(term =>
      text.toLowerCase().includes(term.toLowerCase())
    );

    return foundTerms;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    stopRecording();
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Mic size={20} className={isRecording && !isPaused ? "animate-pulse" : ""} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{activeVisit.patientName}</h2>
            <p className="text-sm text-gray-500">{activeVisit.chiefComplaint}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xl font-mono font-bold text-gray-900">{formatTime(elapsedTime)}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
            <Layers size={16} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Section: {currentSection}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Transcript Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
              <AudioLines size={14} /> Live Transcript
            </span>
            <span className="text-xs text-gray-400 italic">
              {isProcessing ? 'Processing...' :
               isRecording ? 'Listening...' :
               transcript ? 'Complete' : 'Ready'}
            </span>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto custom-scrollbar"
          >
            {transcript ? (
              <p className="text-lg leading-relaxed text-gray-800">
                {transcript}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                {isRecording ? (
                  <>
                    <div className="p-4 bg-gray-50 rounded-full">
                      <Mic size={32} className="animate-pulse" />
                    </div>
                    <p className="text-lg">Recording...</p>
                    <p className="text-sm">Click "End & Generate SOAP Note" when finished</p>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-full">
                      <Mic size={32} />
                    </div>
                    <p className="text-lg">Ready to record</p>
                    <p className="text-sm">Click the record button to start</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {Array.from(detectedTerms).map((term, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-200">
                  <Tag size={10} /> {term}
                </span>
              ))}
              {detectedTerms.size > 0 && (
                <span className="text-xs text-gray-400 self-center ml-2">Medical terms identified</span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Visualizer */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-6">Audio Level</h3>
            <Waveform isPaused={isPaused} isActive={isRecording} />
            <div className="mt-8 flex flex-col gap-3 w-full">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                <span>Confidence</span>
                <span>{isProcessing ? 'Analyzing...' : '94%'}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: isProcessing ? '80%' : '94%' }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">Quick Markers</h3>
            <div className="space-y-2">
              {['Subjective', 'Objective', 'Assessment', 'Plan'].map(section => (
                <button
                  key={section}
                  onClick={() => setCurrentSection(section)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    currentSection === section
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                    : 'border-gray-100 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
              <AlertCircle size={20} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 leading-normal">
                Click a section to mark the transition in the transcript for better AI processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border-t border-gray-200 px-8 py-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-500 font-semibold hover:text-gray-700"
        >
          Cancel Visit
        </button>

        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-red-200 transition-all transform active:scale-95"
            >
              <Mic size={20} fill="currentColor" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={togglePause}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isPaused
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
            </button>
          )}

          <button
            onClick={handleEnd}
            disabled={!isRecording}
            className={`${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg transition-all transform active:scale-95`}
          >
            <Square size={20} fill={isRecording ? "currentColor" : ""} />
            <span>End & Generate SOAP Note</span>
          </button>
        </div>

        <div className="w-20 hidden md:block" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default RecordingInterface;
