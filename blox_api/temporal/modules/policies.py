from datetime import timedelta
from temporalio.common import RetryPolicy

DEFAULT_ACTIVITY_OPTS = {
    "start_to_close_timeout": timedelta(minutes=1, seconds=30),
    "retry_policy": RetryPolicy(
        initial_interval=timedelta(seconds=5),
        backoff_coefficient=2.0,
        maximum_attempts=3,
    ),
}