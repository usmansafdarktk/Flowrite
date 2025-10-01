# py modules
from temporalio import workflow
from agents import RunConfig, Runner
from datetime import timedelta
import json

# models
from .models import BlogDetails, BlogWorkflowInput, OpenAIMessage

# agents
from .blog_agents.orchestrator_agent import orchestrator_agent
from .blog_agents.summary_agent import summary_agent
from .blog_agents.instruction_agent import instruction_agent

# activities
from .activities import get_blog_details, save_blog_content, save_messages, create_new_blog

# activity helper
from .activity_helper import exec_activity

async def generate_first_blog_prompt(blog: BlogDetails) -> str:
    """
    Generates the first user message for the blog creation agent
    based on BlogDetails metadata when no content or instructions exist.
    """
    prompt = f"""
        You are tasked with creating the first draft of a blog post. Please follow all best practices for
        multi-agent blog writing. Use the details provided below:

        - Title: {blog.title}
        - Description: {blog.description}
        - Target Audience: {blog.target_audience}
        - Desired Tone: {blog.desired_tone}
        - SEO Keywords: {', '.join(blog.seo_keywords)}
        - Estimated Length: {blog.blog_length_min}-{blog.blog_length_max} words

        Instructions for this draft:
        - Create a well-structured, engaging, and informative blog that adheres to the title and description.
        - Use the SEO keywords naturally throughout the content.
        - Ensure the tone matches the desired tone.
        - Organize content with logical flow, headings, and subheadings if necessary.
        - Output the draft in markdown format.

        This is the first draft, so focus on producing the complete blog content from scratch based on the metadata provided.
        """
    return prompt.strip()

def format_orchestrator_input(blog_details: BlogDetails, current_user_message: str) -> list[OpenAIMessage]:
    """
    Format the input for the orchestrator agent including:
    - Last 10 conversations in OpenAI chat format
    - Current user message
    - Strict instructions
    """
    conversation = blog_details.messages

    # Add current user message in OpenAI format
    escaped_user_message = current_user_message.replace('"', '\\"')  # Escape quotes in content
    conversation.append(OpenAIMessage(role="user", content=f"{escaped_user_message} + \n{blog_details.instructions}"))

    return conversation

async def handle_new_blog(workflow_input: BlogWorkflowInput) -> dict:
    """
    Handle new blog creation flow.
    """
    workflow.logger.info(
        "Starting new blog creation workflow",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "title": workflow_input.title,
            "description": workflow_input.description,
            "target_audience": workflow_input.target_audience,
            "desired_tone": workflow_input.desired_tone,
            "seo_keywords": workflow_input.seo_keywords,
            "blog_length_range": f"{workflow_input.blog_length_min}-{workflow_input.blog_length_max}",
        },
    )

    # Create new blog in database
    workflow.logger.info(
        "Creating new blog in database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "database_creation",
            "title": workflow_input.title,
        },
    )
    blog_id = await exec_activity(
        create_new_blog,
        workflow_input.title,
        workflow_input.description,
        workflow_input.desired_tone,
        workflow_input.seo_keywords,
        workflow_input.target_audience,
        workflow_input.blog_length_min,
        workflow_input.blog_length_max,
        workflow_input.user_id,
    )

    workflow.logger.info(
        "New blog created in database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "database_creation",
            "blog_id": blog_id,
        },
    )

    # Create BlogDetails for new blog
    blog_details = BlogDetails(
        id=blog_id,
        title=workflow_input.title,
        description=workflow_input.description,
        desired_tone=workflow_input.desired_tone,
        seo_keywords=workflow_input.seo_keywords,
        target_audience=workflow_input.target_audience,
        blog_length_min=workflow_input.blog_length_min,
        blog_length_max=workflow_input.blog_length_max,
        content=None,
        messages=[],
        instructions=None,
        user_selected_context=None,
        user_message=None,
        tool_call_counters={}
    )

    workflow.logger.info(
        "BlogDetails object created",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "blog_details_creation",
            "blog_id": blog_id,
            "has_instructions": False,
            "message_count": 0,
        },
    )

    # Generate blog instructions
    workflow.logger.info(
        "Generating blog instructions",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "instruction_generation",
            "blog_id": blog_id,
        },
    )
    blog_details.instructions = await generate_first_blog_prompt(blog_details)

    workflow.logger.info(
        "Blog instructions generated",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "instruction_generation",
            "blog_id": blog_id,
            "instruction_length": len(blog_details.instructions),
        },
    )

    # Use orchestrator agent to generate blog
    workflow.logger.info(
        "Starting orchestrator agent for blog generation",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "agent_execution",
            "blog_id": blog_id,
            "agent_type": "orchestrator",
            "model": "gpt-4o-mini",
            "max_turns": 20,
        },
    )
    run_config = RunConfig(
        workflow_name="BlogWorkflow",
        model="gpt-4o-mini",
        tracing_disabled=True,
    )
    result = await Runner.run(
        orchestrator_agent,
        input=blog_details.instructions,
        run_config=run_config,
        max_turns=20,
        context=blog_details
    )

    workflow.logger.info(
        "Orchestrator agent completed",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "agent_execution",
            "blog_id": blog_id,
            "agent_type": "orchestrator",
            "turns_used": result.turn_count if hasattr(result, 'turn_count') else "unknown",
            "has_final_output": result.final_output is not None,
        },
    )

    # Save blog content to database
    workflow.logger.info(
        "Saving blog content to database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "content_save",
            "blog_id": blog_id,
            "content_length": len(result.final_output.blog_post) if result.final_output and result.final_output.blog_post else 0,
        },
    )
    await exec_activity(
        save_blog_content,
        blog_id,
        result.final_output.blog_post, #todo(afaq): json handling
    )

    workflow.logger.info(
        "Blog content saved to database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "step": "content_save",
            "blog_id": blog_id,
        },
    )

    # Return blog
    workflow.logger.info(
        "New blog creation completed successfully",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "new_blog",
            "blog_id": blog_id,
            "content_length": len(result.final_output.blog_post) if result.final_output and result.final_output.blog_post else 0,
            "action_summary_length": len(result.final_output.action_summary) if result.final_output and result.final_output.action_summary else 0,
        },
    )
    return {
        "blog_id": blog_id,
        "content": result.final_output.blog_post, #todo(afaq): json handling
        "action_summary": result.final_output.action_summary, #todo(afaq): json handling
        "user_message_id": None,
        "ai_message_id": None
    }


