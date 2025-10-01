from __future__ import annotations

import asyncio
import logging
import sys
from datetime import timedelta
from pathlib import Path

# Add the parent directory to Python path to enable imports from models
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure logging for temporal workflows
logging.getLogger("openai").setLevel(logging.ERROR)
logging.getLogger("openai.agents").setLevel(logging.CRITICAL)

# Configure temporal logger
temporal_logger = logging.getLogger("temporal")
temporal_logger.setLevel(logging.INFO)

# Create console handler with custom formatter for workflow identification
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Custom formatter to highlight workflow logs
class WorkflowFormatter(logging.Formatter):
    def format(self, record):
        # Add workflow identification for temporal logs
        if hasattr(record, 'workflow_name'):
            record.msg = f"[WORKFLOW:{record.workflow_name}] {record.getMessage()}"
        elif hasattr(record, 'activity_name'):
            record.msg = f"[ACTIVITY:{record.activity_name}] {record.getMessage()}"
        elif 'temporal' in record.name.lower():
            record.msg = f"[TEMPORAL] {record.getMessage()}"

        return super().format(record)

# Set custom formatter
formatter = WorkflowFormatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(msg)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler.setFormatter(formatter)

# Add handler to root logger to catch all logs
root_logger = logging.getLogger()
root_logger.addHandler(console_handler)
root_logger.setLevel(logging.INFO)

from temporalio.client import Client
from temporalio.common import RetryPolicy
from temporalio.contrib.openai_agents import OpenAIAgentsPlugin, ModelActivityParameters

from temporalio.contrib.pydantic import pydantic_data_converter
from temporalio.worker import Worker

from modules.blog.workflow import BlogWorkflow
from modules.blog.activities import web_search, get_blog_details, save_blog_content, save_messages, create_new_blog

async def main():
    # Log worker startup
    temporal_logger.info(
        "Starting Temporal Worker for Blog Workflow",
        extra={
            "worker_name": "BlogWorkflowWorker",
            "task_queue": "openai-agents-task-queue",
            "temporal_server": "localhost:7233",
            "workflows": ["BlogWorkflow"],
            "activities": ["web_search", "get_blog_details", "save_blog_content", "save_messages", "create_new_blog"],
        },
    )

    try:
        # Create client connected to server at the given address
        temporal_logger.info(
            "Connecting to Temporal server",
            extra={
                "worker_name": "BlogWorkflowWorker",
                "server_address": "localhost:7233",
            },
        )

        client = await Client.connect(
            "localhost:7233",
            plugins=[
                OpenAIAgentsPlugin(
                    model_params=ModelActivityParameters(
                        start_to_close_timeout=timedelta(seconds=90),
                        # schedule_to_close_timeout=timedelta(seconds=500),
                        retry_policy=RetryPolicy(
                            backoff_coefficient=2.0,
                            # initial_interval=timedelta(seconds=1),
                            # maximum_interval=timedelta(seconds=5),
                            maximum_attempts=2,
                        ),
                    )
                ),
            ],
            data_converter=pydantic_data_converter,
        )

        temporal_logger.info(
            "Temporal client connected successfully",
            extra={
                "worker_name": "BlogWorkflowWorker",
                "server_address": "localhost:7233",
            },
        )

        worker = Worker(
            client,
            task_queue="openai-agents-task-queue",
            workflows=[
                BlogWorkflow
            ],
            activities=[web_search, get_blog_details, save_blog_content, save_messages, create_new_blog],
        )

        temporal_logger.info(
            "Worker initialized and starting",
            extra={
                "worker_name": "BlogWorkflowWorker",
                "task_queue": "openai-agents-task-queue",
                "workflow_count": 1,
                "activity_count": 5,
            },
        )

        await worker.run()

    except Exception as e:
        temporal_logger.error(
            f"Worker failed to start or run: {e}",
            extra={
                "worker_name": "BlogWorkflowWorker",
                "error_type": type(e).__name__,
                "error_message": str(e),
            },
        )
        raise
    finally:
        temporal_logger.info(
            "Worker shutdown",
            extra={
                "worker_name": "BlogWorkflowWorker",
                "shutdown_reason": "normal_exit",
            },
        )


if __name__ == "__main__":
    asyncio.run(main())