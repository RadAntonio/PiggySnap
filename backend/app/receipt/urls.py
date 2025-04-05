from django.urls import path, include
from rest_framework.routers import DefaultRouter
from receipt.views import ReceiptViewSet, TagViewSet

urlpatterns = [
    path('create', ReceiptViewSet.as_view({'post': 'create'}), name='create'),
    path('list', ReceiptViewSet.as_view({'get': 'list'}), name='list'),
    path('partial_update/<int:pk>', ReceiptViewSet.as_view({'patch': 'partial_update'}), name='partial_update'),
    path('delete/<int:pk>', ReceiptViewSet.as_view({'delete': 'destroy'}), name='delete'),
    path('tags/list', TagViewSet.as_view({'get': 'list'}), name='list'),
    path('tags/create', TagViewSet.as_view({'post': 'create'}), name='create'),
    path('tags/update/<int:pk>', TagViewSet.as_view({'patch': 'partial_update'}), name='partial_update'),
    path('tags/delete/<int:pk>', TagViewSet.as_view({'delete': 'destroy'}), name='delete'),
]