from rest_framework.serializers import ValidationError
from rest_framework import serializers
from ..models import StoreLayout, Component

class ComponentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='component_id')
    categories = serializers.ListField(
        child=serializers.CharField(), required=False, default=[]
    )
    class Meta:
        model = Component
        fields = [
            'id', 'type', 'position_x', 'position_y',
            'width', 'height','categories','rotation'
        ]

class StoreLayoutSerializer(serializers.ModelSerializer):
    items = ComponentSerializer(many=True,source='components')
    gridSize = serializers.IntegerField(source='grid_size')
    lastModified = serializers.DateTimeField(source='last_modified')

    class Meta:
        model = StoreLayout
        fields = ['id','gridSize', 'lastModified', 'items','store']
        extra_kwargs = {
            'store': {'read_only': True}
        }
        
    def update(self, instance, validated_data):
        components_data = validated_data.pop('components', [])
        instance.grid_size = validated_data.get('grid_size', instance.grid_size)
        if instance.grid_size < 0:
            raise ValidationError("Enter a Positive Inetegr number!") 
        instance.save()

        # Remove existing components to allow a full update
        instance.components.all().delete()

        # Create new components
        for component_data in components_data:
            Component.objects.create(layout=instance, **component_data)
        return instance