from django.db import models


class AttendanceStatus(models.TextChoices):
    PRESENT = 'PRESENT', 'Present'
    ABSENT = 'ABSENT', 'Absent'


class Employee(models.Model):
    employee_id = models.CharField(max_length=50, unique=True, db_index=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    department = models.CharField(max_length=100)

    class Meta:
        db_table = 'employees'

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"


class Attendance(models.Model):
    employee_id = models.CharField(max_length=50, db_index=True)
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        # No choices= here — serializer validate_status handles validation & normalisation
    )

    class Meta:
        db_table = 'attendance'
        # unique_together enforced at DB level; handled manually in serializer
        # for user-friendly error messages

    def __str__(self):
        return f"{self.employee_id} - {self.date} - {self.status}"
