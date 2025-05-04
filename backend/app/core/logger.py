import logging

import colorlog

from backend.app.core.config import settings

# Logging settings
LOGGING_LEVEL = int(settings.LOGLEVEL.value)
# Create a custom logger
logger = logging.getLogger(__name__)
logger.setLevel(LOGGING_LEVEL)

# Console handler with colored output
console_handler = logging.StreamHandler()
console_handler.setLevel(LOGGING_LEVEL)

# Formatter for colored output in console
colored_formatter = colorlog.ColoredFormatter(
    "%(log_color)s%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    log_colors={
        "DEBUG": "cyan",
        "INFO": "green",
        "WARNING": "yellow",
        "ERROR": "red",
        "CRITICAL": "bold_red",
    },
)

# Set the formatter for the console handler
console_handler.setFormatter(colored_formatter)

# Add the console handler to the logger
logger.addHandler(console_handler)
