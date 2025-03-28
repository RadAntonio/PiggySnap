FROM python:3.12-slim
LABEL maintainer="Toni Rad"

ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libpq-dev \
    gcc \
    g++ \
    wget \
    curl \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /py
ENV PATH="/py/bin:$PATH"

# Install Python deps
COPY ./requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && \
    pip install -r /tmp/requirements.txt

# Copy application code
COPY ./app /app
COPY ./app/ocr/marius_ner_model /app/ocr/marius_ner_model
WORKDIR /app

# Add a user (optional)
RUN useradd -m django-user
USER django-user

EXPOSE 8000
