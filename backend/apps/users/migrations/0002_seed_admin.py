from django.db import migrations

def create_default_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    if not User.objects.filter(email='admin@homeopathy.com').exists():
        from django.contrib.auth.hashers import make_password
        admin = User.objects.create(
            email='admin@homeopathy.com',
            full_name='System Admin',
            role='ADMIN',
            is_active=True,
            is_staff=True,
            is_superuser=True,
            password=make_password('password123')
        )
        admin.save()

def remove_default_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(email='admin@homeopathy.com').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, remove_default_admin),
    ]
