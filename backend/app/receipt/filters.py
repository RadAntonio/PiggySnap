import django_filters
from core.models import Receipt
from django.db.models import Count, Q
from django.utils.timezone import now
from datetime import timedelta

class ReceiptFilter(django_filters.FilterSet):
    min_total = django_filters.NumberFilter(field_name="total", lookup_expr='gte')
    max_total = django_filters.NumberFilter(field_name="total", lookup_expr='lte')
    shop_name = django_filters.CharFilter(field_name="shop_name", lookup_expr='icontains')
    tags = django_filters.CharFilter(method='filter_by_tags')
    last_7_days = django_filters.BooleanFilter(method='filter_last_7_days')
    last_x_days = django_filters.NumberFilter(method='filter_last_x_days')
    exact_total = django_filters.NumberFilter(field_name="total", lookup_expr="exact")
    start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    month = django_filters.NumberFilter(method='filter_by_month')


    class Meta:
        model = Receipt
        fields = [
            'min_total',
            'max_total',
            'shop_name',
            'tags',
            'last_7_days',
            'last_x_days',
            'exact_total',
            'start_date',
            'end_date',
            'month',
        ]

    def filter_by_tags(self, queryset, name, value):
        tag_names = [tag.strip() for tag in value.split(',') if tag.strip()]
        tag_count = len(tag_names)

        queryset = queryset.filter(tags__name__in=tag_names)

        queryset = queryset.annotate(matching_tag_count=Count('tags', filter=Q(tags__name__in=tag_names), distinct=True))

        return queryset.filter(matching_tag_count=tag_count)

    def filter_last_7_days(self, queryset, name, value):
        if value:
            seven_days_ago = now() - timedelta(days=7)
            return queryset.filter(date__gte=seven_days_ago)
        return queryset

    def filter_last_x_days(self, queryset, name, value):
        if value:
            x_days_ago = now() - timedelta(days=int(value))
            return queryset.filter(date__gte=x_days_ago)
        return queryset

    def filter_by_month(self, queryset, name, value):
        return queryset.filter(date__month=int(value))
