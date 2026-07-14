const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const axios = require('axios');

const router = express.Router();

// In-memory storage (no file saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are accepted'));
  }
});

// ── Skills Dictionary ─────────────────────────────────────────────────────
const SKILLS_DICT = [
  // Programming Languages
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'golang', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'dart', 'c',
  // Web
  'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'angular', 'nextjs', 'next.js',
  'svelte', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery',
  // Backend
  'node', 'node.js', 'nodejs', 'express', 'express.js', 'django', 'flask',
  'spring', 'fastapi', 'laravel', 'rails', 'graphql', 'rest', 'grpc',
  // Data / ML / AI
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
  'pandas', 'numpy', 'nlp', 'computer vision', 'data science', 'data analysis',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'power bi', 'tableau', 'excel', 'jupyter',
  // Cloud / DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform',
  'ci/cd', 'jenkins', 'github actions', 'linux', 'bash', 'devops',
  // Mobile
  'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin',
  // Design / UX
  'figma', 'adobe xd', 'sketch', 'ui/ux', 'user experience', 'prototyping',
  'canva', 'photoshop', 'illustrator',
  // Other Tech
  'git', 'github', 'agile', 'scrum', 'jira', 'postman', 'firebase', 'supabase',
  'blockchain', 'solidity', 'cybersecurity', 'networking', 'arduino', 'raspberry pi'
];

const DEGREE_PATTERNS = [
  /\bB\.?Tech\b/i, /\bB\.?E\.?\b/i, /\bB\.?Sc\b/i, /\bBachelor/i,
  /\bM\.?Tech\b/i, /\bM\.?E\.?\b/i, /\bM\.?Sc\b/i, /\bMaster/i,
  /\bMBA\b/i, /\bMCA\b/i, /\bBCA\b/i, /\bPhD\b/i, /\bB\.?Com\b/i,
  /\bB\.?A\b/i, /\bM\.?A\b/i, /\bDiploma\b/i
];

const CITY_LIST = [
  'new delhi', 'delhi', 'bangalore', 'bengaluru', 'mumbai', 'pune', 'hyderabad',
  'chennai', 'kolkata', 'noida', 'gurugram', 'gurgaon', 'ahmedabad', 'jaipur',
  'new york', 'san francisco', 'seattle', 'austin', 'boston', 'chicago', 'london',
  'berlin', 'amsterdam', 'toronto', 'singapore', 'tokyo', 'paris', 'sydney'
];

const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:work\s+)?(?:experience|exp)/i,
  /experience[^.]{0,30}(\d+)\+?\s*(?:years?|yrs?)/i,
];

// ── Resume Parser ─────────────────────────────────────────────────────────
function parseResumeText(text) {
  const lower = text.toLowerCase();

  // Extract skills
  const skills = SKILLS_DICT.filter(skill => {
    const re = new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&')}\\b`, 'i');
    return re.test(text);
  });

  // Extract degree
  let degree = null;
  for (const pattern of DEGREE_PATTERNS) {
    const match = text.match(pattern);
    if (match) { degree = match[0]; break; }
  }

  // Extract location
  let location = null;
  for (const city of CITY_LIST) {
    if (lower.includes(city)) { location = city; break; }
  }

  // Extract experience years
  let experienceYears = 0;
  for (const pattern of EXPERIENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match) { experienceYears = parseInt(match[1], 10); break; }
  }

  // Extract name (first non-empty line, heuristically)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const name = lines[0] || 'Candidate';

  return { name, skills, degree, location, experienceYears };
}

// ── POST /api/resume/upload ────────────────────────────────────────────────
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });

    const parser = new PDFParse(new Uint8Array(req.file.buffer));
    await parser.load();
    const parsedResult = await parser.getText();
    const rawText = parsedResult.text || '';
    const profile = parseResumeText(rawText);

    res.json({
      success: true,
      profile,
      rawText: rawText.slice(0, 500) // snippet for debug
    });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ message: 'Failed to parse resume: ' + err.message });
  }
});

