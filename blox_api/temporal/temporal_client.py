from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, Optional

from temporalio.client import Client
from temporalio.contrib.pydantic import pydantic_data_converter

from temporal.modules.blog.workflow import BlogWorkflow
from temporal.modules.blog.models import BlogWorkflowInput

# Configure logging
logger = logging.getLogger(__name__)

class TemporalClientManager:
    """Manager class for Temporal client operations"""

    def __init__(self):
        self.client: Optional[Client] = None

    async def get_client(self) -> Client:
        """Get or create Temporal client connection"""
        if self.client is None:
            self.client = await self._create_client()
        return self.client

    async def _create_client(self) -> Client:
        """Create and configure Temporal client"""
        try:
            logger.info("Connecting to Temporal server at localhost:7233")

            client = await Client.connect(
                "localhost:7233",
                data_converter=pydantic_data_converter,
            )

            logger.info("Temporal client connected successfully")
            return client

        except Exception as e:
            logger.error(f"Failed to connect to Temporal server: {e}")
            raise

    async def start_blog_workflow(self, workflow_input: BlogWorkflowInput) -> Dict[str, Any]:
        """
        Start a blog workflow and wait for its completion

        Args:
            workflow_input: Input data for the blog workflow

        Returns:
            Dict containing the workflow result
        """
        try:
            client = await self.get_client()

            # Generate unique workflow ID
            workflow_id = f"blog-workflow-{workflow_input.title.replace(' ', '-').lower()}"
            if workflow_input.blog_id:
                workflow_id += f"-{workflow_input.blog_id}"

            # Add timestamp for uniqueness
            import time
            workflow_id += f"-{int(time.time())}"

            logger.info(f"Starting workflow with ID: {workflow_id}")

            # Start the workflow
            handle = await client.start_workflow(
                BlogWorkflow.run,
                workflow_input,
                id=workflow_id,
                task_queue="openai-agents-task-queue",
            )

            logger.info(f"Workflow started, waiting for completion: {workflow_id}")

            # Wait for workflow completion
            result = await handle.result()

            logger.info(f"Workflow completed successfully: {workflow_id}")
            return result

        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            raise

    async def start_blog_creation_workflow(self, blog_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Start a new blog creation workflow

        Args:
            blog_data: Blog creation data matching the specified format

        Returns:
            Dict containing the workflow result
        """
        workflow_input = BlogWorkflowInput(
            title=blog_data["title"],
            description=blog_data["description"],
            desired_tone=blog_data["desired_tone"],
            seo_keywords=blog_data["seo_keywords"],
            target_audience=blog_data["target_audience"],
            blog_length_min=blog_data["blog_length_min"],
            blog_length_max=blog_data["blog_length_max"],
            user_id=blog_data["user_id"],
            blog_id=None,  # New blog
            user_message=None,
        )

        return await self.start_blog_workflow(workflow_input)

    async def start_message_workflow(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Start a message workflow for existing blog

        Args:
            message_data: Message data matching the specified format

        Returns:
            Dict containing the workflow result
        """
        workflow_input = BlogWorkflowInput(
            title=message_data["title"],
            description=message_data["description"],
            desired_tone=message_data["desired_tone"],
            seo_keywords=message_data["seo_keywords"],
            target_audience=message_data["target_audience"],
            blog_length_min=message_data["blog_length_min"],
            blog_length_max=message_data["blog_length_max"],
            user_id=message_data["user_id"],
            blog_id=message_data["blog_id"],
            user_message=message_data["user_message"],
            user_selected_context=message_data["user_selected_context"],
        )

        return await self.start_blog_workflow(workflow_input)

# Global instance for easy access
temporal_client_manager = TemporalClientManager()

# Helper functions for easy use
async def start_blog_creation_workflow(blog_data: Dict[str, Any]) -> Dict[str, Any]:
    """Helper function to start blog creation workflow"""
    return await temporal_client_manager.start_blog_creation_workflow(blog_data)

async def start_message_workflow(message_data: Dict[str, Any]) -> Dict[str, Any]:
    """Helper function to start message workflow"""
    return await temporal_client_manager.start_message_workflow(message_data)
