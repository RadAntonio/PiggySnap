from rest_framework import viewsets, permissions, mixins, status
from core.models import Receipt, Tag
from .serializers import ReceiptSerializer, TagSerializer
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter, OpenApiTypes
from rest_framework.decorators import action
from rest_framework.response import Response
from .filters import ReceiptFilter
from django_filters.rest_framework import DjangoFilterBackend

from io import BytesIO, StringIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.core.mail import EmailMessage
import textwrap
from datetime import datetime
from PyPDF2 import PdfReader, PdfWriter

import csv
from django.http import HttpResponse
import pyzipper


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

    @action(detail=False, methods=['post'], url_path='send-pdf', permission_classes=[permissions.IsAuthenticated])
    @extend_schema(  # re-use the same query-param docs if you want
      parameters=[
        OpenApiParameter('start_date', OpenApiTypes.DATE, OpenApiParameter.QUERY),
        OpenApiParameter('end_date',   OpenApiTypes.DATE, OpenApiParameter.QUERY),
      ],
      request=None,
      responses=OpenApiTypes.NONE,
    )
    def send_pdf(self, request):
        receipts = self.filter_queryset(self.get_queryset())
        if not receipts.exists():
            return Response({'detail': 'No receipts found.'}, status=status.HTTP_404_NOT_FOUND)

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        w, h = A4
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawCentredString(w/2, h-50, f"Receipts for {request.user.email}")
        y = h - 80
        pdf.setFont("Helvetica", 12)
        for i, r in enumerate(receipts, start=1):
            pdf.drawString(50, y, f"{i}. {r.shop_name} | {r.date:%Y-%m-%d} | RON{r.total:.2f}")
            y -= 20
            if getattr(r, 'items', None):
                pdf.setFont("Helvetica-Bold", 10)
                pdf.drawString(70, y, "Product")
                pdf.drawString(250, y, "Qty")
                pdf.drawString(300, y, "Unit Price")
                pdf.drawString(400, y, "Price")
                y -= 14
                pdf.setFont("Helvetica", 10)
                for itm in r.items:
                    name = itm.get('name', '')
                    qty = itm.get('quantity', '')
                    up = itm.get('unit_price', 0)
                    lp = itm.get('price', 0)
                    pdf.drawString(70, y, str(name))
                    pdf.drawString(250, y, str(qty))
                    pdf.drawString(300, y, f"RON{up:.2f}")
                    pdf.drawString(400, y, f"RON{lp:.2f}")
                    y -= 14
                    if y < 50:
                        pdf.showPage()
                        pdf.setFont("Helvetica-Bold", 10)
                        y = h - 50
                        pdf.drawString(70, y, "Product")
                        pdf.drawString(250, y, "Qty")
                        pdf.drawString(300, y, "Unit Price")
                        pdf.drawString(400, y, "Price")
                        y -= 14
                        pdf.setFont("Helvetica", 10)
                y -= 10
                pdf.setFont("Helvetica", 12)
            if y < 50:
                pdf.showPage()
                pdf.setFont("Helvetica", 12)
                y = h - 50
        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        reader = PdfReader(buffer)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        pw = request.query_params.get('pdf_password', 'piggysnap')
        if pw:
            writer.encrypt(user_pwd=pw)
        enc_buffer = BytesIO()
        writer.write(enc_buffer)
        enc_buffer.seek(0)

        email = EmailMessage(
            subject="Your Password Protected Receipts PDF",
            body="Attached is a password-protected PDF with your receipts.",
            to=[request.user.email],
        )
        email.attach("receipts.pdf", enc_buffer.getvalue(), "application/pdf")
        email.send(fail_silently=False)

        return Response({'detail': 'Encrypted PDF emailed successfully.'}, status=status.HTTP_200_OK)

    @extend_schema(
        responses={200: OpenApiTypes.NONE},
        request=None,
        description="Generate a CSV of all filtered receipts and email it as an attachment."
    )
    @action(detail=False, methods=['post'], url_path='send-csv', permission_classes=[permissions.IsAuthenticated])
    def send_csv(self, request):
        """Generate an encrypted ZIP containing the CSV of filtered receipts/items and email it."""
        receipts = self.filter_queryset(self.get_queryset())
        if not receipts.exists():
            return Response({'detail': 'No receipts found.'}, status=status.HTTP_404_NOT_FOUND)

        # Build CSV text
        csv_buffer = StringIO()
        writer = csv.writer(csv_buffer)
        writer.writerow(["Receipt ID", "Shop", "Date", "Total", "Product", "Qty", "Unit Price", "Price"])
        for r in receipts:
            items = getattr(r, 'items', []) or []
            if items:
                for itm in items:
                    writer.writerow([
                        r.id,
                        r.shop_name,
                        r.date.strftime("%Y-%m-%d"),
                        f"{r.total:.2f}",
                        itm.get('name', ''),
                        itm.get('quantity', ''),
                        f"{itm.get('unit_price', 0):.2f}",
                        f"{itm.get('price', 0):.2f}"
                    ])
            else:
                writer.writerow([r.id, r.shop_name, r.date.strftime("%Y-%m-%d"), f"{r.total:.2f}", "", "", "", ""])
            writer.writerow([])
        csv_data = csv_buffer.getvalue().encode()

        # Encrypt CSV in ZIP
        csv_pw = request.query_params.get('csv_password', 'piggysnap')
        zip_buffer = BytesIO()
        with pyzipper.AESZipFile(zip_buffer, 'w', compression=pyzipper.ZIP_DEFLATED, encryption=pyzipper.WZ_AES) as zf:
            if csv_pw:
                zf.setpassword(csv_pw.encode())
            zf.writestr('receipts.csv', csv_data)
        zip_buffer.seek(0)

        # Send email with encrypted ZIP
        email = EmailMessage(
            subject="Your Encrypted Receipts CSV",
            body="Attached is a password-protected ZIP containing your receipts CSV.",
            to=[request.user.email],
        )
        email.attach("receipts.zip", zip_buffer.getvalue(), "application/zip")
        email.send(fail_silently=False)
        return Response({'detail': 'Encrypted CSV emailed successfully.'}, status=status.HTTP_200_OK)



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