async def handle_existing_blog(workflow_input: BlogWorkflowInput) -> dict:
    """
    Handle existing blog editing flow.
    """
    workflow.logger.info(
        "Starting existing blog editing workflow",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "blog_id": workflow_input.blog_id,
            "user_message": workflow_input.user_message,
            "user_selected_context": workflow_input.user_selected_context,
        },
    )

    # Get blog details from database with previous messages
    workflow.logger.info(
        "Retrieving blog details from database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "retrieve_blog_details",
            "blog_id": workflow_input.blog_id,
        },
    )
    blog_details = await exec_activity(
        get_blog_details,
        workflow_input.blog_id,
    )

    workflow.logger.info(
        "Blog details retrieved successfully",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "retrieve_blog_details",
            "blog_id": workflow_input.blog_id,
            "message_count": len(blog_details.messages) if blog_details.messages else 0,
            "has_existing_content": blog_details.content is not None,
            "has_instructions": blog_details.instructions is not None,
        },
    )

    # Set workflow input data
    blog_details.user_selected_context = workflow_input.user_selected_context
    blog_details.user_message = workflow_input.user_message

    workflow.logger.info(
        "Workflow input data set in blog details",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "input_data_set",
            "blog_id": workflow_input.blog_id,
            "user_message_length": len(workflow_input.user_message) if workflow_input.user_message else 0,
            "has_selected_context": workflow_input.user_selected_context is not None,
        },
    )

    # Use summary agent to update general instructions
    workflow.logger.info(
        "Starting summary agent to update general instructions",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "summary_agent",
            "blog_id": workflow_input.blog_id,
            "agent_type": "summary",
            "model": "gpt-4o-mini",
        },
    )
    run_config = RunConfig(
        workflow_name="BlogWorkflow",
        model="gpt-4o-mini",
        tracing_disabled=True,
    )

    # Call summary agent to update general instructions
    summary_result = await Runner.run(
        summary_agent,
        input="Summarize general instructions based on new user message",
        run_config=run_config,
        context=blog_details
    )

    workflow.logger.info(
        "Summary agent completed",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "summary_agent",
            "blog_id": workflow_input.blog_id,
            "agent_type": "summary",
            "has_final_output": summary_result.final_output is not None,
        },
    )

    # Parse summary result and save new general instructions in db if needed
    summary_data = summary_result.final_output
    if summary_data.update_general_required:
        new_general_instructions = summary_data.general_instruction
        workflow.logger.info(
            "Updating general instructions in database",
            extra={
                "workflow_name": "BlogWorkflow",
                "flow_type": "existing_blog",
                "step": "update_general_instructions",
                "blog_id": workflow_input.blog_id,
                "new_instructions_length": len(new_general_instructions),
            },
        )
        await exec_activity(
            save_blog_content,
            workflow_input.blog_id,
            None,  # Keep existing content
            new_general_instructions,
        )
        blog_details.general_instructions = new_general_instructions
    else:
        workflow.logger.info(
            "No general instructions update required",
            extra={
                "workflow_name": "BlogWorkflow",
                "flow_type": "existing_blog",
                "step": "summary_parsing",
                "blog_id": workflow_input.blog_id,
                "update_required": False,
            },
        )

    # Use instruction agent to generate detailed instructions
    workflow.logger.info(
        "Starting instruction agent to generate detailed instructions",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "instruction_agent",
            "blog_id": workflow_input.blog_id,
            "agent_type": "instruction",
            "model": "gpt-4o-mini",
            "max_turns": 10,
        },
    )
    instruction_result = await Runner.run(
        instruction_agent,
        input="Generate detailed instructions for blog editing",
        run_config=run_config,
        max_turns=10,
        context=blog_details
    )

    workflow.logger.info(
        "Instruction agent completed",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "instruction_agent",
            "blog_id": workflow_input.blog_id,
            "agent_type": "instruction",
            "has_final_output": instruction_result.final_output is not None,
        },
    )

    # Parse the instruction result JSON
    instruction_data = instruction_result.final_output
    blog_details.instructions = instruction_data.strict_instructions or workflow_input.user_message
    blog_details.user_prompt = instruction_data.user_prompt or workflow_input.user_message

    contexts = []
    if instruction_data.selected_context:
        if isinstance(instruction_data.selected_context, list):
            contexts.extend(instruction_data.selected_context)
        else:
            contexts.append(instruction_data.selected_context)
    if workflow_input.user_selected_context:
        if isinstance(workflow_input.user_selected_context, list):
            contexts.extend(workflow_input.user_selected_context)
        else:
            contexts.append(workflow_input.user_selected_context)

    blog_details.user_selected_context = " ".join(contexts) if contexts else None

    workflow.logger.info(
        "Instruction data parsed successfully",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "instruction_parsing",
            "blog_id": workflow_input.blog_id,
            "has_strict_instructions": instruction_data.strict_instructions is not None,
            "has_user_prompt": instruction_data.user_prompt is not None,
            "has_selected_context": instruction_data.selected_context is not None,
        },
    )

    # Format conversation history + current message + strict instructions
    orchestrator_input = format_orchestrator_input(blog_details, workflow_input.user_message)

    workflow.logger.info(
        "Orchestrator input formatted",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "orchestrator_input_format",
            "blog_id": workflow_input.blog_id,
            "message_count": len(orchestrator_input),
        },
    )

    # Use orchestrator agent to update blog content
    workflow.logger.info(
        "Starting orchestrator agent for blog content update",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "orchestrator_agent",
            "blog_id": workflow_input.blog_id,
            "agent_type": "orchestrator",
            "model": "gpt-4o-mini",
            "max_turns": 20,
        },
    )
    result = await Runner.run(
        orchestrator_agent,
        input=orchestrator_input,
        run_config=run_config,
        max_turns=20,
        context=blog_details
    )

    workflow.logger.info(
        "Orchestrator agent completed",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "orchestrator_agent",
            "blog_id": workflow_input.blog_id,
            "agent_type": "orchestrator",
            "has_final_output": result.final_output is not None,
        },
    )

    # Save updated blog content to database
    workflow.logger.info(
        "Saving updated blog content to database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "content_save",
            "blog_id": workflow_input.blog_id,
            "content_length": len(result.final_output.blog_post) if result.final_output and result.final_output.blog_post else 0,
            "instructions_length": len(blog_details.instructions) if blog_details.instructions else 0,
        },
    )
    await exec_activity(
        save_blog_content,
        workflow_input.blog_id,
        result.final_output.blog_post, #todo(afaq): json handling
        blog_details.instructions,
    )

    workflow.logger.info(
        "Blog content saved to database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "content_save",
            "blog_id": workflow_input.blog_id,
        },
    )

    # Save user message and AI message to database
    workflow.logger.info(
        "Saving user and AI messages to database",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "step": "message_save",
            "blog_id": workflow_input.blog_id,
            "user_message_length": len(workflow_input.user_message),
            "ai_message_length": len(result.final_output.action_summary) if result.final_output and result.final_output.action_summary else 0,
        },
    )
    message = await exec_activity(
        save_messages,
        workflow_input.blog_id,
        workflow_input.user_message,
        result.final_output.action_summary,
    )

    # Return blog and message info
    workflow.logger.info(
        "Existing blog editing completed successfully",
        extra={
            "workflow_name": "BlogWorkflow",
            "flow_type": "existing_blog",
            "blog_id": workflow_input.blog_id,
            "content_length": len(result.final_output.blog_post) if result.final_output and result.final_output.blog_post else 0,
            "action_summary_length": len(result.final_output.action_summary) if result.final_output and result.final_output.action_summary else 0,
        },
    )
    return {
        "blog_id": workflow_input.blog_id,
        "content": result.final_output.blog_post,
        "message": message,
    }
