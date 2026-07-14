import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, Coins, Clock, Globe, ArrowRight } from 'lucide-react';

function timeAgo(ts) {
  if (!ts) return 'Recently';
  const seconds = Math.floor(Date.now() / 1000 - ts);
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export default function InternshipFeed() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/jobs/search?search=internship&page=1');
        const data = (res.data.data || []).slice(0, 4);
        setInternships(data);
      } catch (err) {
        console.warn('Failed to fetch live internships:', err.message);
        setInternships([]);
      }
      setLoading(false);
    };

    fetchInternships();
  }, []);

  return (
    <div className="w-full bg-[#060814] dark:bg-[#faf7f2] py-24 px-4 transition-colors duration-500 relative overflow-hidden">
      {/* Background blur blobs */}
      <div className="absolute top-1/2 left-[-150px] w-96 h-96 rounded-full bg-[#b45309]/5 dark:bg-[#f3eedf]/20 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-10 rounded bg-[#d97706] dark:bg-[#b45309]" />
              <p className="text-[10px] tracking-[0.25em] font-black uppercase text-[#d97706] dark:text-[#b45309]">Opportunities</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white dark:text-slate-900 tracking-tight leading-none">
              Explore Live Gigs
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
              Curated positions matching active developer skillsets.
            </p>
          </div>
          <Link 
            to="/jobs" 
            className="flex items-center gap-1.5 text-[#fbbf24] hover:text-[#d97706] dark:text-[#b45309] dark:hover:text-[#d4af37] font-bold text-sm transition-colors group"
          >
            Explore all listings 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm font-semibold">Updating stream...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internships.map((job) => {
              const comp = job.company_name || 'Tech Startup';
              const type = job.job_types?.[0] || 'Internship';
              const salary = job.stipend || job.salary || 'Competitive Stipend';
              const postedTime = job.created_at ? timeAgo(job.created_at) : 'Recently';
              const uniqueId = job.slug || job.id || Math.random().toString();
              
              return (
                <div 
                  key={uniqueId} 
                  className="bg-gradient-to-b from-[#111422]/50 to-[#090b13]/50 dark:from-[#ffffff] dark:to-[#fcfbf9] rounded-2xl p-6 border border-slate-900 dark:border-[#e6ddc5] hover:border-[#d97706]/40 dark:hover:border-[#b45309]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#d97706]/5 group flex flex-col justify-between"
                  style={{
                    minHeight: '220px'
                  }}
                >
                  <div>
                    {/* Header: Title & type badge */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white dark:text-slate-900 group-hover:text-[#fbbf24] dark:group-hover:text-[#b45309] transition-colors leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">{comp}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                        <span className="bg-[#d97706]/10 dark:bg-[#b45309]/5 text-[#fbbf24] dark:text-[#b45309] text-[10px] font-bold px-3 py-1 rounded-lg border border-[#d97706]/20 dark:border-[#b45309]/20 tracking-wider uppercase">
                          {type}
                        </span>
                      </div>
                    </div>

                    {/* Metadata pills */}
                    <div className="flex flex-wrap gap-2.5 mt-5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 dark:text-slate-600 bg-slate-900/60 dark:bg-[#f6f3ea] px-3 py-1.5 rounded-xl border border-slate-800/80 dark:border-slate-200/50">
                        {job.remote ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                        <span>{job.location?.slice(0, 20)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 dark:text-emerald-700 bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <Coins className="w-3.5 h-3.5" />
                        <span className="font-bold">{salary}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-900/60 dark:bg-[#f6f3ea] px-3 py-1.5 rounded-xl border border-slate-800/80 dark:border-slate-200/50">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{postedTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-3">
                    <a
                      href={job.url || '/jobs'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-[#d97706] to-[#b45309] dark:from-[#b45309] dark:to-[#d4af37] text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center block shadow-lg shadow-[#d97706]/10 hover:shadow-[#d97706]/30 hover:scale-[1.02] active:scale-95"
                    >
                      Apply Now
                    </a>
                    <Link 
                      to="/jobs" 
                      className="p-2.5 border border-slate-800 dark:border-slate-300 hover:bg-slate-900 dark:hover:bg-slate-100/50 rounded-xl text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-800 transition-colors"
                    >
                      <Briefcase className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
