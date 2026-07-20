require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');

const MONGODB_URI = process.env.MONGODB_URI;

async function seedData() {
  try {
    if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
      console.log('⚠️ MongoDB URI contains placeholder <db_password>. Skipping automated database seed until real password is provided in backend/.env');
      return;
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data.');

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const sankyaHash = await bcrypt.hash('Mr.sankya@123', salt);

    const studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@digicampus.edu',
      password: passwordHash,
      role: 'student',
      department: 'Computer Science & AI',
      studentId: 'CS-2026-894',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    const sankyaAdmin = await User.create({
      name: 'Mr. Sankya',
      email: 'mr.sankya@digicampus.edu',
      password: sankyaHash,
      role: 'admin',
      department: 'School of Engineering & Administration',
      studentId: 'ADM-2026-001',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    // Alias for campuspulse email domain compatibility
    await User.create({
      name: 'Mr. Sankya',
      email: 'mr.sankya@campuspulse.edu',
      password: sankyaHash,
      role: 'admin',
      department: 'School of Engineering & Administration',
      studentId: 'ADM-2026-002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    console.log('Demo Users Created:');
    console.log(' - Student: alex.rivera@digicampus.edu / password123');
    console.log(' - Admin: mr.sankya@digicampus.edu / Mr.sankya@123');

    // Create sample events matching design mockups
    const sampleEvents = [
      {
        title: 'Annual Tech & AI Innovation Symposium 2026',
        description: 'Explore the next frontier of Artificial Intelligence, Quantum Computing, and Next-Gen Software Architecture. Feature keynotes from industry pioneers, interactive hackathon showcases, and deep-dive technical workshops.',
        category: 'Tech',
        date: new Date('2026-08-15T09:30:00'),
        time: '09:30 AM - 05:00 PM',
        location: 'Grand Academic Auditorium, Block C',
        venue: 'Main Campus Center',
        organizer: 'Department of Computer Science & AI',
        department: 'Computer Science',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        capacity: 350,
        registeredCount: 248,
        price: 0,
        isFeatured: true,
        status: 'Upcoming',
        agenda: [
          { time: '09:30 AM', title: 'Registration & Welcome Coffee', description: 'Check-in at main lobby and pick up symposium badge' },
          { time: '10:15 AM', title: 'Keynote: The Generative AI Renaissance', description: 'Dr. Sarah Lin presents state of deep learning models' },
          { time: '01:00 PM', title: 'Networking Lunch & Project Exhibition', description: 'Complimentary lunch & student demo booths' },
          { time: '02:30 PM', title: 'Panel: Ethics in Autonomous Systems', description: 'Expert discussion with industry leaders' }
        ],
        speakers: [
          { name: 'Dr. Sarah Lin', role: 'Head of AI Research', company: 'DeepMind Fellow', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
          { name: 'David K. Miller', role: 'Lead Architect', company: 'Cloud Scale Tech', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
        ],
        createdById: sankyaAdmin._id
      },
      {
        title: 'Battle of the Bands - Campus Cultural Fest',
        description: 'Get ready for an electrifying night of live rock, pop, and indie fusion bands competing for the coveted Trophy of the Year! Food trucks, light shows, and musical performances.',
        category: 'Cultural',
        date: new Date('2026-08-20T18:00:00'),
        time: '06:00 PM - 10:30 PM',
        location: 'Open Air Amphitheatre',
        venue: 'Campus Grounds',
        organizer: 'Cultural Student Union',
        department: 'Fine Arts & Music',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
        capacity: 500,
        registeredCount: 412,
        price: 5,
        isFeatured: true,
        status: 'Upcoming',
        agenda: [
          { time: '06:00 PM', title: 'Gates Open & Opening Act', description: 'DJ setup and lightshow warmups' },
          { time: '07:15 PM', title: 'Band Performances - Round 1', description: 'Top 6 qualifying student bands live on stage' },
          { time: '09:30 PM', title: 'Guest Headline Artist & Awards', description: 'Crowd voting and trophy presentation' }
        ],
        createdById: sankyaAdmin._id
      },
      {
        title: 'Inter-College Basketball Championship Finals',
        description: 'Cheer for your home team in the thrilling final round of the Inter-College Sports League. Intense action, high stakes, live commentary, and halftime performances.',
        category: 'Sports',
        date: new Date('2026-08-12T16:00:00'),
        time: '04:00 PM - 07:00 PM',
        location: 'Indoor Sports Arena Court 1',
        venue: 'Sports Complex',
        organizer: 'Department of Physical Education',
        department: 'Sports',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        capacity: 250,
        registeredCount: 180,
        price: 0,
        isFeatured: false,
        status: 'Upcoming',
        createdById: sankyaAdmin._id
      },
      {
        title: 'Full-Stack Cloud Development Workshop',
        description: 'Hands-on intensive bootcamp building scalable microservices with Node.js, Docker, MongoDB Atlas, and React. Laptops required!',
        category: 'Workshop',
        date: new Date('2026-08-18T11:00:00'),
        time: '11:00 AM - 03:00 PM',
        location: 'Computer Lab 402, IT Block',
        venue: 'IT Center',
        organizer: 'Code Crafters Club',
        department: 'Information Technology',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        capacity: 60,
        registeredCount: 55,
        price: 0,
        isFeatured: false,
        status: 'Upcoming',
        createdById: sankyaAdmin._id
      },
      {
        title: 'Future of Sustainable Energy & Green Design',
        description: 'Academic seminar exploring renewable energy integration, smart grids, and eco-friendly urban architecture with guest speakers from National Green Labs.',
        category: 'Seminar',
        date: new Date('2026-08-25T14:00:00'),
        time: '02:00 PM - 05:00 PM',
        location: 'Seminar Hall B',
        venue: 'Environmental Sciences Wing',
        organizer: 'Green Earth Student Society',
        department: 'Environmental Science',
        image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800',
        capacity: 120,
        registeredCount: 88,
        price: 0,
        isFeatured: false,
        status: 'Upcoming',
        createdById: sankyaAdmin._id
      }
    ];

    await Event.insertMany(sampleEvents);
    console.log(`Successfully seeded ${sampleEvents.length} initial events.`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
