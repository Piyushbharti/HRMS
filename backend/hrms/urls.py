from django.urls import path
from .views import (
    RootView,
    HealthView,
    EmployeeListView,
    EmployeeDetailView,
    AttendanceCreateView,
    AttendanceByEmployeeView,
    AttendanceByDateView,
)

urlpatterns = [
    # Health
    path('', RootView.as_view(), name='root'),
    path('health/', HealthView.as_view(), name='health'),

    # Employees
    path('employees/', EmployeeListView.as_view(), name='employee-list'),
    path('employees/<str:employee_id>/', EmployeeDetailView.as_view(), name='employee-detail'),

    # Attendance
    path('attendance/', AttendanceCreateView.as_view(), name='attendance-create'),
    path('attendance/employee/<str:employee_id>/', AttendanceByEmployeeView.as_view(), name='attendance-by-employee'),
    path('attendance/date/<str:attendance_date>/', AttendanceByDateView.as_view(), name='attendance-by-date'),
]
