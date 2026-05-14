FROM python:3.10-slim

# Install system dependencies for OpenCV and multimedia decoding (FFmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the python api module
COPY api/ ./api/

# Start the FastAPI server using Uvicorn
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "10000"]
