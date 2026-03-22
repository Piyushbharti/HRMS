import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms_backend.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # 1. Drop FK constraint that references employees.id (integer)
    print("Dropping FK constraint fk_employee...")
    cursor.execute("ALTER TABLE attendance DROP CONSTRAINT IF EXISTS fk_employee")
    connection.connection.commit()

    # 2. Alter column type
    print("Altering attendance.employee_id to varchar(50)...")
    cursor.execute("ALTER TABLE attendance ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::text")
    connection.connection.commit()

    # 3. Verify
    cursor.execute("""
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name='attendance'
        ORDER BY ordinal_position
    """)
    print("=== attendance table (after fix) ===")
    for row in cursor.fetchall():
        print(row)

    # 4. Show existing data
    cursor.execute("SELECT * FROM attendance LIMIT 5")
    print("\n=== existing attendance rows ===")
    for row in cursor.fetchall():
        print(row)

print("Done!")
