const express = require('express');
const axios = require('axios');
const Job = require('../models/Job');
const Application = require('../models/Application');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Semantic translations and synonyms map for role filtering (English and German)
const ROLE_SYNONYMS = {
  'software engineer': [
    'software engineer', 'software developer', 'softwareentwickler', 'entwickler', 
    'softwareentwicklung', 'programmer', 'programmierer', 'developer', 'entwicklerin',
    'application developer', 'anwendungsentwickler', 'coding', 'coder'
  ],
  'software developer': [
    'software engineer', 'software developer', 'softwareentwickler', 'entwickler', 
    'softwareentwicklung', 'programmer', 'programmierer', 'developer', 'entwicklerin',
    'application developer', 'anwendungsentwickler', 'coding', 'coder'
  ],
  'junior software developer': [
    'software engineer', 'software developer', 'softwareentwickler', 'entwickler', 
    'programmer', 'developer', 'junior', 'entry level', 'werkstudent', 'softwareentwicklerin'
  ],
  'senior software engineer': [
    'software engineer', 'software developer', 'softwareentwickler', 'entwickler', 
    'programmer', 'developer', 'senior', 'lead', 'senior software developer'
  ],
  'frontend developer': [
    'frontend', 'front-end', 'web developer', 'webentwickler', 'frontend-entwickler',
    'react', 'vue', 'angular', 'javascript', 'ui developer', 'frontend-entwicklerin'
  ],
  'backend developer': [
    'backend', 'back-end', 'backend-entwickler', 'node', 'python', 'java', 'go',
    'ruby', 'c#', 'backend developer', 'backend-entwicklerin'
  ],
  'fullstack developer': [
    'fullstack', 'full-stack', 'full stack', 'fullstack developer', 'fullstack-entwickler', 'fullstack-entwicklerin'
  ],
  'cloud engineer': [
    'cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'docker', 'infrastructure'
  ],
  'cloud developer': [
    'cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'docker', 'infrastructure'
  ],
  'devops engineer': [
    'devops', 'site reliability', 'sre', 'ci/cd', 'cloud', 'sysadmin'
  ],
  'data scientist': [
    'data scientist', 'data science', 'machine learning', 'ml', 'ai', 'data science intern'
  ],
  'data analyst': [
    'data analyst', 'data analysis', 'business analyst', 'analytics', 'data analyst intern'
  ],
  'ui/ux designer': [
    'ui/ux', 'ui/ux designer', 'product designer', 'designer', 'graphic designer',
    'user experience', 'user interface'
  ],
  'product manager': [
    'product manager', 'pm', 'product owner', 'product management'
  ],
  'mobile app developer': [
    'mobile', 'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin'
  ],
  'machine learning engineer': [
    'machine learning', 'ml', 'ai', 'deep learning', 'nlp', 'computer vision'
  ],
  'ai engineer': [
    'ai', 'artificial intelligence', 'openai', 'llm', 'machine learning', 'generative ai'
  ],
  'research intern': [
    'research', 'forschung', 'researcher', 'research intern'
  ],
  'marketing intern': [
    'marketing', 'social media', 'growth', 'sales', 'seo'
  ],
  'finance assistant': [
    'finance', 'accounting', 'accountant', 'audit', 'finanz'
  ],
  'hr specialist': [
    'hr', 'human resources', 'recruiter', 'recruitment', 'personal'
  ]
};

// Programmatic strict semantic match checking
function matchJobWithQuery(job, queryTerm) {
  const cleanQuery = queryTerm.trim().toLowerCase();
  if (!cleanQuery || cleanQuery === 'internship' || cleanQuery === 'intern') return true;

  let keywords = [cleanQuery];
  // Match synonyms dictionary
  for (const [role, synonyms] of Object.entries(ROLE_SYNONYMS)) {
    if (role.includes(cleanQuery) || cleanQuery.includes(role)) {
      keywords = [...keywords, ...synonyms];
      break;
    }
  }

  const title = (job.title || '').toLowerCase();
  const tags = (job.tags || []).map(t => t.toLowerCase());

  // Check if any semantic synonym word matches the title or tags
  return keywords.some(kw => {
    return title.includes(kw) || tags.some(t => t.includes(kw));
  });
}

