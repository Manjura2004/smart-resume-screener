import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

interface ExtractRequest {
  action: "extract";
  resumeText: string;
  fileName: string;
}

interface MatchRequest {
  action: "match";
  resume: {
    name: string;
    skills: string[];
    education: unknown[];
    experience: unknown[];
    projects: unknown[];
    certifications: string[];
  };
  job: {
    title: string;
    description: string;
    required_skills: string[];
    min_experience_years: number;
  };
}

type RequestBody = ExtractRequest | MatchRequest;

const EXTRACTION_PROMPT = `You are an AI resume parser. Extract structured information from the resume text below.
Return ONLY valid JSON with this exact shape (no markdown, no commentary):
{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "education": [{"degree":"","institution":"","year":""}],
  "experience": [{"role":"","company":"","duration":"","summary":""}],
  "projects": [{"name":"","description":"","technologies":[]}],
  "certifications": []
}
- "skills" is an array of skill name strings (e.g. ["React","Python","AWS"]).
- "education" entries have degree, institution, and year (year as a string).
- "experience" entries have role, company, duration (e.g. "Jan 2020 - Present" or "3 years"), and a one-line summary.
- "projects" entries have name, description, and technologies (array of strings).
- "certifications" is an array of certification name strings.
- If a field is not present in the resume, use an empty array or empty string.
- Use the candidate's full name for "name".`;

const MATCHING_PROMPT = `You are an AI recruitment assistant. Compare the candidate profile with the job description below.
Evaluate technical skills, relevant experience, education, projects, and semantic relevance.
Return ONLY valid JSON with this exact shape (no markdown, no commentary):
{
  "semanticScore": 0,
  "matchingSkills": [],
  "missingSkills": [],
  "strengths": [],
  "experienceMatch": "",
  "educationMatch": "",
  "recommendation": "SHORTLIST",
  "justification": ""
}
- "semanticScore" is an integer 0-100 reflecting how well the candidate's overall profile semantically matches the job.
- "matchingSkills" and "missingSkills" are arrays of skill name strings.
- "strengths" is an array of short sentences (max 5).
- "experienceMatch" is a one-sentence qualitative assessment.
- "educationMatch" is a one-sentence qualitative assessment.
- "recommendation" is one of "SHORTLIST", "REVIEW", or "REJECT".
- "justification" is a concise paragraph (2-4 sentences) explaining the score.`;

async function callOpenAI(systemPrompt: string, userContent: string): Promise<unknown> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response.");
  return JSON.parse(content);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "OPENAI_API_KEY secret is not configured. Add it in Supabase Edge Functions > Secrets.",
          llmAvailable: false,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as RequestBody;

    if (body.action === "extract") {
      if (!body.resumeText || body.resumeText.trim().length < 20) {
        return new Response(
          JSON.stringify({ error: "Resume text is too short or empty." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const result = await callOpenAI(
        EXTRACTION_PROMPT,
        `Resume text:\n\n${body.resumeText}`,
      );
      return new Response(
        JSON.stringify({ llmAvailable: true, extraction: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.action === "match") {
      const result = await callOpenAI(
        MATCHING_PROMPT,
        `Job Title: ${body.job.title}\nJob Description: ${body.job.description}\nRequired Skills: ${body.job.required_skills.join(", ")}\nMinimum Experience: ${body.job.min_experience_years} years\n\nCandidate Profile:\n${JSON.stringify(body.resume, null, 2)}`,
      );
      return new Response(
        JSON.stringify({ llmAvailable: true, match: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use 'extract' or 'match'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Edge function failed.";
    return new Response(
      JSON.stringify({ error: message, llmAvailable: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
