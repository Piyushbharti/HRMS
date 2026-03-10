import re
from rest_framework import serializers
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department']

    def validate_employee_id(self, value):
        if not re.match(r'^[A-Za-z0-9_-]+$', value):
            raise serializers.ValidationError(
                'Employee ID must contain only letters, numbers, underscores, and hyphens'
            )
        return value

    def validate_email(self, value):
        # On update, exclude self
        instance = self.instance
        qs = Employee.objects.filter(email=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Email {value} already exists")
        return value

    def validate_employee_id_unique(self, value):
        instance = self.instance
        qs = Employee.objects.filter(employee_id=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Employee ID {value} already exists")
        return value


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'employee_id', 'date', 'status']

    def to_representation(self, instance):
        """Convert stored uppercase PRESENT/ABSENT back to Present/Absent for frontend."""
        data = super().to_representation(instance)
        status_map = {'PRESENT': 'Present', 'ABSENT': 'Absent'}
        data['status'] = status_map.get(data['status'], data['status'].capitalize())
        return data

    def validate_status(self, value):
        # Normalise to uppercase so 'Present', 'present', 'PRESENT' all work
        normalised = value.strip().upper()
        allowed = ['PRESENT', 'ABSENT']
        if normalised not in allowed:
            raise serializers.ValidationError(
                f"Status must be one of: Present, Absent"
            )
        return normalised

    def validate(self, data):
        employee_id = data.get('employee_id')
        date = data.get('date')

        # Check employee exists
        if not Employee.objects.filter(employee_id=employee_id).exists():
            raise serializers.ValidationError(
                {'employee_id': f"Employee with ID {employee_id} not found"}
            )

        # Check duplicate attendance (user-friendly message)
        qs = Attendance.objects.filter(employee_id=employee_id, date=date)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {'detail': f"Attendance already marked for employee {employee_id} on {date}"}
            )

        return data


class EmployeeWithAttendanceSerializer(serializers.ModelSerializer):
    attendance_records = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'attendance_records']

    def get_attendance_records(self, obj):
        records = Attendance.objects.filter(employee_id=obj.employee_id)
        return AttendanceSerializer(records, many=True).data
