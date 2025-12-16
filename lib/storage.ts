// Local storage management for Go Start Hub
// In production, this would be replaced with a proper database

const STORAGE_KEYS = {
  USERS: 'dreamify_users',
  STARTUPS: 'dreamify_startups',
  MENTORS: 'dreamify_mentors',
  FUNDING_OPPORTUNITIES: 'dreamify_funding_opportunities',
  APPLICATIONS: 'dreamify_applications',
  MENTORSHIP_REQUESTS: 'dreamify_mentorship_requests',
  PROGRAMMES: 'dreamify_programmes',
  EVENTS: 'dreamify_events',
  PROGRAMME_REGISTRATIONS: 'dreamify_programme_registrations',
  EVENT_REGISTRATIONS: 'dreamify_event_registrations',
  SESSION: 'dreamify_session',
  SUBSCRIPTIONS: 'dreamify_subscriptions',
  PROMO_CODES: 'dreamify_promo_codes',
  NOTIFICATIONS: 'dreamify_notifications',
  COMMENTS: 'dreamify_comments',
  ACTIVITIES: 'dreamify_activities',
};

export const storage = {
  // Users
  getUsers: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Mentors
  getMentors: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MENTORS);
    return data ? JSON.parse(data) : [];
  },

  saveMentors: (mentors: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));
  },

  // Startups
  getStartups: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.STARTUPS);
    let startups = data ? JSON.parse(data) : [];

    // Migration: Remove Lapasar and add new university IoT startups
    let updated = false;

    // Remove Lapasar if it exists
    const lapasarIndex = startups.findIndex((s: any) => s.id === '1' && s.title === 'Lapasar');
    if (lapasarIndex !== -1) {
      startups = startups.filter((s: any) => !(s.id === '1' && s.title === 'Lapasar'));
      updated = true;
    }

    // Update existing SmartCampus IoT System startup with PDF if it exists
    const smartCampusIndex = startups.findIndex((s: any) => s.id === '1' && s.title === 'SmartCampus IoT System');
    if (smartCampusIndex !== -1) {
      if (!startups[smartCampusIndex].pitchPdf || startups[smartCampusIndex].pitchPdf === '') {
        startups[smartCampusIndex].pitchPdf = '/pitchdeck/SmartCampus IoT Pitch Deck.pdf';
        updated = true;
      }
    }

    // Check if new startups exist, if not add them
    const existingIds = new Set(startups.map((s: any) => s.id));
    const newStartups = [
      {
        id: '1',
        title: 'SmartCampus IoT System',
        description: 'A comprehensive IoT-based campus management system developed by university students to monitor and optimize energy consumption, security, and facility management. The system uses sensors and AI to provide real-time insights and automated control for university campuses, reducing operational costs by up to 30%.',
        innovatorId: 'user1',
        innovatorName: 'Ahmad Firdaus',
        university: 'Universiti Teknologi Malaysia (UTM)',
        projectType: 'uni',
        category: 'IoT & Hardware',
        stage: 'testing',
        growthStage: 'early-stage',
        fundingNeeded: 50000,
        fundingReceived: 25000,
        views: 245,
        likes: 18,
        images: ['/images/smartcampusiot.png'],
        image: '/images/smartcampusiot.png',
        tags: ['IoT', 'Smart Campus', 'Energy Management', 'University Innovation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'A comprehensive IoT-based campus management system developed by university students to monitor and optimize energy consumption, security, and facility management. The system uses sensors and AI to provide real-time insights and automated control for university campuses, reducing operational costs by up to 30%.',
          },
          contactInfo: {
            location: 'Universiti Teknologi Malaysia, Skudai, Johor',
            url: 'https://smartcampusiot.com',
            email: 'contact@smartcampusiot.com',
            phone: '+60123456789',
          },
          keyPeople: [
            { name: 'Ahmad Firdaus', role: 'Founder, Lead Developer' },
            { name: 'Nurul Aina', role: 'Co-Founder, Hardware Engineer' },
            { name: 'Lim Wei Jie', role: 'Co-Founder, AI Specialist' },
          ],
          programmes: ['UTM Innovation Challenge 2024', 'Go Start Hub Pre-Accelerator Bootcamp'],
          foundedYear: 2024,
          legalName: 'SMARTCAMPUS IOT SDN. BHD.',
          commercialName: 'SmartCampus IoT System',
          growthStage: 'Early',
          primaryHQ: 'Johor',
          primaryIndustry: 'IoT & Hardware',
          otherIndustries: ['Education Technology', 'Smart City'],
          primaryTechnology: 'IoT',
          otherTechnology: ['AI/ML', 'Cloud Platform', 'Sensor Networks'],
          companySize: '1-10',
        },
        team: {
          companySize: '1 - 10',
          totalFounders: 3,
          totalTopManagement: 0,
          otherEmployees: 2,
          founders: [
            { name: 'Ahmad Firdaus', role: 'Founder, Lead Developer', linkedin: 'https://linkedin.com/in/ahmadfirdaus' },
            { name: 'Nurul Aina', role: 'Co-Founder, Hardware Engineer', linkedin: 'https://linkedin.com/in/nurulaina' },
            { name: 'Lim Wei Jie', role: 'Co-Founder, AI Specialist', linkedin: 'https://linkedin.com/in/limweijie' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 3,
          lastDealDetails: {
            amount: '75,000',
            currency: 'MYR',
            date: 'Nov 2024',
          },
          totalFundraised: 'MYR 75,000',
          latestValuation: 'MYR 600,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '/pitchdeck/SmartCampus IoT Pitch Deck.pdf',
        news: [
          {
            id: 'news1',
            title: 'UTM Students Develop Smart Campus IoT System',
            date: '15 Nov 2024',
            time: '10:00 AM',
            content: 'A team of UTM students has developed an innovative IoT system for campus management that has been successfully piloted in their university. The system has shown significant energy savings and improved facility management efficiency. The team is now seeking funding to scale the solution to other universities.',
            programmes: ['UTM Innovation Challenge 2024'],
          },
        ],
      },
      {
        id: '6',
        title: 'AgriSense IoT Platform',
        description: 'An IoT-based agricultural monitoring system created by university students to help farmers optimize crop yields through real-time soil, weather, and crop health monitoring. The platform uses sensors, drones, and machine learning to provide actionable insights for precision agriculture.',
        innovatorId: 'user6',
        innovatorName: 'Siti Nurhaliza',
        university: 'Universiti Putra Malaysia (UPM)',
        projectType: 'uni',
        category: 'IoT & Hardware',
        stage: 'testing',
        growthStage: 'early-stage',
        fundingNeeded: 80000,
        fundingReceived: 35000,
        views: 189,
        likes: 12,
        images: ['/images/agriculturalmonitoring system.png'],
        image: '/images/agriculturalmonitoring system.png',
        tags: ['IoT', 'Agriculture', 'Precision Farming', 'University Innovation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'An IoT-based agricultural monitoring system created by university students to help farmers optimize crop yields through real-time soil, weather, and crop health monitoring. The platform uses sensors, drones, and machine learning to provide actionable insights for precision agriculture.',
          },
          contactInfo: {
            location: 'Universiti Putra Malaysia, Serdang, Selangor',
            url: 'https://agrisenseiot.com',
            email: 'info@agrisenseiot.com',
            phone: '+60198765432',
          },
          keyPeople: [
            { name: 'Siti Nurhaliza', role: 'Founder, CEO' },
            { name: 'Muhammad Hafiz', role: 'Co-Founder, IoT Engineer' },
            { name: 'Tan Mei Ling', role: 'Co-Founder, Data Scientist' },
          ],
          programmes: ['UPM Innovation Hub', 'Go Start Hub Hackathon 2025'],
          foundedYear: 2024,
          legalName: 'AGRISENSE IOT SDN. BHD.',
          commercialName: 'AgriSense IoT Platform',
          growthStage: 'Early',
          primaryHQ: 'Selangor',
          primaryIndustry: 'Agriculture',
          otherIndustries: ['IoT & Hardware'],
          primaryTechnology: 'IoT',
          otherTechnology: ['AI/ML', 'Drone Technology', 'Sensor Networks'],
          companySize: '1-10',
        },
        team: {
          companySize: '1 - 10',
          totalFounders: 3,
          totalTopManagement: 0,
          otherEmployees: 1,
          founders: [
            { name: 'Siti Nurhaliza', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/sitinurhaliza' },
            { name: 'Muhammad Hafiz', role: 'Co-Founder, IoT Engineer', linkedin: 'https://linkedin.com/in/muhammadhafiz' },
            { name: 'Tan Mei Ling', role: 'Co-Founder, Data Scientist', linkedin: 'https://linkedin.com/in/tanmeiling' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 2,
          lastDealDetails: {
            amount: '100,000',
            currency: 'MYR',
            date: 'Oct 2024',
          },
          totalFundraised: 'MYR 100,000',
          latestValuation: 'MYR 800,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news6-1',
            title: 'UPM Students Launch AgriSense IoT Platform for Smart Farming',
            date: '8 Oct 2024',
            time: '2:30 PM',
            content: 'A team of UPM students has launched AgriSense, an IoT platform that helps farmers monitor and optimize their crops. The system has been tested on several farms in Selangor with promising results, showing 20% improvement in crop yields. The team is now expanding to more farms across Malaysia.',
            programmes: ['UPM Innovation Hub'],
          },
        ],
      },
      {
        id: '7',
        title: 'SmartHome Automation System',
        description: 'A university-developed home automation system that integrates IoT devices, AI voice control, and energy management. The system allows homeowners to control lighting, security, climate, and appliances through a unified mobile app, reducing energy consumption and enhancing home security.',
        innovatorId: 'user7',
        innovatorName: 'Lee Jia Wei',
        university: 'Universiti Malaya (UM)',
        projectType: 'uni',
        category: 'IoT & Hardware',
        stage: 'startup',
        growthStage: 'early-stage',
        fundingNeeded: 60000,
        fundingReceived: 30000,
        views: 312,
        likes: 24,
        images: ['/images/smarthome.jpg'],
        image: '/images/smarthome.jpg',
        tags: ['IoT', 'Smart Home', 'Automation', 'University Innovation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'A university-developed home automation system that integrates IoT devices, AI voice control, and energy management. The system allows homeowners to control lighting, security, climate, and appliances through a unified mobile app, reducing energy consumption and enhancing home security.',
          },
          contactInfo: {
            location: 'Universiti Malaya, Kuala Lumpur',
            url: 'https://smarthomeautomation.my',
            email: 'hello@smarthomeautomation.my',
            phone: '+60123456790',
          },
          keyPeople: [
            { name: 'Lee Jia Wei', role: 'Founder, CEO' },
            { name: 'Nur Izzati', role: 'Co-Founder, Software Engineer' },
            { name: 'Chong Yew Meng', role: 'Co-Founder, Hardware Engineer' },
          ],
          programmes: ['UM Innovation Challenge', 'Go Start Hub Accelerator 2025'],
          foundedYear: 2024,
          legalName: 'SMARTHOME AUTOMATION SDN. BHD.',
          commercialName: 'SmartHome Automation System',
          growthStage: 'Early',
          primaryHQ: 'Kuala Lumpur',
          primaryIndustry: 'IoT & Hardware',
          otherIndustries: ['Consumer Electronics'],
          primaryTechnology: 'IoT',
          otherTechnology: ['AI/ML', 'Mobile App', 'Voice Control'],
          companySize: '1-10',
        },
        team: {
          companySize: '1 - 10',
          totalFounders: 3,
          totalTopManagement: 0,
          otherEmployees: 3,
          founders: [
            { name: 'Lee Jia Wei', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/leejiawei' },
            { name: 'Nur Izzati', role: 'Co-Founder, Software Engineer', linkedin: 'https://linkedin.com/in/nurizzati' },
            { name: 'Chong Yew Meng', role: 'Co-Founder, Hardware Engineer', linkedin: 'https://linkedin.com/in/chongyewmeng' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 4,
          lastDealDetails: {
            amount: '150,000',
            currency: 'MYR',
            date: 'Sep 2024',
          },
          totalFundraised: 'MYR 150,000',
          latestValuation: 'MYR 1,200,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news7-1',
            title: 'UM Students Develop Affordable Smart Home System',
            date: '20 Sep 2024',
            time: '11:15 AM',
            content: 'A team of UM students has developed an affordable smart home automation system that makes home automation accessible to middle-income families. The system has been installed in over 50 homes in the Klang Valley with positive feedback. The team is now seeking funding to scale production and expand nationwide.',
            programmes: ['UM Innovation Challenge'],
          },
        ],
      },
    ];

    // Add new startups if they don't exist
    newStartups.forEach((newStartup) => {
      if (!existingIds.has(newStartup.id)) {
        startups.push(newStartup);
        updated = true;
      }
    });

    // Add a company startup if it doesn't exist
    if (!existingIds.has('8')) {
      const companyStartup = {
        id: '8',
        title: 'TechCorp Solutions',
        description: 'A leading technology solutions company providing enterprise software and cloud services to businesses across Malaysia. Specializing in digital transformation, we help companies modernize their operations with cutting-edge technology solutions.',
        innovatorId: 'user8',
        innovatorName: 'David Tan',
        companyName: 'TechCorp Solutions Sdn. Bhd.',
        projectType: 'company',
        category: 'Software',
        stage: 'startup',
        growthStage: 'mid-stage',
        fundingNeeded: 2000000,
        fundingReceived: 1500000,
        views: 856,
        likes: 67,
        images: ['/images/techcorp.jpg'],
        image: '/images/techcorp.jpg',
        tags: ['Enterprise Software', 'Cloud Services', 'Digital Transformation', 'B2B'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'A leading technology solutions company providing enterprise software and cloud services to businesses across Malaysia. Specializing in digital transformation, we help companies modernize their operations with cutting-edge technology solutions.',
          },
          contactInfo: {
            location: 'Kuala Lumpur, Malaysia',
            url: 'https://techcorpsolutions.my',
            email: 'info@techcorpsolutions.my',
            phone: '+60312345678',
          },
          keyPeople: [
            { name: 'David Tan', role: 'Founder, CEO' },
            { name: 'Jennifer Lim', role: 'Co-Founder, CTO' },
            { name: 'Michael Chen', role: 'Head of Sales' },
          ],
          programmes: ['NEXEA Accelerator 2023'],
          foundedYear: 2021,
          legalName: 'TECHCORP SOLUTIONS SDN. BHD.',
          commercialName: 'TechCorp Solutions',
          growthStage: 'Mid',
          primaryHQ: 'Kuala Lumpur',
          primaryIndustry: 'Software',
          otherIndustries: ['Enterprise Technology'],
          primaryTechnology: 'Cloud Computing',
          otherTechnology: ['Enterprise Software', 'SaaS'],
          companySize: '51-200',
        },
        team: {
          companySize: '51 - 200',
          totalFounders: 2,
          totalTopManagement: 1,
          otherEmployees: 45,
          founders: [
            { name: 'David Tan', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/davidtan' },
            { name: 'Jennifer Lim', role: 'Co-Founder, CTO', linkedin: 'https://linkedin.com/in/jenniferlim' },
          ],
          topManagement: [
            { name: 'Michael Chen', role: 'Head of Sales', linkedin: 'https://linkedin.com/in/michaelchen' },
          ],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 3,
          totalInvestors: 8,
          lastDealDetails: {
            amount: '500,000',
            currency: 'MYR',
            date: 'Sep 2024',
          },
          totalFundraised: 'MYR 1,500,000',
          latestValuation: 'MYR 12,000,000',
          latestFundingRound: 'Series A',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news8-1',
            title: 'TechCorp Solutions Secures RM 500,000 in Series A Funding',
            date: '15 Sep 2024',
            time: '3:00 PM',
            content: 'TechCorp Solutions has successfully raised RM 500,000 in Series A funding to expand their enterprise software solutions. The company plans to use the funding to scale their operations and reach more businesses across Southeast Asia.',
            programmes: ['NEXEA Accelerator 2023'],
          },
        ],
      };
      startups.push(companyStartup);
      updated = true;
    }

    // Add image field and other missing fields to existing startups
    const imageMap: Record<string, string> = {
      '2': '/images/edutech.png', // EduTech AI
      '3': '/images/greencyclesolutions.png', // GreenCycle Solutions
      '4': '/images/medicareconnect.jpg', // MediCare Connect
      '5': '/images/foodiehub.jpg', // FoodieHub
    };

    // University and project type mapping
    const universityMap: Record<string, { university?: string; projectType: 'uni' | 'individual' | 'company' }> = {
      '1': { university: 'Universiti Teknologi Malaysia (UTM)', projectType: 'uni' },
      '6': { university: 'Universiti Putra Malaysia (UPM)', projectType: 'uni' },
      '7': { university: 'Universiti Malaya (UM)', projectType: 'uni' },
      '2': { projectType: 'company' },
      '3': { projectType: 'individual' },
      '4': { projectType: 'individual' },
      '5': { projectType: 'company' },
    };

    const updatedStartups = startups.map((startup: any) => {
      let needsUpdate = false;
      const updates: any = {};

      // Always update images to use new image files
      const newImageMap: Record<string, string> = {
        '1': '/images/smartcampusiot.png',
        '2': '/images/edutech.png',
        '3': '/images/greencyclesolutions.png',
        '4': '/images/medicareconnect.jpg',
        '5': '/images/foodiehub.jpg',
        '6': '/images/agriculturalmonitoring system.png',
        '7': '/images/smarthome.jpg',
        '8': '/images/techcorp.jpg',
      };

      // Force update images for all startups in the map
      if (newImageMap[startup.id]) {
        const newImage = newImageMap[startup.id];
        if (startup.image !== newImage || (startup.images && startup.images[0] !== newImage)) {
          updates.images = [newImage];
          updates.image = newImage;
          needsUpdate = true;
        }
      } else if (!startup.image && startup.images && startup.images.length > 0) {
        updates.image = startup.images[0];
        needsUpdate = true;
      } else if (!startup.image && (!startup.images || startup.images.length === 0)) {
        const defaultImage = imageMap[startup.id] || '/images/Gemini_Generated_Image_o6zpnko6zpnko6zp.png';
        updates.images = [defaultImage];
        updates.image = defaultImage;
        needsUpdate = true;
      }

      // Migrate 'private' to 'individual'
      if (startup.projectType === 'private') {
        updates.projectType = 'individual';
        needsUpdate = true;
      }

      // Add university, companyName, and projectType if missing
      if (!startup.university && !startup.companyName && !startup.projectType) {
        const uniInfo = universityMap[startup.id];
        if (uniInfo) {
          if (uniInfo.university) {
            updates.university = uniInfo.university;
          }
          updates.projectType = uniInfo.projectType;
          needsUpdate = true;
        }
      } else if (!startup.projectType) {
        // Infer projectType from university or companyName
        if (startup.university) {
          updates.projectType = 'uni';
          needsUpdate = true;
        } else if (startup.companyName) {
          updates.projectType = 'company';
          needsUpdate = true;
        } else {
          updates.projectType = 'individual';
          needsUpdate = true;
        }
      }

      // Add companyName for company startups if missing
      if (startup.projectType === 'company' && !startup.companyName && startup.profile?.legalName) {
        updates.companyName = startup.profile.legalName;
        needsUpdate = true;
      } else if (startup.projectType === 'company' && !startup.companyName && startup.profile?.commercialName) {
        updates.companyName = startup.profile.commercialName;
        needsUpdate = true;
      }

      // Add views and likes if missing
      if (startup.views === undefined) {
        updates.views = Math.floor(Math.random() * 1000) + 10; // Random views between 10-1009
        needsUpdate = true;
      }
      if (startup.likes === undefined) {
        updates.likes = Math.floor(Math.random() * 100) + 1; // Random likes between 1-100
        needsUpdate = true;
      }

      // Add growthStage if missing (map from profile.growthStage or infer from stage)
      if (!startup.growthStage) {
        if (startup.profile?.growthStage) {
          const profileStage = startup.profile.growthStage.toLowerCase();
          if (profileStage === 'early') {
            updates.growthStage = 'early-stage';
          } else if (profileStage === 'mid') {
            updates.growthStage = 'mid-stage';
          } else if (profileStage === 'late') {
            updates.growthStage = 'late-stage';
          } else {
            updates.growthStage = 'pre-stage';
          }
        } else {
          // Infer from stage
          if (startup.stage === 'idea') {
            updates.growthStage = 'pre-stage';
          } else if (startup.stage === 'testing' || startup.stage === 'startup') {
            updates.growthStage = 'early-stage';
          } else {
            updates.growthStage = 'early-stage';
          }
        }
        needsUpdate = true;
      }

      if (needsUpdate) {
        updated = true;
        return { ...startup, ...updates };
      }
      return startup;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.STARTUPS, JSON.stringify(updatedStartups));
      return updatedStartups;
    }

    return startups;
  },

  saveStartups: (startups: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.STARTUPS, JSON.stringify(startups));
    // Also save to legacy key for backward compatibility
    localStorage.setItem('dreamify_prototypes', JSON.stringify(startups));
  },

  // Legacy support - map prototypes to startups
  getPrototypes: (): any[] => {
    return storage.getStartups();
  },

  savePrototypes: (prototypes: any[]): void => {
    storage.saveStartups(prototypes);
  },

  // Mentors
  getMentors: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MENTORS);
    let mentors = data ? JSON.parse(data) : [];

    // Migration: Keep only Dr. Tan Wei Ming (mentor1) and Puan Norazlina (mentor2)
    const allowedIds = ['mentor1', 'mentor2'];
    const filteredMentors = mentors.filter((m: any) => allowedIds.includes(m.id));

    let updated = false;
    if (filteredMentors.length !== mentors.length) {
      updated = true;
      mentors = filteredMentors;
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));
    }

    return mentors;
  },

  saveMentors: (mentors: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));
  },

  // Funding Opportunities
  getFundingOpportunities: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.FUNDING_OPPORTUNITIES);
    let opportunities = data ? JSON.parse(data) : [];

    // Migration: Remove CIP 300, CIP Spark, and CIP Sprint
    const removedIds = ['cip-spark', 'cip-sprint', 'cip-300'];
    const filteredOpportunities = opportunities.filter((op: any) => !removedIds.includes(op.id));

    if (filteredOpportunities.length !== opportunities.length) {
      opportunities = filteredOpportunities;
      localStorage.setItem(STORAGE_KEYS.FUNDING_OPPORTUNITIES, JSON.stringify(opportunities));
    }

    return opportunities;
  },

  saveFundingOpportunities: (opportunities: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.FUNDING_OPPORTUNITIES, JSON.stringify(opportunities));
  },

  // Applications
  getApplications: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveApplications: (applications: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  },

  // Mentorship Requests
  getMentorshipRequests: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MENTORSHIP_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  saveMentorshipRequests: (requests: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MENTORSHIP_REQUESTS, JSON.stringify(requests));
  },

  // Programmes
  getProgrammes: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROGRAMMES);
    const programmes = data ? JSON.parse(data) : [];

    // Migration: Add image field to existing programmes if missing and update Go Start Hub Hackathon image
    let updated = false;
    const imageMap: Record<string, string> = {
      'prog1': '/images/Gemini_Generated_Image_o6zpnko6zpnko6zp.png',
      'prog2': '/images/Pre-Accelerator Bootcamp.png',
      'prog3': '/images/dreamifyhackathon.jpg', // Updated to use the correct image file
    };

    const updatedProgrammes = programmes.map((prog: any) => {
      // Force update prog3 (Go Start Hub Hackathon) to use the correct image
      if (prog.id === 'prog3' && imageMap[prog.id]) {
        updated = true;
        return { ...prog, image: imageMap[prog.id] };
      }
      // Add image for other programmes if missing
      if (imageMap[prog.id] && !prog.image) {
        updated = true;
        return { ...prog, image: imageMap[prog.id] };
      }
      return prog;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMMES, JSON.stringify(updatedProgrammes));
      return updatedProgrammes;
    }

    return programmes;
  },

  saveProgrammes: (programmes: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROGRAMMES, JSON.stringify(programmes));
  },

  // Events
  getEvents: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    let events = data ? JSON.parse(data) : [];

    // Migration: Remove specific events (event3, event4, event5)
    // event3: Startup Funding Masterclass
    // event4: Go Start Hub Hackathon 2025 (removed from events, kept in programmes)
    // event5: Pre-Accelerator Bootcamp
    const eventsToRemove = ['event3', 'event4', 'event5'];
    const initialCount = events.length;
    events = events.filter((event: any) => !eventsToRemove.includes(event.id));

    let updated = false;
    if (events.length !== initialCount) {
      updated = true;
    }

    // Also ensure all events have image field and update existing events with images
    // Force update images for event1 and event2 if they exist
    const eventImageMap: Record<string, string> = {
      'event1': '/images/innovationnetworkingnight.jpg', // Innovation Networking Night
      'event2': '/images/aiandmachinelearningworkshop.jpg', // AI & Machine Learning Workshop
    };

    events = events.map((event: any) => {
      let eventUpdated = false;
      let updatedEvent = { ...event };

      // Add image field if missing
      if (!event.hasOwnProperty('image')) {
        eventUpdated = true;
        updatedEvent.image = undefined;
      }

      // Update specific events with their images (force update)
      if (eventImageMap[event.id]) {
        eventUpdated = true;
        updatedEvent.image = eventImageMap[event.id];
      }

      if (eventUpdated) {
        updated = true;
        return updatedEvent;
      }
      return event;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }

    return events;
  },

  saveEvents: (events: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  // Programme Registrations
  getProgrammeRegistrations: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROGRAMME_REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveProgrammeRegistrations: (registrations: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROGRAMME_REGISTRATIONS, JSON.stringify(registrations));
  },

  // Event Registrations
  getEventRegistrations: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EVENT_REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveEventRegistrations: (registrations: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EVENT_REGISTRATIONS, JSON.stringify(registrations));
  },

  // Session
  getSession: (): any | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },

  saveSession: (session: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  clearSession: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Subscriptions
  getSubscriptions: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveSubscriptions: (subscriptions: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  },

  getUserSubscription: (userId: string): any | null => {
    if (typeof window === 'undefined') return null;
    const subscriptions = storage.getSubscriptions();
    const activeSubscription = subscriptions.find(
      (sub: any) => sub.userId === userId && sub.status === 'active'
    );
    return activeSubscription || null;
  },

  createSubscription: (subscription: any): void => {
    if (typeof window === 'undefined') return;
    const subscriptions = storage.getSubscriptions();
    subscriptions.push(subscription);
    storage.saveSubscriptions(subscriptions);
  },

  updateSubscription: (subscriptionId: string, updates: any): void => {
    if (typeof window === 'undefined') return;
    const subscriptions = storage.getSubscriptions();
    const index = subscriptions.findIndex((sub: any) => sub.id === subscriptionId);
    if (index !== -1) {
      subscriptions[index] = { ...subscriptions[index], ...updates, updatedAt: new Date().toISOString() };
      storage.saveSubscriptions(subscriptions);
    }
  },

  // Promo Codes
  getPromoCodes: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROMO_CODES);
    return data ? JSON.parse(data) : [];
  },

  savePromoCodes: (codes: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(codes));
  },

  validatePromoCode: (code: string): any | null => {
    if (typeof window === 'undefined') return null;
    const codes = storage.getPromoCodes();
    const promoCode = codes.find(
      (c: any) => c.code.toLowerCase() === code.toLowerCase() && c.active && (!c.expiryDate || new Date(c.expiryDate) > new Date())
    );
    return promoCode || null;
  },

  // On-Demand Purchases
  getOnDemandPurchases: (): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('dreamify_on_demand_purchases');
    return data ? JSON.parse(data) : [];
  },

  saveOnDemandPurchases: (purchases: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dreamify_on_demand_purchases', JSON.stringify(purchases));
  },

  createOnDemandPurchase: (purchase: any): void => {
    if (typeof window === 'undefined') return;
    const purchases = storage.getOnDemandPurchases();
    purchases.push(purchase);
    storage.saveOnDemandPurchases(purchases);
  },

  // Notifications
  getNotifications: (userId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = data ? JSON.parse(data) : [];
    if (userId) {
      return notifications.filter((n: any) => n.userId === userId);
    }
    return notifications;
  },

  saveNotifications: (notifications: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  createNotification: (notification: any): void => {
    if (typeof window === 'undefined') return;
    const notifications = storage.getNotifications();
    notifications.push({
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    storage.saveNotifications(notifications);
  },

  markNotificationAsRead: (notificationId: string): void => {
    if (typeof window === 'undefined') return;
    const notifications = storage.getNotifications();
    const updated = notifications.map((n: any) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    storage.saveNotifications(updated);
  },

  markAllNotificationsAsRead: (userId: string): void => {
    if (typeof window === 'undefined') return;
    const notifications = storage.getNotifications();
    const updated = notifications.map((n: any) =>
      n.userId === userId ? { ...n, read: true } : n
    );
    storage.saveNotifications(updated);
  },

  // Comments
  getComments: (startupId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments = data ? JSON.parse(data) : [];
    if (startupId) {
      return comments.filter((c: any) => c.startupId === startupId);
    }
    return comments;
  },

  saveComments: (comments: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  },

  createComment: (comment: any): void => {
    if (typeof window === 'undefined') return;
    const comments = storage.getComments();
    comments.push({
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    });
    storage.saveComments(comments);
  },

  // Activities
  getActivities: (userId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    const activities = data ? JSON.parse(data) : [];
    if (userId) {
      return activities.filter((a: any) => a.userId === userId);
    }
    return activities;
  },

  saveActivities: (activities: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  createActivity: (activity: any): void => {
    if (typeof window === 'undefined') return;
    const activities = storage.getActivities();
    activities.unshift({
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    });
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(1000);
    }
    storage.saveActivities(activities);
  },
};

// Server-side storage simulation (for API routes)
// In production, this would use a database
let serverStorage: {
  users: any[];
  startups: any[];
  prototypes: any[]; // Legacy support
  mentors: any[];
  fundingOpportunities: any[];
  applications: any[];
  mentorshipRequests: any[];
} = {
  users: [],
  startups: [],
  prototypes: [], // Legacy support
  mentors: [],
  fundingOpportunities: [],
  applications: [],
  mentorshipRequests: [],
};

// Initialize server storage from client storage if available
if (typeof window !== 'undefined') {
  try {
    serverStorage = {
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
      startups: JSON.parse(localStorage.getItem(STORAGE_KEYS.STARTUPS) || '[]'),
      prototypes: JSON.parse(localStorage.getItem(STORAGE_KEYS.STARTUPS) || '[]'), // Legacy support
      mentors: JSON.parse(localStorage.getItem(STORAGE_KEYS.MENTORS) || '[]'),
      fundingOpportunities: JSON.parse(localStorage.getItem(STORAGE_KEYS.FUNDING_OPPORTUNITIES) || '[]'),
      applications: JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]'),
      mentorshipRequests: JSON.parse(localStorage.getItem(STORAGE_KEYS.MENTORSHIP_REQUESTS) || '[]'),
    };
  } catch (e) {
    // Ignore errors
  }
}

// Initialize with sample data if storage is empty
export const initializeData = () => {
  if (typeof window === 'undefined') return;

  // Initialize startups
  if (!localStorage.getItem(STORAGE_KEYS.STARTUPS)) {
    const sampleStartups = [
      {
        id: '1',
        title: 'SmartCampus IoT System',
        description: 'A comprehensive IoT-based campus management system developed by university students to monitor and optimize energy consumption, security, and facility management. The system uses sensors and AI to provide real-time insights and automated control for university campuses, reducing operational costs by up to 30%.',
        innovatorId: 'user1',
        innovatorName: 'Ahmad Firdaus',
        category: 'IoT & Hardware',
        stage: 'testing',
        fundingNeeded: 200000,
        fundingReceived: 75000,
        images: ['/images/startup-iot-campus.jpg'],
        image: '/images/startup-iot-campus.jpg',
        tags: ['IoT', 'Smart Campus', 'Energy Management', 'University Innovation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'A comprehensive IoT-based campus management system developed by university students to monitor and optimize energy consumption, security, and facility management. The system uses sensors and AI to provide real-time insights and automated control for university campuses, reducing operational costs by up to 30%.',
          },
          contactInfo: {
            location: 'Universiti Teknologi Malaysia, Skudai, Johor',
            url: 'https://smartcampusiot.com',
            email: 'contact@smartcampusiot.com',
            phone: '+60123456789',
          },
          keyPeople: [
            { name: 'Ahmad Firdaus', role: 'Founder, Lead Developer' },
            { name: 'Nurul Aina', role: 'Co-Founder, Hardware Engineer' },
            { name: 'Lim Wei Jie', role: 'Co-Founder, AI Specialist' },
          ],
          programmes: ['UTM Innovation Challenge 2024', 'Go Start Hub Pre-Accelerator Bootcamp'],
          foundedYear: 2024,
          legalName: 'SMARTCAMPUS IOT SDN. BHD.',
          commercialName: 'SmartCampus IoT System',
          growthStage: 'Early',
          primaryHQ: 'Johor',
          primaryIndustry: 'IoT & Hardware',
          otherIndustries: ['Education Technology', 'Smart City'],
          primaryTechnology: 'IoT',
          otherTechnology: ['AI/ML', 'Cloud Platform', 'Sensor Networks'],
          companySize: '1-10',
        },
        team: {
          companySize: '1 - 10',
          totalFounders: 3,
          totalTopManagement: 0,
          otherEmployees: 2,
          founders: [
            { name: 'Ahmad Firdaus', role: 'Founder, Lead Developer', linkedin: 'https://linkedin.com/in/ahmadfirdaus' },
            { name: 'Nurul Aina', role: 'Co-Founder, Hardware Engineer', linkedin: 'https://linkedin.com/in/nurulaina' },
            { name: 'Lim Wei Jie', role: 'Co-Founder, AI Specialist', linkedin: 'https://linkedin.com/in/limweijie' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 3,
          lastDealDetails: {
            amount: '75,000',
            currency: 'MYR',
            date: 'Nov 2024',
          },
          totalFundraised: 'MYR 75,000',
          latestValuation: 'MYR 600,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news1',
            title: 'UTM Students Develop Smart Campus IoT System',
            date: '15 Nov 2024',
            time: '10:00 AM',
            content: 'A team of UTM students has developed an innovative IoT system for campus management that has been successfully piloted in their university. The system has shown significant energy savings and improved facility management efficiency. The team is now seeking funding to scale the solution to other universities.',
            programmes: ['UTM Innovation Challenge 2024'],
          },
        ],
      },
      {
        id: '6',
        title: 'AgriSense IoT Platform',
        description: 'An IoT-based agricultural monitoring system created by university students to help farmers optimize crop yields through real-time soil, weather, and crop health monitoring. The platform uses sensors, drones, and machine learning to provide actionable insights for precision agriculture.',
        innovatorId: 'user6',
        innovatorName: 'Siti Nurhaliza',
        category: 'IoT & Hardware',
        stage: 'testing',
        fundingNeeded: 300000,
        fundingReceived: 100000,
        images: ['/images/startup-agrisense.jpg'],
        image: '/images/startup-agrisense.jpg',
        tags: ['IoT', 'Agriculture', 'Precision Farming', 'University Innovation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'An IoT-based agricultural monitoring system created by university students to help farmers optimize crop yields through real-time soil, weather, and crop health monitoring. The platform uses sensors, drones, and machine learning to provide actionable insights for precision agriculture.',
          },
          contactInfo: {
            location: 'Universiti Putra Malaysia, Serdang, Selangor',
            url: 'https://agrisenseiot.com',
            email: 'info@agrisenseiot.com',
            phone: '+60198765432',
          },
          keyPeople: [
            { name: 'Siti Nurhaliza', role: 'Founder, CEO' },
            { name: 'Muhammad Hafiz', role: 'Co-Founder, IoT Engineer' },
            { name: 'Tan Mei Ling', role: 'Co-Founder, Data Scientist' },
          ],
          programmes: ['UPM Innovation Hub', 'Go Start Hub Hackathon 2025'],
          foundedYear: 2024,
          legalName: 'AGRISENSE IOT SDN. BHD.',
          commercialName: 'AgriSense IoT Platform',
          growthStage: 'Early',
          primaryHQ: 'Selangor',
          primaryIndustry: 'Agriculture',
          otherIndustries: ['IoT & Hardware'],
          primaryTechnology: 'IoT',
          otherTechnology: ['AI/ML', 'Drone Technology', 'Sensor Networks'],
          companySize: '1-10',
        },
        team: {
          companySize: '1 - 10',
          totalFounders: 3,
          totalTopManagement: 0,
          otherEmployees: 1,
          founders: [
            { name: 'Siti Nurhaliza', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/sitinurhaliza' },
            { name: 'Muhammad Hafiz', role: 'Co-Founder, IoT Engineer', linkedin: 'https://linkedin.com/in/muhammadhafiz' },
            { name: 'Tan Mei Ling', role: 'Co-Founder, Data Scientist', linkedin: 'https://linkedin.com/in/tanmeiling' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 2,
          lastDealDetails: {
            amount: '100,000',
            currency: 'MYR',
            date: 'Oct 2024',
          },
          totalFundraised: 'MYR 100,000',
          latestValuation: 'MYR 800,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news6-1',
            title: 'UPM Students Launch AgriSense IoT Platform for Smart Farming',
            date: '8 Oct 2024',
            time: '2:30 PM',
            content: 'A team of UPM students has launched AgriSense, an IoT platform that helps farmers monitor and optimize their crops. The system has been tested on several farms in Selangor with promising results, showing 20% improvement in crop yields. The team is now expanding to more farms across Malaysia.',
            programmes: ['UPM Innovation Hub'],
          },
        ],
      },
      {
        id: '7',
        title: 'SmartHome Automation System',
        description: 'A university-developed home automation system that integrates IoT devices, AI voice control, and energy management. The system allows homeowners to control lighting, security, climate, and appliances through a unified mobile app, reducing energy consumption and enhancing home security.',
        innovatorId: 'user7',
        innovatorName: 'Lee Jia Wei',
        category: 'IoT & Hardware',
        stage: 'startup',
        fundingNeeded: 400000,
        fundingReceived: 150000,
        images: ['/images/startup-smarthome.jpg'],
        image: '/images/startup-smarthome.jpg',
        tags: ['IoT', 'Smart Home', 'Automation', 'University Innovation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'A university-developed home automation system that integrates IoT devices, AI voice control, and energy management. The system allows homeowners to control lighting, security, climate, and appliances through a unified mobile app, reducing energy consumption and enhancing home security.',
          },
          contactInfo: {
            location: 'Universiti Malaya, Kuala Lumpur',
            url: 'https://smarthomeautomation.my',
            email: 'hello@smarthomeautomation.my',
            phone: '+60123456790',
          },
          keyPeople: [
            { name: 'Lee Jia Wei', role: 'Founder, CEO' },
            { name: 'Nur Izzati', role: 'Co-Founder, Software Engineer' },
            { name: 'Chong Yew Meng', role: 'Co-Founder, Hardware Engineer' },
          ],
          programmes: ['UM Innovation Challenge', 'Go Start Hub Accelerator 2025'],
          foundedYear: 2024,
          legalName: 'SMARTHOME AUTOMATION SDN. BHD.',
          commercialName: 'SmartHome Automation System',
          growthStage: 'Early',
          primaryHQ: 'Kuala Lumpur',
          primaryIndustry: 'IoT & Hardware',
          otherIndustries: ['Consumer Electronics'],
          primaryTechnology: 'IoT',
          otherTechnology: ['AI/ML', 'Mobile App', 'Voice Control'],
          companySize: '1-10',
        },
        team: {
          companySize: '1 - 10',
          totalFounders: 3,
          totalTopManagement: 0,
          otherEmployees: 3,
          founders: [
            { name: 'Lee Jia Wei', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/leejiawei' },
            { name: 'Nur Izzati', role: 'Co-Founder, Software Engineer', linkedin: 'https://linkedin.com/in/nurizzati' },
            { name: 'Chong Yew Meng', role: 'Co-Founder, Hardware Engineer', linkedin: 'https://linkedin.com/in/chongyewmeng' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 4,
          lastDealDetails: {
            amount: '150,000',
            currency: 'MYR',
            date: 'Sep 2024',
          },
          totalFundraised: 'MYR 150,000',
          latestValuation: 'MYR 1,200,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news7-1',
            title: 'UM Students Develop Affordable Smart Home System',
            date: '20 Sep 2024',
            time: '11:15 AM',
            content: 'A team of UM students has developed an affordable smart home automation system that makes home automation accessible to middle-income families. The system has been installed in over 50 homes in the Klang Valley with positive feedback. The team is now seeking funding to scale production and expand nationwide.',
            programmes: ['UM Innovation Challenge'],
          },
        ],
      },
      {
        id: '2',
        title: 'EduTech AI',
        description: 'EduTech AI is an intelligent learning platform that personalizes education for Malaysian students using advanced machine learning algorithms. The platform adapts to individual learning styles, tracks progress, and provides customized study plans. It helps students improve their academic performance through AI-powered tutoring, practice questions, and real-time feedback.',
        innovatorId: 'user2',
        innovatorName: 'Sarah Lim',
        companyName: 'EDUTECH AI SDN. BHD.',
        projectType: 'company',
        category: 'AI & Machine Learning',
        stage: 'startup',
        fundingNeeded: 500000,
        fundingReceived: 250000,
        images: ['/images/edutech.png'],
        image: '/images/edutech.png',
        tags: ['AI', 'Education', 'EdTech', 'Machine Learning'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'EduTech AI is an intelligent learning platform that personalizes education for Malaysian students using advanced machine learning algorithms. The platform adapts to individual learning styles, tracks progress, and provides customized study plans. It helps students improve their academic performance through AI-powered tutoring, practice questions, and real-time feedback.',
          },
          contactInfo: {
            location: 'Level 5, Menara UOA Bangsar, 5 Jalan Bangsar Utama 1, Bangsar, Kuala Lumpur, Malaysia',
            url: 'https://edutechai.com',
            email: 'hello@edutechai.com',
            phone: '+60322456789',
          },
          keyPeople: [
            { name: 'Sarah Lim', role: 'Founder, CEO' },
            { name: 'Ahmad Zulkifli', role: 'Co-Founder, CTO' },
            { name: 'Priya Devi', role: 'Head of Product' },
          ],
          programmes: ['MaGIC Accelerator 2023', 'Cradle Fund CIP 300'],
          foundedYear: 2022,
          legalName: 'EDUTECH AI SDN. BHD.',
          commercialName: 'EduTech AI',
          growthStage: 'Early',
          primaryHQ: 'Kuala Lumpur',
          primaryIndustry: 'Education',
          otherIndustries: ['AI & Machine Learning'],
          primaryTechnology: 'AI/ML',
          otherTechnology: ['Web Platform', 'Mobile App'],
          companySize: '11-50',
        },
        team: {
          companySize: '11 - 50',
          totalFounders: 2,
          totalTopManagement: 1,
          otherEmployees: 8,
          founders: [
            { name: 'Sarah Lim', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/sarahlim' },
            { name: 'Ahmad Zulkifli', role: 'Co-Founder, CTO', linkedin: 'https://linkedin.com/in/ahmadzulkifli' },
          ],
          topManagement: [
            { name: 'Priya Devi', role: 'Head of Product', linkedin: 'https://linkedin.com/in/priyadevi' },
          ],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 2,
          totalInvestors: 5,
          lastDealDetails: {
            amount: '150,000',
            currency: 'MYR',
            date: 'Aug 2024',
          },
          totalFundraised: 'MYR 250,000',
          latestValuation: 'MYR 2,500,000',
          latestFundingRound: 'Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news2-1',
            title: 'EduTech AI Raises RM 150,000 in Seed Funding',
            date: '15 Aug 2024',
            time: '2:30 PM',
            content: 'EduTech AI, a Malaysian edtech startup, has successfully raised RM 150,000 in seed funding from local angel investors. The funding will be used to expand their AI-powered learning platform and reach more students across Malaysia. Founder Sarah Lim expressed excitement about the growth opportunities this funding will provide.',
            programmes: ['MaGIC Accelerator 2023'],
          },
        ],
      },
      {
        id: '3',
        title: 'GreenCycle Solutions',
        description: 'GreenCycle Solutions is a sustainable waste management startup that uses IoT sensors and AI to optimize waste collection routes and recycling processes. The platform connects households, businesses, and waste management companies to create a circular economy. They help reduce environmental impact while providing cost-effective waste management solutions.',
        innovatorId: 'user3',
        innovatorName: 'Ahmad Rahman',
        category: 'IoT & Hardware',
        stage: 'startup',
        fundingNeeded: 800000,
        fundingReceived: 400000,
        images: ['/images/greencyclesolutions.png'],
        image: '/images/greencyclesolutions.png',
        tags: ['IoT', 'Sustainability', 'Smart City', 'Environment'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'GreenCycle Solutions is a sustainable waste management startup that uses IoT sensors and AI to optimize waste collection routes and recycling processes. The platform connects households, businesses, and waste management companies to create a circular economy. They help reduce environmental impact while providing cost-effective waste management solutions.',
          },
          contactInfo: {
            location: 'Block A, Technology Park Malaysia, Bukit Jalil, Kuala Lumpur, Malaysia',
            url: 'https://greencyclesolutions.com',
            email: 'info@greencyclesolutions.com',
            phone: '+60387654321',
          },
          keyPeople: [
            { name: 'Ahmad Rahman', role: 'Founder, CEO' },
            { name: 'Lisa Tan', role: 'Co-Founder, COO' },
          ],
          programmes: ['MRANTI Technology Park Programme', 'Go Start Hub Accelerator 2025'],
          foundedYear: 2023,
          legalName: 'GREENCYCLE SOLUTIONS SDN. BHD.',
          commercialName: 'GreenCycle Solutions',
          growthStage: 'Early',
          primaryHQ: 'Kuala Lumpur',
          primaryIndustry: 'Environment & Sustainability',
          otherIndustries: ['IoT & Hardware'],
          primaryTechnology: 'IoT',
          otherTechnology: ['AI/ML', 'Cloud Platform'],
          companySize: '11-50',
        },
        team: {
          companySize: '11 - 50',
          totalFounders: 2,
          totalTopManagement: 0,
          otherEmployees: 5,
          founders: [
            { name: 'Ahmad Rahman', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/ahmadrahman' },
            { name: 'Lisa Tan', role: 'Co-Founder, COO', linkedin: 'https://linkedin.com/in/lisatan' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 3,
          lastDealDetails: {
            amount: '400,000',
            currency: 'MYR',
            date: 'Jun 2024',
          },
          totalFundraised: 'MYR 400,000',
          latestValuation: 'MYR 3,200,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news3-1',
            title: 'GreenCycle Solutions Partners with KL City Council for Smart Waste Management',
            date: '10 Oct 2024',
            time: '9:15 AM',
            content: 'GreenCycle Solutions has announced a partnership with Kuala Lumpur City Council to implement their IoT-based waste management system in selected areas. The pilot program will use smart sensors to optimize waste collection routes, reducing costs and environmental impact. This partnership marks a significant milestone for the startup in their mission to create smarter, more sustainable cities.',
            programmes: ['MRANTI Technology Park Programme'],
          },
        ],
      },
      {
        id: '4',
        title: 'MediCare Connect',
        description: 'MediCare Connect is a telemedicine platform that connects patients with healthcare providers across Malaysia. The platform enables remote consultations, prescription management, and health monitoring through mobile and web applications. It aims to make healthcare more accessible, especially for rural communities, while reducing the burden on physical healthcare facilities.',
        innovatorId: 'user4',
        innovatorName: 'Dr. Chen Wei Ming',
        category: 'Healthcare',
        stage: 'startup',
        fundingNeeded: 1200000,
        fundingReceived: 600000,
        images: ['/images/medicareconnect.jpg'],
        image: '/images/medicareconnect.jpg',
        tags: ['Healthcare', 'Telemedicine', 'HealthTech', 'Mobile App'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'MediCare Connect is a telemedicine platform that connects patients with healthcare providers across Malaysia. The platform enables remote consultations, prescription management, and health monitoring through mobile and web applications. It aims to make healthcare more accessible, especially for rural communities, while reducing the burden on physical healthcare facilities.',
          },
          contactInfo: {
            location: 'Suite 8-3, Menara Hap Seng, Jalan P. Ramlee, Kuala Lumpur, Malaysia',
            url: 'https://medicareconnect.my',
            email: 'contact@medicareconnect.my',
            phone: '+60327123456',
          },
          keyPeople: [
            { name: 'Dr. Chen Wei Ming', role: 'Founder, CEO' },
            { name: 'Nurul Aisyah', role: 'Co-Founder, CTO' },
            { name: 'Dr. Rajesh Kumar', role: 'Medical Director' },
          ],
          programmes: ['Cradle Fund CIP 300', 'MaGIC Accelerator 2023'],
          foundedYear: 2022,
          legalName: 'MEDICARE CONNECT SDN. BHD.',
          commercialName: 'MediCare Connect',
          growthStage: 'Early',
          primaryHQ: 'Kuala Lumpur',
          primaryIndustry: 'Healthcare',
          otherIndustries: ['Technology'],
          primaryTechnology: 'Telemedicine',
          otherTechnology: ['Mobile App', 'Cloud Platform'],
          companySize: '11-50',
        },
        team: {
          companySize: '11 - 50',
          totalFounders: 2,
          totalTopManagement: 1,
          otherEmployees: 12,
          founders: [
            { name: 'Dr. Chen Wei Ming', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/chenweiming' },
            { name: 'Nurul Aisyah', role: 'Co-Founder, CTO', linkedin: 'https://linkedin.com/in/nurulaisyah' },
          ],
          topManagement: [
            { name: 'Dr. Rajesh Kumar', role: 'Medical Director', linkedin: 'https://linkedin.com/in/rajeshkumar' },
          ],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 2,
          totalInvestors: 7,
          lastDealDetails: {
            amount: '300,000',
            currency: 'MYR',
            date: 'Sep 2024',
          },
          totalFundraised: 'MYR 600,000',
          latestValuation: 'MYR 4,800,000',
          latestFundingRound: 'Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news4-1',
            title: 'MediCare Connect Expands to Serve Rural Communities',
            date: '5 Nov 2024',
            time: '11:00 AM',
            content: 'MediCare Connect has launched a new initiative to bring telemedicine services to rural communities in Sabah and Sarawak. The startup has partnered with local clinics and healthcare providers to ensure patients in remote areas have access to quality medical consultations. This expansion is part of their mission to make healthcare accessible to all Malaysians.',
            programmes: ['Cradle Fund CIP 300'],
          },
        ],
      },
      {
        id: '5',
        title: 'FoodieHub',
        description: 'FoodieHub is a food delivery and restaurant management platform that helps local restaurants digitize their operations. The platform offers online ordering, table reservations, kitchen management, and delivery services. FoodieHub focuses on supporting small and medium-sized restaurants in Malaysia, helping them compete with larger chains through technology.',
        innovatorId: 'user5',
        innovatorName: 'Kevin Tan',
        companyName: 'FOODIEHUB SDN. BHD.',
        projectType: 'company',
        category: 'Food & Beverage',
        stage: 'startup',
        fundingNeeded: 600000,
        fundingReceived: 350000,
        images: ['/images/foodiehub.jpg'],
        image: '/images/foodiehub.jpg',
        tags: ['Food & Beverage', 'Restaurant Tech', 'Delivery', 'SaaS'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        profile: {
          generalInfo: {
            description: 'FoodieHub is a food delivery and restaurant management platform that helps local restaurants digitize their operations. The platform offers online ordering, table reservations, kitchen management, and delivery services. FoodieHub focuses on supporting small and medium-sized restaurants in Malaysia, helping them compete with larger chains through technology.',
          },
          contactInfo: {
            location: 'Unit 3-2, Jalan SS 15/4, Subang Jaya, Selangor, Malaysia',
            url: 'https://foodiehub.my',
            email: 'hello@foodiehub.my',
            phone: '+60356345678',
          },
          keyPeople: [
            { name: 'Kevin Tan', role: 'Founder, CEO' },
            { name: 'Siti Nurhaliza', role: 'Co-Founder, COO' },
          ],
          programmes: ['NEXEA Accelerator 2024', 'MaGIC Pre-Accelerator'],
          foundedYear: 2023,
          legalName: 'FOODIEHUB SDN. BHD.',
          commercialName: 'FoodieHub',
          growthStage: 'Early',
          primaryHQ: 'Selangor',
          primaryIndustry: 'Food & Beverage',
          otherIndustries: ['Technology'],
          primaryTechnology: 'SaaS',
          otherTechnology: ['Mobile App', 'Web Platform'],
          companySize: '11-50',
        },
        team: {
          companySize: '11 - 50',
          totalFounders: 2,
          totalTopManagement: 0,
          otherEmployees: 6,
          founders: [
            { name: 'Kevin Tan', role: 'Founder, CEO', linkedin: 'https://linkedin.com/in/kevintan' },
            { name: 'Siti Nurhaliza', role: 'Co-Founder, COO', linkedin: 'https://linkedin.com/in/sitinurhaliza' },
          ],
          topManagement: [],
          otherEmployeesList: [],
        },
        financials: {
          totalDeals: 1,
          totalInvestors: 4,
          lastDealDetails: {
            amount: '350,000',
            currency: 'MYR',
            date: 'Jul 2024',
          },
          totalFundraised: 'MYR 350,000',
          latestValuation: 'MYR 2,800,000',
          latestFundingRound: 'Pre-Seed',
        },
        pitchPdf: '',
        news: [
          {
            id: 'news5-1',
            title: 'FoodieHub Onboards 100 Restaurants in Klang Valley',
            date: '20 Sep 2024',
            time: '3:45 PM',
            content: 'FoodieHub has reached a milestone by onboarding 100 restaurants across the Klang Valley region. The platform has seen strong adoption from local restaurants looking to digitize their operations and reach more customers. Founder Kevin Tan attributes this success to their focus on supporting small and medium-sized restaurants with affordable technology solutions.',
            programmes: ['NEXEA Accelerator 2024'],
          },
        ],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.STARTUPS, JSON.stringify(sampleStartups));
    // Also set for legacy support
    localStorage.setItem('dreamify_prototypes', JSON.stringify(sampleStartups));
  }

  // Initialize mentors
  if (!localStorage.getItem(STORAGE_KEYS.MENTORS)) {
    const sampleMentors = [
      {
        id: 'mentor1',
        name: 'Dr. Tan Wei Ming',
        email: 'tan@example.com',
        company: 'TechVenture Malaysia',
        role: 'MENTOR',
        mentorProfile: {
          bio: '15 years of experience in IoT and hardware development. Former CTO of multiple startups. Passionate about helping young engineers build scalable hardware solutions.',
          expertise: ['IoT', 'Hardware', 'Product Design', 'Robotics'],
          experience: 15,
          availability: 'available',
          company: 'TechVenture Malaysia',
          linkedin: 'https://linkedin.com/in/drtanweiming',
          mentorType: 'Technical Mentor',
          languages: ['English', 'Mandarin', 'Malay'],
          profileImage: '/images/tanweiming.jpg',
        },
      },
      {
        id: 'mentor2',
        name: 'Puan Norazlina',
        email: 'norazlina@example.com',
        company: 'InnovateLab',
        role: 'MENTOR',
        mentorProfile: {
          bio: 'AI researcher and startup advisor with expertise in machine learning applications. I help startups navigate the complex world of AI ethics and implementation.',
          expertise: ['AI/ML', 'Software', 'Strategy', 'Data Science'],
          experience: 10,
          availability: 'available',
          company: 'InnovateLab',
          linkedin: 'https://linkedin.com/in/norazlina',
          mentorType: 'Technical Mentor',
          languages: ['English', 'Malay'],
          profileImage: '/images/norazlina.jpg',
        },
      },
      {
        id: 'mentor3',
        name: 'Jason Lee',
        email: 'jason@example.com',
        company: 'GrowthHackers Asia',
        role: 'MENTOR',
        mentorProfile: {
          bio: 'Serial entrepreneur and growth marketing expert. I specialize in B2B sales strategies and fundraising for early-stage startups.',
          expertise: ['Marketing', 'Sales', 'Fundraising', 'Growth'],
          experience: 8,
          availability: 'limited',
          company: 'GrowthHackers Asia',
          linkedin: 'https://linkedin.com/in/jasonlee',
          mentorType: 'Business/Startup Mentor',
          languages: ['English', 'Cantonese'],
          profileImage: '',
        },
      },
    ];
    localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(sampleMentors));
  }

  // Initialize programmes
  if (!localStorage.getItem(STORAGE_KEYS.PROGRAMMES)) {
    const sampleProgrammes = [
      {
        id: 'prog1',
        title: 'Go Start Hub Accelerator 2025',
        description: 'A 12-week intensive accelerator program designed to help student innovators transform their prototypes into viable startups. Includes mentorship, funding, and access to investor network.',
        type: 'accelerator',
        category: 'Accelerator',
        organizer: 'Go Start Hub',
        organizerId: 'org1',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Kuala Lumpur, Malaysia',
        format: 'hybrid',
        maxParticipants: 20,
        currentParticipants: 8,
        eligibility: ['Student or recent graduate', 'Have a working prototype', 'Malaysian resident'],
        benefits: ['Up to RM 50,000 in grants', 'Expert mentorship', 'Access to investor network', 'Co-working space', 'Marketing support'],
        requirements: ['Working prototype', 'Team of 2-4 members', 'Business plan', 'Video pitch'],
        fee: 0,
        grantAmount: 50000,
        status: 'open',
        image: '/images/Gemini_Generated_Image_o6zpnko6zpnko6zp.png',
        tags: ['Accelerator', 'Funding', 'Mentorship', 'Startup'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prog2',
        title: 'Pre-Accelerator Bootcamp',
        description: 'A 6-week bootcamp for early-stage innovators to develop their ideas into prototypes. Perfect for students with innovative concepts but no prototype yet.',
        type: 'pre-accelerator',
        category: 'Pre-Accelerator',
        organizer: 'Go Start Hub',
        organizerId: 'org1',
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 87 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Online',
        format: 'online',
        maxParticipants: 50,
        currentParticipants: 23,
        eligibility: ['Student', 'Have an innovative idea', 'Willing to commit 10 hours/week'],
        benefits: ['Prototype development support', 'Mentorship sessions', 'Access to tools and resources', 'Certificate of completion'],
        requirements: ['Innovative idea', 'Team of 1-3 members', 'Application form'],
        fee: 0,
        status: 'open',
        image: '/images/Pre-Accelerator Bootcamp.png',
        tags: ['Pre-Accelerator', 'Bootcamp', 'Idea Development'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prog3',
        title: 'Go Start Hub Hackathon 2025',
        description: '48-hour hackathon for students to build innovative solutions addressing real-world problems. Winners receive funding and mentorship opportunities.',
        type: 'hackathon',
        category: 'Hackathon',
        organizer: 'Go Start Hub',
        organizerId: 'org1',
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Sunway University, Selangor',
        format: 'offline',
        maxParticipants: 100,
        currentParticipants: 45,
        eligibility: ['Student', 'Team of 2-5 members'],
        benefits: ['Cash prizes up to RM 20,000', 'Mentorship opportunities', 'Fast-track to accelerator', 'Networking with industry'],
        requirements: ['Team registration', 'Problem statement'],
        fee: 0,
        grantAmount: 20000,
        status: 'open',
        image: '/images/dreamifyhackathon.jpg',
        tags: ['Hackathon', 'Competition', 'Innovation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PROGRAMMES, JSON.stringify(sampleProgrammes));
  }

  // Initialize events
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    const sampleEvents = [
      {
        id: 'event1',
        title: 'Innovation Networking Night',
        description: 'Join us for an evening of networking with fellow innovators, mentors, and investors. Great opportunity to showcase your prototype and make valuable connections.',
        type: 'networking',
        organizer: 'Go Start Hub',
        organizerId: 'org1',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        startTime: '18:00',
        endTime: '21:00',
        location: 'KL Innovation Hub, Kuala Lumpur',
        format: 'offline',
        maxAttendees: 80,
        currentAttendees: 32,
        registrationRequired: true,
        registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        fee: 0,
        status: 'open',
        agenda: ['18:00 - Registration & Networking', '18:30 - Welcome & Keynote', '19:00 - Prototype Showcase', '20:00 - Networking Session', '21:00 - Closing'],
        speakers: [
          { name: 'Dr. Ahmad Rahman', title: 'CEO, TechVenture Malaysia' },
          { name: 'Sarah Lim', title: 'Serial Entrepreneur & Investor' },
        ],
        tags: ['Networking', 'Innovation', 'Startup'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'event2',
        title: 'AI & Machine Learning Workshop',
        description: 'Learn how to integrate AI and ML into your prototypes. Hands-on workshop with industry experts covering practical applications and tools.',
        type: 'workshop',
        organizer: 'Go Start Hub',
        organizerId: 'org1',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        startTime: '10:00',
        endTime: '16:00',
        location: 'Online',
        format: 'online',
        maxAttendees: 200,
        currentAttendees: 87,
        registrationRequired: true,
        registrationDeadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
        fee: 0,
        status: 'open',
        agenda: ['10:00 - Introduction to AI/ML', '11:00 - Practical Tools & Frameworks', '13:00 - Lunch Break', '14:00 - Hands-on Coding Session', '15:30 - Q&A & Networking'],
        speakers: [
          { name: 'Dr. Tan Wei Ming', title: 'AI Researcher, TechVenture' },
          { name: 'Puan Norazlina', title: 'ML Engineer, InnovateLab' },
        ],
        tags: ['Workshop', 'AI', 'Machine Learning', 'Technology'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'event3',
        title: 'Startup Funding Masterclass',
        description: 'Learn how to prepare for funding, pitch to investors, and navigate the investment landscape. Expert insights from successful entrepreneurs and investors.',
        type: 'seminar',
        organizer: 'Go Start Hub',
        organizerId: 'org1',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        startTime: '14:00',
        endTime: '17:00',
        location: 'Hybrid (Online + Physical)',
        format: 'hybrid',
        maxAttendees: 150,
        currentAttendees: 56,
        registrationRequired: true,
        registrationDeadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
        fee: 0,
        status: 'open',
        agenda: ['14:00 - Funding Landscape Overview', '14:45 - Preparing Your Pitch Deck', '15:30 - Break', '15:45 - Investor Panel Discussion', '16:30 - Q&A Session'],
        speakers: [
          { name: 'John Lee', title: 'Venture Partner, Malaysian Tech Ventures' },
          { name: 'Lisa Tan', title: 'Founder, GreenTech Malaysia' },
        ],
        tags: ['Seminar', 'Funding', 'Investment', 'Pitching'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(sampleEvents));
  }

  // Initialize funding opportunities
  if (!localStorage.getItem(STORAGE_KEYS.FUNDING_OPPORTUNITIES)) {
    const sampleOpportunities = [
      {
        id: 'fund1',
        title: 'Student Innovation Grant 2025',
        description: 'Funding opportunity for student innovators working on sustainable technology solutions.',
        providerId: 'business1',
        providerName: 'GreenTech Malaysia',
        amount: 100000,
        category: 'Sustainability',
        requirements: ['Student status', 'Working prototype', 'Sustainability focus'],
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        applications: [],
      },
      {
        id: 'fund2',
        title: 'Tech Innovation Seed Fund',
        description: 'Early-stage funding for tech innovations with potential for market impact.',
        providerId: 'business2',
        providerName: 'Malaysian Tech Ventures',
        amount: 50000,
        category: 'Technology',
        requirements: ['Innovative tech solution', 'Market potential', 'Team commitment'],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        applications: [],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.FUNDING_OPPORTUNITIES, JSON.stringify(sampleOpportunities));
  }



  // Initialize promo codes
  if (!localStorage.getItem(STORAGE_KEYS.PROMO_CODES)) {
    const samplePromoCodes = [
      {
        id: 'promo-utm-2025',
        code: 'UTM2025',
        institutionName: 'Universiti Teknologi Malaysia',
        tier: 'pro',
        active: true,
        maxUses: 1000,
        currentUses: 0,
        expiryDate: new Date('2025-12-31').toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'promo-um-2025',
        code: 'UM2025',
        institutionName: 'Universiti Malaya',
        tier: 'pro',
        active: true,
        maxUses: 1000,
        currentUses: 0,
        expiryDate: new Date('2025-12-31').toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'promo-upm-2025',
        code: 'UPM2025',
        institutionName: 'Universiti Putra Malaysia',
        tier: 'pro',
        active: true,
        maxUses: 1000,
        currentUses: 0,
        expiryDate: new Date('2025-12-31').toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(samplePromoCodes));
  }
};



