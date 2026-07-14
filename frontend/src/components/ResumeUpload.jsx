import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResumeUpload({ isOpen, onClose, onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [parsedName, setParsedName] = useState('');
  const [lookingFor, setLookingFor] = useState(() => {
    return localStorage.getItem('resumeLookingFor') || 'internship';
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        localStorage.setItem('resumeProfile', JSON.stringify(res.data.profile));
        localStorage.setItem('resumeLookingFor', lookingFor);
        setParsedName(res.data.profile.name);
        setSuccess(true);
        if (onUploadSuccess) onUploadSuccess(res.data.profile, lookingFor);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error parsing resume PDF. Please try again.');
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 transition-all animate-in fade-in zoom-in duration-200"
        style={{
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.15)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📄 Upload Resume
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Parsing your profile unlocks the AI-powered Flash deck match engine.
          </p>
        </div>

        {/* Preference Selector */}
        {!success && (
          <div className="mb-5 bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button
              onClick={() => {
                setLookingFor('internship');
                localStorage.setItem('resumeLookingFor', 'internship');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                lookingFor === 'internship'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎓 Internships
            </button>
            <button
              onClick={() => {
                setLookingFor('job');
                localStorage.setItem('resumeLookingFor', 'job');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                lookingFor === 'job'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💼 Full-time Jobs
            </button>
          </div>
        )}

        {/* Main State Handler */}
        {!success ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              dragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                : 'border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-500/5 bg-slate-950/40'
            }`}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={(e) => handleUpload(e.target.files[0])} 
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-indigo-400 text-sm font-bold animate-pulse">Analyzing document structure...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-200 font-bold text-sm">Select PDF or drag here</p>
                  <p className="text-slate-500 text-[10px] mt-1">PDF format only · Max 10MB</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Resume Parsed Successfully!</p>
              <p className="text-slate-400 text-xs mt-1">Hello <span className="text-indigo-300 font-semibold">{parsedName}</span>, your deck is loaded.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/flash');
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
              >
                ⚡ Open Flash Deck
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                }}
                className="py-2.5 px-4 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mt-4 text-xs text-red-400 bg-red-500/5 border border-red-500/20 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