// Known city coordinates for proximity scoring
const CITY_COORDS = {
  'new delhi': { lat: 28.6139, lng: 77.2090, country: 'india' },
  'delhi': { lat: 28.6139, lng: 77.2090, country: 'india' },
  'bangalore': { lat: 12.9716, lng: 77.5946, country: 'india' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, country: 'india' },
  'mumbai': { lat: 19.0760, lng: 72.8777, country: 'india' },
  'pune': { lat: 18.5204, lng: 73.8567, country: 'india' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, country: 'india' },
  'chennai': { lat: 13.0827, lng: 80.2707, country: 'india' },
  'kolkata': { lat: 22.5726, lng: 88.3639, country: 'india' },
  'noida': { lat: 28.5355, lng: 77.3910, country: 'india' },
  'gurugram': { lat: 28.4595, lng: 77.0266, country: 'india' },
  'new york': { lat: 40.7128, lng: -74.0060, country: 'usa' },
  'san francisco': { lat: 37.7749, lng: -122.4194, country: 'usa' },
  'seattle': { lat: 47.6062, lng: -122.3321, country: 'usa' },
  'austin': { lat: 30.2672, lng: -97.7431, country: 'usa' },
  'boston': { lat: 42.3601, lng: -71.0589, country: 'usa' },
  'chicago': { lat: 41.8781, lng: -87.6298, country: 'usa' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'usa' },
  'london': { lat: 51.5074, lng: -0.1278, country: 'uk' },
  'manchester': { lat: 53.4808, lng: -2.2426, country: 'uk' },
  'berlin': { lat: 52.5200, lng: 13.4050, country: 'germany' },
  'munich': { lat: 48.1351, lng: 11.5820, country: 'germany' },
  'paris': { lat: 48.8566, lng: 2.3522, country: 'france' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, country: 'netherlands' },
  'toronto': { lat: 43.6532, lng: -79.3832, country: 'canada' },
  'vancouver': { lat: 49.2827, lng: -123.1207, country: 'canada' },
  'sydney': { lat: -33.8688, lng: 151.2093, country: 'australia' },
  'melbourne': { lat: -37.8136, lng: 144.9631, country: 'australia' },
  'singapore': { lat: 1.3521, lng: 103.8198, country: 'singapore' },
  'tokyo': { lat: 35.6762, lng: 139.6503, country: 'japan' }
};

// Haversine distance between two coordinates (km)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get relevance score for a job against the query (3=exact, 2=partial, 1=synonym/tag)
function getRelevanceScore(job, queryTerm) {
  const cleanQuery = queryTerm.trim().toLowerCase();
  if (!cleanQuery || cleanQuery === 'internship' || cleanQuery === 'intern') return 2;
  const title = (job.title || '').toLowerCase();
  const tags = (job.tags || []).map(t => t.toLowerCase());
  if (title.includes(cleanQuery)) return 3;
  const queryWords = cleanQuery.split(' ');
  if (queryWords.every(w => title.includes(w))) return 2;
  if (tags.some(t => t.includes(cleanQuery))) return 1;
  return 1;
}

// Get location proximity score (3=exact city, 2=same country, 1=other)
function getLocationScore(job, rawLocation, userLat, userLng) {
  if (!rawLocation && !userLat) return 1;
  const jobLoc = (job.location || '').toLowerCase();
  if (job.remote || /remote/i.test(jobLoc)) return 1; // remote jobs get neutral score

  if (rawLocation) {
    const cleanLoc = rawLocation.toLowerCase();
    // Extract city and country parts
    const parts = cleanLoc.split(',').map(s => s.trim());
    const city = parts[0];
    const country = parts[parts.length - 1];
    if (jobLoc.includes(city)) return 3;
    if (country && jobLoc.includes(country)) return 2;
  }

  // Use geolocation if no textual match
  if (userLat && userLng) {
    for (const [cityName, coords] of Object.entries(CITY_COORDS)) {
      if (jobLoc.includes(cityName)) {
        const dist = haversineDistance(parseFloat(userLat), parseFloat(userLng), coords.lat, coords.lng);
        if (dist < 50) return 3;   // within 50km
        if (dist < 500) return 2;  // within 500km (same region)
      }
    }
  }

  return 1;
}

