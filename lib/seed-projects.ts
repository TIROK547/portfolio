// Initial projects, copied from the old hard-coded projects page.
// Only used to seed an empty database; after that, manage projects from admin.tirok.ir.
export interface SeedProject {
  name: string
  description: string
  stack: string[]
  github: string
  status: 'active' | 'wip' | 'archived'
  featured?: boolean // shown in the home page's featured section
}

export const seedProjects: SeedProject[] = [
{
    name: 'Coxy',
    featured: true,
    description: 'Scrapes, tests, and ranks VPN configs (VLESS / VMess / Trojan) and MTProto proxies collected from public Telegram channels. coxy pulls raw links from Telegram, speed-tests them, and produces a clean, ranked list of the fastest working configs and proxies — ready to publish or import into a client.',
    stack: ['Python', 'Bash'],
    github: 'https://github.com/TIROK547/coxy',
    status: 'active',
  },
{
    name: 'TrendPulse',
    description: 'Open-source social media trend heatmap platform. Built with Django 6 + DRF backend, PostgreSQL and Valkey for storage/caching, a Next.js frontend, and a planned Go middleware layer, developed with Docker Compose.',
    stack: ['Django', 'Next.js', 'PostgreSQL', 'Valkey'],
    github: 'https://github.com/TIROK547/TrendPulse',
    status: 'wip',
  },
{
    name: 'TeleVisit24',
    featured: true,
    description: 'A telemedicine platform with Django REST Framework backend and Next.js frontend, deployed via Cloudflare Tunnel. Includes doctor profiles, appointment scheduling, real-time WebSocket chat (Django Channels), JWT auth, and AI-assisted booking with disease-prediction and emergency-detection microservices.',
    stack: ['Django', 'Next.js', 'PostgreSQL', 'Redis'],
    github: 'https://github.com/TIROK547/Televisit',
    status: 'wip',
  },
  {
    name: 'Kelaasor Panel',
    description: 'A Django backend for managing users, support tickets, and bootcamps. Features SMS-based phone verification, role-based access for technical and financial admins, a ticketing/messaging system, bootcamp join requests, and async task handling with Celery.',
    stack: ['Django', 'Celery', 'Python'],
    github: 'https://github.com/TIROK547/kelaasor-panel',
    status: 'archived',
  },
  {
    name: 'OTP Go',
    description: 'A Go backend service for OTP-based login and registration. Generates OTPs with Redis-backed expiry and rate limiting, issues JWTs on verification, persists users in PostgreSQL, and ships with a full OpenAPI spec and Docker Compose setup.',
    stack: ['Go', 'PostgreSQL', 'Redis', 'Docker'],
    github: 'https://github.com/TIROK547/otp-go',
    status: 'active',
  },
  {
    name: 'LeetCode Solutions',
    description: 'A running archive of LeetCode problem solutions, organized by difficulty (easy/medium/hard) and month. Tracks ongoing practice and problem-solving progress over time.',
    stack: ['Algorithms', 'Data Structures'],
    github: 'https://github.com/TIROK547/tirok-leetcode-solutions',
    status: 'active',
  },
    {
    name: 'Os',
    description: 'A Python-based minimal operating system simulation project. This project includes a custom filesystem structure, process handling logic, and foundational components that mimic basic OS behaviors. It demonstrates low-level programming skills and understanding of core operating system concepts through Python scripting and file modeling.',
    stack: ['Python'],
    github: 'https://github.com/TIROK547/Os',
    status: 'wip',
  },
  {
    name: 'Telegram Study Bot',
    description: 'A Telegram bot designed to assist with study tasks and organization. Built with Python, it includes bot integration with a database backend, command handling, and deployment scripts. Useful for automating schedule reminders, task tracking, and other personalized study workflows.',
    stack: ['Python', 'Telegram Bot API'],
    github: 'https://github.com/TIROK547/telegram-study-bot',
    status: 'archived',
  },
  {
    name: 'Portfolio Website',
    description: 'A retro terminal-inspired portfolio website showcasing projects and skills. Built with Next.js, TypeScript, React, and Tailwind CSS, the site features bilingual support, theme toggling, responsive design, and terminal CRT aesthetic effects. Designed to present your developer profile in a unique and interactive way.',
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS'],
    github: 'https://github.com/TIROK547/portfolio',
    status: 'active',
  },
];
