/**
 * Emika app constants — discovered via scouting 2026-02-20
 */

const BASE_URL = 'https://app.emika.ai';

const AI_EMPLOYEES = {
  active: [
    {
      name: 'Executive Assistant',
      description: 'Versatile generalist — web apps, emails, data workflows, content plans',
      useCases: [
        {
          name: 'Schedule a meeting',
          prompt: 'I need to schedule a meeting with my team next Tuesday at 2pm. Can you help?',
          expectContains: ['meeting', 'schedule', 'Tuesday'],
        },
        {
          name: 'Draft an email',
          prompt: 'Draft a professional email to a client named John about project delivery being delayed by one week.',
          expectContains: ['John', 'delay', 'week'],
        },
        {
          name: 'Summarize data',
          prompt: 'I have quarterly sales numbers: Q1 $120k, Q2 $145k, Q3 $98k, Q4 $210k. Summarize the trend and highlight concerns.',
          expectContains: ['Q3', 'decline', 'Q4'],
        },
        {
          name: 'Create a content plan',
          prompt: 'Create a 1-week social media content plan for a B2B SaaS company launching a new feature.',
          expectContains: ['Monday', 'post', 'launch'],
        },
      ],
    },
    {
      name: 'Software Developer',
      description: 'AI software engineer — plan, architect, build applications',
      useCases: [
        {
          name: 'Build a REST API',
          prompt: 'I need a simple REST API in Node.js with Express for a todo list app. Can you create it?',
          expectContains: ['express', 'app', 'route'],
        },
        {
          name: 'Debug code',
          prompt: 'This code crashes: `const x = JSON.parse(undefined);` — why and how to fix it?',
          expectContains: ['undefined', 'try', 'catch'],
        },
        {
          name: 'Architecture recommendation',
          prompt: 'I\'m building a marketplace app for 10k users. What tech stack do you recommend?',
          expectContains: ['database', 'frontend', 'backend'],
        },
        {
          name: 'Code review',
          prompt: 'Review this function: `function add(a,b){return a+b}` — what improvements would you suggest for production use?',
          expectContains: ['type', 'validation', 'error'],
        },
      ],
    },
    {
      name: 'QA Engineer',
      description: 'Analyzes code, generates test cases, runs automated tests',
      useCases: [
        {
          name: 'Generate test cases',
          prompt: 'Generate test cases for a login form that accepts email and password.',
          expectContains: ['valid', 'invalid', 'empty'],
        },
        {
          name: 'Write automated test',
          prompt: 'Write a Playwright test that checks if google.com loads and has a search input.',
          expectContains: ['playwright', 'test', 'expect'],
        },
        {
          name: 'Bug report analysis',
          prompt: 'Users report the checkout button sometimes doesn\'t work on mobile Safari. What should I test?',
          expectContains: ['Safari', 'mobile', 'click'],
        },
        {
          name: 'Test strategy',
          prompt: 'We\'re launching a payment feature next week. What\'s the testing strategy?',
          expectContains: ['regression', 'payment', 'test'],
        },
      ],
    },
    {
      name: 'System Analyst',
      description: 'Specification expert — analyzes codebases, creates detailed specs',
      useCases: [
        {
          name: 'Create a specification',
          prompt: 'Write a specification for a user registration feature that supports email and Google OAuth.',
          expectContains: ['registration', 'OAuth', 'email'],
        },
        {
          name: 'Analyze requirements',
          prompt: 'Client wants "a fast website". Break this down into measurable technical requirements.',
          expectContains: ['load time', 'performance', 'metric'],
        },
        {
          name: 'Edge case analysis',
          prompt: 'What edge cases should we consider for a file upload feature that accepts images up to 10MB?',
          expectContains: ['size', 'format', 'error'],
        },
        {
          name: 'Architecture documentation',
          prompt: 'Document the architecture for a microservices system with 3 services: auth, orders, and notifications.',
          expectContains: ['auth', 'orders', 'notification'],
        },
      ],
    },
    {
      name: 'Sales Development Rep',
      description: 'AI-powered SDR — prospect research, outreach campaigns, pipeline management',
      useCases: [
        {
          name: 'Research prospects',
          prompt: 'Find the ideal customer profile for a B2B project management tool targeting tech startups.',
          expectContains: ['startup', 'tech', 'target'],
        },
        {
          name: 'Write cold outreach',
          prompt: 'Write a cold email to a VP of Engineering at a 50-person startup about our CI/CD tool.',
          expectContains: ['CI/CD', 'engineering', 'team'],
        },
        {
          name: 'Objection handling',
          prompt: 'A prospect says "we already use Jira, why would we switch?" How should I respond?',
          expectContains: ['Jira', 'benefit', 'switch'],
        },
        {
          name: 'Pipeline review',
          prompt: 'I have 20 leads, 5 in discovery, 3 in demo stage, 2 in negotiation. What should I prioritize?',
          expectContains: ['negotiation', 'prioritize', 'close'],
        },
      ],
    },
    {
      name: 'SEO Manager',
      description: 'AI SEO strategist — audits, content optimization, keyword tracking',
      useCases: [
        {
          name: 'SEO audit',
          prompt: 'What are the most important things to check in an SEO audit for a new e-commerce site?',
          expectContains: ['meta', 'speed', 'content'],
        },
        {
          name: 'Keyword strategy',
          prompt: 'Suggest a keyword strategy for a SaaS tool that does automated invoicing.',
          expectContains: ['keyword', 'invoicing', 'search'],
        },
        {
          name: 'Content optimization',
          prompt: 'I have a blog post titled "How to Use Our Tool". How can I optimize it for SEO?',
          expectContains: ['title', 'keyword', 'heading'],
        },
        {
          name: 'Technical SEO fix',
          prompt: 'My site has duplicate content issues across www and non-www versions. How do I fix this?',
          expectContains: ['canonical', 'redirect', '301'],
        },
      ],
    },
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

module.exports = {
  BASE_URL,
  AI_EMPLOYEES,
  USER_ROLES,
  MALE_NAMES,
};
