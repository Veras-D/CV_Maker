export interface SeedDomain {
  id: string;
  label: string;
  keywords: Record<string, number>;
}

export const COMPREHENSIVE_BASE_SEEDS: Record<string, SeedDomain> = {
  testing: {
    id: 'testing',
    label: 'Testing & QA Automation',
    keywords: {
      cypress: 10, playwright: 10, selenium: 10, jest: 10, vitest: 10,
      junit: 10, pytest: 10, testrail: 10, postman: 10, jmeter: 10,
      k6: 10, appium: 10, cucumber: 10, bdd: 10, tdd: 10,
      qa: 10, tester: 10, test: 10, 'quality assurance': 10,
      'test automation': 10, 'e2e': 10, 'end-to-end': 10, 'unit test': 10,
      'integration test': 10, 'regression testing': 10, 'smoke testing': 10,
      'exploratory testing': 10, 'api testing': 10, 'performance testing': 10,
      'load testing': 10, 'security testing': 10, 'test cases': 10,
      'bug tracking': 10, 'defect life cycle': 10, istqb: 10
    }
  },
  frontend: {
    id: 'frontend',
    label: 'Frontend Development',
    keywords: {
      react: 10, 'react.js': 10, vue: 10, 'vue.js': 10, angular: 10,
      'next.js': 10, svelte: 10, typescript: 10, javascript: 10, html: 10,
      html5: 10, css: 10, css3: 10, tailwind: 10, 'tailwind css': 10,
      bootstrap: 10, redux: 10, zustand: 10, mobx: 10, webpack: 10,
      vite: 10, ui: 10, ux: 10, responsive: 10, frontend: 10,
      'front-end': 10, 'web application': 10, figma: 10, storybook: 10,
      sass: 10, less: 10, spa: 10, ssr: 10, pwa: 10,
      'web vitals': 10, microfrontends: 10
    }
  },
  backend: {
    id: 'backend',
    label: 'Backend Engineering',
    keywords: {
      java: 10, spring: 10, 'spring boot': 10, 'c#': 10, '.net': 10,
      dotnet: 10, python: 10, django: 10, fastapi: 10, flask: 10,
      node: 10, 'node.js': 10, express: 10, nestjs: 10, golang: 10,
      go: 10, rust: 10, php: 10, laravel: 10, ruby: 10,
      rails: 10, sql: 10, postgresql: 10, postgres: 10, mysql: 10,
      sqlite: 10, mongodb: 10, redis: 10, elasticsearch: 10, kafka: 10,
      rabbitmq: 10, microservices: 10, rest: 10, 'rest api': 10,
      graphql: 10, grpc: 10, websockets: 10, backend: 10, 'back-end': 10,
      database: 10, orm: 10, prisma: 10, hibernate: 10
    }
  },
  devops: {
    id: 'devops',
    label: 'DevOps & Cloud Infrastructure',
    keywords: {
      docker: 10, kubernetes: 10, k8s: 10, terraform: 10, ansible: 10,
      helm: 10, aws: 10, 'amazon web services': 10, gcp: 10,
      'google cloud': 10, azure: 10, 'ci/cd': 10, 'github actions': 10,
      'gitlab ci': 10, jenkins: 10, argocd: 10, prometheus: 10,
      grafana: 10, datadog: 10, linux: 10, bash: 10, shell: 10,
      cloud: 10, infrastructure: 10, iac: 10, sre: 10,
      'site reliability': 10, nginx: 10
    }
  },
  ai_data: {
    id: 'ai_data',
    label: 'AI & Data Engineering',
    keywords: {
      ai: 10, 'artificial intelligence': 10, 'machine learning': 10,
      ml: 10, llm: 10, rag: 10, 'vector database': 10, embeddings: 10,
      langchain: 10, llamaindex: 10, pytorch: 10, tensorflow: 10,
      pandas: 10, numpy: 10, 'scikit-learn': 10, openai: 10, nlp: 10,
      'computer vision': 10, 'data science': 10, etl: 10, spark: 10,
      'data engineering': 10, airflow: 10, dbt: 10, snowflake: 10,
      databricks: 10, 'data warehouse': 10
    }
  },
  mobile: {
    id: 'mobile',
    label: 'Mobile Development',
    keywords: {
      'react native': 10, flutter: 10, ios: 10, swift: 10, swiftui: 10,
      android: 10, kotlin: 10, 'jetpack compose': 10, expo: 10,
      xcode: 10, 'android studio': 10, 'cross-platform': 10, mobile: 10
    }
  },
  management: {
    id: 'management',
    label: 'Leadership & Agile Management',
    keywords: {
      'tech lead': 10, 'team lead': 10, 'engineering manager': 10, lead: 10,
      scrum: 10, agile: 10, kanban: 10, sprint: 10, jira: 10,
      confluence: 10, mentoring: 10, mentor: 10, 'code review': 10,
      architecture: 10, stakeholder: 10, okrs: 10, 'sprint planning': 10
    }
  },
  marketing: {
    id: 'marketing',
    label: 'Digital Marketing & Growth',
    keywords: {
      seo: 10, sem: 10, ppc: 10, 'meta ads': 10, 'facebook ads': 10,
      'google ads': 10, 'google analytics': 10, ga4: 10, 'tag manager': 10,
      hubspot: 10, 'content marketing': 10, copywriting: 10, 'email marketing': 10,
      cro: 10, cac: 10, roas: 10, ltv: 10, ctr: 10, cpc: 10,
      'conversion rate': 10, 'social media': 10, klaviyo: 10, mailchimp: 10,
      marketo: 10, 'growth marketing': 10, campaigns: 10, funnel: 10,
      'b2b marketing': 10, 'brand marketing': 10, ahrefs: 10, semrush: 10,
      'lifecycle marketing': 10, 'retention marketing': 10
    }
  },
  design: {
    id: 'design',
    label: 'Product & UI/UX Design',
    keywords: {
      figma: 10, ui: 10, ux: 10, 'user experience': 10, 'user interface': 10,
      wireframing: 10, prototyping: 10, 'design system': 10, 'user research': 10,
      'usability testing': 10, photoshop: 10, illustrator: 10, sketch: 10,
      'adobe xd': 10, typography: 10, 'interaction design': 10,
      'journey mapping': 10, personas: 10, accessibility: 10, wcag: 10
    }
  },
  product: {
    id: 'product',
    label: 'Product Management',
    keywords: {
      'product management': 10, 'product manager': 10, 'product strategy': 10,
      roadmap: 10, prd: 10, 'user stories': 10, 'backlog grooming': 10,
      prioritization: 10, okrs: 10, kpis: 10, 'product discovery': 10,
      'go-to-market': 10, gtm: 10, 'feature roadmap': 10, linear: 10
    }
  },
  sales: {
    id: 'sales',
    label: 'Sales & Business Development',
    keywords: {
      'b2b sales': 10, 'lead generation': 10, outreach: 10, crm: 10,
      salesforce: 10, 'account executive': 10, 'pipeline management': 10,
      prospecting: 10, closing: 10, negotiation: 10, quota: 10,
      sdr: 10, 'cold email': 10, 'cold calling': 10, 'customer success': 10
    }
  },
  data_analytics: {
    id: 'data_analytics',
    label: 'Data & Business Analytics',
    keywords: {
      sql: 10, excel: 10, 'power bi': 10, tableau: 10, looker: 10,
      dashboards: 10, kpi: 10, metrics: 10, analytics: 10, reporting: 10,
      'a/b testing': 10, statistics: 10, 'business intelligence': 10,
      'cohort analysis': 10, 'pivot tables': 10
    }
  },
  finance: {
    id: 'finance',
    label: 'Finance & Accounting',
    keywords: {
      'financial modeling': 10, accounting: 10, 'p&l': 10, budgeting: 10,
      forecasting: 10, reconciliation: 10, gaap: 10, ifrs: 10,
      quickbooks: 10, sap: 10, auditing: 10, 'financial analysis': 10,
      'accounts payable': 10, 'accounts receivable': 10, 'cash flow': 10
    }
  },
  hr_recruiting: {
    id: 'hr_recruiting',
    label: 'Human Resources & Talent Acquisition',
    keywords: {
      recruiting: 10, 'talent acquisition': 10, sourcing: 10, hr: 10,
      'human resources': 10, onboarding: 10, 'employee relations': 10,
      workday: 10, greenhouse: 10, lever: 10, ats: 10,
      'performance management': 10, 'compensation & benefits': 10, hris: 10
    }
  }
};
