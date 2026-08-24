import type { StructuredResume } from './types';
import { extractSkillsFromText } from './skills';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{8,}\d)/;

const SECTION_PATTERNS: { key: keyof StructuredResume; pattern: RegExp }[] = [
  { key: 'experience', pattern: /\b(experience|work history|employment|professional experience|work experience)\b/i },
  { key: 'education', pattern: /\b(education|academic)\b/i },
  { key: 'projects', pattern: /\b(projects|personal projects|academic projects)\b/i },
  { key: 'certifications', pattern: /\b(certifications|certificates|licenses)\b/i },
  { key: 'skills', pattern: /\b(skills|technical skills|core competencies|technologies)\b/i },
];

function splitIntoSections(text: string): Map<string, string> {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const sections = new Map<string, string>();
  let currentKey = '_header';
  const buckets: Record<string, string[]> = { _header: [] };

  for (const line of lines) {
    const matched = SECTION_PATTERNS.find((s) => s.pattern.test(line));
    if (matched && line.length < 60) {
      currentKey = matched.key;
      if (!buckets[currentKey]) buckets[currentKey] = [];
      buckets[currentKey].push(line);
    } else {
      if (!buckets[currentKey]) buckets[currentKey] = [];
      buckets[currentKey].push(line);
    }
  }

  for (const [key, arr] of Object.entries(buckets)) {
    sections.set(key, arr.join('\n'));
  }
  return sections;
}

function extractName(headerText: string): string {
  const lines = headerText.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[A-Za-z][A-Za-z\s.'-]+$/.test(line)) {
      return line.replace(/\s+/g, ' ').trim();
    }
  }
  const firstLine = lines[0];
  if (firstLine) return firstLine.replace(/\s+/g, ' ').trim();
  return 'Unknown Candidate';
}

function extractEmail(text: string): string | undefined {
  const m = text.match(EMAIL_RE);
  return m ? m[0] : undefined;
}

function extractPhone(text: string): string | undefined {
  const m = text.match(PHONE_RE);
  return m ? m[0].trim() : undefined;
}

function extractEducation(educationText: string): StructuredResume['education'] {
  if (!educationText) return [];
  const lines = educationText.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: StructuredResume['education'] = [];
  for (const line of lines) {
    if (/\b(education|academic)\b/i.test(line) && line.length < 40) continue;
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const degreeMatch = line.match(/\b(b\.?tech|b\.?e|m\.?tech|m\.?e|bachelor|master|phd|b\.?sc|m\.?sc|diploma|associate|mba)\b/i);
    if (degreeMatch || yearMatch || line.length > 10) {
      items.push({
        degree: degreeMatch ? degreeMatch[0] : line.split(/[,|–|-]/)[0].trim(),
        institution: line.replace(yearMatch?.[0] ?? '', '').replace(degreeMatch?.[0] ?? '', '').replace(/[,\s|–-]+$/, '').trim() || line,
        year: yearMatch ? yearMatch[0] : '',
      });
    }
  }
  return items.slice(0, 6);
}

function extractExperience(experienceText: string): StructuredResume['experience'] {
  if (!experienceText) return [];
  const lines = experienceText.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: StructuredResume['experience'] = [];
  for (const line of lines) {
    if (/\b(experience|work history|employment|professional experience)\b/i.test(line) && line.length < 50) continue;
    const durationMatch = line.match(/((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+19\d{2})\s*[-–to]+\s*((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+20\d{2}|present|current)/i)
      || line.match(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}|present|current\b/i)
      || line.match(/\b(\d+)\+?\s*(years|yrs)\b/i);
    const roleMatch = line.match(/^([A-Z][A-Za-z\s/]+?)(?:\s+at\s+|\s+[-–|]\s+)([A-Z][A-Za-z\s&.,]+)/);
    if (roleMatch) {
      items.push({
        role: roleMatch[1].trim(),
        company: roleMatch[2].trim(),
        duration: durationMatch ? durationMatch[0] : '',
        summary: line,
      });
    } else if (durationMatch) {
      items.push({
        role: line.split(/[-–|]/)[0].trim() || 'Role',
        company: '',
        duration: durationMatch[0],
        summary: line,
      });
    } else if (line.length > 15) {
      items.push({
        role: line.split(/[-–|]/)[0].trim() || 'Role',
        company: '',
        duration: '',
        summary: line,
      });
    }
  }
  return items.slice(0, 8);
}

function extractProjects(projectsText: string): StructuredResume['projects'] {
  if (!projectsText) return [];
  const lines = projectsText.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: StructuredResume['projects'] = [];
  for (const line of lines) {
    if (/\b(projects|personal projects|academic projects)\b/i.test(line) && line.length < 50) continue;
    if (line.length > 10) {
      items.push({
        name: line.split(/[-–|:]/)[0].trim() || 'Project',
        description: line,
        technologies: extractSkillsFromText(line),
      });
    }
  }
  return items.slice(0, 8);
}

function extractCertifications(certText: string): string[] {
  if (!certText) return [];
  const lines = certText.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines
    .filter((l) => !/^(certifications|certificates|licenses)$/i.test(l))
    .filter((l) => l.length > 5)
    .slice(0, 10);
}

export function extractStructuredResume(text: string, fileName: string): StructuredResume {
  const sections = splitIntoSections(text);
  const headerText = sections.get('_header') ?? '';
  const skillsText = sections.get('skills') ?? '';
  const educationText = sections.get('education') ?? '';
  const experienceText = sections.get('experience') ?? '';
  const projectsText = sections.get('projects') ?? '';
  const certText = sections.get('certifications') ?? '';

  const dictionarySkills = extractSkillsFromText(text);
  const listedSkills = skillsText
    .split(/[,•|\n·;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40 && !/^(skills|technical skills)$/i.test(s));

  const allSkills = Array.from(new Set([...dictionarySkills, ...listedSkills]));

  return {
    name: extractName(headerText) || fileName.replace(/\.pdf$/i, ''),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: allSkills,
    education: extractEducation(educationText),
    experience: extractExperience(experienceText),
    projects: extractProjects(projectsText),
    certifications: extractCertifications(certText),
  };
}
