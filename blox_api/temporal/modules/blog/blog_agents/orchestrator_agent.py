# pymodules
from agents import Agent
from pydantic import BaseModel

# agents
from .research_agent import research_agent
from .seo_agent import seo_agent
from .outline_agent import outline_agent
from .writing_agent import writing_agent
from ..activity_helper import create_agent_tool

# models
from ..models import BlogDetails

# constants
from ..constants import constants

def orchestrator_agent_instructions(blog: BlogDetails) -> str:
    """
    Generate a dynamic orchestrator prompt for both new blog creation and editing existing blogs.
    Handles user-specified sections, implicit section edits, research, SEO, tone, and seamless integration.
    """

    # strict_instructions injected from Instruction Agent
    strict_instructions = f"\n\nStrict instructions to perform the task:\n{blog.instructions}" if blog.instructions else ""

    # Determine if this is an edit or new blog
    is_edit = bool(getattr(blog, "content", None))
    selected_sections_text = (
        f"{', '.join(blog.user_selected_context)}" if getattr(blog, "user_selected_context", None) else "Infer from strict_instructions if applicable"
    )

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
- Apply additional research or content expansion only to sections indicated in strict_instructions.
"""

    return f"""
You are the Blog Orchestrator Agent — the workflow manager and quality gate.
Your job is to create new blogs or edit existing blogs with high quality, **strict adherence to strict_instructions**, and deterministic execution.
Do not hallucinate or deviate from the given instructions.

BLOG CONTEXT:
- Title: {blog.title}
- Description: {blog.description}
- Target audience: {blog.target_audience}
- Desired tone: {blog.desired_tone}
- Desired length: {blog.blog_length_min} to {blog.blog_length_max} words
- Base SEO keywords: {', '.join(blog.seo_keywords) if blog.seo_keywords else 'none'}

{edit_context}

MANDATORY TOOL SEQUENCE (always call in this exact order):
1) `research_agent`
   - New blogs: gather ≥1 authoritative + ≥2 corroborating sources, recent dates, audience depth.
   - Edits: research only requested sections or topics, unless user instructs full-blog research.
   - Max 2 refine cycles.

2) `seo_agent`
   - Validate meta_title, description, primary keyword, H2s, FAQs, alt texts.
   - Apply SEO improvements only to sections being modified.
   - Max 2 refine cycles.

3) `outline_agent`
   - Create intro hook, TL;DR, per-section word counts, keyword mapping.
   - For edits: adjust outline only for modified sections; preserve unchanged sections.
   - Max 2 refine cycles.

4) `writing_agent`
   - Produce fully polished blog or sections.
   - **FOR EDITS: Take existing content and modify ONLY the specified sections/topics.**
   - **PRESERVE all existing sections that are not mentioned in user instructions.**
   - **DO NOT regenerate the entire blog - only modify requested parts.**
   - Merge updated sections seamlessly into the full blog.
   - Include citations, visuals/alt text suggestions, self-review, and editorial notes.
   - Maintain tone, depth, and word count across all sections.
   - Max 2 refine cycles.

QUALITY CHECKLIST:
- Hook + TL;DR present and engaging
- Depth tailored to {blog.target_audience}
- Primary keyword in H1 + intro
- All claims cited with credible sources
- Visuals + alt-text suggested
- Word count ≈ {blog.blog_length_min} to {blog.blog_length_max}
- Tone: {blog.desired_tone}
- **CRITICAL FOR EDITS: Only modify sections explicitly requested in user instructions**
- **PRESERVE all existing content structure and sections unless explicitly instructed to change them**
- **Return the COMPLETE blog with modifications integrated, not just the new sections**

RULES:
- Always follow tool-call sequence: `research_agent` → `seo_agent` → `outline_agent` → `writing_agent`.
- Never skip or stop early.
- Only return the final structured response once Writing Agent completes.
- Do not expose intermediate tool outputs in the final response.
- **Follow strict_instructions exactly; do not deviate or hallucinate.**
- **FOR EDITS: Always include the full existing blog content in your final output, with only requested modifications.**

{strict_instructions}
"""

class OrchestratorAgentResponse(BaseModel):
   blog_post: str
   action_summary: str


orchestrator_agent = Agent(
   name="Blog Orchestrator Agent",
   instructions=lambda context, agent: orchestrator_agent_instructions(context.context),
   handoffs=[],  # Will be linked with all agents
   output_type=OrchestratorAgentResponse,
   handoff_description="Handoff to orchestrator agent once your task is completed and the system should move to next steps to finalize the blog post.",
   tools=[
      create_agent_tool(
         research_agent,
         tool_name=constants.get("research_agent_tool_name"),
         tool_description="The Research Agent gathers, verifies, and summarizes research",
      ),
      create_agent_tool(
         seo_agent,
         tool_name=constants.get("seo_agent_tool_name"),
         tool_description="The SEO Agent generates and returns high-quality, relevant SEO keywords for the blog",
      ),
      create_agent_tool(
         outline_agent,
         tool_name=constants.get("outline_agent_tool_name"),
         tool_description="The Outline Agent produces a publication-ready, SEO-optimized, audience-tailored outline",
      ),
      create_agent_tool(
         writing_agent,
         tool_name=constants.get("writing_agent_tool_name"),
         tool_description="the Writing Agent produces a fully polished blog post based on research from the research agent, outline from the outline agent, and SEO keywords from the seo agent",
      ),
   ]
)
