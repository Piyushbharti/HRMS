import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms_backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

# Check attendance table schema
cursor.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name='attendance'
    ORDER BY ordinal_position
""")
print("=== attendance table ===")
for row in cursor.fetchall():
    print(row)

cursor.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name='employees'
    ORDER BY ordinal_position
""")
print("=== employees table ===")
for row in cursor.fetchall():
    print(row)
