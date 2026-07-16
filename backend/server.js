require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resume');
const messagesRoutes = require('./routes/messages');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stugig').trim();
const JWT_SECRET = (process.env.JWT_SECRET || 'stugig_super_secret_key_12345').trim();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Log origin checking to help debug CORS setup on Render
    console.log(`[CORS] Request Origin: "${origin}" | Allowed:`, allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Return false instead of throwing a 500 error, so browser gets standard CORS block
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/messages', messagesRoutes);

// Special endpoint to get admin token — disabled in production
app.get('/api/auth/admin-token', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not available in production' });
  }
  try {
    const User = require('./models/User');
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) return res.status(404).json({ message: 'Admin not seeded yet' });
    const token = jwt.sign(
      { id: admin._id.toString(), role: admin.role, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: admin._id.toString(), name: admin.name, email: admin.email, role: admin.role, isAdmin: true }
    });
  } catch (err) {
    console.error('admin-token error:', err);
    res.status(500).json({ message: 'Error generating admin token' });
  }
});

// Seed admin user + mock internships on startup
const seedData = async () => {
  const User = require('./models/User');
  const Job = require('./models/Job');

  // Seed Admin
  const existingAdmin = await User.findOne({ email: 'admin@stugig.com' });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Site Admin',
      email: 'admin@stugig.com',
      password: hashedPassword,
      role: 'Admin',
      isAdmin: true,
    });
    console.log('✅ Admin user seeded: admin@stugig.com / admin123');
  }

  // Seed Internships
  const jobCount = await Job.countDocuments();
  if (jobCount === 0) {
    await Job.insertMany([
      { title: 'Frontend Developer Intern', company: 'TechCorp', location: 'Remote', salary: '$20-$25/hr', description: 'Build stunning UIs with React and TailwindCSS.', type: 'Internship' },
      { title: 'UI/UX Design Intern', company: 'Creative Solutions', location: 'New York, NY', salary: '$18-$22/hr', description: 'Design user flows, wireframes, and high-fidelity prototypes.', type: 'Part-time' },
      { title: 'Data Science Intern', company: 'DataWiz', location: 'San Francisco, CA', salary: '$30-$35/hr', description: 'Work with Python, Pandas, and ML models on real datasets.', type: 'Internship' },
      { title: 'Marketing Assistant Intern', company: 'BrandBoost', location: 'Remote', salary: 'Unpaid + Certificate', description: 'Assist in social media campaigns and content writing.', type: 'Internship' },
      { title: 'Backend Node.js Intern', company: 'ServerPro', location: 'Austin, TX', salary: '$25/hr', description: 'Build scalable REST APIs using Node.js, Express, and MongoDB.', type: 'Internship' },
      { title: 'Graphic Design Intern', company: 'ArtStudio', location: 'Remote', salary: '$15/hr', description: 'Create brand assets, logos, and marketing materials.', type: 'Part-time' },
      { title: 'Mobile App Developer Intern', company: 'AppLaunch', location: 'Remote', salary: '$22/hr', description: 'Develop cross-platform apps with React Native.', type: 'Internship' },
      { title: 'Content Writing Intern', company: 'WordCraft', location: 'Remote', salary: '$12/hr', description: 'Write SEO-optimized blog posts and technical articles.', type: 'Part-time' },
    ]);
    console.log('✅ Seeded 8 internship listings');
  }
};

const connectDB = async () => {
  try {
    console.log(`Attempting to connect to ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to Local MongoDB');
  } catch (err) {
    console.log('Failed to connect to Local MongoDB. Falling back to In-Memory MongoDB Server...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Connected to In-Memory MongoDB at ${uri}`);
    } catch (memErr) {
      console.error('Failed to start In-Memory MongoDB:', memErr);
    }
  }
};

connectDB().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔑 Admin login: admin@stugig.com / admin123`);
  });
});