// ── POST /api/resume/flash-jobs ────────────────────────────────────────────
// Accepts profile JSON, returns scored job list for Flash cards
router.post('/flash-jobs', async (req, res) => {
  try {
    const { skills = [], location = '', degree = '', experienceYears = 0, lookingFor = 'internship' } = req.body;

    // Build search query from top skills
    const topSkills = skills.slice(0, 3);
    let searchQuery = topSkills.length > 0 ? topSkills.join(' ') : 'software';
    if (lookingFor === 'internship') {
      searchQuery += ' internship';
    }

    // Fetch jobs from multiple sources in parallel
    const requests = [];

    // Himalayas
    requests.push(
      axios.get(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(searchQuery)}`, { timeout: 4000 })
        .then(r => (r.data?.jobs || []).map(j => ({
          slug: `himalayas-${j.slug || Math.random().toString(36).substring(7)}`,
          title: j.title,
          company_name: j.companyName || 'Company',
          location: j.locationRestrictions?.join(', ') || 'Remote',
          remote: true,
          job_types: j.employmentType ? [j.employmentType] : ['Full-time'],
          tags: j.categories || [],
          stipend: null,
          url: j.applicationLink || j.guid || 'https://himalayas.app',
          source: 'Himalayas'
        })))
        .catch(() => [])
    );

    // Remotive
    requests.push(
      axios.get(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(searchQuery)}&limit=25`, { timeout: 4000 })
        .then(r => (r.data?.jobs || []).map(j => ({
          slug: `remotive-${j.id}`,
          title: j.title,
          company_name: j.company_name,
          location: j.candidate_required_location || 'Remote',
          remote: true,
          job_types: j.job_type ? [j.job_type] : ['Full-time'],
          tags: j.tags || [],
          stipend: j.salary || null,
          url: j.url,
          source: 'Remotive'
        })))
        .catch(() => [])
    );

    // Arbeitnow
    requests.push(
      axios.get(`https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(searchQuery)}`, { timeout: 4000 })
        .then(r => (r.data?.data || []).map(j => ({
          slug: `arbeitnow-${j.slug}`,
          title: j.title,
          company_name: j.company_name,
          location: j.location,
          remote: j.remote || false,
          job_types: j.job_types || ['Full-time'],
          tags: j.tags || [],
          stipend: null,
          url: j.url,
          source: 'Arbeitnow'
        })))
        .catch(() => [])
    );

    const [himalayasJobs, remotiveJobs, arbeitnowJobs] = await Promise.all(requests);
    let allJobs = [...himalayasJobs, ...remotiveJobs, ...arbeitnowJobs];

    // Filter based on lookingFor preference
    if (lookingFor === 'internship') {
      allJobs = allJobs.filter(j => {
        const titleLower = (j.title || '').toLowerCase();
        const typesLower = (j.job_types || []).map(t => t.toLowerCase());
        return titleLower.includes('intern') || typesLower.some(t => t.includes('intern'));
      });
    } else if (lookingFor === 'job') {
      allJobs = allJobs.filter(j => {
        const titleLower = (j.title || '').toLowerCase();
        const typesLower = (j.job_types || []).map(t => t.toLowerCase());
        return !titleLower.includes('intern') && !typesLower.some(t => t.includes('intern'));
      });
    }

    // Score each job by skills overlap
    const userSkillsLower = skills.map(s => s.toLowerCase());
    allJobs = allJobs.map(job => {
      const jobText = `${job.title} ${(job.tags || []).join(' ')}`.toLowerCase();
      const matchedSkills = userSkillsLower.filter(s => jobText.includes(s));
      const matchScore = skills.length > 0
        ? Math.round((matchedSkills.length / Math.min(skills.length, 8)) * 100)
        : 50;
      return { ...job, matchScore: Math.min(matchScore, 99), matchedSkills };
    });

    // Sort by match score desc
    allJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 30 flash cards
    res.json({ success: true, jobs: allJobs.slice(0, 30) });
  } catch (err) {
    console.error('Flash jobs error:', err);
    res.status(500).json({ message: 'Failed to generate flash jobs' });
  }
});

module.exports = router;
