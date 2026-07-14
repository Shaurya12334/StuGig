import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Filter, MapPin, Globe, Briefcase, Clock,
  Zap, Star, FlaskConical, CheckCircle, Bookmark, X,
  ChevronLeft, ChevronRight, ExternalLink, Building2
} from 'lucide-react';

// ── Tabs inspired by nointernship.com ──────────────────────────────────────
const TABS = [
  { id: 'all',      label: 'All',        icon: Briefcase },
  { id: 'new',      label: 'Newly Listed', icon: Zap },
  { id: 'remote',   label: 'Remote',      icon: Globe },
  { id: 'research', label: 'Research',    icon: FlaskConical },
  { id: 'saved',    label: 'Saved',       icon: Bookmark },
];

const TAGS_LIST = [
  'Software Engineering', 'Data Science', 'Design', 'Marketing',
  'Finance', 'Product', 'Research', 'Writing', 'Business', 'HR',
];

const PRE_AVAILABLE_ROLES = [
  'Software Engineer',
  'Software Developer',
  'Junior Software Developer',
  'Senior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Cloud Engineer',
  'Cloud Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Data Analyst',
  'UI/UX Designer',
  'Product Manager',
  'Mobile App Developer',
  'Machine Learning Engineer',
  'AI Engineer',
  'Research Intern',
  'Marketing Intern',
  'Finance Assistant',
  'HR Specialist'
];

const PRE_AVAILABLE_LOCATIONS = [
  'New Delhi, India',
  'Bangalore, India',
  'Mumbai, India',
  'Pune, India',
  'Noida, India',
  'Gurugram, India',
  'Hyderabad, India',
  'Chennai, India',
  'Kolkata, India',
  'New York, United States',
  'San Francisco, United States',
  'Seattle, United States',
  'Austin, United States',
  'Boston, United States',
  'Chicago, United States',
  'Los Angeles, United States',
  'London, United Kingdom',
  'Manchester, United Kingdom',
  'Berlin, Germany',
  'Munich, Germany',
  'Frankfurt, Germany',
  'Paris, France',
  'Amsterdam, Netherlands',
  'Delft, Netherlands',
  'Toronto, Canada',
  'Vancouver, Canada',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Singapore, Singapore',
  'Tokyo, Japan'
];

