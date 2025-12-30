import time
import functools
import logging
import os
from typing import Callable, Any

logger = logging.getLogger("performance")
logger.setLevel(logging.INFO)

# Setup logging handler if enabled
if os.getenv("ENABLE_PERFORMANCE_LOGGING", "false").lower() == "true":
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "performance.log")
    
    # File Handler
    file_handler = logging.FileHandler(log_file)
    formatter = logging.Formatter('%(asctime)s - %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Ensure propogation doesn't duplicate logs if root logger captures them
    logger.propagate = False

def monitor_performance(func: Callable) -> Callable:
    """
    Decorator to log execution time of a function.
    Enabled only if ENABLE_PERFORMANCE_LOGGING env var is set to "true".
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        if os.getenv("ENABLE_PERFORMANCE_LOGGING", "false").lower() != "true":
            return func(*args, **kwargs)
            
        start_time = time.time()
        result = func(*args, **kwargs)
        duration_ms = (time.time() - start_time) * 1000
        
        logger.info(f"[PERF] {func.__module__}.{func.__name__} executed in {duration_ms:.2f}ms")
        return result
        
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs) -> Any:
        if os.getenv("ENABLE_PERFORMANCE_LOGGING", "false").lower() != "true":
            return await func(*args, **kwargs)
            
        start_time = time.time()
        result = await func(*args, **kwargs)
        duration_ms = (time.time() - start_time) * 1000
        
        logger.info(f"[PERF] {func.__module__}.{func.__name__} executed in {duration_ms:.2f}ms")
        return result

    import asyncio
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return wrapper
