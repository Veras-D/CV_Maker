import { CVData } from '../types/cv';

export const initialCVData: CVData = {
  profile: {
    name: "Vivi Veras",
    headline: {
      en: "Full-Stack Engineer & DevOps Specialist",
      cs: "Full-Stack Vývojář a DevOps Specialistá"
    },
    summary: {
      en: "3+ years of hands-on experience in building scalable web applications using React, TypeScript, Node.js, Python, and DevOps tools such as Docker, AWS and Terraform. Committed to writing clean, maintainable code and improving system reliability through automation and testing.",
      cs: "3+ roky praktických zkušeností s vývojem škálovatelných webových aplikací pomocí React, TypeScript, Node.js, Python a DevOps nástrojů jako Docker, AWS a Terraform. Zaměření na čistý, udržovatelný kód a zvyšování spolehlivosti systémů pomocí automatizace a testování."
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
    cvPdfName: "temp_cv.pdf",
    customLinks: [
      "https://veras-app.netlify.app/pages/projects",
      "https://veras-app.netlify.app/pages/about"
    ]
  },
  aiConfig: {
    provider: "ollama",
    endpoint: "http://localhost:11434",
    modelName: "llama3.2"
  },
  presets: [
    {
      id: "preset-fullstack",
      name: "Full-Stack Engineer (Default)",
      description: "Balanced CV highlighting React, Node.js, TypeScript, APIs and DevOps capabilities.",
      activeTags: ["fullstack", "frontend", "backend", "devops"],
      activeLanguage: "en",
      activeLayout: "modern",
      accentColor: "#0284c7",
      metadata: {
        dc_title: "Vivi Veras - Full-Stack Engineer Resume",
        dc_creator: "Vivi Veras",
        cp_keywords: "React, TypeScript, Node.js, Python, Full-Stack, Web Applications, PostgreSQL, AWS",
        cp_description: "Professional Resume for Vivi Veras - Full-Stack Engineer",
        cp_category: "Resume"
      }
    },
    {
      id: "preset-devops",
      name: "DevOps / Infrastructure Engineer",
      description: "Tailored for DevOps, CI/CD, Cloud Infrastructure (AWS/Terraform) & Linux roles.",
      activeTags: ["devops", "backend"],
      activeLanguage: "en",
      activeLayout: "minimal",
      accentColor: "#0d9488",
      metadata: {
        dc_title: "Vivi Veras - DevOps & Infrastructure Specialist",
        dc_creator: "Vivi Veras",
        cp_keywords: "DevOps, Docker, Terraform, AWS, CI/CD, GitHub Actions, Linux, Kubernetes, Automation",
        cp_description: "Tailored DevOps & Cloud Engineering Resume for Vivi Veras",
        cp_category: "Resume"
      }
    },
    {
      id: "preset-czech",
      name: "Czech Role Preset (Česká Verze)",
      description: "Localized Czech resume layout tailored for software engineering positions in Czechia.",
      activeTags: ["fullstack", "backend", "devops"],
      activeLanguage: "cs",
      activeLayout: "classic",
      accentColor: "#2563eb",
      metadata: {
        dc_title: "Vivi Veras - Životopis (Full-Stack & DevOps)",
        dc_creator: "Vivi Veras",
        cp_keywords: "React, TypeScript, Node.js, DevOps, Docker, Python, Životopis, CZ",
        cp_description: "Profesionální životopis - Vivi Veras",
        cp_category: "Životopis"
      }
    }
  ],
  activePresetId: "preset-fullstack",
  experiences: [
    {
      id: "exp-recent-role",
      roleTitle: {
        en: "Senior Software Engineer (Latest Role)",
        cs: "Seniorní Softwarový Inženýr (Nejnovější Pozice)"
      },
      company: "Tech Enterprise / Client",
      location: "Prague / Remote",
      startDate: "Jul 2024",
      endDate: "Present",
      summary: {
        en: "Leading key development initiatives, microservice architecture, and automated cloud infrastructure deployments.",
        cs: "Vedení klíčových vývojových iniciativ, mikroservisní architektury a automatizovaných nasazení v cloudu."
      },
      tags: ["fullstack", "backend", "devops", "management"],
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
            en: "Mentored junior engineers and conducted strict code reviews to ensure compliance with security and clean code practices.",
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
            en: "Developed and maintained scalable web applications using React, I18N, TypeScript, TailwindCSS, and Testing Library.",
            cs: "Vyvíjel a udržoval škálovatelné webové aplikace s využitím React, I18N, TypeScript, TailwindCSS a Testing Library."
          },
          tags: ["frontend", "fullstack"],
          enabled: true
        },
        {
          id: "b-gx4-2",
          text: {
            en: "Built RESTful APIs with ExpressJS and Spring Boot, integrating PostgreSQL and MongoDB for reliable data storage.",
            cs: "Vytvořil RESTful API s ExpressJS a Spring Boot, včetně integrace PostgreSQL a MongoDB pro spolehlivé ukládání dat."
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
        },
        {
          id: "b-gx4-4",
          text: {
            en: "Collaborated with cross-functional teams to deliver new features under agile methodologies, ensuring code quality through unit and integration testing.",
            cs: "Spolupracoval s mezioborovými týmy na dodávání nových funkcí v agilním prostředí, zajišťoval kvalitu kódu pomocí testů."
          },
          tags: ["fullstack"],
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
      location: "Brazil / Remote",
      startDate: "Aug 2023",
      endDate: "Jul 2024",
      summary: {
        en: "Non-profit association protecting animals through rescue, medical treatment, and placement in responsible homes.",
        cs: "Nezisková organizace na ochranu zvířat zajišťující záchranu, léčbu a adopční péči."
      },
      tags: ["management", "fullstack", "devops", "backend"],
      enabled: true,
      bullets: [
        {
          id: "b-apam-1",
          text: {
            en: "Led a volunteer team of 5 developers to deliver a full-stack application using React, Python, and MySQL.",
            cs: "Vedl dobrovolnický tým 5 vývojářů při vývoji full-stack aplikace v Reactu, Pythonu a MySQL."
          },
          tags: ["management", "fullstack"],
          enabled: true
        },
        {
          id: "b-apam-2",
          text: {
            en: "Architected the platform's backend and infrastructure, implementing CI/CD with GitHub Actions, reducing release cycle time by 40%.",
            cs: "Navrhl backend a infrastrukturu platformy s využitím CI/CD v GitHub Actions, čímž zkrátil dobu vydání o 40 %."
          },
          tags: ["devops", "backend"],
          enabled: true
        },
        {
          id: "b-apam-3",
          text: {
            en: "Used GitHub Projects and JIRA to manage agile workflows and ensure team alignment.",
            cs: "Využíval GitHub Projects a JIRA pro řízení agilního vývoje a koordinaci týmu."
          },
          tags: ["management"],
          enabled: true
        },
        {
          id: "b-apam-4",
          text: {
            en: "Facilitated code reviews and mentoring sessions to ensure knowledge sharing and maintain code quality, reducing bug rate in production by 30%.",
            cs: "Organizoval revize kódu a mentoring pro sdílení znalostí a udržení kvality kódu, což snížilo chybovost o 30 %."
          },
          tags: ["management"],
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
        en: "Laboratory of Experimentation and Simulation in Heat at State University of Maranhão (UEMA).",
        cs: "Laboratoř experimentů a simulací tepla na Státní univerzitě v Maranhão (UEMA)."
      },
      tags: ["frontend", "backend"],
      enabled: true,
      bullets: [
        {
          id: "b-lesc-1",
          text: {
            en: "Designed and implemented responsive UI components using JavaScript and Figma for academic research tools.",
            cs: "Navrhl a implementoval responzivní UI komponenty v JavaScriptu a Figmě pro akademické nástroje."
          },
          tags: ["frontend"],
          enabled: true
        },
        {
          id: "b-lesc-2",
          text: {
            en: "Automated research workflows with Python, including web scraping and report generation, saving over 6 hours weekly.",
            cs: "Automatizoval výzkumné postupy v Pythonu včetně web scrapingu a generování zpráv, což ušetřilo 6+ hodin týdně."
          },
          tags: ["backend"],
          enabled: true
        },
        {
          id: "b-lesc-3",
          text: {
            en: "Developed machine learning models with scikit-learn and Keras, contributing to two peer-reviewed publications.",
            cs: "Vyvinul modely strojového učení pomocí scikit-learn a Keras a přispěl ke dvěma odborným publikacím."
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
        en: "Frontend Frameworks & Tools",
        cs: "Frontend Rámce a Nástroje"
      },
      skills: [
        { id: "sk-react", name: "React / Vite", tags: ["frontend", "fullstack"], enabled: true },
        { id: "sk-tailwind", name: "TailwindCSS", tags: ["frontend"], enabled: true },
        { id: "sk-next", name: "Next.js", tags: ["frontend", "fullstack"], enabled: true },
        { id: "sk-angular", name: "Angular", tags: ["frontend"], enabled: true },
        { id: "sk-i18n", name: "I18N / Localization", tags: ["frontend"], enabled: true },
        { id: "sk-figma", name: "Figma UI/UX", tags: ["frontend"], enabled: true },
        { id: "sk-jest", name: "Jest / Testing Library", tags: ["frontend"], enabled: true }
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
        { id: "sk-redis", name: "Redis", tags: ["backend"], enabled: true },
        { id: "sk-jwt", name: "JWT / Auth", tags: ["backend"], enabled: true }
      ]
    },
    {
      id: "cat-devops",
      categoryName: {
        en: "DevOps & Cloud Infrastructure",
        cs: "DevOps a Cloud Infrastruktura"
      },
      skills: [
        { id: "sk-docker", name: "Docker & Compose", tags: ["devops"], enabled: true },
        { id: "sk-aws", name: "AWS (EC2, ECR, S3)", tags: ["devops"], enabled: true },
        { id: "sk-terraform", name: "Terraform (IaC)", tags: ["devops"], enabled: true },
        { id: "sk-actions", name: "GitHub Actions CI/CD", tags: ["devops"], enabled: true },
        { id: "sk-k8s", name: "Kubernetes", tags: ["devops"], enabled: true },
        { id: "sk-qa", name: "QA Automation & Testing", tags: ["frontend", "backend"], enabled: true },
        { id: "sk-linux", name: "Linux Administration", tags: ["devops"], enabled: true }
      ]
    }
  ],
  projects: [
    {
      id: "proj-devops",
      title: "Automated AWS & Nginx DevOps Infrastructure",
      description: {
        en: "Production-ready DevOps deployment pipeline automating Nginx service delivery on AWS EC2 using Terraform, Docker, and GitHub Actions.",
        cs: "Produkční DevOps pipeline automatizující nasazení Nginx v AWS EC2 pomocí Terraformu, Dockeru a GitHub Actions."
      },
      url: "https://github.com/Veras-D/advanced-devops-project",
      techStack: ["Docker", "Terraform", "AWS ECR/EC2", "GitHub Actions", "Nginx"],
      tags: ["devops", "backend"],
      enabled: true
    },
    {
      id: "proj-auth",
      title: "Auth Lab Microservice",
      description: {
        en: "Robust TypeScript authentication API supporting JWT rotation, password hashing, unit testing, and isolated Docker container environment.",
        cs: "Bezpečnostní autentizační API v TypeScriptu s podporou JWT, šifrování hesel, testování a izolací v Dockeru."
      },
      url: "https://github.com/Veras-D/auth-lab",
      techStack: ["TypeScript", "Node.js", "Express", "JWT", "Docker", "Jest"],
      tags: ["backend", "fullstack", "devops"],
      enabled: true
    },
    {
      id: "proj-tarot",
      title: "AI Tarot Chat Web Application",
      description: {
        en: "Modern interactive web app built with Next.js and TypeScript, integrating OpenAI/LLM endpoints for intuitive personalized interpretations.",
        cs: "Moderní interaktivní webová aplikace v Next.js a TypeScriptu využívající LLM pro personalizovaný výklad."
      },
      url: "https://github.com/Veras-D/AI_TarotChat",
      techStack: ["Next.js", "React", "TypeScript", "TailwindCSS", "REST API"],
      tags: ["frontend", "fullstack"],
      enabled: true
    },
    {
      id: "proj-web",
      title: "Personal Portfolio & App Platform",
      description: {
        en: "Clean responsive portfolio platform showcasing interactive web applications, skills matrix, and contact routing.",
        cs: "Portfoliová platforma prezentující interaktivní aplikace, dovednosti a kontakty."
      },
      url: "https://veras-app.netlify.app/",
      techStack: ["HTML5", "CSS3", "JavaScript", "Netlify", "Figma"],
      tags: ["frontend"],
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
      technologies: ["React", "Node.js", "TypeScript", "Java", "Spring Boot", "MySQL", "MongoDB", "Docker"],
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
      technologies: ["Python", "Machine Learning", "Pandas", "Scikit-Learn", "Linux", "Bash"],
      enabled: true
    }
  ],
  languages: [
    {
      id: "lang-pt",
      language: {
        en: "Portuguese",
        cs: "Portugalština"
      },
      proficiency: {
        en: "Native Speaker",
        cs: "Rodilý Mluvčí"
      },
      enabled: true
    },
    {
      id: "lang-en",
      language: {
        en: "English",
        cs: "Angličtina"
      },
      proficiency: {
        en: "Full Professional / Advanced (B2-C1)",
        cs: "Pokročilá Profesionální (B2-C1)"
      },
      enabled: true
    },
    {
      id: "lang-cs",
      language: {
        en: "Czech",
        cs: "Čeština"
      },
      proficiency: {
        en: "Elementary (Learning)",
        cs: "Základní (Student)"
      },
      enabled: true
    }
  ],
  coverLetters: [
    {
      id: "cl-1",
      jobTitle: "Senior DevOps Engineer",
      companyName: "Avast / Gen Digital",
      date: "2026-08-17",
      recipientName: "Hiring Manager",
      language: "en",
      content: {
        en: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior DevOps Engineer position at Avast / Gen Digital. With over 3 years of hands-on experience building scalable applications, architecting CI/CD pipelines with Docker and GitHub Actions, and automating cloud infrastructure using Terraform and AWS, I am excited about the opportunity to contribute to your engineering team.

In my recent positions, I have successfully reduced release cycle times by 40% and cut deployment errors by 30% through automated Infrastructure as Code (IaC) and containerization. My background spans both full-stack software development (TypeScript, Node.js, React) and deep DevOps practices, enabling me to bridge the gap between application engineering and system reliability.

I look forward to discussing how my technical skills and enthusiasm for robust infrastructure align with your team's goals.

Sincerely,
Vivi Veras`,
        cs: `Vážený pane / Vážená paní,

píši Vám ohledně svého zájmu o pozici Senior DevOps Engineer ve společnosti Avast / Gen Digital. S více než 3 lety praktických zkušeností s vývojem škálovatelných aplikací, tvorbou CI/CD pipelines (Docker, GitHub Actions) a automatizací cloudové infrastruktury (Terraform, AWS) bych rád přispěl k úspěchu Vašeho týmu.

V předchozích rolích se mi podařilo zkrátit dobu vydání o 40 % a snížit chybovost nasazení o 30 % díky automatizaci infrastruktury a kontejnerizaci.

Těším se na možnost osobního setkání a diskuse o mé kvalifikaci.

S pozdravem,
Vivi Veras`
      }
    }
  ],
  kanbanRoles: [
    {
      id: "kanban-1",
      roleTitle: "Senior DevOps & Cloud Engineer",
      company: "Avast / Gen Digital",
      location: "Prague, CZ (Hybrid)",
      salary: "120,000 - 150,000 CZK / mo",
      status: "interview",
      dateApplied: "2026-08-10",
      roleUrl: "https://www.linkedin.com/jobs/view/123456789",
      presetId: "preset-devops",
      coverLetterId: "cl-1",
      notes: "First technical screening completed. Next round is system architecture interview.",
      updatedAt: "2026-08-15T10:00:00.000Z"
    },
    {
      id: "kanban-2",
      roleTitle: "Full-Stack TypeScript Developer",
      company: "Mews",
      location: "Prague / Remote",
      salary: "110,000 - 140,000 CZK / mo",
      status: "applied",
      dateApplied: "2026-08-14",
      roleUrl: "https://mews.careers/jobs/fullstack-ts",
      presetId: "preset-fullstack",
      notes: "Submitted tailored Full-Stack preset CV with emphasis on React and Node microservices.",
      updatedAt: "2026-08-14T14:30:00.000Z"
    }
  ]
};
