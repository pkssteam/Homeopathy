from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admin can view all inventory, staff/doctors/inventory reps can see their own branch's inventory
        user = self.request.user
        if user.role == 'ADMIN' or user.is_superuser:
            return InventoryItem.objects.all().order_by('name')
        if user.hospital:
            return InventoryItem.objects.filter(hospital=user.hospital).order_by('name')
        return InventoryItem.objects.none()

    @action(detail=True, methods=['post', 'put', 'patch'])
    def adjust_stock(self, request, pk=None):
        item = self.get_object()
        stock = request.data.get('stock')
        if stock is None:
            return Response({'error': 'Please provide stock quantity.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            item.stock = int(stock)
            item.save()
            return Response(InventoryItemSerializer(item).data, status=status.HTTP_200_OK)
        except ValueError:
            return Response({'error': 'Stock must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        queryset = self.get_queryset()
        count = queryset.count()
        queryset.delete()
        return Response({'message': f'Successfully deleted {count} entries.'}, status=status.HTTP_204_NO_CONTENT)
