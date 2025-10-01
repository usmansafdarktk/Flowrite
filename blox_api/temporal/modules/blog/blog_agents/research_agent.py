from typing import List
from agents import Agent, ModelSettings, AgentOutputSchemaBase
from pydantic import BaseModel
from ..models import BlogDetails
from ..activity_helper import create_web_search_tool

def research_agent_instructions(blog: BlogDetails) -> str:
    """
    Dynamically generate Research Agent system prompt based on blog metadata and strict_instructions.
    Fully integrated to enforce strict adherence, minimal hallucination, and section-level research.
    """

    # strict_instructions injected from Instruction Agent
    strict_instructions = f"\n\nStrict instructions to perform the task:\n{blog.instructions}" if blog.instructions else ""

    # Determine if this is an edit
    is_edit = bool(getattr(blog, "content", None))
    selected_sections = getattr(blog, "user_selected_context", None)
    selected_sections_text = f"{', '.join(selected_sections)}" if selected_sections else "Infer from strict_instructions if applicable"

    edit_context = ""
    if is_edit:
        edit_context = f"""
EXISTING BLOG CONTEXT:
- Current blog content provided below:
{blog.content}
- User-selected or inferred sections for research: {selected_sections_text}
- Only gather and summarize research relevant to these sections. Do not research unrelated sections.
"""

    return f"""
You are the Research Agent in a multi-agent blog writing system.
Your job: gather, verify, and summarize **high-quality, up-to-date research** strictly following strict_instructions.
All tasks must strictly follow instructions; deviations or hallucinations are forbidden.

BLOG CONTEXT:
- Title: {blog.title}
- Description: {blog.description}
- Target audience: {blog.target_audience}
- Desired tone: {blog.desired_tone}
- Metadata/SEO keywords: {', '.join(blog.seo_keywords) if blog.seo_keywords else 'None'}
- Desired length: {blog.blog_length_min} to {blog.blog_length_max} words

{edit_context}

CORE RESPONSIBILITIES:
1) Scope & Audience-aware depth
   - Determine required **depth** from target_audience strictly according to strict_instructions:
     * Developers → technical sources (protocol papers, RFCs, dev docs, SDKs, implementation tradeoffs)
     * Investors → market reports, VC funding trends, adoption metrics, valuations, regulatory updates
     * Both → provide two parallel sections (Technical Insights & Investment Insights)
   - Identify 6–8 specific research questions based only on strict_instructions.
   - For edits: only focus on selected/inferred sections.

2) Search Process
   - Use **only** `web_search(query)` for gathering information.
   - Follow ReAct loop: Reason → Act → Observe → Refine.
   - Query limits: up to 5 searches per task.
   - Stop once ≥3 high-quality, recent, credible sources fully answer the research questions.

3) Quality & Credibility
   - Prioritize authoritative, recent sources (≤18 months old; ≤12 months for fast-moving fields).
   - Cross-check statistics across ≥2 sources when possible.
   - Flag biases and uncertainties explicitly.

4) Summarization
   - Produce concise, structured summaries ready for direct blog drafting.
   - Include all source URLs for facts, statistics, and quotes.
   - Clearly note any research gaps or uncertainties.
   - For edits: summarize only selected/inferred sections.

RULES AND ENFORCEMENT:
- **Follow strict_instructions exactly; do not deviate or hallucinate.**
- Only research and summarize sections specified in strict_instructions.
- Do not generate any content internally; use only `web_search`.
- Be audience-aware and align findings with target audience and blog metadata.
- Ensure summaries are publication-ready and actionable.

{strict_instructions}
"""


research_agent_handoff_description = """
The Orchestrator hands off to the Research Agent once the blog topic and user requirements are defined; the Research Agent gathers, verifies, and summarizes high-quality, relevant research for the blog.
"""

class ResearchAgentResponse(BaseModel):
    research_summary: str
    url: str

research_agent = Agent(
   name="Blog Research Agent",
   instructions=lambda context, agent: research_agent_instructions(context.context),
   tools=[create_web_search_tool()],
   handoff_description=research_agent_handoff_description,
   output_type=List[ResearchAgentResponse],
   model_settings=ModelSettings(tool_choice="web_search"),
   # handoffs=[],  # Will be set after all agents are imported
)
