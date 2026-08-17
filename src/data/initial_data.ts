import { CVData } from '../types/cv';

export const initialCVData: CVData = {
  profile: {
    name: "Vivi Veras",
    headline: {
      en: "Full-Stack Engineer & DevOps Specialist",
      cs: "Full-Stack Vývojář a DevOps Specialistá"
    },
    summary: {
      en: "Software engineer with 3+ years of hands-on experience in building scalable web applications using React, TypeScript, Node.js, Python, and DevOps tools such as Docker, AWS and Terraform. Committed to writing clean, maintainable code and improving system reliability through automation and testing.",
      cs: "Softwarový inženýr s 3+ roky praktických zkušeností s vývojem škálovatelných webových aplikací pomocí React, TypeScript, Node.js, Python a DevOps nástrojů jako Docker, AWS a Terraform. Zaměření na čistý, udržovatelný kód a zvyšování spolehlivosti systémů pomocí automatizace a testování."
    },
    email: "dveras2310@gmail.com",
    phone: "+55 (98) 98721-6857",
    location: "Czech Republic / Remote",
    portfolioUrl: "https://veras-app.netlify.app/",
    githubUrl: "https://github.com/Veras-D",
    linkedinUrl: "https://www.linkedin.com/in/veras-d/",
    whatsappUrl: "https://wa.me/5598987216857"
  },
  ingestionSources: {
    githubUrl: "https://github.com/Veras-D",
    linkedinUrl: "https://www.linkedin.com/in/veras-d/",
    websiteUrl: "https://veras-app.netlify.app/",
    cvPdfName: "temp_cv.pdf"
  },
  aiConfig: {
    provider: "ollama",
    endpoint: "http://localhost:11434",
    modelName: "llama3.2"
  },
  presets: [
    {
      id: "preset-default",
      name: "Classic ATS Engineer",
      description: "Clean ATS-optimized corporate layout for tech roles.",
      activeTags: ["fullstack", "devops", "backend"],
      activeLanguage: "en",
      activeLayout: "classic",
      metadata: {
        dc_title: "Vivi Veras - Resume",
        dc_creator: "Vivi Veras",
        cp_keywords: "React, TypeScript, Node.js, Python, DevOps, Docker, AWS",
        cp_description: "Professional Resume - Vivi Veras",
        cp_category: "Resume"
      }
    }
  ],
  activePresetId: "preset-default",
  experiences: [
    {
      id: "exp-recent-role",
      roleTitle: {
        en: "Senior Software Engineer",
        cs: "Seniorní Softwarový Inženýr"
      },
      company: "Tech Enterprise / Client",
      location: "Prague / Remote",
      startDate: "Jul 2024",
      endDate: "Present",
      summary: {
        en: "Leading microservice architecture and automated cloud infrastructure deployments.",
        cs: "Vedení architektury mikroslužeb a automatizovaných nasazení v cloudu."
      },
      tags: ["fullstack", "backend", "devops"],
      enabled: true,
      bullets: [
        {
          id: "b-recent-1",
          text: {
            en: "Architected high-throughput RESTful services and event-driven worker services, reducing processing latency by 35%.",
            cs: "Navrhl vysokokapacitní REST služby a událostmi řízené mikroslužby, čímž se snížila latence zpracování o 35 %."
          },
          tags: ["backend", "fullstack"],
          enabled: true
        },
        {
          id: "b-recent-2",
          text: {
            en: "Designed containerized deployment strategies using Docker, Kubernetes, and automated Terraform Infrastructure as Code (IaC).",
            cs: "Navrhl kontejnerové strategie nasazení pomocí Dockeru, Kubernetes a automatizované infrastruktury jako kódu (Terraform)."
          },
          tags: ["devops"],
          enabled: true
        },
        {
          id: "b-recent-3",
          text: {
            en: "Mentored junior engineers and conducted code reviews to ensure compliance with security and clean code practices.",
            cs: "Mentoroval služebně mladší vývojáře a prováděl revize kódu pro dodržování zásad bezpečnosti a čistého kódu."
          },
          tags: ["management"],
          enabled: true
        }
      ]
    },
    {
      id: "exp-gx4",
      roleTitle: {
        en: "Full-Stack Engineer",
        cs: "Full-Stack Vývojář"
      },
      company: "GX4 Software",
      location: "Remote",
      startDate: "Jun 2024",
      endDate: "Jul 2024",
      summary: {
        en: "Software house specialized in Website Development for ERP Systems, CRM, Android Applications and Financial Systems.",
        cs: "Softwarová společnost specializovaná na vývoj ERP systémů, CRM, Android aplikací a finančních systémů."
      },
      tags: ["fullstack", "frontend", "backend", "devops"],
      enabled: true,
      bullets: [
        {
          id: "b-gx4-1",
          text: {
            en: "Developed and maintained web applications using React, TypeScript, TailwindCSS, and Testing Library.",
            cs: "Vyvíjel a udržoval webové aplikace s využitím React, TypeScript, TailwindCSS a Testing Library."
          },
          tags: ["frontend", "fullstack"],
          enabled: true
        },
        {
          id: "b-gx4-2",
          text: {
            en: "Built RESTful APIs with ExpressJS and Spring Boot, integrating PostgreSQL and MongoDB for reliable data storage.",
            cs: "Vytvořil RESTful API s ExpressJS a Spring Boot, včetně integrace PostgreSQL a MongoDB."
          },
          tags: ["backend"],
          enabled: true
        },
        {
          id: "b-gx4-3",
          text: {
            en: "Streamlined CI/CD pipelines with Docker, reducing deployment errors by 30%.",
            cs: "Zefektivnil CI/CD pipelines pomocí Dockeru, což snížilo chyby při nasazení o 30 %."
          },
          tags: ["devops"],
          enabled: true
        }
      ]
    },
    {
      id: "exp-apam",
      roleTitle: {
        en: "Programmer Team Manager",
        cs: "Vedoucí Týmu Vývojářů"
      },
      company: "APAM (NGO)",
      location: "Remote",
      startDate: "Aug 2023",
      endDate: "Jul 2024",
      summary: {
        en: "Non-profit animal protection organization.",
        cs: "Nezisková organizace na ochranu zvířat."
      },
      tags: ["management", "fullstack", "devops"],
      enabled: true,
      bullets: [
        {
          id: "b-apam-1",
          text: {
            en: "Led a volunteer team of 5 developers to deliver a full-stack web application using React, Python, and MySQL.",
            cs: "Vedl dobrovolnický tým 5 vývojářů při vývoji full-stack aplikace v Reactu, Pythonu a MySQL."
          },
          tags: ["management", "fullstack"],
          enabled: true
        },
        {
          id: "b-apam-2",
          text: {
            en: "Architected platform backend and infrastructure, implementing CI/CD with GitHub Actions, reducing release cycle time by 40%.",
            cs: "Navrhl backend a infrastrukturu platformy s využitím CI/CD v GitHub Actions, čímž zkrátil dobu vydání o 40 %."
          },
          tags: ["devops", "backend"],
          enabled: true
        }
      ]
    },
    {
      id: "exp-lesc",
      roleTitle: {
        en: "Undergraduate Researcher",
        cs: "Akademický Výzkumník"
      },
      company: "LESC, UEMA",
      location: "Maranhão, Brazil",
      startDate: "Jul 2022",
      endDate: "Sep 2023",
      summary: {
        en: "Laboratory of Experimentation and Simulation in Heat at State University of Maranhão.",
        cs: "Laboratoř experimentů a simulací tepla na Státní univerzitě v Maranhão."
      },
      tags: ["frontend", "backend"],
      enabled: true,
      bullets: [
        {
          id: "b-lesc-1",
          text: {
            en: "Designed responsive UI components using JavaScript and Figma for academic research tools.",
            cs: "Navrhl a implementoval responzivní UI komponenty v JavaScriptu a Figmě pro akademické nástroje."
          },
          tags: ["frontend"],
          enabled: true
        },
        {
          id: "b-lesc-2",
          text: {
            en: "Automated research workflows with Python, saving over 6 hours weekly.",
            cs: "Automatizoval výzkumné postupy v Pythonu, což ušetřilo 6+ hodin týdně."
          },
          tags: ["backend"],
          enabled: true
        }
      ]
    }
  ],
  skillCategories: [
    {
      id: "cat-languages",
      categoryName: {
        en: "Programming Languages",
        cs: "Programovací Jazyky"
      },
      skills: [
        { id: "sk-ts", name: "TypeScript", tags: ["frontend", "backend", "fullstack"], enabled: true },
        { id: "sk-js", name: "JavaScript", tags: ["frontend", "backend", "fullstack"], enabled: true },
        { id: "sk-py", name: "Python", tags: ["backend", "devops"], enabled: true },
        { id: "sk-cs", name: "C# / .NET", tags: ["backend"], enabled: true },
        { id: "sk-java", name: "Java", tags: ["backend"], enabled: true },
        { id: "sk-bash", name: "Bash / Shell", tags: ["devops"], enabled: true },
        { id: "sk-html", name: "HTML5 / CSS3", tags: ["frontend"], enabled: true }
      ]
    },
    {
      id: "cat-frontend",
      categoryName: {
        en: "Frontend & UI",
        cs: "Frontend a UI"
      },
      skills: [
        { id: "sk-react", name: "React / Vite", tags: ["frontend", "fullstack"], enabled: true },
        { id: "sk-tailwind", name: "TailwindCSS", tags: ["frontend"], enabled: true },
        { id: "sk-next", name: "Next.js", tags: ["frontend", "fullstack"], enabled: true },
        { id: "sk-angular", name: "Angular", tags: ["frontend"], enabled: true },
        { id: "sk-figma", name: "Figma UI/UX", tags: ["frontend"], enabled: true }
      ]
    },
    {
      id: "cat-backend",
      categoryName: {
        en: "Backend & Databases",
        cs: "Backend a Databáze"
      },
      skills: [
        { id: "sk-node", name: "Node.js / Express", tags: ["backend", "fullstack"], enabled: true },
        { id: "sk-spring", name: "Spring Boot", tags: ["backend"], enabled: true },
        { id: "sk-pg", name: "PostgreSQL", tags: ["backend"], enabled: true },
        { id: "sk-mongo", name: "MongoDB", tags: ["backend"], enabled: true },
        { id: "sk-mysql", name: "MySQL", tags: ["backend"], enabled: true },
        { id: "sk-redis", name: "Redis", tags: ["backend"], enabled: true }
      ]
    },
    {
      id: "cat-devops",
      categoryName: {
        en: "DevOps & Cloud",
        cs: "DevOps a Cloud"
      },
      skills: [
        { id: "sk-docker", name: "Docker & Compose", tags: ["devops"], enabled: true },
        { id: "sk-aws", name: "AWS (EC2, ECR, S3)", tags: ["devops"], enabled: true },
        { id: "sk-terraform", name: "Terraform (IaC)", tags: ["devops"], enabled: true },
        { id: "sk-actions", name: "GitHub Actions CI/CD", tags: ["devops"], enabled: true },
        { id: "sk-k8s", name: "Kubernetes", tags: ["devops"], enabled: true },
        { id: "sk-linux", name: "Linux Administration", tags: ["devops"], enabled: true }
      ]
    }
  ],
  projects: [
    {
      id: "proj-devops",
      title: "Automated AWS & Nginx DevOps Infrastructure",
      description: {
        en: "DevOps deployment pipeline automating Nginx service delivery on AWS EC2 using Terraform, Docker, and GitHub Actions.",
        cs: "DevOps pipeline automatizující nasazení Nginx v AWS EC2 pomocí Terraformu, Dockeru a GitHub Actions."
      },
      url: "https://github.com/Veras-D/advanced-devops-project",
      techStack: ["Docker", "Terraform", "AWS ECR/EC2", "GitHub Actions"],
      tags: ["devops", "backend"],
      enabled: true
    },
    {
      id: "proj-auth",
      title: "Auth Lab Microservice",
      description: {
        en: "TypeScript authentication API supporting JWT rotation, testing, and isolated Docker container environment.",
        cs: "Bezpečnostní autentizační API v TypeScriptu s podporou JWT a Dockeru."
      },
      url: "https://github.com/Veras-D/auth-lab",
      techStack: ["TypeScript", "Node.js", "Express", "JWT", "Docker"],
      tags: ["backend", "fullstack", "devops"],
      enabled: true
    },
    {
      id: "proj-tarot",
      title: "AI Tarot Chat Web Application",
      description: {
        en: "Interactive web app built with Next.js and TypeScript, integrating LLM endpoints.",
        cs: "Interaktivní webová aplikace v Next.js a TypeScriptu využívající LLM."
      },
      url: "https://github.com/Veras-D/AI_TarotChat",
      techStack: ["Next.js", "React", "TypeScript", "TailwindCSS"],
      tags: ["frontend", "fullstack"],
      enabled: true
    }
  ],
  education: [
    {
      id: "edu-recode",
      institution: "Recode Pro",
      program: {
        en: "Full-Stack Development Program",
        cs: "Program Vývoje Full-Stack Aplikací"
      },
      dates: "2024 – 2025",
      technologies: ["React", "Node.js", "TypeScript", "Java", "Spring Boot", "MySQL", "Docker"],
      enabled: true
    },
    {
      id: "edu-secti",
      institution: "SECTI MA",
      program: {
        en: "Data Science & Automation Program",
        cs: "Program Datové Vědy a Automatizace"
      },
      dates: "2023 – 2024",
      technologies: ["Python", "Machine Learning", "Pandas", "Linux", "Bash"],
      enabled: true
    }
  ],
  languages: [
    {
      id: "lang-pt",
      language: { en: "Portuguese", cs: "Portugalština" },
      proficiency: { en: "Native", cs: "Rodilý mluvčí" },
      enabled: true
    },
    {
      id: "lang-en",
      language: { en: "English", cs: "Angličtina" },
      proficiency: { en: "Full Professional (B2-C1)", cs: "Pokročilá (B2-C1)" },
      enabled: true
    },
    {
      id: "lang-cs",
      language: { en: "Czech", cs: "Čeština" },
      proficiency: { en: "Elementary", cs: "Základní" },
      enabled: true
    }
  ],
  coverLetters: [],
  kanbanRoles: [
    {
      id: "kanban-1",
      roleTitle: "Senior DevOps & Cloud Engineer",
      company: "Avast / Gen Digital",
      location: "Prague, CZ",
      salary: "130,000 CZK / mo",
      status: "tech_interview",
      dateApplied: "2026-08-10",
      roleUrl: "https://www.linkedin.com/jobs/view/123456789",
      notes: "Technical architecture interview scheduled.",
      updatedAt: "2026-08-15T10:00:00.000Z"
    },
    {
      id: "kanban-2",
      roleTitle: "Full-Stack TypeScript Developer",
      company: "Mews",
      location: "Prague / Remote",
      salary: "120,000 CZK / mo",
      status: "hr_call",
      dateApplied: "2026-08-14",
      roleUrl: "https://mews.careers/jobs/fullstack-ts",
      notes: "Recruiter screening call completed.",
      updatedAt: "2026-08-14T14:30:00.000Z"
    },
    {
      id: "kanban-3",
      roleTitle: "Backend Software Engineer",
      company: "Red Hat",
      location: "Brno / Remote",
      salary: "125,000 CZK / mo",
      status: "applied",
      dateApplied: "2026-08-16",
      roleUrl: "https://redhat.jobs",
      updatedAt: "2026-08-16T09:15:00.000Z"
    }
  ]
};
