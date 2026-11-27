import type { Content } from "./types";

export const fr: Content = {
  lang: "fr",
  meta: {
    title: "Younes Ghalloum — Développeur Full-Stack",
    description:
      "Développeur full-stack : Laravel, Symfony, NestJS et Spring Boot côté back-end, React et Angular côté front-end.",
  },
  nav: {
    contact: "Contactez-moi",
    skip: "Aller au contenu",
    home: "Accueil",
    slides: "Sections",
    scrollView: "Vue défilement",
    slideView: "Vue diapositives",
  },
  hero: {
    greeting: "Bonjour, je suis",
    name: "Younes Ghalloum",
    titles: ["Développeur Full-Stack", "Designer", "Résolveur de problèmes"],
    ui: "Des interfaces avec React et Angular",
    between: "l'infrastructure entre les deux",
    api: "Des back-ends avec Laravel, NestJS et Spring Boot",
    cta: "Voir les projets",
  },
  about: {
    title: "À propos de moi",
    text: "Je construis des produits full-stack, de la base de données à l'interface, et je continue d'apprendre en livrant de vrais projets.",
    tiles: [
      { title: "Backend", text: "Laravel, Symfony et NestJS d'un côté, Java avec Spring Boot de l'autre." },
      { title: "Frontend", text: "Interfaces React et Angular, des tableaux de bord aux applications temps réel." },
      {
        title: "Hors du travail",
        text: "Projets personnels, d'un site e-commerce Stripe à une plateforme bancaire en microservices.",
      },
    ],
  },
  skills: {
    title: "Mes Compétences",
    text: "Voici quelques-unes de mes compétences :",
    labels: {
      backend: "Développement Backend",
      frontend: "Développement Frontend",
      databases: "Bases de données",
      devops: "DevOps & outils",
      ai: "IA & LLM",
      languages: "Langues",
    },
    languages: ["Anglais (courant)", "Français (courant)", "Arabe (maternelle)"],
  },
  projects: {
    title: "Projets",
    text: "Voici quelques projets sur lesquels j'ai travaillé :",
    cta: "Voir le projet",
    prev: "Projet précédent",
    next: "Projet suivant",
    items: [
      {
        id: "leaksight",
        name: "LeakSight",
        desc: "Plateforme de cybersécurité réalisée pendant mon stage chez Hisneo : un backend FastAPI qui analyse une IP, un site ou un fichier en croisant 4 services (VirusTotal, AbuseIPDB…), avec un tableau de bord Angular, des alertes sonores et des mises à jour en temps réel.",
      },
      {
        id: "baskit",
        name: "Baskit",
        desc: "Application e-commerce full-stack : catalogue produits, paniers invités et utilisateurs, paiement Stripe (webhook, commandes sans doublon, stock verrouillé), historique des commandes et back-office à rôles.",
      },
      {
        id: "hubly",
        name: "Hubly",
        desc: "Plateforme de gestion d'agence web : suivi des URL, SSL et hébergements, alertes e-mail et Slack, 2FA et API JWT.",
      },
      {
        id: "bugtracker",
        name: "Bug Tracker",
        desc: "Suivi d'anomalies avec statuts, rôles par projet et backend API Platform, livré avec Docker et CI GitHub.",
      },
      {
        id: "shopsense",
        name: "ShopSense",
        desc: "API REST d'une plateforme e-commerce : panier, commandes avec contrôle du total, paiement Stripe (PaymentIntent) et authentification JWT.",
      },
      {
        id: "mentora",
        name: "Mentora",
        desc: "Application de gestion de tâches : API REST Spring Boot (Spring Security, JWT avec refresh token en cookie HttpOnly, limitation de débit) et client Angular.",
      },
      {
        id: "ledgerline",
        name: "ledgerline",
        desc: "Plateforme bancaire en microservices (Eureka, Config Server, API Gateway) : JWT avec liste noire Redis, migrations Flyway et Docker Compose.",
      },
    ],
  },
  timeline: {
    title: "Mon Parcours",
    items: [
      "Stagiaire développeur Full-Stack chez ADITYA. Participation à une plateforme de recrutement (Laravel, React) avec scoring de candidats et synthèse par LLM, transcription d'entretiens audio et import de fiches de poste par IA, et à une application RH (NestJS, Prisma, React) avec auth JWT, moteur d'acquisition de congés et pointage géolocalisé. Développement de modules pour une plateforme de gestion d'ONG (planification, documents, actions en masse, rapports PDF) et refactorisation des contrôleurs Laravel vers le nouveau standard du projet.",
      "Master Systèmes d'Information & Data Science à l'ENSAM Casablanca. Fondamentaux du Machine Learning et du Deep Learning, analyse de données et principes du génie logiciel.",
      "Stagiaire développeur Full-Stack chez Hisneo. Développement du backend FastAPI d'une plateforme de cybersécurité et de son interface Angular (graphiques, alertes sonores, import de fichiers), déployés avec Docker.",
      "Développeur Full-Stack junior chez CTM. Refonte des écrans Angular d'une application de suivi de bus en temps réel (QR code ou numéro de billet pour afficher la position du bus, l'itinéraire et l'heure d'arrivée) et extension d'endpoints REST PHP (Flight) connectés à PostgreSQL et à l'API du fournisseur.",
      "Licence Professionnelle en Génie Logiciel & Administration Systèmes/Réseaux à l'EST Casablanca. Génie logiciel avancé, architecture des systèmes et administration réseau.",
      "DUT Génie Informatique à l'EST Casablanca. Fondamentaux du développement web, des bases de données et du génie logiciel.",
    ],
  },
  contact: {
    title: "Contact",
    text: "Vous travaillez sur quelque chose d'intéressant, vous recrutez, ou vous voulez simplement discuter ? Écrivez-moi.",
    button: "Envoyez-moi un email",
    form: {
      name: "Votre nom",
      email: "Votre email",
      message: "Votre message",
      send: "Envoyer",
      sending: "Envoi en cours...",
      sent: "Merci — votre message a bien été envoyé. Je vous répondrai rapidement.",
      error: "Une erreur est survenue. Écrivez-moi directement par email.",
    },
  },
};
