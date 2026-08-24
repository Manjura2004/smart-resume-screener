import type { Job, MatchResult, Recommendation, StructuredResume } from './types';
import { canonicalizeSkillList, normalizeSkill } from './skills';

const WEIGHTS = {
  skills: 0.4,
  experience: 0.25,
  education: 0.15,
  projects: 0.1,
  semantic: 0.1,
};

function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function estimateYears(experience: StructuredResume['experience']): number {
  let total = 0;
  for (const item of experience) {
    const yearMatch = item.duration.match(/(\d+)\+?\s*(years|yrs)/i);
    if (yearMatch) {
      total += parseInt(yearMatch[1], 10);
      continue;
    }
    const rangeMatch = item.duration.match(/(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}|present|current/i);
    if (rangeMatch) {
      const years = item.duration.match(/(19|20)\d{2}/g);
      if (years && years.length >= 2) {
        const start = parseInt(years[0], 10);
        const end = /present|current/i.test(item.duration) ? new Date().getFullYear() : parseInt(years[1], 10);
        total += Math.max(0, end - start);
      }
    }
  }
  return total;
}

function skillsMatchPct(resumeSkills: string[], requiredSkills: string[]): { pct: number; matching: string[]; missing: string[] } {
  const normalizedResume = new Set(canonicalizeSkillList(resumeSkills).map((s) => s.toLowerCase()));
  const matching: string[] = [];
  const missing: string[] = [];
  for (const req of requiredSkills) {
    const norm = normalizeSkill(req);
    const key = (norm ?? req).toLowerCase();
    if (normalizedResume.has(key)) matching.push(norm ?? req);
    else missing.push(norm ?? req);
  }
  if (requiredSkills.length === 0) return { pct: 100, matching, missing };
  const pct = Math.round((matching.length / requiredSkills.length) * 100);
  return { pct, matching, missing };
}

function experienceMatchPct(resume: StructuredResume, job: Job): { pct: number; text: string } {
  const years = estimateYears(resume.experience);
  const min = job.min_experience_years || 0;
  if (min === 0) {
    const pct = Math.min(100, 50 + years * 10);
    return { pct, text: `${years} years of relevant experience.` };
  }
  const ratio = Math.min(1, years / min);
  const pct = Math.round(ratio * 100);
  const text = years >= min
    ? `${years} years experience exceeds the ${min} year minimum.`
    : `${years} years experience is below the ${min} year minimum.`;
  return { pct, text };
}

function educationMatchPct(resume: StructuredResume, job: Job): { pct: number; text: string } {
  if (resume.education.length === 0) return { pct: 30, text: 'No formal education entries detected.' };
  const hasDegree = resume.education.some((e) => /bachelor|master|phd|b\.?tech|m\.?tech|mba|b\.?sc|m\.?sc/i.test(e.degree));
  const hasAdvanced = resume.education.some((e) => /master|phd|m\.?tech|mba|m\.?sc/i.test(e.degree));
  let pct = 60;
  if (hasAdvanced) pct = 100;
  else if (hasDegree) pct = 85;
  const topEdu = resume.education[0];
  const text = hasAdvanced
    ? `Advanced degree in ${topEdu.degree || 'related field'} from ${topEdu.institution || 'a recognized institution'}.`
    : hasDegree
      ? `Bachelor's degree in ${topEdu.degree || 'related field'} from ${topEdu.institution || 'a recognized institution'}.`
      : 'Education history present but degree level unclear.';
  return { pct, text };
}

function projectMatchPct(resume: StructuredResume, requiredSkills: string[]): { pct: number } {
  if (resume.projects.length === 0) return { pct: 40 };
  if (requiredSkills.length === 0) return { pct: Math.min(100, 60 + resume.projects.length * 8) };
  const projectTech = resume.projects.flatMap((p) => p.technologies);
  const normalizedProject = canonicalizeSkillList(projectTech);
  const normalizedRequired = canonicalizeSkillList(requiredSkills);
  const sim = jaccardSimilarity(normalizedProject, normalizedRequired);
  return { pct: Math.round(sim * 100) };
}

function semanticMatchPct(resume: StructuredResume, job: Job): number {
  const resumeText = [
    resume.skills.join(' '),
    resume.experience.map((e) => e.summary).join(' '),
    resume.projects.map((p) => p.description).join(' '),
  resume.certifications.join(' '),
  job.description,
  job.required_skills.join(' '),
  job.title,
  job.description,
  job.description,
  job.description,
  job.description,
  job.description,
    job.description,
    job.description,
    job.description,
    job.description,
  ].join(' ').toLowerCase();

  const tokens = resumeText.split(/\s+/).filter((t) => t.length > 3);
  const tokenFreq = new Map<string, number>();
  for (const t of tokens) tokenFreq.set(t, (tokenFreq.get(t) ?? 0) + 1);
  const sorted = Array.from(tokenFreq.entries()).sort((a, b) => b[1] - a[1]);
  const topTokens = sorted.slice(0, 40).map((e) => e[0]);
  const jobTokens = new Set(job.description.toLowerCase().split(/\s+/).filter((t) => t.length > 3));
  let overlap = 0;
  for (const t of topTokens) if (jobTokens.has(t)) overlap += 1;
  return Math.min(100, Math.round((overlap / 40) * 200));
}

