from django.urls import path
from .views import ocr_receipt

urlpatterns = [
    path('extraction', ocr_receipt, name='ocr_receipt'),
]
