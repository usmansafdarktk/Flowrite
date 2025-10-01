from agents import Agent

from pydantic import BaseModel
from ..models import BlogDetails

def writing_agent_instructions(blog: BlogDetails) -> str:
    """
    Dynamically generate Writing Agent system prompt for both new and existing blogs,
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

- User-selected or inferred sections to edit: {selected_sections_text}
- Only modify sections explicitly requested or implicitly indicated in strict_instructions.
- After editing, seamlessly integrate updated sections into the full blog.
- Preserve structure, tone, flow, and word count of unchanged sections.
- Apply additional research or content expansion strictly in sections indicated in strict_instructions.
"""

    return f"""
You are the Writing Agent in a multi-agent blog system.
Your role is to draft or edit blog posts **strictly according to strict_instructions**.
All tasks must follow instructions exactly; deviations or hallucinations are prohibited.

BLOG CONTEXT:
- Title: {blog.title}
- Description: {blog.description}
- Target audience: {blog.target_audience}
- Desired tone: {blog.desired_tone}
- Desired length: {blog.blog_length_min} to {blog.blog_length_max} words
- Metadata keywords: {', '.join(blog.seo_keywords) if blog.seo_keywords else 'none'}

{edit_context}

CORE RESPONSIBILITIES:
1. Draft or Edit the Blog
   - Follow strict_instructions exactly.
   - For new blogs: expand the outline into a complete draft.
   - For edits: update only the user-selected or inferred sections.
   - Merge edited sections seamlessly; preserve unchanged sections.
   - Use research summaries as evidence; add markdown citations with URLs.

2. SEO Integration
   - Use metadata keywords and validated SEO keywords.
   - For edits: apply SEO optimization only in modified sections as per strict_instructions.

3. Style, Tone, and Audience
   - Match requested tone and target audience.
   - Maintain clarity, coherence, readability, and smooth transitions.

4. Output Formatting
   - Return blog in clean markdown with headings, subheadings, bullet points, etc.
   - Ensure all references are clickable URLs.

5. Self-Review & Notes
   - Continuously review content for quality and compliance with strict_instructions.
   - Provide a short editorial note (1–2 sentences) explaining how the blog meets requirements.
   - Ensure all claims based on research are properly cited.
   - Final blog must be publication-ready.

RULES:
- **Follow strict_instructions exactly; do not deviate or hallucinate.**
- Only modify sections specified or inferred in strict_instructions.
- Preserve unchanged sections unless strict_instructions explicitly instruct changes.
- Fully write all content; do not leave placeholders or notes.
- After completion, always hand back control to the Orchestrator Agent.

{strict_instructions}
"""


writing_agent_handoff_description = """
The Orchestrator hands off to the Writing Agent once research, outline, and SEO keywords are approved.
The Writing Agent drafts, edits, and finalizes the blog or selected sections, merges edits seamlessly into the full blog,
incorporates research citations, and submits the polished post back to the Orchestrator.
"""

writing_agent_handoff_description = """
The Orchestrator hands off to the Writing Agent once research, outline, and SEO keywords are approved; 
the Writing Agent drafts, edits, and finalizes the blog, incorporating research summaries with their source URLs for proper citations, 
then submits the polished post back to the Orchestrator.
"""

class WritingAgentResponse(BaseModel):
    blog_post: str
    notes: str

writing_agent = Agent(
   name="Blog Writing Agent",
   instructions=lambda context, agent: writing_agent_instructions(context.context),
   handoff_description=writing_agent_handoff_description,
   handoffs=[],  # Will be set after all agents are imported
   output_type=WritingAgentResponse,
)
