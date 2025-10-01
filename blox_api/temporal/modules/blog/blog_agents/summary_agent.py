from typing import Optional, List
from agents import Agent
from pydantic import BaseModel

# Summary Agent - handles general instructions summarization
def summary_agent_prompt(blog) -> str:
    """
    Generate a summary agent prompt that updates general instructions based on new user messages.
    """
    existing_summary = getattr(blog, "general_instructions", "")
    new_user_message = getattr(blog, "user_message", "")

    return f"""
You are the Summary Agent in a multi-agent blog writing system.
Your task is to maintain concise, persistent general instructions that summarize the user's overall requirements and preferences for their blog.

EXISTING SUMMARY:
{existing_summary}

NEW USER MESSAGE:
{new_user_message}

TASK:
1. Analyze the new user message and determine if it introduces new persistent requirements, preferences, or context that should be added to the general instructions.

2. If the new message contains important context that should persist across multiple interactions (like tone preferences, content requirements, structural preferences, etc.), update the summary.

3. If the new message is just a specific editing request without persistent context, you may not need to update the summary.

4. Keep the summary concise but comprehensive - focus on persistent rules and context, not specific one-time requests.

Output JSON in the following format:
{{
    "update_general_required": bool,  // true if summary should be updated, false otherwise
    "general_instruction": "updated summary text if update_general_required is true, otherwise empty string"
}}
"""

class SummaryAgentResponse(BaseModel):
    update_general_required: bool
    general_instruction: str

summary_agent = Agent(
    name="Summary Agent",
    instructions=lambda context, agent: summary_agent_prompt(context.context),
    output_type=SummaryAgentResponse,
)
