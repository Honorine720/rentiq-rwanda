"""
Logging Utility for RentIQ Rwanda API
Configures structured logging with console and optional file handlers.
"""

import logging
import os
from pathlib import Path
from typing import Optional


def configure_logging(
    log_level: int = logging.INFO,
    file_log_level: int = logging.DEBUG,
    log_dir: str = "./logs",
    log_file: str = "app.log",
    console: bool = True,
    file: bool = False,
) -> logging.Logger:
    """
    Configure the root logger with structured formatting.

    Format: '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s'

    Args:
        log_level: Log level for console handler (default: INFO).
        file_log_level: Log level for file handler (default: DEBUG).
        log_dir: Directory for log files (default: ./logs).
        log_file: Name of the log file (default: app.log).
        console: Enable console handler (default: True).
        file: Enable file handler (default: False).

    Returns:
        The configured root logger.
    """
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    formatter = logging.Formatter(fmt=log_format, datefmt=date_format)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)  # Capture all levels; handlers control output

    # Remove existing handlers to avoid duplicates on re-configuration
    root_logger.handlers.clear()

    # Console handler (INFO level by default)
    if console:
        console_handler = logging.StreamHandler()
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

    # File handler (DEBUG level by default, creates logs directory)
    if file:
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(
            filename=log_path / log_file,
            mode="a",
            encoding="utf-8",
        )
        file_handler.setLevel(file_log_level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    # Quiet down noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("matplotlib").setLevel(logging.WARNING)
    logging.getLogger("PIL").setLevel(logging.WARNING)

    return root_logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a named logger instance.

    Convenience wrapper around logging.getLogger(name) so callers
    don't need to import logging directly.

    Args:
        name: The logger name (typically __name__).

    Returns:
        A logger instance with the given name.
    """
    return logging.getLogger(name)


def get_access_logger() -> logging.Logger:
    """
    Get a logger dedicated to access/request logging.

    Returns:
        Logger named 'rentiq.access'.
    """
    return logging.getLogger("rentiq.access")


def get_error_logger() -> logging.Logger:
    """
    Get a logger dedicated to error logging.

    Returns:
        Logger named 'rentiq.error'.
    """
    return logging.getLogger("rentiq.error")


# Auto-configure on first import with safe defaults (console only, INFO level)
if not logging.getLogger().handlers:
    configure_logging(console=True, file=False)