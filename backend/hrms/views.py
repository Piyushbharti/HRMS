from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Employee, Attendance
from .serializers import (
    EmployeeSerializer,
    EmployeeWithAttendanceSerializer,
    AttendanceSerializer,
)


# ---------- HEALTH ----------

class RootView(APIView):
    def get(self, request):
        return Response({"message": "HRMS Lite API running 🚀"})


class HealthView(APIView):
    def get(self, request):
        return Response({"status": "healthy"})


# ---------- EMPLOYEE ----------

class EmployeeListView(APIView):
    """
    GET  /api/employees/  — list all employees
    POST /api/employees/  — create employee
    """

    def get(self, request):
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            # Manual duplicate employee_id check (serializer unique check on model field handles it,
            # but keep explicit error message consistent with old API)
            emp_id = serializer.validated_data['employee_id']
            if Employee.objects.filter(employee_id=emp_id).exists():
                return Response(
                    {"detail": f"Employee ID {emp_id} already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        employee = self._get_employee(employee_id)
        if not employee:
            return Response(
                {"detail": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = EmployeeWithAttendanceSerializer(employee)
        return Response(serializer.data)

    def delete(self, request, employee_id):
        employee = self._get_employee(employee_id)
        if not employee:
            return Response(
                {"detail": f"Employee with ID {employee_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        # Delete attendance records first, then employee
        Attendance.objects.filter(employee_id=employee_id).delete()
        employee.delete()
        return Response({"message": "Employee deleted successfully"})


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
        records = Attendance.objects.filter(employee_id=employee_id)
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)


class AttendanceByDateView(APIView):
    """
    GET /api/attendance/date/{attendance_date}/  — get attendance by date
    """

    def get(self, request, attendance_date):
        records = Attendance.objects.filter(date=attendance_date)
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)
