from rest_framework import serializers
from core.models import Receipt, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ReceiptSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)
    date = serializers.DateTimeField(format="%Y-%m-%d",  input_formats=["%Y-%m-%d"])
    class Meta:
        model = Receipt
        fields = ['id', 'shop_name', 'items', 'total', 'date', 'tags']
        #read_only_fields = ['date']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        receipt = Receipt.objects.create(**validated_data)

        for tag in tags_data:
            tag_obj, _ = Tag.objects.get_or_create(name=tag['name'], user=self.context['request'].user)
            receipt.tags.add(tag_obj)

        return receipt

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        instance = super().update(instance, validated_data)

        if tags_data is not None:
            instance.tags.clear()
            for tag in tags_data:
                tag_obj, _ = Tag.objects.get_or_create(
                    name=tag['name'],
                    user=self.context['request'].user
                )
                instance.tags.add(tag_obj)

        return instance

