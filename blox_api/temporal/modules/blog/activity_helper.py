#py modules
from datetime import timedelta
from agents import ItemHelpers, RunContextWrapper, Runner, function_tool
from temporalio import workflow
from temporalio.common import RetryPolicy

# Import activity logger
from temporalio import activity as activity_module

# constants
from .constants import constants

# activities
from .activities import web_search

# policies
from ..policies import DEFAULT_ACTIVITY_OPTS

async def exec_activity(name_or_fn, *post_args):
    activity_name = name_or_fn.__name__ if hasattr(name_or_fn, '__name__') else str(name_or_fn)

    workflow.logger.info(
        "Executing activity",
        extra={
            "workflow_name": "BlogWorkflow",
            "activity_name": activity_name,
            "args_count": len(post_args),
        },
    )

    result = await workflow.execute_activity(
        name_or_fn,
        args=post_args,
        **DEFAULT_ACTIVITY_OPTS,
    )

    workflow.logger.info(
        "Activity execution completed",
        extra={
            "workflow_name": "BlogWorkflow",
            "activity_name": activity_name,
            "execution_successful": True,
        },
    )

    return result

def create_agent_tool(
    agent,
    tool_name: str,
    tool_description: str,
):
    """
    Wraps agent_as_tool with call limits.
    Mirrors official SDK implementation of as_tool but enforces max_calls using workflow-scoped counters.
    """
    @function_tool(
        name_override=tool_name,
        description_override=tool_description,
    )
    async def run_agent(context: RunContextWrapper, input: str) -> str:
        try:
            # Get call counters from workflow context (BlogDetails)
            blog_details = context.context
            max_calls = constants.get("max_agent_tool_calls")
            current_count = blog_details.tool_call_counters.get(tool_name, 1)

            workflow.logger.info(
                "Agent tool execution started",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "tool_name": tool_name,
                    "current_call_count": current_count,
                    "max_calls": max_calls,
                    "input_length": len(input),
                    "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                },
            )

            # enforce call limit
            if current_count > max_calls:
                workflow.logger.warning(
                    "Agent tool call limit exceeded",
                    extra={
                        "workflow_name": "BlogWorkflow",
                        "tool_name": tool_name,
                        "current_call_count": current_count,
                        "max_calls": max_calls,
                        "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                    },
                )
                return f"Max calls exceeded for tool: {tool_name}"

            # identical to SDK's as_tool implementation
            output = await Runner.run(
                starting_agent=agent,
                input=input,
                context=context.context,
            )

            # Update counter in workflow context
            blog_details.tool_call_counters[tool_name] = current_count + 1

            workflow.logger.info(
                "Agent tool execution completed successfully",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "tool_name": tool_name,
                    "new_call_count": current_count + 1,
                    "has_output": output is not None,
                    "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                },
            )

            return ItemHelpers.text_message_outputs(output.new_items)
        except Exception as e:
            workflow.logger.error(
                f"Agent tool execution failed: {e}",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "tool_name": tool_name,
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                    "blog_id": context.context.id if hasattr(context.context, 'id') else None,
                },
            )
            return f"Failed to run {tool_name}: {e}"

    return run_agent

def create_web_search_tool():
    """
    Creates a web search tool that manages call counters from workflow state.
    Returns error messages from the activity if something goes wrong.
    """
    @function_tool(
        name_override=constants.get("web_search_tool_name"),
        description_override=(
            "This tool is used for research purposes. "
            "It performs a web search using Tavily API and returns search results."
        ),
    )
    async def search_tool(context: RunContextWrapper, query: str) -> list[dict] | str:
        blog_details = context.context
        web_search_tool_name = constants.get("web_search_tool_name")
        current_count = blog_details.tool_call_counters.get(web_search_tool_name, 1)

        try:
            workflow.logger.info(
                "Web search tool execution started",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "tool_name": web_search_tool_name,
                    "query": query,
                    "current_call_count": current_count,
                    "max_calls": constants.get("max_web_search_calls"),
                    "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                },
            )

            if current_count > constants.get("max_web_search_calls"):
                workflow.logger.warning(
                    "Web search tool call limit exceeded",
                    extra={
                        "workflow_name": "BlogWorkflow",
                        "tool_name": web_search_tool_name,
                        "current_call_count": current_count,
                        "max_calls": constants.get("max_web_search_calls"),
                        "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                    },
                )
                return "Max search calls exceeded. Summarize the results now."

            # Call the web search activity
            results, updated_count = await exec_activity(
                web_search,
                query, current_count,
            )

            # Update the counter in workflow state
            blog_details.tool_call_counters[web_search_tool_name] = updated_count

            # Return formatted results
            if results:
                workflow.logger.info(
                    "Web search tool execution completed with results",
                    extra={
                        "workflow_name": "BlogWorkflow",
                        "tool_name": web_search_tool_name,
                        "query": query,
                        "results_count": len(results),
                        "updated_call_count": updated_count,
                        "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                    },
                )
                return [{"url": res.url, "content": res.content} for res in results]
            else:
                workflow.logger.info(
                    "Web search tool execution completed with no results",
                    extra={
                        "workflow_name": "BlogWorkflow",
                        "tool_name": web_search_tool_name,
                        "query": query,
                        "results_count": 0,
                        "updated_call_count": updated_count,
                        "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                    },
                )
                return []

        except Exception as e:
            workflow.logger.error(
                f"Web search tool execution failed: {e}",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "tool_name": web_search_tool_name,
                    "query": query,
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                    "blog_id": blog_details.id if hasattr(blog_details, 'id') else None,
                },
            )
            return f"Failed to search the web: {e}"

    return search_tool
