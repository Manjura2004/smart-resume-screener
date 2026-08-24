export type Recommendation = 'SHORTLIST' | 'REVIEW' | 'REJECT';
export type CandidateStatus = 'processing' | 'ready' | 'error';

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  summary: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
}

export interface StructuredResume {
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  min_experience_years: number;
  created_at: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  file_name: string;
  raw_text: string | null;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  match_score: number;
  skills_match_pct: number;
  experience_match_pct: number;
  education_match_pct: number;
  project_match_pct: number;
  semantic_match_pct: number;
  matching_skills: string[];
  missing_skills: string[];
  strengths: string[];
  experience_match_text: string | null;
  education_match_text: string | null;
  recommendation: Recommendation;
  justification: string | null;
  status: CandidateStatus;
  error_message: string | null;
  created_at: string;
}

export interface MatchResult {
  score: number;
  skillsMatchPct: number;
  experienceMatchPct: number;
  educationMatchPct: number;
  projectMatchPct: number;
  semanticMatchPct: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  experienceMatch: string;
  educationMatch: string;
  recommendation: Recommendation;
  justification: string;
}
