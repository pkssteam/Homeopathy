from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.hospitals.urls')),
    path('api/', include('apps.appointments.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/', include('apps.consultations.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