function buildStrengths(resume: StructuredResume, matching: string[], expYears: number, eduPct: number): string[] {
  const strengths: string[] = [];
  if (matching.length >= 5) strengths.push(`Strong technical fit with ${matching.length} of the required skills present.`);
  else if (matching.length >= 3) strengths.push(`Solid skill coverage with ${matching.length} required skills matched.`);
  if (expYears >= 5) strengths.push(`${expYears} years of hands-on professional experience.`);
  else if (expYears >= 2) strengths.push(`${expYears} years of relevant work experience.`);
  if (eduPct >= 85) strengths.push('Strong academic background relevant to the role.');
  if (resume.projects.length >= 3) strengths.push(`${resume.projects.length} documented projects demonstrating applied skills.`);
  if (resume.certifications.length >= 2) strengths.push(`${resume.certifications.length} professional certifications.`);
  if (strengths.length === 0) strengths.push('Profile shows potential for growth in the role.');
  return strengths.slice(0, 5);
}

function buildJustification(
  resume: StructuredResume,
  job: Job,
  scores: { skills: number; exp: number; edu: number; proj: number; sem: number },
  matching: string[],
  missing: string[],
  recommendation: Recommendation,
): string {
  const parts: string[] = [];
  parts.push(`${resume.name} is being evaluated for the ${job.title} role.`);
  if (scores.skills >= 80) parts.push(`Excellent technical alignment — ${matching.length} of ${job.required_skills.length} required skills are present.`);
  else if (scores.skills >= 50) parts.push(`Moderate technical alignment — ${matching.length} of ${job.required_skills.length} required skills matched.`);
  else parts.push(`Limited technical alignment — only ${matching.length} of ${job.required_skills.length} required skills found.`);
  if (missing.length > 0) parts.push(`Missing skills include ${missing.slice(0, 4).join(', ')}.`);
  if (scores.exp >= 80) parts.push('Experience requirements are comfortably met.');
  else if (scores.exp >= 50) parts.push('Experience is partially aligned with the role requirements.');
  else parts.push('Experience falls short of the role expectations.');
  if (scores.edu >= 85) parts.push('Educational background is a strong match.');
  if (recommendation === 'SHORTLIST') parts.push('Overall, this candidate is recommended for shortlisting based on a strong hybrid match.');
  else if (recommendation === 'REVIEW') parts.push('This candidate warrants a manual review before proceeding.');
  else parts.push('This candidate does not meet the threshold for this role.');
  return parts.join(' ');
}

function recommend(finalPct: number): Recommendation {
  if (finalPct >= 75) return 'SHORTLIST';
  if (finalPct >= 50) return 'REVIEW';
  return 'REJECT';
}

export interface LlmOverride {
  semanticScore: number;
  matchingSkills?: string[];
  missingSkills?: string[];
  strengths?: string[];
  experienceMatch?: string;
  educationMatch?: string;
  recommendation?: Recommendation;
  justification?: string;
}

export function scoreCandidate(resume: StructuredResume, job: Job, llm?: LlmOverride): MatchResult {
  const skills = skillsMatchPct(resume.skills, job.required_skills);
  const exp = experienceMatchPct(resume, job);
  const edu = educationMatchPct(resume, job);
  const proj = projectMatchPct(resume, job.required_skills);
  const deterministicSem = semanticMatchPct(resume, job);
  const sem = llm ? llm.semanticScore : deterministicSem;

  const finalPct =
    skills.pct * WEIGHTS.skills +
    exp.pct * WEIGHTS.experience +
    edu.pct * WEIGHTS.education +
    proj.pct * WEIGHTS.projects +
    sem * WEIGHTS.semantic;

  const score = Math.max(1, Math.min(10, parseFloat((finalPct / 10).toFixed(2))));
  const deterministicRec = recommend(finalPct);
  const recommendation = llm?.recommendation ?? deterministicRec;
  const expYears = estimateYears(resume.experience);
  const deterministicStrengths = buildStrengths(resume, skills.matching, expYears, edu.pct);
  const strengths = llm?.strengths?.length ? llm.strengths : deterministicStrengths;
  const matchingSkills = llm?.matchingSkills?.length ? llm.matchingSkills : skills.matching;
  const missingSkills = llm?.missingSkills?.length ? llm.missingSkills : skills.missing;
  const deterministicJust = buildJustification(resume, job, { skills: skills.pct, exp: exp.pct, edu: edu.pct, proj: proj.pct, sem }, matchingSkills, missingSkills, recommendation);
  const justification = llm?.justification ?? deterministicJust;
  const experienceMatch = llm?.experienceMatch ?? exp.text;
  const educationMatch = llm?.educationMatch ?? edu.text;

  return {
    score,
    skillsMatchPct: skills.pct,
    experienceMatchPct: exp.pct,
    educationMatchPct: edu.pct,
    projectMatchPct: proj.pct,
    semanticMatchPct: sem,
    matchingSkills,
    missingSkills,
    strengths,
    experienceMatch,
    educationMatch,
    recommendation,
    justification,
  };
}
