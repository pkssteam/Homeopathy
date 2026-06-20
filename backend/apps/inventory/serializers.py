from rest_framework import serializers
from .models import InventoryItem
from apps.hospitals.serializers import HospitalSerializer

class InventoryItemSerializer(serializers.ModelSerializer):
    hospital_name = serializers.ReadOnlyField(source='hospital.hospital_name')
    branch_name = serializers.ReadOnlyField(source='hospital.branch_name')

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'hospital', 'hospital_name', 'branch_name',
            'name', 'category', 'stock', 'unit', 'price', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
