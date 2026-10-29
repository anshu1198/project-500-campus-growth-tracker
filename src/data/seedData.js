/**
 * Project 500 — Campus Growth Tracker
 * Realistic fictional seed datasets for campaign demonstration.
 */

function getCampaignStartDate() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getRelativeDate(dayOffset, hours = 12, minutes = 0) {
  const d = getCampaignStartDate();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function getSeedAmbassadors() {
  return [
    {
      id: 'amb-001',
      name: 'Rahul Sharma',
      college: 'JNTU Hyderabad',
      email: 'rahul.sharma@demo.example',
      referralCode: 'CAMPUS_RAHUL_42',
      status: 'active'
    },
    {
      id: 'amb-002',
      name: 'Priya Reddy',
      college: 'VIT Vellore',
      email: 'priya.reddy@demo.example',
      referralCode: 'CAMPUS_PRIYA_15',
      status: 'active'
    },
    {
      id: 'amb-003',
      name: 'Arjun Patel',
      college: 'NIT Warangal',
      email: 'arjun.patel@demo.example',
      referralCode: 'CAMPUS_ARJUN_78',
      status: 'active'
    },
    {
      id: 'amb-004',
      name: 'Sneha Krishnan',
      college: 'BITS Pilani',
      email: 'sneha.k@demo.example',
      referralCode: 'CAMPUS_SNEHA_33',
      status: 'active'
    },
    {
      id: 'amb-005',
      name: 'Vikram Singh',
      college: 'IIT Madras',
      email: 'vikram.s@demo.example',
      referralCode: 'CAMPUS_VIKRAM_56',
      status: 'active'
    },
    {
      id: 'amb-006',
      name: 'Anjali Desai',
      college: 'CBIT Hyderabad',
      email: 'anjali.d@demo.example',
      referralCode: 'CAMPUS_ANJALI_91',
      status: 'inactive'
    }
  ];
}

export function getSeedRegistrations() {
  return [
    // Day 1
    {
      id: 'reg-001',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@demo.example',
      college: 'JNTU Hyderabad',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_RAHUL_42',
      ambassadorId: 'amb-001',
      registeredAt: getRelativeDate(0, 10, 15),
      status: 'confirmed'
    },
    {
      id: 'reg-002',
      name: 'Diya Nair',
      email: 'diya.nair@demo.example',
      college: 'VIT Vellore',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_PRIYA_15',
      ambassadorId: 'amb-002',
      registeredAt: getRelativeDate(0, 14, 40),
      status: 'confirmed'
    },

    // Day 2
    {
      id: 'reg-003',
      name: 'Rohan Gupta',
      email: 'rohan.gupta@demo.example',
      college: 'Osmania University',
      discoveryChannel: 'whatsapp',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(1, 11, 30),
      status: 'confirmed'
    },
    {
      id: 'reg-004',
      name: 'Tanvi Verma',
      email: 'tanvi.verma@demo.example',
      college: 'NIT Warangal',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_ARJUN_78',
      ambassadorId: 'amb-003',
      registeredAt: getRelativeDate(1, 16, 10),
      status: 'confirmed'
    },

    // Day 3
    {
      id: 'reg-005',
      name: 'Karthik Iyer',
      email: 'karthik.iyer@demo.example',
      college: 'Manipal Institute of Technology',
      discoveryChannel: 'linkedin',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(2, 9, 15),
      status: 'confirmed'
    },
    {
      id: 'reg-006',
      name: 'Pooja Sharma',
      email: 'pooja.sharma@demo.example',
      college: 'BITS Pilani',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_SNEHA_33',
      ambassadorId: 'amb-004',
      registeredAt: getRelativeDate(2, 13, 25),
      status: 'confirmed'
    },
    {
      id: 'reg-007',
      name: 'Aditya Rao',
      email: 'aditya.rao@demo.example',
      college: 'SRM University Chennai',
      discoveryChannel: 'whatsapp',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(2, 17, 45),
      status: 'confirmed'
    },

    // Day 4
    {
      id: 'reg-008',
      name: 'Meera Joshi',
      email: 'meera.joshi@demo.example',
      college: 'JNTU Hyderabad',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_RAHUL_42',
      ambassadorId: 'amb-001',
      registeredAt: getRelativeDate(3, 10, 50),
      status: 'confirmed'
    },
    {
      id: 'reg-009',
      name: 'Siddharth Nair',
      email: 'siddharth.nair@demo.example',
      college: 'Thapar Institute of Technology',
      discoveryChannel: 'linkedin',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(3, 12, 30),
      status: 'confirmed'
    },
    {
      id: 'reg-010',
      name: 'Ishita Sen',
      email: 'ishita.sen@demo.example',
      college: 'VIT Vellore',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_PRIYA_15',
      ambassadorId: 'amb-002',
      registeredAt: getRelativeDate(3, 15, 15),
      status: 'confirmed'
    },

    // Day 5
    {
      id: 'reg-011',
      name: 'Harshvardhan Reddy',
      email: 'harsh.reddy@demo.example',
      college: 'Chaitanya Bharathi Institute',
      discoveryChannel: 'whatsapp',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(4, 11, 20),
      status: 'confirmed'
    },
    {
      id: 'reg-012',
      name: 'Neha Kulkarni',
      email: 'neha.kulkarni@demo.example',
      college: 'NIT Warangal',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_ARJUN_78',
      ambassadorId: 'amb-003',
      registeredAt: getRelativeDate(4, 14, 5),
      status: 'confirmed'
    },
    {
      id: 'reg-013',
      name: 'Ritu Singhania',
      email: 'ritu.singhania@demo.example',
      college: 'Symbiosis Institute Pune',
      discoveryChannel: 'linkedin',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(4, 18, 25),
      status: 'confirmed'
    },

    // Day 6
    {
      id: 'reg-014',
      name: 'Kunal Malhotra',
      email: 'kunal.malhotra@demo.example',
      college: 'Delhi Technological University',
      discoveryChannel: 'whatsapp',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(5, 11, 15),
      status: 'confirmed'
    },
    {
      id: 'reg-015',
      name: 'Ananya Roy',
      email: 'ananya.roy@demo.example',
      college: 'JNTU Hyderabad',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_RAHUL_42',
      ambassadorId: 'amb-001',
      registeredAt: getRelativeDate(5, 13, 40),
      status: 'confirmed'
    },
    {
      id: 'reg-016',
      name: 'Varun Kapoor',
      email: 'varun.kapoor@demo.example',
      college: 'Amity University Noida',
      discoveryChannel: 'other',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(5, 16, 50),
      status: 'confirmed'
    },

    // Day 7
    {
      id: 'reg-017',
      name: 'Bhavna Chawla',
      email: 'bhavna.chawla@demo.example',
      college: 'VIT Vellore',
      discoveryChannel: 'college-club',
      referralCode: 'CAMPUS_PRIYA_15',
      ambassadorId: 'amb-002',
      registeredAt: getRelativeDate(6, 10, 20),
      status: 'confirmed'
    },
    {
      id: 'reg-018',
      name: 'Pranav Deshmukh',
      email: 'pranav.deshmukh@demo.example',
      college: 'College of Engineering Pune',
      discoveryChannel: 'whatsapp',
      referralCode: '',
      ambassadorId: '',
      registeredAt: getRelativeDate(6, 11, 45),
      status: 'confirmed'
    }
  ];
}

export function getSeedChannels() {
  return [
    { id: 'college-club', name: 'College Clubs & Ambassadors', target: 250 },
    { id: 'whatsapp', name: 'WhatsApp Communities', target: 150 },
    { id: 'linkedin', name: 'LinkedIn & Organic', target: 100 }
  ];
}

export function getSeedBudget() {
  return [
    {
      id: 'budget-1',
      category: 'Ambassador Incentive Pool',
      plannedAmount: 1000,
      actualSpent: 0,
      notes: 'Rewards for top-performing ambassadors'
    },
    {
      id: 'budget-2',
      category: 'Promotional Materials',
      plannedAmount: 300,
      actualSpent: 0,
      notes: 'Posters, social media creatives, flyers'
    },
    {
      id: 'budget-3',
      category: 'Contingency',
      plannedAmount: 700,
      actualSpent: 0,
      notes: 'Reserve fund — not automatically spent'
    }
  ];
}

export function getDefaultSettings() {
  const startDate = getCampaignStartDate();
  return {
    campaignName: 'Build Your First AI Project in 60 Minutes',
    registrationTarget: 500,
    campaignDuration: 7,
    startDate: startDate.toISOString(),
    plannedBudget: 2000,
    baseUrl: 'https://workshop.nxtwave.in/register'
  };
}
