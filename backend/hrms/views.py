from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import DatabaseError, OperationalError
from .models import Employee, Attendance
from .serializers import (
    EmployeeSerializer,
    EmployeeWithAttendanceSerializer,
    AttendanceSerializer,
)


def db_error_response(exc):
    """Return a clean 503 JSON response for database/connection errors."""
    return Response(
        {"detail": "Database is temporarily unavailable. Please try again in a moment."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


# ---------- HEALTH ----------

class RootView(APIView):
    def get(self, request):
        return Response({"message": "HRMS Lite API running 🚀"})


class HealthView(APIView):
    def get(self, request):
        try:
            # Quick DB ping
            Employee.objects.exists()
            return Response({"status": "healthy"})
        except (DatabaseError, OperationalError):
            return Response(
                {"status": "degraded", "detail": "Database unreachable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


# ---------- EMPLOYEE ----------

class EmployeeListView(APIView):
    """
    GET  /api/employees/  — list all employees
    POST /api/employees/  — create employee
    """

    def get(self, request):
        try:
            employees = Employee.objects.all()
            serializer = EmployeeSerializer(employees, many=True)
            return Response(serializer.data)
        except (DatabaseError, OperationalError) as e:
            return db_error_response(e)

    def post(self, request):
        try:
            serializer = EmployeeSerializer(data=request.data)
            if serializer.is_valid():
                emp_id = serializer.validated_data['employee_id']
                if Employee.objects.filter(employee_id=emp_id).exists():
                    return Response(
                        {"detail": f"Employee ID '{emp_id}' already exists"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except (DatabaseError, OperationalError) as e:
            return db_error_response(e)


class EmployeeDetailView(APIView):
    """
    GET    /api/employees/{employee_id}/  — get employee + attendance records
    DELETE /api/employees/{employee_id}/  — delete employee (cascades attendance)
    """

    def _get_employee(self, employee_id):
        try:
            return Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            return None

    def get(self, request, employee_id):
        try:
            employee = self._get_employee(employee_id)
            if not employee:
                return Response(
                    {"detail": "Employee not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = EmployeeWithAttendanceSerializer(employee)
            return Response(serializer.data)
        except (DatabaseError, OperationalError) as e:
            return db_error_response(e)

    def delete(self, request, employee_id):
        try:
            employee = self._get_employee(employee_id)
            if not employee:
                return Response(
                    {"detail": f"Employee with ID '{employee_id}' not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            Attendance.objects.filter(employee_id=employee_id).delete()
            employee.delete()
            return Response({"message": "Employee deleted successfully"})
        except (DatabaseError, OperationalError) as e:
            return db_error_response(e)


# ---------- ATTENDANCE ----------

class AttendanceCreateView(APIView):
    """
    POST /api/attendance/  — mark attendance
    """

    def post(self, request):
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttendanceByEmployeeView(APIView):
    """
    GET /api/attendance/employee/{employee_id}/  — get attendance by employee
    """

    def get(self, request, employee_id):
        try:
            records = Attendance.objects.filter(employee_id=employee_id)
            serializer = AttendanceSerializer(records, many=True)
            return Response(serializer.data)
        except (DatabaseError, OperationalError) as e:
            return db_error_response(e)


class AttendanceByDateView(APIView):
    """
    GET /api/attendance/date/{attendance_date}/  — get attendance by date
    """

    def get(self, request, attendance_date):
        try:
            records = Attendance.objects.filter(date=attendance_date)
            serializer = AttendanceSerializer(records, many=True)
            return Response(serializer.data)
        except (DatabaseError, OperationalError) as e:
            return db_error_response(e)
