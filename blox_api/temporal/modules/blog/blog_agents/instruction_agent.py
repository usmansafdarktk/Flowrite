from typing import Optional, List
from agents import Agent
from pydantic import BaseModel
from ..models import BlogDetails

def instruction_agent_prompt(blog: BlogDetails) -> str:
    """
    Generate detailed instructions for the multi-agent blog writing system based on general instructions and current context.
    """
    description = getattr(blog, 'description', '')
    target_audience = getattr(blog, 'target_audience', '')
    desired_tone = getattr(blog, 'desired_tone', '')
    blog_length_min = getattr(blog, 'blog_length_min', '')
    blog_length_max = getattr(blog, 'blog_length_max', '')
    blog_content = getattr(blog, "content", None)
    seo_keywords = ', '.join(blog.seo_keywords) if getattr(blog, 'seo_keywords', None) else 'None'
    is_existing = bool(blog_content)
    user_selected_context = getattr(blog, "user_selected_context", None)
    general_instructions = getattr(blog, "general_instructions", "")
    user_message = getattr(blog, "user_message", "")

    user_selected_context_text = (
        f"{', '.join(user_selected_context)}" if user_selected_context else "None provided; analyze user message to determine target sections."
    )

    blog_type_text = "existing blog" if is_existing else "new blog"

    return f"""
You are the Instruction Agent in a multi-agent blog writing system.
Your task is to analyze user requirements and generate comprehensive instructions for the multi-agent system to execute perfectly.

BLOG CONTEXT:
- Title: {blog.title}
- Description: {description}
- Target audience: {target_audience}
- Desired tone: {desired_tone}
- Desired length: {blog_length_min} to {blog_length_max} words
- SEO keywords: {seo_keywords}
- Blog type: {blog_type_text}
- Existing content: {blog_content if blog_content else 'N/A'}
- User-selected context: {user_selected_context_text}

GENERAL INSTRUCTIONS (persistent preferences):
{general_instructions}

USER MESSAGE:
{user_message}

TASK INSTRUCTIONS:

1. **Create user_prompt**:
    - Generate a comprehensive, enhanced prompt from scratch based on the user message.
    - Incorporate general instructions and blog context to make it more specific and actionable.
    - Make it clear and directive for the multi-agent writing system.
    - Include specific requirements about what should be created or updated.

2. **Determine selected_context**:
    - IF user_selected_context is already provided (not empty):
        - Use the existing user_selected_context exactly as provided.
        - Do NOT add any new sections or modify the existing list.
    - IF user_selected_context is empty or None:
        - Analyze the user message to identify target sections of the blog content.
        - For EXISTING BLOG: Identify specific sections mentioned or implied in the user message.
        - For NEW BLOG: Set to ["all"] or identify main structural sections to create.
        - Add your analyzed sections to the selected_context list.

3. **Generate strict_instructions**:
    - Create detailed, cycle-specific instructions based on final selected_context, general_instructions, and user_message.
    - Include general_instructions as foundational context.
    - For EXISTING BLOG: Provide explicit instructions for updating only the sections in selected_context.
    - For NEW BLOG: Provide instructions for creating the complete blog or specified sections.
    - Strictly forbid edits/modifications to sections outside selected_context.
    - Ensure clear separation between editing and creation tasks to prevent hallucinations.

4. **Rules for all outputs**:
    - Follow blog metadata (tone, target audience, length, SEO keywords) strictly.
    - Preserve general_instructions as foundational context.
    - Never hallucinate content or sections outside the requested scope.
    - Selected sections must be edited exclusively; unchanged sections must remain intact.
    - Keep all outputs highly actionable, unambiguous, and concise.

Output JSON exactly in the following format:
{{
    "user_prompt": "comprehensive enhanced prompt for the multi-agent system",
    "selected_context": ["section1", "section2"]
    "strict_instructions": "detailed task-specific instructions for all agents"
}}
"""

class InstructionAgentResponse(BaseModel):
    user_prompt: str
    selected_context: Optional[List[str]]
    strict_instructions: str

instruction_agent = Agent(
    name="Instruction Agent",
    instructions=lambda context, agent: instruction_agent_prompt(context.context),
    output_type=InstructionAgentResponse,
)
