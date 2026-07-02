export interface Article {
  id: string;
  title: string;
  content: string; // Markdown
  topic: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  audience: string;
  keywords: string[];
  suggestedBlurbs: {
    platform: 'LinkedIn' | 'Twitter/X' | 'Facebook' | 'Slack';
    text: string;
  }[];
  createdAt: string;
}

export interface ScheduledPost {
  id: string;
  articleId?: string;
  articleTitle?: string;
  text: string;
  platforms: ('LinkedIn' | 'Twitter/X' | 'Facebook' | 'Slack')[];
  scheduledAt: string; // ISO String
  status: 'scheduled' | 'published' | 'cancelled';
  createdAt: string;
}

export interface HRTopic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export const HR_TOPICS: HRTopic[] = [
  {
    id: 'remote-culture',
    name: 'Remote Work Culture',
    description: 'Fostering collaboration, engagement, and alignment across distributed teams.',
    keywords: ['virtual onboarding', 'asynchronous communication', 'digital watercooler', 'remote engagement'],
  },
  {
    id: 'mental-health',
    name: 'Employee Well-being & Mental Health',
    description: 'Addressing burnout, offering mental health days, and supporting work-life harmony.',
    keywords: ['preventing burnout', 'work-life balance', 'wellness benefits', 'psychological safety'],
  },
  {
    id: 'performance-reviews',
    name: 'Modern Performance Management',
    description: 'Moving from annual reviews to continuous feedback, coaching, and OKRs.',
    keywords: ['continuous feedback', 'peer reviews', 'growth coaching', 'OKR goal setting'],
  },
  {
    id: 'diversity-inclusion',
    name: 'Diversity, Equity & Inclusion (DE&I)',
    description: 'Creating equitable hiring processes, employee resource groups (ERGs), and inclusive cultures.',
    keywords: ['inclusive hiring', 'unconscious bias', 'ERG support', 'cultural belonging'],
  },
  {
    id: 'talent-acquisition',
    name: 'Talent Acquisition & Employer Branding',
    description: 'Attracting top talent, crafting compelling employee value propositions, and social sourcing.',
    keywords: ['employer value proposition', 'social recruiting', 'candidate experience', 'skills-based hiring'],
  },
  {
    id: 'retention-strategies',
    name: 'Employee Retention & Growth',
    description: 'Career development mapping, upskilling opportunities, and reducing voluntary turnover.',
    keywords: ['career pathing', 'upskilling', 'voluntary turnover', 'stay interviews'],
  },
];

export const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional & Authoritative', emoji: '💼' },
  { id: 'empathetic', label: 'Empathetic & Supportive', emoji: '🌱' },
  { id: 'casual', label: 'Casual & Engaging', emoji: '☕' },
  { id: 'inspirational', label: 'Inspirational & Bold', emoji: '🚀' },
  { id: 'informative', label: 'Data-driven & Informative', emoji: '📊' },
];
