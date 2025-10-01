from typing import List, Optional
from agents import Agent
from pydantic import BaseModel
from dataclasses import dataclass

from ..models import BlogDetails

# Assuming BlogDetails already exists in your shared models

def outline_agent_instructions(blog: BlogDetails) -> str:
    """
    Generate dynamic prompt for the Outline Agent based on blog metadata,
    fully integrating strict_instructions from the Instruction Agent.
    """

    # strict_instructions injected from Instruction Agent
    strict_instructions = f"\n\nStrict instructions to perform the task:\n{blog.instructions}" if blog.instructions else ""

    is_edit = bool(getattr(blog, "content", None))
    selected_sections = getattr(blog, "user_selected_context", None)
    selected_sections_text = f"{', '.join(selected_sections)}" if selected_sections else "Infer from strict_instructions if applicable"

    edit_context = ""
    if is_edit:
        edit_context = f"""
EXISTING BLOG CONTEXT:
- Current blog content provided below:
{blog.content}
- User-selected or inferred sections to update in the outline: {selected_sections_text}
- Only modify sections explicitly requested or implicitly indicated in strict_instructions.
- Preserve headings, structure, and content of unchanged sections.
"""

    return f"""
You are the Outline Agent in a multi-agent blog writing system.
Your role: produce a **publication-ready, SEO-optimized, audience-tailored outline** strictly following strict_instructions.
Do not deviate or hallucinate.

BLOG CONTEXT:
- Title: {blog.title}
- Description: {blog.description}
- Target audience: {blog.target_audience}
- Desired tone: {blog.desired_tone}
- Desired length: {blog.blog_length_min} to {blog.blog_length_max} words
- Metadata keywords: {', '.join(blog.seo_keywords) if blog.seo_keywords else 'none'}
- SEO Agent keywords: (will be provided separately and must be formatted, de-duplicated, and used alongside metadata keywords)

{edit_context}

CORE RESPONSIBILITIES:
1) Structure & Depth
   - Follow strict_instructions exactly.
   - Audience-aware: create developer vs investor sections if relevant.
   - Each heading must include:
     * intent note
     * word count
     * mapped keywords (metadata + SEO Agent keywords)
   - Include:
     * intro hook
     * TL;DR (2–3 bullets)
     * 2–3 headline variants
     * 2 subhead variants

2) Section Guidance
   - For each section, specify:
     * word count range
     * target keywords
     * evidence types (stats, case studies, code, visuals)
     * suggested visuals (chart, diagram, code block) + alt text idea
   - For edits: only update sections specified or inferred in strict_instructions.

3) Self-Review & Notes
   - Ensure total word count ≈ desired_length.
   - Ensure logical flow, keyword mapping, and readability.
   - Optimize for both SEO and readability.
   - Provide a short **editorial note** (1–2 sentences) explaining how the outline supports the blog's audience, SEO, and readability.
   - Verify all changes comply with strict_instructions.

RULES:
- **Follow strict_instructions exactly; do not deviate or hallucinate.**
- Do not add or remove sections unless explicitly instructed.
- Preserve headings and content of unchanged sections.
- Always integrate both metadata and SEO Agent keywords.
- Output must be clean, structured, and publication-ready.

{strict_instructions}
"""


outline_agent_handoff_description = """
The Orchestrator hands off to the Outline Agent once research and SEO keywords are approved; 
the Outline Agent creates a detailed, structured, and SEO-optimized blog outline for review.
"""

# --- Structured response model ---
class OutlineSection(BaseModel):
    heading: str
    subheadings: Optional[List[str]] = None
    key_points: Optional[List[str]] = None

class OutlineAgentResponse(BaseModel):
    title: str
    sections: List[OutlineSection]

outline_agent = Agent(
   name="Blog Outline Agent",
   instructions=lambda context, agent: outline_agent_instructions(context.context),
   handoff_description=outline_agent_handoff_description,
   handoffs=[],  # Orchestrator will be added later
   output_type=OutlineAgentResponse,
)
