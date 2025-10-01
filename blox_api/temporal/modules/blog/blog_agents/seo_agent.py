from agents import Agent
from pydantic import BaseModel
from dataclasses import dataclass
from typing import Optional

from ..models import BlogDetails

# Assuming BlogDetails is already defined elsewhere

def seo_agent_instructions(blog: BlogDetails) -> str:
    """Dynamically generate SEO Agent system prompt based on blog metadata and strict_instructions."""

    # strict_instructions injected from Instruction Agent
    strict_instructions = f"\n\nStrict instructions to perform the task:\n{blog.instructions}" if blog.instructions else ""

    return f"""
You are the SEO Agent in a multi-agent blog writing system.
Your role: produce a **complete, publication-ready SEO pack** fully aligned to the blog metadata, research, and strict_instructions.

INPUT:
- blog_title: {blog.title}
- blog_description: {blog.description}
- target_audience: {blog.target_audience}
- desired_length: {blog.blog_length_min} to {blog.blog_length_max} words
- base_seo_keywords: {', '.join(blog.seo_keywords) if blog.seo_keywords else "none"}
- tone: {blog.desired_tone}

CORE RESPONSIBILITIES:
1) Keyword Strategy
   - Tailor keywords to the audience strictly according to strict_instructions.
   - Developers → technical long-tails.
   - Investors → market-intent long-tails.
   - Both → balanced set as indicated in strict_instructions.
   - Include semantic/LSI keywords and FAQ queries as relevant.

2) On-page SEO Deliverables
   - Generate a structured SEO pack including:
     * primary_focus_keyword
     * primary_keywords
     * secondary_keywords
     * long_tail_keywords
     * meta_title (<=60 chars)
     * meta_description (120-160 chars)
     * url_slug
     * h1
     * h2_suggestions (5-8)
     * image_alt_texts (3)
     * internal_link_anchors (3)
     * faq (5 Q&A items)
     * keyword_density_guidance
   - For edits: apply SEO updates only to sections specified or inferred in strict_instructions.

3) RULES:
- **Follow strict_instructions exactly; do not deviate or hallucinate.**
- Tailor keywords based on research + target audience strictly.
- Ensure meta_title and meta_description are compelling and click-worthy.
- All output must be publication-ready; no placeholders.
- Respect user-selected or inferred sections; do not modify unrelated sections.

{strict_instructions}
"""


seo_agent_handoff_description = """
The Orchestrator hands off to the SEO Agent once the blog title, description, target audience, and length are known;
the SEO Agent generates and returns high-quality, relevant SEO keywords for the blog.
"""

class SEOAgentResponse(BaseModel):
   primary_focus_keyword: str
   primary_keywords: list[str]
   secondary_keywords: list[str]
   long_tail_keywords: list[str]
   meta_title: str
   meta_description: str
   url_slug: str
   h1: str
   h2_suggestions: list[str]
   image_alt_texts: list[str]
   internal_link_anchors: list[str]
   faq: list[str]
   keyword_density_guidance: str
   social_snippets: dict[str, str]

seo_agent = Agent(
    name="Blog SEO Agent",
    instructions=lambda context, agent: seo_agent_instructions(context.context),
    handoff_description=seo_agent_handoff_description,
    handoffs=[],  # Will be set after all agents are imported
    output_type=SEOAgentResponse,
)
