# blog_agents/__init__.py

from .orchestrator_agent import orchestrator_agent
from .research_agent import research_agent
from .seo_agent import seo_agent
from .outline_agent import outline_agent
from .writing_agent import writing_agent
from .instruction_agent import instruction_agent
from .summary_agent import summary_agent


def _setup_handoffs():
    # Define children of orchestrator
    children = [research_agent, seo_agent, outline_agent, writing_agent]

    # Orchestrator hands off to children
    orchestrator_agent.handoffs = children

    # Each child hands off back to orchestrator
    for child in children:
        child.handoffs = [orchestrator_agent]

    # 🔒 Sanity check: enforce symmetry
    for child in children:
        print(f"{child.name} has {[handoff.name for handoff in child.handoffs]} handoffs")

        if orchestrator_agent not in child.handoffs:
            raise RuntimeError(
                f"{child.name} does not have orchestrator_agent in its handoffs!"
            )


# Run setup immediately when package is imported
# _setup_handoffs()

__all__ = [
    "orchestrator_agent",
    "research_agent",
    "seo_agent",
    "outline_agent",
    "writing_agent",
    "instruction_agent",
    "summary_agent",
]
