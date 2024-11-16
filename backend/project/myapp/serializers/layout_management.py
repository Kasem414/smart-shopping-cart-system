from rest_framework import serializers
from ..models import StoreLayout, Component

class ComponentSerializer(serializers.ModelSerializer):
    categories = serializers.ListField(
        child=serializers.CharField(), required=False, default=[]
    )

    class Meta:
        model = Component
        fields = [
            'component_id', 'type', 'position_x', 'position_y',
            'width', 'height', 'categories'
        ]

class StoreLayoutSerializer(serializers.ModelSerializer):
    components = ComponentSerializer(many=True)

    class Meta:
        model = StoreLayout
        fields = ['grid_size', 'last_modified', 'components']

    def update(self, instance, validated_data):
        components_data = validated_data.pop('components', [])
        instance.grid_size = validated_data.get('grid_size', instance.grid_size)
        instance.save()

        # Remove existing components to allow a full update
        instance.components.all().delete()

        # Create new components
        for component_data in components_data:
            Component.objects.create(layout=instance, **component_data)
        return instance