// Helper function to generate simulated jobs for Indeed & LinkedIn
function generateSimulatedJobs(keyword, locationInput, workMode, allowRelocation, page) {
  const jobs = [];
  const keywordClean = keyword.trim().toLowerCase();
  
  let titleKeyword = keyword.trim();
  if (!titleKeyword) {
    titleKeyword = 'Cloud Engineer';
  }
  // Capitalize title words
  titleKeyword = titleKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Determine locations based on inputs
  let locations = [];
  const isIndia = /india/i.test(locationInput) || /delhi/i.test(locationInput) || /mumbai/i.test(locationInput) || /bangalore/i.test(locationInput) || /bengaluru/i.test(locationInput) || /hyderabad/i.test(locationInput) || /noida/i.test(locationInput) || /pune/i.test(locationInput);
  const isUS = /usa|united states|u\.s\./i.test(locationInput) || /new york|california|san francisco|seattle|austin/i.test(locationInput);

  if (workMode === 'remote') {
    locations = ['Remote (Worldwide)', 'Remote (USA)', 'Remote (India)', 'Remote (Europe)', 'Remote (UK)'];
  } else {
    if (locationInput) {
      if (allowRelocation) {
        if (isIndia) {
          locations = [
            'Bangalore, India',
            'Noida, India',
            'Gurugram, India',
            'Hyderabad, India',
            'Pune, India',
            'Mumbai, India',
            'Chennai, India'
          ];
        } else if (isUS) {
          locations = [
            'San Francisco, CA',
            'New York, NY',
            'Seattle, WA',
            'Austin, TX',
            'Boston, MA'
          ];
        } else {
          const parts = locationInput.split(',');
          const country = parts[parts.length - 1].trim();
          locations = [
            `Bangalore, ${country}`,
            `Berlin, ${country}`,
            `London, ${country}`,
            `Sydney, ${country}`,
            `Toronto, ${country}`,
            locationInput
          ];
        }
      } else {
        locations = [locationInput];
      }
    } else {
      locations = ['Bangalore, India', 'San Francisco, CA', 'London, UK', 'Berlin, Germany', 'Remote'];
    }
  }

  // Tech Companies
  let companies = [];
  if (isIndia && workMode !== 'remote') {
    companies = [
      { name: 'Google India', logo: 'G' },
      { name: 'Microsoft India', logo: 'M' },
      { name: 'Amazon India', logo: 'A' },
      { name: 'Flipkart', logo: 'F' },
      { name: 'TCS', logo: 'T' },
      { name: 'Infosys', logo: 'I' },
      { name: 'Wipro', logo: 'W' },
      { name: 'Paytm', logo: 'P' },
      { name: 'Zomato', logo: 'Z' },
      { name: 'Swiggy', logo: 'S' }
    ];
  } else if (isUS && workMode !== 'remote') {
    companies = [
      { name: 'Google', logo: 'G' },
      { name: 'Meta', logo: 'M' },
      { name: 'Apple', logo: 'A' },
      { name: 'Netflix', logo: 'N' },
      { name: 'Amazon', logo: 'A' },
      { name: 'Microsoft', logo: 'M' },
      { name: 'Stripe', logo: 'S' },
      { name: 'Airbnb', logo: 'A' },
      { name: 'OpenAI', logo: 'O' }
    ];
  } else {
    companies = [
      { name: 'Google', logo: 'G' },
      { name: 'Amazon', logo: 'A' },
      { name: 'Microsoft', logo: 'M' },
      { name: 'Stripe', logo: 'S' },
      { name: 'GitHub', logo: 'G' },
      { name: 'Vercel', logo: 'V' },
      { name: 'Canva', logo: 'C' },
      { name: 'Spotify', logo: 'S' },
      { name: 'Figma', logo: 'F' }
    ];
  }

  const count = 4;
  // Generate varied job types
  const jobTypesList = ['Internship', 'Full-time', 'Part-time', 'Internship'];

  const titles = [
    `${titleKeyword} Intern`,
    `Junior ${titleKeyword} Developer`,
    `${titleKeyword} Engineering Intern`,
    `Summer 2026 ${titleKeyword} Intern`,
    `Graduate ${titleKeyword} Intern`,
    `${titleKeyword} Trainee`,
    `Associate ${titleKeyword} Intern`,
    `Research Intern - ${titleKeyword}`
  ];

  const tags = [titleKeyword, 'Software Engineering', 'Tech Internship', 'Development', 'Programming'];
  const sources = ['Indeed Partner', 'LinkedIn Partner', 'Glassdoor'];

  for (let i = 0; i < count; i++) {
    const company = companies[(i + page) % companies.length];
    const loc = locations[(i + page) % locations.length];
    const isRemote = /remote/i.test(loc) || workMode === 'remote';
    const jobType = jobTypesList[i % jobTypesList.length];

    // Spread simulated jobs over the last 3-10 days so fresh live jobs sit on top
    const secondsAgo = 3600 * 24 * (i + 3) * page;
    const createdAt = Math.floor(Date.now() / 1000) - secondsAgo;

    const title = titles[i % titles.length];
    const source = sources[i % sources.length];
    const slug = `sim-${keywordClean.replace(/\s+/g, '-')}-${company.name.toLowerCase().replace(/\s+/g, '-')}-${i}-${page}-${Math.random().toString(36).substring(2, 6)}`;
    const description = `We are looking for a passionate ${title} to join our team at ${company.name}. You will work on production-level projects, collaborate with senior engineers, and gain hands-on experience with ${titleKeyword} tools. Candidates should have a strong foundation in computer science principles and a desire to learn.`;

    // Stipend/salary based on job type and location
    let stipend = null;
    const isIndiaLoc = /india|delhi|mumbai|bangalore|bengaluru|hyderabad|noida|pune|gurugram|chennai/i.test(loc);
    const isUSLoc = /usa|united states|new york|san francisco|seattle|austin|boston|chicago|los angeles/i.test(loc);
    if (jobType === 'Internship') {
      stipend = isIndiaLoc ? '₹15,000–30,000/mo' : isUSLoc ? '$2,500–5,000/mo' : '€800–1,500/mo';
    } else if (jobType === 'Full-time') {
      stipend = isIndiaLoc ? '₹6–15 LPA' : isUSLoc ? '$80,000–130,000/yr' : '€45,000–80,000/yr';
    } else if (jobType === 'Part-time') {
      stipend = isIndiaLoc ? '₹8,000–15,000/mo' : isUSLoc ? '$20–40/hr' : '€12–25/hr';
    }

    jobs.push({
      slug,
      title,
      company_name: company.name,
      location: loc,
      remote: isRemote,
      job_types: [jobType],
      tags: tags.slice(0, 3),
      created_at: createdAt,
      stipend,
      url: `https://www.indeed.com/jobs?q=${encodeURIComponent(title)}&l=${encodeURIComponent(loc)}`,
      description,
      source
    });
  }

  return jobs;
}

