from django.urls import path
from .views import ocr_receipt

urlpatterns = [
    path('receipt', ocr_receipt, name='ocr_receipt'),
]
