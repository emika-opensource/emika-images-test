/**
 * Emika app constants — discovered via scouting 2026-02-20
 */

const BASE_URL = 'https://app.emika.ai';

const AVATAR_PREFIXES = ['men', 'women', 'male', 'female'];
const AVATAR_COUNT = 15; // 1-15 for each prefix

const AVATARS = {
  men: Array.from({ length: 15 }, (_, i) => `/avatars/men-${i + 1}.jpg`),
  women: Array.from({ length: 15 }, (_, i) => `/avatars/women-${i + 1}.jpg`),
  male: Array.from({ length: 15 }, (_, i) => `/avatars/male-${i + 1}.jpg`),
  female: Array.from({ length: 15 }, (_, i) => `/avatars/female-${i + 1}.jpg`),
};

const ALL_AVATARS = [
  ...AVATARS.men, ...AVATARS.women, ...AVATARS.male, ...AVATARS.female,
];

const AI_EMPLOYEES = {
  active: [
    'Executive Assistant',
    'Software Developer',
    'QA Engineer',
    'System Analyst',
    'Sales Development Rep',
    'SEO Manager',
  ],
  comingSoon: [
    'Copywriter',
    'Social Media Manager',
    'Workflow Engineer',
    'Customer Support Rep',
    'UI/UX Designer',
    'Marketing Manager',
    'Recruiter',
    'Head of Operations',
  ],
};

const USER_ROLES = [
  'Software Engineer',
  'Product Manager',
  'Founder',
  'Marketing Manager',
  'Sales Manager',
  'Designer',
  'Data Analyst',
  'Operations Manager',
];

const MALE_NAMES = [
  'Atlas', 'Nova', 'Orion', 'Zephyr', 'Phoenix',
  'Jasper', 'Felix', 'Leo', 'Kai', 'Axel', 'Finn', 'Oscar',
];

// Female names TBD — need to scout the Female tab names

module.exports = {
  BASE_URL,
  AVATAR_PREFIXES,
  AVATAR_COUNT,
  AVATARS,
  ALL_AVATARS,
  AI_EMPLOYEES,
  USER_ROLES,
  MALE_NAMES,
};