// GET /api/jobs/search
router.get('/search', async (req, res) => {
  try {
    const queryTerm = req.query.search || 'internship';
    const rawLocation = req.query.location || '';
    const workMode = req.query.workMode || 'all'; // all, remote, onsite, hybrid
    const allowRelocation = req.query.allowRelocation === 'true';
    const page = parseInt(req.query.page) || 1;

    let mergedJobs = [];

    // Helper to check if location is India
    const isIndia = (loc) => /india/i.test(loc) || /delhi/i.test(loc) || /mumbai/i.test(loc) || /bangalore/i.test(loc) || /bengaluru/i.test(loc) || /hyderabad/i.test(loc) || /noida/i.test(loc) || /pune/i.test(loc) || /chennai/i.test(loc);
    
    // Determine the query location for live APIs
    let apiLocation = rawLocation;
    if (allowRelocation) {
      if (isIndia(rawLocation)) {
        apiLocation = 'India';
      } else if (/usa|united states|u\.s\./i.test(rawLocation)) {
        apiLocation = 'United States';
      } else if (/germany|deutschland/i.test(rawLocation)) {
        apiLocation = 'Germany';
      } else if (/uk|united kingdom|london/i.test(rawLocation)) {
        apiLocation = 'United Kingdom';
      }
    }

    // 1. Fetch from Arbeitnow (Germany/Europe + some worldwide)
    let arbeitnowJobs = [];
    try {
      const arbeitnowRes = await axios.get(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(queryTerm)}&page=${page}`, { timeout: 3000 });
      if (arbeitnowRes.data && arbeitnowRes.data.data) {
        arbeitnowJobs = arbeitnowRes.data.data.map(j => ({
          slug: `arbeitnow-${j.slug || Math.random().toString(36).substring(7)}`,
          title: j.title,
          company_name: j.company_name,
          location: j.location,
          remote: j.remote || false,
          job_types: j.job_types || ['Internship'],
          tags: j.tags || [],
          created_at: j.created_at || Math.floor(Date.now() / 1000),
          url: j.url,
          description: j.description || '',
          source: 'Arbeitnow'
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch from Arbeitnow:', err.message);
    }

    // 2. Fetch from Himalayas Remote Jobs (Remote only)
    let himalayasJobs = [];
    if (workMode === 'remote' || workMode === 'all') {
      try {
        const himalayasRes = await axios.get(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(queryTerm)}&page=${page}`, { timeout: 3000 });
        if (himalayasRes.data && himalayasRes.data.jobs) {
          himalayasJobs = himalayasRes.data.jobs.map(j => ({
            slug: `himalayas-${j.slug || Math.random().toString(36).substring(7)}`,
            title: j.title,
            company_name: j.companyName || 'Company',
            location: j.locationRestrictions && j.locationRestrictions.length > 0 ? j.locationRestrictions.join(', ') : 'Remote',
            remote: true,
            job_types: j.employmentType ? [j.employmentType] : ['Internship'],
            tags: j.categories || [],
            created_at: j.pubDate || Math.floor(Date.now() / 1000),
            url: j.applicationLink || j.guid || 'https://himalayas.app',
            description: j.description || j.excerpt || '',
            source: 'Himalayas'
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch from Himalayas:', err.message);
      }
    }

    // 2.5. Fetch from Remotive API (Remote only)
    let remotiveJobs = [];
    if (workMode === 'remote' || workMode === 'all') {
      try {
        const remotiveRes = await axios.get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(queryTerm)}&limit=30`, { timeout: 3000 });
        if (remotiveRes.data && remotiveRes.data.jobs) {
          remotiveJobs = remotiveRes.data.jobs.map(j => ({
            slug: `remotive-${j.id || Math.random().toString(36).substring(7)}`,
            title: j.title,
            company_name: j.company_name,
            location: j.candidate_required_location || 'Remote',
            remote: true,
            job_types: j.job_type ? [j.job_type] : ['Internship'],
            tags: j.tags || [],
            created_at: j.publication_date ? Math.floor(Date.parse(j.publication_date) / 1000) : Math.floor(Date.now() / 1000),
            url: j.url,
            description: j.description || '',
            stipend: j.salary ? j.salary : null,
            source: 'Remotive'
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch from Remotive:', err.message);
      }
    }

    // 3. Fetch from The Muse
    let museJobs = [];
    try {
      const museParams = new URLSearchParams();
      museParams.set('page', (page - 1).toString()); // 0-indexed
      museParams.set('level', 'Internship');
      
      // Category mapping for The Muse API
      if (/software|developer|frontend|backend|cloud|fullstack/i.test(queryTerm)) {
        museParams.set('category', 'Software Engineering');
      } else if (/design|ux|ui/i.test(queryTerm)) {
        museParams.set('category', 'Design');
      } else if (/marketing|sales/i.test(queryTerm)) {
        museParams.set('category', 'Marketing');
      }

      if (workMode !== 'remote' && apiLocation) {
        museParams.set('location', apiLocation);
      }

      const museRes = await axios.get(`https://www.themuse.com/api/public/jobs?${museParams.toString()}`, { timeout: 3000 });
      if (museRes.data && museRes.data.results) {
        museJobs = museRes.data.results.map(j => {
          const loc = j.locations && j.locations.length > 0 ? j.locations.map(l => l.name).join(', ') : 'Global';
          return {
            slug: `muse-${j.id || Math.random().toString(36).substring(7)}`,
            title: j.name,
            company_name: j.company?.name || 'Company',
            location: loc,
            remote: /remote/i.test(loc),
            job_types: j.levels ? j.levels.map(l => l.name) : ['Internship'],
            tags: j.categories ? j.categories.map(c => c.name) : [],
            created_at: j.publication_date ? Math.floor(Date.parse(j.publication_date) / 1000) : Math.floor(Date.now() / 1000),
            url: j.refs?.landing_page || 'https://www.themuse.com',
            description: j.contents || '',
            source: 'The Muse'
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch from The Muse:', err.message);
    }

    // Accept jobType, userLat, userLng for filtering & proximity scoring
    const jobType = req.query.jobType || 'all'; // all, internship, full-time, part-time
    const paidOnly = req.query.paidOnly === 'true';
    const userLat = req.query.userLat ? parseFloat(req.query.userLat) : null;
    const userLng = req.query.userLng ? parseFloat(req.query.userLng) : null;

    // Merge and Deduplicate live jobs
    mergedJobs = [...arbeitnowJobs, ...himalayasJobs, ...remotiveJobs, ...museJobs];

    // Filter live jobs based on workMode (Remote, Hybrid, Onsite)
    if (workMode === 'remote') {
      mergedJobs = mergedJobs.filter(j => j.remote || /remote/i.test(j.location));
    } else if (workMode === 'onsite') {
      mergedJobs = mergedJobs.filter(j => !j.remote && !/remote/i.test(j.location));
    } else if (workMode === 'hybrid') {
      mergedJobs = mergedJobs.filter(j => /hybrid/i.test(j.location) || /hybrid/i.test(j.title));
    }

    // Filter live jobs based on location (if not remote and not empty)
    if (workMode !== 'remote' && rawLocation) {
      const locRegex = new RegExp(rawLocation.replace(/[^a-zA-Z0-9]/g, '\\$&'), 'i');
      const countrySearch = allowRelocation ? apiLocation : rawLocation;
      const countryRegex = new RegExp(countrySearch.replace(/[^a-zA-Z0-9]/g, '\\$&'), 'i');

      mergedJobs = mergedJobs.filter(j => {
        if (allowRelocation) {
          return countryRegex.test(j.location) || locRegex.test(j.location);
        }
        return locRegex.test(j.location);
      });
    }

    // 4. Supplement with simulated jobs (Indeed, LinkedIn, Glassdoor)
    const simulatedJobs = generateSimulatedJobs(queryTerm, rawLocation, workMode, allowRelocation, page);
    mergedJobs = [...mergedJobs, ...simulatedJobs];

    // Strictly match results by job title and semantic synonyms
    mergedJobs = mergedJobs.filter(j => matchJobWithQuery(j, queryTerm));

    // Filter by job type if specified
    if (jobType !== 'all') {
      mergedJobs = mergedJobs.filter(j => {
        const types = (j.job_types || []).map(t => t.toLowerCase());
        const titleLower = (j.title || '').toLowerCase();
        if (jobType === 'internship') {
          return types.some(t => t.includes('intern')) || titleLower.includes('intern');
        } else if (jobType === 'full-time') {
          return types.some(t => t.includes('full'));
        } else if (jobType === 'part-time') {
          return types.some(t => t.includes('part'));
        }
        return true;
      });
      // If paidOnly under internship filter, exclude jobs with no stipend
      if (jobType === 'internship' && paidOnly) {
        mergedJobs = mergedJobs.filter(j => j.stipend && j.stipend !== null);
      }
    }

    // Composite sort: relevance (3>2>1) × location proximity (3>2>1) × recency
    mergedJobs.sort((a, b) => {
      const relA = getRelevanceScore(a, queryTerm);
      const relB = getRelevanceScore(b, queryTerm);
      if (relB !== relA) return relB - relA; // Higher relevance first

      const locA = getLocationScore(a, rawLocation, userLat, userLng);
      const locB = getLocationScore(b, rawLocation, userLat, userLng);
      if (locB !== locA) return locB - locA; // Closer location first

      return b.created_at - a.created_at; // Most recent last tie-breaker
    });

    // Paginate merged results
    const limit = 15;
    const startIndex = (page - 1) * limit;
    const paginatedJobs = mergedJobs.slice(startIndex, startIndex + limit);
    const hasNextPage = mergedJobs.length > startIndex + limit;

    res.json({
      data: paginatedJobs,
      links: {
        next: hasNextPage ? `http://localhost:5000/api/jobs/search?search=${encodeURIComponent(queryTerm)}&location=${encodeURIComponent(rawLocation)}&workMode=${workMode}&allowRelocation=${allowRelocation}&jobType=${jobType}&page=${page + 1}` : null
      },
      meta: {
        total: mergedJobs.length,
        page,
        limit
      }
    });

  } catch (err) {
    console.error('Search route error:', err);
    res.status(500).json({ message: 'Server error search opportunities' });
  }
});

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// POST a new job (For seeding or Client posting)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newJob = new Job({ ...req.body, posterId: req.user.id });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating job' });
  }
});

// POST apply to a job
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;
    const applicantId = req.user.id;
    
    // Check if already applied
    const existingApp = await Application.findOne({ jobId, applicantId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied to this opportunity.' });
    }

    const newApp = new Application({
      jobId,
      applicantId,
      coverLetter: req.body.coverLetter || ''
    });

    await newApp.save();
    res.status(201).json({ message: 'Application submitted successfully!', application: newApp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error applying to job' });
  }
});

module.exports = router;
