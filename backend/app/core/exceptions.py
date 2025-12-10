"""
Custom exceptions and global error handling for Knowledge Shadows API.
"""
import logging
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

logger = logging.getLogger(__name__)


class KnowledgeShadowsException(Exception):
    """Base exception for Knowledge Shadows application."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ResourceNotFoundError(KnowledgeShadowsException):
    """Raised when a requested resource is not found."""

    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "id": resource_id}
        )


class PermissionDeniedError(KnowledgeShadowsException):
    """Raised when user doesn't have permission to access a resource."""

    def __init__(self, message: str = "You don't have permission to perform this action"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN
        )


class InvalidOperationError(KnowledgeShadowsException):
    """Raised when an operation is invalid for the current state."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ExternalServiceError(KnowledgeShadowsException):
    """Raised when an external service (OpenAI, Anthropic) fails."""

    def __init__(self, service: str, message: str):
        super().__init__(
            message=f"{service} service error: {message}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details={"service": service}
        )


class RateLimitError(KnowledgeShadowsException):
    """Raised when rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS
        )


def create_error_response(
    status_code: int,
    message: str,
    error_type: str,
    details: Optional[Dict[str, Any]] = None
) -> JSONResponse:
    """Create a standardized error response."""
    content = {
        "error": {
            "type": error_type,
            "message": message,
            "status_code": status_code,
        }
    }
    if details:
        content["error"]["details"] = details

    return JSONResponse(status_code=status_code, content=content)


def setup_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers with the FastAPI app."""

    @app.exception_handler(KnowledgeShadowsException)
    async def knowledge_shadows_exception_handler(
        request: Request,
        exc: KnowledgeShadowsException
    ) -> JSONResponse:
        """Handle custom application exceptions."""
        logger.warning(
            f"Application error: {exc.message}",
            extra={"path": request.url.path, "details": exc.details}
        )
        return create_error_response(
            status_code=exc.status_code,
            message=exc.message,
            error_type=exc.__class__.__name__,
            details=exc.details
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError
    ) -> JSONResponse:
        """Handle request validation errors with user-friendly messages."""
        errors = []
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            errors.append({
                "field": field,
                "message": error["msg"],
                "type": error["type"]
            })

        logger.info(
            f"Validation error on {request.url.path}",
            extra={"errors": errors}
        )

        return create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message="Invalid request data",
            error_type="ValidationError",
            details={"validation_errors": errors}
        )

    @app.exception_handler(ValidationError)
    async def pydantic_validation_handler(
        request: Request,
        exc: ValidationError
    ) -> JSONResponse:
        """Handle Pydantic validation errors."""
        errors = []
        for error in exc.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            errors.append({
                "field": field,
                "message": error["msg"]
            })

        return create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message="Data validation failed",
            error_type="ValidationError",
            details={"validation_errors": errors}
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(
        request: Request,
        exc: IntegrityError
    ) -> JSONResponse:
        """Handle database integrity errors (e.g., unique constraint violations)."""
        logger.error(f"Database integrity error: {exc}", exc_info=True)

        # Check for common constraint violations
        error_str = str(exc.orig).lower()
        if "unique" in error_str:
            message = "A record with this value already exists"
        elif "foreign key" in error_str:
            message = "Referenced record does not exist"
        elif "not null" in error_str:
            message = "Required field is missing"
        else:
            message = "Database constraint violation"

        return create_error_response(
            status_code=status.HTTP_409_CONFLICT,
            message=message,
            error_type="IntegrityError"
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(
        request: Request,
        exc: SQLAlchemyError
    ) -> JSONResponse:
        """Handle general SQLAlchemy database errors."""
        logger.error(f"Database error: {exc}", exc_info=True)

        return create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="A database error occurred. Please try again later.",
            error_type="DatabaseError"
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request,
        exc: Exception
    ) -> JSONResponse:
        """Catch-all handler for unhandled exceptions."""
        logger.error(
            f"Unhandled exception on {request.method} {request.url.path}: {exc}",
            exc_info=True
        )

        # Don't expose internal error details in production
        return create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An unexpected error occurred. Please try again later.",
            error_type="InternalServerError"
        )
