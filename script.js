

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
    }

    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        formStatus.textContent = "Sending...";
        formStatus.className = "form-status";

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: new FormData(contactForm),
                headers: { Accept: "application/json" }
            });

            if (response.ok) {
                formStatus.textContent = "Thanks — your message is sent. I'll get back to you soon.";
                formStatus.classList.add("success");
                contactForm.reset();
            } else {
                throw new Error("Form submission failed");
            }
        } catch (err) {
            formStatus.textContent = "Something went wrong. Please email me directly instead.";
            formStatus.classList.add("error");
        }
    });

    function revealOnScroll() {
            document.querySelectorAll(".reveal").forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 50) {
                el.classList.add("active");
                }
            });
            }
    window.addEventListener("scroll", revealOnScroll);

    const titles = ["Full-Stack Developer", "Designer", "Problem Solver"];
    let i = 0, j = 0, current = "", isDeleting = false;
    const el = document.querySelector(".typing");

    function type() {
    current = titles[i];
    el.textContent = current.substring(0, j);

    if (!isDeleting && j < current.length) {
        j++;
    } else if (isDeleting && j > 0) {
        j--;
    } else {
        // switch between typing & deleting
        isDeleting = !isDeleting;

        if (!isDeleting) {
        i++;
        // check if we finished all titles
        if (i >= titles.length) {
            el.textContent = titles[0]; // reset to first
            return; // stop typing loop here ✅
        }
        }
    }

    setTimeout(type, isDeleting ? 80 : 150);
    }
    type();


const translations = {
  en: {
    // navHome: "Home",
    // navAbout: "About",
    // navPortfolio: "Portfolio",
    navContact: "Contact me",

    heroTitle: "Hi, I'm",
    heroSubtitle: " building backends with Laravel and NestJS, interfaces with React and React Native, and the infrastructure in between.",

    aboutTitle: "About Me",
    aboutText: "I work across the stack — Laravel and NestJS lately, Django and FastAPI before that — with React, React Native, and Angular on the front end. I build whatever a project actually needs rather than sticking to one niche: during an internship I built LeakSight, a platform for aggregating threat-intelligence IoCs, and I've shipped everything from bug trackers to backend APIs since. Outside of client work, I build and ship personal projects to keep learning.",

    skillsTitle: "My Skills",
    skillsText: "Here are some of the skills I possess:",

    projectsTitle: "Projects",
    projectsText: "Here are some of the projects I've worked on:",

    timelineTitle: "My Journey",
    timelineItems: [
      "Full-Stack Developer at ADITYA. Building responsive web apps with React, Laravel, and NestJS styled with Tailwind, and mobile apps with React Native and Expo.",
      "Master's in Data Science & System Information. Learned Machine Learning fundamentals, Deep Learning, Data analytics, and software engineering principles.",
      "Full-Stack Developer at CTM. Building responsive web apps with React and Django.",
      "Professional Bachelor's in Software Engineering & Systems/Network Administration. Built on that foundation with advanced software engineering, systems architecture, and network administration.",
      "University Diploma of Technology's in Computer Engineering. Learned the fundamentals of web development, databases, and software engineering."
    ],

    contactTitle: "Contact",
    contactText: "Working on something interesting, hiring, or just want to talk shop? Send a message.",
    contactButton: "Email me"
  },
  fr: {
    // navHome: "Accueil",
    // navAbout: "À propos",
    // navPortfolio: "Portfolio",
    navContact: "Contactez-moi",

    heroTitle: "Bonjour, je suis ",

    heroSubtitle: "qui construit des back-ends avec Laravel et NestJS, des interfaces avec React et React Native, et tout ce qu'il y a entre les deux.",

    aboutTitle: "À propos de moi",
    aboutText: "Je travaille sur l'ensemble de la pile technique — Laravel et NestJS ces derniers temps, Django et FastAPI avant ça — avec React, React Native et Angular côté interface. Je construis ce dont un projet a réellement besoin plutôt que de me limiter à une niche : durant un stage, j'ai développé LeakSight, une plateforme d'agrégation d'IoC pour la threat intelligence, et j'ai livré aussi bien des trackers de bugs que des API backend depuis. En dehors des projets clients, je construis et déploie mes propres projets pour continuer à apprendre.",

    skillsTitle: "Mes Compétences",
    skillsText: "Voici quelques-unes de mes compétences :",

    projectsTitle: "Projets",
    projectsText: "Voici quelques projets sur lesquels j'ai travaillé :",

    timelineTitle: "Mon Parcours",
    timelineItems: [
      "Développeur Full-Stack chez ADITYA. Développement d'applications web réactives avec React, Laravel et NestJS, stylées avec Tailwind, et d'applications mobiles avec React Native et Expo.",
      "Master en Data Science & Systèmes d'Information. Apprentissage des fondamentaux du Machine Learning, du Deep Learning, de l'analyse de données et des principes du génie logiciel.",
      "Développeur Full-Stack chez CTM. Développement d'applications web réactives avec React et Django.",
      "Licence Professionnelle en Génie Logiciel & Administration Systèmes/Réseaux. Approfondissement de ces fondamentaux avec des notions avancées de génie logiciel, d'architecture systèmes et d'administration réseau.",
      "Diplôme Universitaire de Technologie en Génie Informatique. Apprentissage des fondamentaux du développement web, des bases de données et du génie logiciel."
    ],

    contactTitle: "Contact",
    contactText: "Vous travaillez sur quelque chose d'intéressant, vous recrutez, ou vous voulez simplement discuter ? Écrivez-moi.",
    contactButton: "Envoyez-moi un email"
  }
};

function setLanguage(lang) {
  document.documentElement.lang = lang;

  // document.getElementById("nav-home").textContent = translations[lang].navHome;
  // document.getElementById("nav-about").textContent = translations[lang].navAbout;
  // document.getElementById("nav-portfolio").textContent = translations[lang].navPortfolio;
  document.getElementById("nav-contact").textContent = translations[lang].navContact;

  document.getElementById("hero-title").textContent = translations[lang].heroTitle;
  document.getElementById("hero-subtitle").textContent = translations[lang].heroSubtitle;

  document.getElementById("about-title").textContent = translations[lang].aboutTitle;
  document.getElementById("about-text").textContent = translations[lang].aboutText;

  document.getElementById("skills-title").textContent = translations[lang].skillsTitle;
  document.getElementById("skills-text").textContent = translations[lang].skillsText;

  document.getElementById("projects-title").textContent = translations[lang].projectsTitle;
  document.getElementById("projects-text").textContent = translations[lang].projectsText;

  document.querySelector(".timeline h2").textContent = translations[lang].timelineTitle;
  translations[lang].timelineItems.forEach((text, i) => {
    const el = document.getElementById("timeline-text-" + (i + 1));
    if (el) el.textContent = text;
  });

  document.getElementById("contact-title").textContent = translations[lang].contactTitle;
  document.getElementById("contact-text").textContent = translations[lang].contactText;
  document.querySelector(".main-cta").textContent = translations[lang].contactButton;

  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  document.getElementById("lang-fr").classList.toggle("active", lang === "fr");
}

// Default language
setLanguage("en");


