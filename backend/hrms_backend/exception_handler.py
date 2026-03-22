from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import DatabaseError, OperationalError, IntegrityError


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler.
    - Handles DB/connection errors with a clean 503 response.
    - Falls back to default DRF handler for all other exceptions.
    """
    # IntegrityError (e.g. unique constraint) → 400, not 503
    if isinstance(exc, IntegrityError):
        return Response(
            {"detail": "Duplicate record — attendance may already be marked for this employee on this date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Real DB/connection errors → 503
    if isinstance(exc, (OperationalError, DatabaseError)):
        return Response(
            {"detail": "Database is temporarily unavailable. Please try again in a moment."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # Let DRF handle all other exceptions normally
    response = exception_handler(exc, context)

    # If DRF returns None, it means it's an unhandled exception → return 500 with safe message
    if response is None:
        return Response(
            {"detail": "An unexpected server error occurred. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
