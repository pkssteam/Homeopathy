from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Hospital
from .serializers import HospitalSerializer
from core.permissions.permissions import IsAdminOrReadOnly

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all().order_by('-created_at')
    serializer_class = HospitalSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        Hospital.objects.all().delete()
        return Response({'message': 'All hospital locations deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
