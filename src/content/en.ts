import type { Content } from "./types";

export const en: Content = {
  lang: "en",
  meta: {
    title: "Younes Ghalloum — Full-Stack Developer",
    description:
      "Full-stack developer working with Laravel, Symfony, NestJS and Spring Boot on the back end, and React and Angular on the front end.",
  },
  nav: {
    contact: "Contact me",
    skip: "Skip to content",
    home: "Intro",
    slides: "Sections",
    scrollView: "Scroll view",
    slideView: "Slide view",
  },
  hero: {
    greeting: "Hi, I'm",
    name: "Younes Ghalloum",
    titles: ["Full-Stack Developer", "Designer", "Problem Solver"],
    ui: "Interfaces with React and Angular",
    between: "the infrastructure in between",
    api: "Backends with Laravel, NestJS and Spring Boot",
    cta: "View projects",
  },
  about: {
    title: "About Me",
    text: "I build full-stack products from the database to the interface, and I keep learning by shipping real ones.",
    tiles: [
      { title: "Backend", text: "Laravel, Symfony and NestJS on one side, Java with Spring Boot on the other." },
      { title: "Frontend", text: "React and Angular interfaces, from dashboards to real-time apps." },
      {
        title: "Beyond work",
        text: "Personal projects, from a Stripe e-commerce site to a microservices banking platform.",
      },
    ],
  },
  skills: {
    title: "My Skills",
    text: "Here are some of the skills I possess:",
    labels: {
      backend: "Backend Development",
      frontend: "Frontend Development",
      databases: "Databases",
      devops: "DevOps & Tooling",
      ai: "AI & LLMs",
      languages: "Languages",
    },
    languages: ["English (fluent)", "French (fluent)", "Arabic (native)"],
  },
  projects: {
    title: "Projects",
    text: "Here are some of the projects I've worked on:",
    cta: "GitHub",
    live: "Live demo",
    liveSoon: "Not hosted yet",
    prev: "Previous project",
    next: "Next project",
    items: [
      {
        id: "leaksight",
        name: "LeakSight",
        desc: "Cybersecurity platform built during my internship at Hisneo: a FastAPI backend that analyses an IP, a website or a file by cross-checking 4 services (VirusTotal, AbuseIPDB…), with an Angular dashboard, sound alerts and real-time updates.",
      },
      {
        id: "baskit",
        name: "Baskit",
        desc: "Full-stack e-commerce app: product catalog, guest and user carts, Stripe checkout (webhook, duplicate-free orders, locked stock), order history and a role-based back office.",
      },
      {
        id: "hubly",
        name: "Hubly",
        desc: "Web agency management platform: URL, SSL and hosting monitoring, email and Slack alerts, 2FA and a JWT API.",
      },
      {
        id: "bugtracker",
        name: "Bug Tracker",
        desc: "Issue tracker with statuses, per-project roles and an API Platform backend, shipped with Docker and GitHub CI.",
      },
      {
        id: "shopsense",
        name: "ShopSense",
        desc: "REST API for an e-commerce platform: cart, orders with total verification, Stripe payments (PaymentIntent) and JWT authentication.",
      },
      {
        id: "mentora",
        name: "Mentora",
        desc: "Task management app: a Spring Boot REST API (Spring Security, JWT with a refresh token in an HttpOnly cookie, rate limiting) and an Angular client.",
      },
      {
        id: "ledgerline",
        name: "ledgerline",
        desc: "Banking platform built as microservices (Eureka, Config Server, API Gateway): JWT with a Redis blocklist, Flyway migrations and Docker Compose.",
      },
    ],
  },
  timeline: {
    title: "My Journey",
    items: [
      "Full-Stack Developer intern at ADITYA. Contributed to a recruitment platform (Laravel, React) with LLM candidate scoring and summaries, audio interview transcription and AI job-posting import, and to an HR app (NestJS, Prisma, React) with JWT auth, a leave-accrual engine and geolocated check-ins. Built modules for an NGO management platform (planning, documents, bulk actions, PDF reports) and refactored Laravel controllers into the project's new standard.",
      "Master's in Information Systems & Data Science at ENSAM Casablanca. Machine Learning and Deep Learning fundamentals, data analytics and software engineering principles.",
      "Full-Stack Developer intern at Hisneo. Built the FastAPI backend of a cybersecurity platform and its Angular interface (charts, sound alerts, file import), deployed with Docker.",
      "Junior Full-Stack Developer at CTM. Redesigned the Angular screens of a real-time bus-tracking app (QR code or ticket number to bus position, route and arrival time) and extended PHP (Flight) REST endpoints connected to PostgreSQL and the supplier's API.",
      "Professional Bachelor's in Software Engineering & Systems/Network Administration at EST Casablanca. Advanced software engineering, systems architecture and network administration.",
      "University Diploma of Technology in Computer Engineering at EST Casablanca. The fundamentals of web development, databases and software engineering.",
    ],
  },
  contact: {
    title: "Contact",
    text: "Working on something interesting, hiring, or just want to talk shop? Send a message.",
    button: "Email me",
    form: {
      name: "Your Name",
      email: "Your Email",
      message: "Your Message",
      send: "Send Message",
      sending: "Sending...",
      sent: "Thanks — your message is sent. I'll get back to you soon.",
      error: "Something went wrong. Please email me directly instead.",
    },
  },
};
