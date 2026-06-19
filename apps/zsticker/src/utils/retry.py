import time
from functools import wraps
from src.utils.logger import get_logger

logger = get_logger(__name__)

def retry(times=5, delay=1, backoff=2, exceptions=(Exception,)):
    """
    Retry with exponential backoff.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    logger.warning(f"Attempt {attempt + 1}/{times} failed for {func.__name__}: {e}")
                    if attempt == times - 1:
                        raise
                    time.sleep(current_delay)
                    current_delay *= backoff
            return func(*args, **kwargs)
        return wrapper
    return decorator
