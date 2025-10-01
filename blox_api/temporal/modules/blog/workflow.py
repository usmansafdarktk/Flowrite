# py modules
from temporalio import workflow

# models
from .models import BlogWorkflowInput

# helpers
from .workflow_helper import handle_new_blog, handle_existing_blog

@workflow.defn
class BlogWorkflow:

    @workflow.run
    async def run(self, workflow_input: BlogWorkflowInput) -> dict:
        """
        Main workflow for blog creation and editing. Returns a dict containing blog content and message IDs.
        """
        try:
            is_new_blog = workflow_input.blog_id is None

            workflow.logger.info(
                "BlogWorkflow started",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "is_new_blog": is_new_blog,
                    "blog_id": workflow_input.blog_id,
                    "title": workflow_input.title,
                    "user_message": workflow_input.user_message if hasattr(workflow_input, 'user_message') else None,
                    "target_audience": workflow_input.target_audience,
                    "desired_tone": workflow_input.desired_tone,
                    "seo_keywords": workflow_input.seo_keywords,
                    "blog_length_min": workflow_input.blog_length_min,
                    "blog_length_max": workflow_input.blog_length_max,
                },
            )

            if is_new_blog:
                workflow.logger.info(
                    "Routing to new blog creation flow",
                    extra={
                        "workflow_name": "BlogWorkflow",
                        "flow_type": "new_blog",
                        "title": workflow_input.title,
                    },
                )
                result = await handle_new_blog(workflow_input)
            else:
                workflow.logger.info(
                    "Routing to existing blog editing flow",
                    extra={
                        "workflow_name": "BlogWorkflow",
                        "flow_type": "existing_blog",
                        "blog_id": workflow_input.blog_id,
                        "user_message": workflow_input.user_message if hasattr(workflow_input, 'user_message') else None,
                    },
                )
                result = await handle_existing_blog(workflow_input)

            workflow.logger.info(
                "BlogWorkflow completed successfully",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "blog_id": result.get("blog_id"),
                    "result_type": "success",
                    "has_content": "content" in result,
                    "has_message": "message" in result,
                },
            )

            return result

        except Exception as e:
            workflow.logger.error(
                f"Error in BlogWorkflow: {e}",
                extra={
                    "workflow_name": "BlogWorkflow",
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                    "blog_id": workflow_input.blog_id,
                    "is_new_blog": workflow_input.blog_id is None,
                },
            )
            return { "error": str(e) }