// Time since posted
function timeAgo(ts) {
  const seconds = Math.floor(Date.now() / 1000 - ts);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

// ── Job Card ───────────────────────────────────────────────────────────────
const JobCard = ({ job, isSaved, onSave }) => {
  const isNew = Date.now() / 1000 - job.created_at < 86400;

  return (
    <div className="group relative bg-slate-800/60 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-50 border border-slate-700/60 dark:border-slate-200 hover:border-blue-500/60 dark:hover:border-blue-400 rounded-xl px-5 py-4 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5">
      {isNew && (
        <span className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 dark:bg-emerald-100 dark:text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-500/30">
          NEW
        </span>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Company avatar */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {job.company_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white dark:text-slate-900 truncate group-hover:text-blue-400 dark:group-hover:text-blue-600 transition-colors leading-snug">
              {job.title}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {job.company_name}
            </p>
          </div>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-[11px] bg-slate-700/50 dark:bg-slate-100 text-slate-300 dark:text-slate-600 px-2 py-0.5 rounded-md">
            <MapPin className="w-2.5 h-2.5" /> {job.location}
          </span>
        )}
        {job.remote && (
          <span className="inline-flex items-center gap-1 text-[11px] bg-blue-500/10 dark:bg-blue-50 text-blue-400 dark:text-blue-600 px-2 py-0.5 rounded-md border border-blue-500/20">
            <Globe className="w-2.5 h-2.5" /> Remote
          </span>
        )}
        {job.job_types?.slice(0, 2).map(t => (
          <span key={t} className="text-[11px] bg-slate-700/50 dark:bg-slate-100 text-slate-300 dark:text-slate-500 px-2 py-0.5 rounded-md">
            {t}
          </span>
        ))}
        {/* Stipend / Salary badge */}
        {job.stipend ? (
          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 dark:bg-emerald-50 text-emerald-400 dark:text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
            💰 {job.stipend}
          </span>
        ) : (job.job_types?.some(t => /intern/i.test(t)) || /intern/i.test(job.title || '')) && (
          <span className="text-[11px] bg-slate-700/30 dark:bg-slate-100 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
            Unpaid
          </span>
        )}
        {job.tags?.slice(0, 1).map(t => (
          <span key={t} className="text-[11px] bg-violet-500/10 dark:bg-violet-50 text-violet-400 dark:text-violet-600 px-2 py-0.5 rounded-md border border-violet-500/20">
            {t}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 ml-auto">
          <Clock className="w-2.5 h-2.5" /> {timeAgo(job.created_at)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
        >
          Apply Now <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={() => onSave(job.slug)}
          className={`p-1.5 rounded-lg border transition-colors ${
            isSaved
              ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
              : 'border-slate-600 dark:border-slate-300 text-slate-400 hover:text-yellow-400 hover:border-yellow-500/40'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-yellow-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-slate-800/60 dark:bg-white border border-slate-700/60 dark:border-slate-200 rounded-xl px-5 py-4 animate-pulse">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-9 h-9 rounded-lg bg-slate-700 dark:bg-slate-200" />
      <div className="flex-1">
        <div className="h-3.5 bg-slate-700 dark:bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-2.5 bg-slate-700/60 dark:bg-slate-100 rounded w-1/3" />
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="h-5 w-20 bg-slate-700 dark:bg-slate-200 rounded-md" />
      <div className="h-5 w-14 bg-slate-700 dark:bg-slate-200 rounded-md" />
      <div className="h-5 w-16 bg-slate-700 dark:bg-slate-200 rounded-md" />
    </div>
    <div className="h-8 bg-slate-700 dark:bg-slate-200 rounded-lg" />
  </div>
);

// ── Main Jobs Page ─────────────────────────────────────────────────────────
const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [savedSlugs, setSavedSlugs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saved_jobs') || '[]'); }
    catch { return []; }
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('all');
  const [allowRelocation, setAllowRelocation] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [jobType, setJobType] = useState('all'); // all, internship, full-time, part-time
  const [paidOnly, setPaidOnly] = useState(false);

  // Browser geolocation for proximity sorting
  const [userGeo, setUserGeo] = useState({ lat: null, lng: null });

  // Autocomplete UI Suggestions State & Refs
  const [showSuggestionsQuick, setShowSuggestionsQuick] = useState(false);
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);
  const [showSuggestionsLocation, setShowSuggestionsLocation] = useState(false);
  const quickSearchRef = useRef(null);
  const drawerSearchRef = useRef(null);
  const locationSearchRef = useRef(null);

  // Filter suggestions from PRE_AVAILABLE_ROLES
  const matchedSuggestions = search.trim()
    ? PRE_AVAILABLE_ROLES.filter(role => role.toLowerCase().includes(search.toLowerCase()))
    : [];

  // Filter locations from PRE_AVAILABLE_LOCATIONS
  const matchedLocations = location.trim()
    ? PRE_AVAILABLE_LOCATIONS.filter(loc => loc.toLowerCase().includes(location.toLowerCase()))
    : [];

  // Browser Geolocation — ask once on mount for proximity scoring
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently fail if denied
      );
    }
  }, []);

  // Close suggestions dropdown when clicking outside the wrapper ref
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickSearchRef.current && !quickSearchRef.current.contains(event.target)) {
        setShowSuggestionsQuick(false);
      }
      if (drawerSearchRef.current && !drawerSearchRef.current.contains(event.target)) {
        setShowSuggestionsDrawer(false);
      }
      if (locationSearchRef.current && !locationSearchRef.current.contains(event.target)) {
        setShowSuggestionsLocation(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectSuggestion = (role) => {
    setSearch(role);
    setShowSuggestionsQuick(false);
    setShowSuggestionsDrawer(false);
    setApplied(prev => {
      const next = { ...prev, search: role };
      fetchJobs(1, next);
      return next;
    });
  };

  const handleSelectLocation = (loc) => {
    setLocation(loc);
    setShowSuggestionsLocation(false);
  };

  // Applied filters (committed on "Apply")
  const [applied, setApplied] = useState({ search: '', location: '', workMode: 'all', allowRelocation: false, selectedTag: '', jobType: 'all', paidOnly: false });

  const fetchJobs = useCallback(async (pg = 1, filters = applied) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg });
      if (filters.search) params.set('search', filters.search);
      else params.set('search', 'internship');
      if (filters.location) params.set('location', filters.location);
      if (filters.workMode) params.set('workMode', filters.workMode);
      if (filters.allowRelocation) params.set('allowRelocation', filters.allowRelocation.toString());
      if (filters.jobType && filters.jobType !== 'all') params.set('jobType', filters.jobType);
      if (filters.paidOnly) params.set('paidOnly', 'true');
      if (userGeo.lat) params.set('userLat', userGeo.lat);
      if (userGeo.lng) params.set('userLng', userGeo.lng);

      const res = await axios.get(`http://localhost:5000/api/jobs/search?${params}`);
      let data = res.data.data || [];

      // Filter by tag if selected
      if (filters.selectedTag) {
        data = data.filter(j => j.tags?.some(t => t.toLowerCase().includes(filters.selectedTag.toLowerCase())));
      }
      // Tab filter
      if (activeTab === 'new') data = data.filter(j => Date.now() / 1000 - j.created_at < 86400);
      if (activeTab === 'remote') data = data.filter(j => j.remote);
      if (activeTab === 'research') data = data.filter(j => j.tags?.some(t => /research/i.test(t)));
      if (activeTab === 'saved') data = data.filter(j => savedSlugs.includes(j.slug));

      setJobs(prev => pg === 1 ? data : [...prev, ...data]);
      setHasMore(!!res.data.links?.next && data.length > 0);
      setTotalCount(pg === 1 ? data.length : (prev => prev + data.length));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
    setLoading(false);
  }, [applied, activeTab, savedSlugs]);

  useEffect(() => {
    setPage(1);
    fetchJobs(1);
  }, [applied, activeTab]);

  const handleApplyFilters = () => {
    setApplied({ search, location, workMode, allowRelocation, selectedTag, jobType, paidOnly });
    setFilterOpen(false);
  };

  const handleSave = (slug) => {
    setSavedSlugs(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      localStorage.setItem('saved_jobs', JSON.stringify(next));
      return next;
    });
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchJobs(next);
  };

  const displayedJobs = activeTab === 'saved' ? jobs.filter(j => savedSlugs.includes(j.slug)) : jobs;
  const activeFiltersCount = [
    applied.search,
    applied.location,
    applied.workMode !== 'all' ? applied.workMode : null,
    applied.allowRelocation ? 'relocation' : null,
    applied.selectedTag,
    applied.jobType !== 'all' ? applied.jobType : null,
    applied.paidOnly ? 'paid' : null
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-50 transition-colors duration-500">
      <div className="flex pt-16">

        {/* ── Left Sidebar (desktop) ── */}
        <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-52 flex-col border-r border-slate-800 dark:border-slate-200 bg-slate-900/95 dark:bg-white px-3 py-5 z-30 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2 mb-2">Browse</p>
          <nav className="flex flex-col gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 text-blue-400 dark:bg-blue-50 dark:text-blue-600'
                    : 'text-slate-400 dark:text-slate-600 hover:bg-slate-800 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
                {tab.id === 'saved' && savedSlugs.length > 0 && (
                  <span className="ml-auto text-[10px] bg-slate-700 dark:bg-slate-200 text-slate-300 dark:text-slate-600 px-1.5 py-0.5 rounded-full">
                    {savedSlugs.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-slate-800 dark:border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2 mb-2">Categories</p>
            {TAGS_LIST.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  const t = selectedTag === tag ? '' : tag;
                  setSelectedTag(t);
                  setApplied(prev => ({ ...prev, selectedTag: t }));
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-violet-600/20 text-violet-400 dark:bg-violet-50 dark:text-violet-600'
                    : 'text-slate-400 dark:text-slate-600 hover:bg-slate-800 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 lg:ml-52 px-4 sm:px-8 py-6 max-w-4xl">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-white dark:text-slate-900">Internships</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              Real-time opportunities powered by live job boards
            </p>
          </div>

          {/* Tabs + Search bar row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {/* Mobile tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 lg:hidden">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 bg-slate-800/60 dark:bg-slate-100 dark:text-slate-600'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 ml-auto w-full sm:w-auto">
              {/* Quick search */}
              <div ref={quickSearchRef} className="relative flex-1 sm:w-56 z-40">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setShowSuggestionsQuick(true);
                  }}
                  onFocus={() => setShowSuggestionsQuick(true)}
                  onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800 dark:bg-white border border-slate-700 dark:border-slate-300 rounded-lg text-white dark:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                {showSuggestionsQuick && matchedSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-slate-800 dark:bg-white border border-slate-700 dark:border-slate-200 rounded-lg shadow-xl z-50 py-1 scrollbar-thin">
                    {matchedSuggestions.map(role => (
                      <button
                        key={role}
                        onClick={() => handleSelectSuggestion(role)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white dark:text-slate-700 dark:hover:bg-blue-50 dark:hover:text-blue-650 transition-colors font-semibold"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Filter button */}
              <button
                onClick={() => setFilterOpen(true)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  activeFiltersCount > 0
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                    : 'border-slate-700 dark:border-slate-300 text-slate-400 dark:text-slate-600 hover:bg-slate-800 dark:hover:bg-slate-100'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {applied.search && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  "{applied.search}" <button onClick={() => { setSearch(''); setApplied(p => ({ ...p, search: '' })); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {applied.location && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  📍 {applied.location} <button onClick={() => { setLocation(''); setApplied(p => ({ ...p, location: '' })); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {applied.workMode !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase">
                  💼 {applied.workMode} <button onClick={() => { setWorkMode('all'); setApplied(p => ({ ...p, workMode: 'all' })); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {applied.allowRelocation && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  ✈️ Relocation <button onClick={() => { setAllowRelocation(false); setApplied(p => ({ ...p, allowRelocation: false })); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {applied.selectedTag && (
                <span className="inline-flex items-center gap-1 text-xs bg-violet-600/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full">
                  {applied.selectedTag} <button onClick={() => { setSelectedTag(''); setApplied(p => ({ ...p, selectedTag: '' })); }}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-800 dark:border-slate-200 mb-4" />

          {/* Job list */}
          <div className="space-y-3">
            {loading && jobs.length === 0
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : displayedJobs.map(job => (
                  <JobCard
                    key={job.slug}
                    job={job}
                    isSaved={savedSlugs.includes(job.slug)}
                    onSave={handleSave}
                  />
                ))
            }
          </div>

          {/* Empty state */}
          {!loading && displayedJobs.length === 0 && (
            <div className="text-center py-20">
              <Briefcase className="w-12 h-12 text-slate-600 dark:text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 dark:text-slate-500 text-sm">No internships found. Try different filters.</p>
            </div>
          )}

          {/* Load more */}
          {!loading && hasMore && displayedJobs.length > 0 && activeTab !== 'saved' && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 bg-slate-800 dark:bg-white border border-slate-700 dark:border-slate-300 rounded-lg text-sm font-medium text-slate-300 dark:text-slate-700 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                Load more internships
              </button>
            </div>
          )}

          {loading && jobs.length > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </main>
      </div>

      {/* ── Filter Drawer ── */}
      {filterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-slate-900 dark:bg-white border-l border-slate-800 dark:border-slate-200 z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 dark:border-slate-200">
              <h3 className="text-base font-semibold text-white dark:text-slate-900">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-2">Search by role</label>
                <div ref={drawerSearchRef} className="relative z-40">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. software engineer"
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setShowSuggestionsDrawer(true);
                    }}
                    onFocus={() => setShowSuggestionsDrawer(true)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 dark:bg-slate-50 border border-slate-700 dark:border-slate-300 rounded-lg text-sm text-white dark:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {showSuggestionsDrawer && matchedSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-slate-800 dark:bg-white border border-slate-700 dark:border-slate-200 rounded-lg shadow-xl z-50 py-1 scrollbar-thin">
                      {matchedSuggestions.map(role => (
                        <button
                          key={role}
                          onClick={() => handleSelectSuggestion(role)}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white dark:text-slate-700 dark:hover:bg-blue-50 dark:hover:text-blue-650 transition-colors font-semibold"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-2">Filter by location</label>
                <div ref={locationSearchRef} className="relative z-40">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. New York, United States"
                    value={location}
                    onChange={e => {
                      setLocation(e.target.value);
                      setShowSuggestionsLocation(true);
                    }}
                    onFocus={() => setShowSuggestionsLocation(true)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-800 dark:bg-slate-50 border border-slate-700 dark:border-slate-300 rounded-lg text-sm text-white dark:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {showSuggestionsLocation && matchedLocations.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-slate-800 dark:bg-white border border-slate-700 dark:border-slate-200 rounded-lg shadow-xl z-50 py-1 scrollbar-thin">
                      {matchedLocations.map(loc => (
                        <button
                          key={loc}
                          onClick={() => handleSelectLocation(loc)}
                          className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white dark:text-slate-700 dark:hover:bg-blue-50 dark:hover:text-blue-650 transition-colors font-semibold"
                        >
                          📍 {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-3">Category</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS_LIST.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(prev => prev === tag ? '' : tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedTag === tag
                          ? 'bg-violet-600/20 border-violet-500/50 text-violet-400'
                          : 'border-slate-700 dark:border-slate-300 text-slate-400 dark:text-slate-600 hover:border-violet-500/50 hover:text-violet-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-3">Job Type</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { id: 'all', label: '🔍 All', emoji: '' },
                    { id: 'internship', label: '🎓 Internship', emoji: '🎓' },
                    { id: 'full-time', label: '💼 Full-time', emoji: '💼' },
                    { id: 'part-time', label: '⏱️ Part-time', emoji: '⏱️' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setJobType(opt.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                        jobType === opt.id
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'border-slate-700 dark:border-slate-300 text-slate-400 dark:text-slate-600 hover:border-blue-500/40 hover:text-blue-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {jobType === 'internship' && (
                  <label className="flex items-center gap-2 cursor-pointer select-none mt-2">
                    <input
                      type="checkbox"
                      checked={paidOnly}
                      onChange={e => setPaidOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
                    />
                    <span className="text-xs text-emerald-400 dark:text-emerald-600 font-medium">💰 Paid internships only</span>
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-2">Work Mode</label>
                <select
                  value={workMode}
                  onChange={e => setWorkMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-50 border border-slate-700 dark:border-slate-300 rounded-lg text-sm text-white dark:text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Modes</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {location && (
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowRelocation}
                    onChange={e => setAllowRelocation(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 dark:border-slate-300 text-blue-600 focus:ring-blue-500 bg-slate-850 dark:bg-white"
                  />
                  <span className="text-sm text-slate-300 dark:text-slate-700 font-medium">Open to relocation (Country-wide)</span>
                </label>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 dark:border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setSearch(''); setLocation(''); setWorkMode('all'); setAllowRelocation(false); setSelectedTag(''); setJobType('all'); setPaidOnly(false);
                  setApplied({ search: '', location: '', workMode: 'all', allowRelocation: false, selectedTag: '', jobType: 'all', paidOnly: false });
                  setFilterOpen(false);
                }}
                className="flex-1 py-2.5 border border-slate-700 dark:border-slate-300 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-600 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Apply filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Jobs;
