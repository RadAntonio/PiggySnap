from rest_framework import viewsets, permissions, mixins, status
from core.models import Receipt, Tag
from .serializers import ReceiptSerializer, TagSerializer
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter, OpenApiTypes
from rest_framework.decorators import action
from rest_framework.response import Response
from .filters import ReceiptFilter
from django_filters.rest_framework import DjangoFilterBackend


@extend_schema(
    request=ReceiptSerializer,
    responses=ReceiptSerializer,
    description="Create a receipt entry.",
    parameters=[
        OpenApiParameter("min_total", OpenApiTypes.FLOAT, OpenApiParameter.QUERY),
        OpenApiParameter("max_total", OpenApiTypes.FLOAT, OpenApiParameter.QUERY),
        OpenApiParameter("shop_name", OpenApiTypes.STR, OpenApiParameter.QUERY),
        OpenApiParameter("tags", OpenApiTypes.STR, OpenApiParameter.QUERY),
        OpenApiParameter('last_7_days', OpenApiTypes.BOOL, OpenApiParameter.QUERY),
        OpenApiParameter('last_x_days', OpenApiTypes.INT, OpenApiParameter.QUERY),
        OpenApiParameter('exact_total', OpenApiTypes.FLOAT, OpenApiParameter.QUERY),
        OpenApiParameter('start_date', OpenApiTypes.DATE, OpenApiParameter.QUERY),
        OpenApiParameter('end_date', OpenApiTypes.DATE, OpenApiParameter.QUERY),
        OpenApiParameter('month', OpenApiTypes.INT, OpenApiParameter.QUERY),
        OpenApiParameter('day_of_month', OpenApiTypes.INT, OpenApiParameter.QUERY),
        OpenApiParameter('year', OpenApiTypes.INT, OpenApiParameter.QUERY),
    ]
)
class ReceiptViewSet(mixins.ListModelMixin,
                     mixins.CreateModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.DestroyModelMixin,
                     viewsets.GenericViewSet):
    serializer_class = ReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ReceiptFilter

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class TagViewSet(mixins.ListModelMixin,
                 mixins.CreateModelMixin,
                 mixins.UpdateModelMixin,
                 mixins.DestroyModelMixin,
                 viewsets.GenericViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
