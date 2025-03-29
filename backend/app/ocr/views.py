import cv2
import numpy as np
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import OCRUploadSerializer
from paddleocr import PaddleOCR
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter, OpenApiTypes
from rest_framework import status
import spacy
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions
import re
from rest_framework.decorators import authentication_classes, permission_classes


nlp = spacy.load("ocr/marius_ner_model")

def order_points(pts):
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

@extend_schema(
    request=OCRUploadSerializer,
    responses={200: OpenApiTypes.OBJECT},
    description="Upload a receipt image to extract OCR text.",
)
@api_view(['POST'])
@parser_classes([MultiPartParser])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def ocr_receipt(request):
    ocr_model = PaddleOCR(use_angle_cls=True, lang='en')
    serializer = OCRUploadSerializer(data=request.data)
    if serializer.is_valid():
        image_file = serializer.validated_data['image']

        file_bytes = np.asarray(bytearray(image_file.read()), dtype=np.uint8)
        image1 = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        img_gray = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(img_gray, (5, 5), 0)
        _, binary_image = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        contours, _ = cv2.findContours(image=binary_image, mode=cv2.RETR_TREE, method=cv2.CHAIN_APPROX_NONE)
        if not contours:
            return Response({"error": "No contours found"}, status=400)

        largest_contour = max(contours, key=cv2.contourArea)
        epsilon = 0.02 * cv2.arcLength(largest_contour, True)
        approx = cv2.approxPolyDP(largest_contour, epsilon, True)

        if len(approx) != 4:
            return Response({"error": "Receipt contour not detected"}, status=400)

        points = approx.reshape(4, 2)
        ordered_points = order_points(points)

        (tl, tr, br, bl) = ordered_points
        width_top = np.linalg.norm(tr - tl)
        width_bottom = np.linalg.norm(br - bl)
        max_width = max(int(width_top), int(width_bottom))

        height_left = np.linalg.norm(tl - bl)
        height_right = np.linalg.norm(tr - br)
        max_height = max(int(height_left), int(height_right))

        dst = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype="float32")

        M = cv2.getPerspectiveTransform(ordered_points, dst)
        warped = cv2.warpPerspective(image1, M, (max_width, max_height))

        result = ocr_model.ocr(warped, cls=True)
        lines = []
        for line in result:
            line_text = " ".join([word_info[1][0] for word_info in line])
            lines.append(line_text)

        ocr_text = "\n".join(lines)

        entities = extract_data_from_receipt(ocr_text)
        entitiesStructured = format_ner_entities(entities)


        return Response({
            "ocr_text": ocr_text,
            "entities": entities,
            "entitiesStructured": entitiesStructured,
            })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def extract_data_from_receipt(text):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]

def split_quantity_string(quantity_string):
    cleaned = quantity_string.replace(',', '.').replace(' ', '')
    pattern = r"^([\d.]+)[A-Za-z\-]*[^\d]*([\d.]+)$"
    match = re.match(pattern, cleaned)
    if match:
        quantity = match.group(1)
        unit_price = match.group(2)
        return quantity, unit_price
    return quantity_string, None

def clean_price_string(price_string):
    cleaned = price_string.replace(',', '.').replace(' ', '')
    match = re.search(r"[\d.]+", cleaned)
    if match:
        return match.group(0)
    return price_string


def format_ner_entities(entities):
    store_name = None
    items = []
    totals = []
    current_item = {}

    for text, label in entities:
        if label == "SHOPNAME" and store_name is None:
            store_name = text

        elif label == "QUANTITY":
            quantity, unit_price = split_quantity_string(text)
            current_item["quantity"] = quantity
            if unit_price:
                current_item["unit_price"] = unit_price
            else:
                current_item["unit_price"] = "Could not parse unit price"

        elif label == "PRICE":
            current_item["price"] = clean_price_string(text)

        elif label == "PRODUCT":
            current_item["name"] = text

        if all(key in current_item for key in ("name", "quantity", "price")):
            items.append(current_item)
            current_item = {}

        elif label == "TOTAL":
            totals.append(clean_price_string(text))

    # Add any leftover partial item
    if any(k in current_item for k in ("name", "quantity", "price")):
        items.append(current_item)

    return {
        "store": {"name": store_name} if store_name else {},
        "items": items,
        "total": totals[-1] if totals else None
    }
