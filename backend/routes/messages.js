const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ── GET /api/messages ──────────────────────────────────────────────────────
// Returns all messages for logged in user.
// Auto-seeds a test message from a Recruiter if they have zero messages.
router.get('/', authMiddleware, async (req, res) => {
  try {
    let messages = await Message.find({
      $or: [
        { receiverId: req.user.id },
        { senderId: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    // Auto-seed a high-fidelity test message from a Google Recruiter if empty
    if (messages.length === 0) {
      // Find or create a mock recruiter user
      let recruiter = await User.findOne({ email: 'recruiter@google.com' });
      if (!recruiter) {
        recruiter = new User({
          name: 'Sarah Jenkins',
          email: 'recruiter@google.com',
          password: 'google_mock_password', // hashed isn't strictly needed for mock fetch
          role: 'Client'
        });
        await recruiter.save();
      }

      const testMsg = new Message({
        senderId: recruiter._id,
        receiverId: req.user.id,
        jobTitle: 'Cloud Engineer Intern',
        companyName: 'Google India',
        content: `Hi there! I am Sarah, a senior recruiter at Google. We reviewed your resume from StuGig and were absolutely impressed by your skills and experience! We would love to shortlist you for our Cloud Engineering Internship team. Let's schedule a brief 30-minute virtual technical interview to discuss next steps. Looking forward to speaking!`,
        interviewTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }) + ' (GMT+5:30)',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        createdAt: new Date()
      });

      await testMsg.save();
      messages = [testMsg];
    }

    res.json(messages);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// ── POST /api/messages ─────────────────────────────────────────────────────
// Send a message to a candidate
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiverId, jobTitle, companyName, content, interviewTime, meetingLink } = req.body;
    
    if (!receiverId || !jobTitle || !companyName || !content) {
      return res.status(400).json({ message: 'Please provide receiverId, jobTitle, companyName, and content' });
    }

    const newMessage = new Message({
      senderId: req.user.id,
      receiverId,
      jobTitle,
      companyName,
      content,
      interviewTime,
      meetingLink
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// ── PATCH /api/messages/:id/read ───────────────────────────────────────────
// Mark message as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    
    if (msg.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    msg.isRead = true;
    await msg.save();
    res.json(msg);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ message: 'Server error updating message' });
  }
});

// ── POST /api/messages/send-mock ───────────────────────────────────────────
// Simulates a recruiter shortlisting a user and scheduling an interview.
router.post('/send-mock', authMiddleware, async (req, res) => {
  try {
    const companies = [
      { name: 'Microsoft', recruiter: 'David Vance', title: 'React Developer Intern', link: 'https://teams.microsoft.com/l/meetup-join/mock-123' },
      { name: 'Stripe', recruiter: 'Olivia Wilde', title: 'Backend Software Engineer', link: 'https://zoom.us/j/9876543210' },
      { name: 'Vercel', recruiter: 'Guillermo Rauch', title: 'Frontend Developer Intern', link: 'https://meet.google.com/xyz-pdq-rst' },
      { name: 'Amazon', recruiter: 'Jeff Bezos', title: 'Cloud Solutions Architect', link: 'https://chime.aws/123456' }
    ];

    const pick = companies[Math.floor(Math.random() * companies.length)];

    let recruiter = await User.findOne({ email: `recruiter@${pick.name.toLowerCase().replace(/\s+/g, '')}.com` });
    if (!recruiter) {
      recruiter = new User({
        name: pick.recruiter,
        email: `recruiter@${pick.name.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'mock_password',
        role: 'Client'
      });
      await recruiter.save();
    }

    const mockMsg = new Message({
      senderId: recruiter._id,
      receiverId: req.user.id,
      jobTitle: pick.title,
      companyName: pick.name,
      content: `Hello! I'm ${pick.recruiter} from ${pick.name}. We saw your profile on StuGig and are excited to move forward with your application for the ${pick.title} role. We've shortlisted you and would love to set up a chat on our video platform. Please click the link below at the scheduled time!`,
      interviewTime: new Date(Date.now() + 4 * 24 * 3600 * 1000).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }) + ' (GMT+5:30)',
      meetingLink: pick.link,
      createdAt: new Date()
    });

    await mockMsg.save();
    
    // Populate sender details for frontend to match standard fetch format
    const populated = await Message.findById(mockMsg._id).populate('senderId', 'name email role');

    res.json({ success: true, message: populated });
  } catch (err) {
    console.error('Send mock recruiter message error:', err);
    res.status(500).json({ message: 'Failed to simulate recruiter message' });
  }
});

module.exports = router;
