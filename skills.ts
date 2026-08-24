export interface SkillEntry {
  canonical: string;
  aliases: string[];
}

export const SKILL_DICTIONARY: SkillEntry[] = [
  { canonical: 'JavaScript', aliases: ['javascript', 'js', 'ecmascript'] },
  { canonical: 'TypeScript', aliases: ['typescript', 'ts'] },
  { canonical: 'React', aliases: ['react', 'reactjs', 'react.js'] },
  { canonical: 'Next.js', aliases: ['next.js', 'nextjs', 'next js'] },
  { canonical: 'Vue', aliases: ['vue', 'vuejs', 'vue.js'] },
  { canonical: 'Angular', aliases: ['angular', 'angularjs'] },
  { canonical: 'Node.js', aliases: ['node.js', 'nodejs', 'node js'] },
  { canonical: 'Express', aliases: ['express', 'express.js', 'expressjs'] },
  { canonical: 'NestJS', aliases: ['nestjs', 'nest.js'] },
  { canonical: 'Python', aliases: ['python'] },
  { canonical: 'Django', aliases: ['django'] },
  { canonical: 'Flask', aliases: ['flask'] },
  { canonical: 'FastAPI', aliases: ['fastapi', 'fast api'] },
  { canonical: 'Java', aliases: ['java'] },
  { canonical: 'Spring', aliases: ['spring', 'spring boot', 'springboot'] },
  { canonical: 'Kotlin', aliases: ['kotlin'] },
  { canonical: 'C++', aliases: ['c++', 'cpp', 'c plus plus'] },
  { canonical: 'C', aliases: ['c language', 'c programming'] },
  { canonical: 'C#', aliases: ['c#', 'csharp', 'c sharp'] },
  { canonical: '.NET', aliases: ['.net', 'dotnet'] },
  { canonical: 'Go', aliases: ['golang', 'go lang'] },
  { canonical: 'Rust', aliases: ['rust'] },
  { canonical: 'Ruby', aliases: ['ruby'] },
  { canonical: 'Rails', aliases: ['rails', 'ruby on rails'] },
  { canonical: 'PHP', aliases: ['php'] },
  { canonical: 'Laravel', aliases: ['laravel'] },
  { canonical: 'Swift', aliases: ['swift'] },
  { canonical: 'Objective-C', aliases: ['objective-c', 'objective c'] },
  { canonical: 'SQL', aliases: ['sql'] },
  { canonical: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'psql'] },
  { canonical: 'MySQL', aliases: ['mysql'] },
  { canonical: 'MongoDB', aliases: ['mongodb', 'mongo'] },
  { canonical: 'Redis', aliases: ['redis'] },
  { canonical: 'GraphQL', aliases: ['graphql'] },
  { canonical: 'REST API', aliases: ['rest', 'rest api', 'restful'] },
  { canonical: 'gRPC', aliases: ['grpc'] },
  { canonical: 'Docker', aliases: ['docker'] },
  { canonical: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { canonical: 'AWS', aliases: ['aws', 'amazon web services'] },
  { canonical: 'Azure', aliases: ['azure'] },
  { canonical: 'GCP', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { canonical: 'Terraform', aliases: ['terraform'] },
  { canonical: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'continuous integration', 'continuous deployment'] },
  { canonical: 'Jenkins', aliases: ['jenkins'] },
  { canonical: 'Git', aliases: ['git', 'github'] },
  { canonical: 'HTML', aliases: ['html', 'html5'] },
  { canonical: 'CSS', aliases: ['css', 'css3'] },
  { canonical: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
  { canonical: 'Sass', aliases: ['sass', 'scss'] },
  { canonical: 'Redux', aliases: ['redux'] },
  { canonical: 'Webpack', aliases: ['webpack'] },
  { canonical: 'Vite', aliases: ['vite'] },
  { canonical: 'Jest', aliases: ['jest'] },
  { canonical: 'Cypress', aliases: ['cypress'] },
  { canonical: 'Playwright', aliases: ['playwright'] },
  { canonical: 'PyTorch', aliases: ['pytorch'] },
  { canonical: 'TensorFlow', aliases: ['tensorflow'] },
  { canonical: 'Keras', aliases: ['keras'] },
  { canonical: 'scikit-learn', aliases: ['scikit-learn', 'sklearn', 'scikit learn'] },
  { canonical: 'Pandas', aliases: ['pandas'] },
  { canonical: 'NumPy', aliases: ['numpy'] },
  { canonical: 'Machine Learning', aliases: ['machine learning', 'ml'] },
  { canonical: 'Deep Learning', aliases: ['deep learning'] },
  { canonical: 'NLP', aliases: ['nlp', 'natural language processing'] },
  { canonical: 'Computer Vision', aliases: ['computer vision', 'cv'] },
  { canonical: 'Data Analysis', aliases: ['data analysis', 'data analytics'] },
  { canonical: 'Data Visualization', aliases: ['data visualization'] },
  { canonical: 'Tableau', aliases: ['tableau'] },
  { canonical: 'Power BI', aliases: ['power bi', 'powerbi'] },
  { canonical: 'Excel', aliases: ['excel', 'microsoft excel'] },
  { canonical: 'Elasticsearch', aliases: ['elasticsearch', 'elastic search'] },
  { canonical: 'Kafka', aliases: ['kafka', 'apache kafka'] },
  { canonical: 'RabbitMQ', aliases: ['rabbitmq', 'rabbit mq'] },
  { canonical: 'Microservices', aliases: ['microservices', 'micro services'] },
  { canonical: 'System Design', aliases: ['system design', 'systems design'] },
  { canonical: 'Agile', aliases: ['agile', 'scrum'] },
  { canonical: 'Linux', aliases: ['linux', 'unix'] },
  { canonical: 'Bash', aliases: ['bash', 'shell scripting', 'shell'] },
  { canonical: 'Figma', aliases: ['figma'] },
  { canonical: 'UI/UX', aliases: ['ui/ux', 'ux', 'user experience', 'user interface design'] },
  { canonical: 'Communication', aliases: ['communication', 'communication skills'] },
  { canonical: 'Leadership', aliases: ['leadership', 'team leadership'] },
  { canonical: 'Project Management', aliases: ['project management', 'pmp'] },
  { canonical: 'SEO', aliases: ['seo', 'search engine optimization'] },
  { canonical: 'Marketing', aliases: ['marketing', 'digital marketing'] },
  { canonical: 'Salesforce', aliases: ['salesforce'] },
  { canonical: 'Supabase', aliases: ['supabase'] },
  { canonical: 'Firebase', aliases: ['firebase'] },
  { canonical: 'Prisma', aliases: ['prisma'] },
  { canonical: 'Stripe', aliases: ['stripe', 'stripe api'] },
  { canonical: 'TensorFlow.js', aliases: ['tensorflow.js', 'tfjs'] },
  { canonical: 'Hugging Face', aliases: ['hugging face', 'huggingface'] },
  { canonical: 'LangChain', aliases: ['langchain'] },
  { canonical: 'OpenAI', aliases: ['openai', 'gpt', 'chatgpt'] },
  { canonical: 'LLM', aliases: ['llm', 'large language models'] },
  { canonical: 'RAG', aliases: ['rag', 'retrieval augmented generation'] },
];

const aliasIndex = new Map<string, string>();
for (const entry of SKILL_DICTIONARY) {
  aliasIndex.set(entry.canonical.toLowerCase(), entry.canonical);
  for (const alias of entry.aliases) {
    aliasIndex.set(alias.toLowerCase(), entry.canonical);
  }
}

export function normalizeSkill(raw: string): string | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  return aliasIndex.get(key) ?? null;
}

export function extractSkillsFromText(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `;
  const found = new Set<string>();
  for (const entry of SKILL_DICTIONARY) {
    if (lower.includes(` ${entry.canonical.toLowerCase()} `)) {
      found.add(entry.canonical);
      continue;
    }
    for (const alias of entry.aliases) {
      const token = alias.toLowerCase();
      if (token.includes('.') || token.includes('/') || token.includes('#') || token.includes('+')) {
        if (lower.includes(token)) {
          found.add(entry.canonical);
          break;
        }
      } else if (new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)) {
        found.add(entry.canonical);
        break;
      }
    }
  }
  return Array.from(found);
}

export function canonicalizeSkillList(skills: string[]): string[] {
  const result = new Set<string>();
  for (const s of skills) {
    const norm = normalizeSkill(s);
    if (norm) result.add(norm);
    else if (s.trim()) result.add(s.trim());
  }
  return Array.from(result);
}
