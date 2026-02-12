# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the Python server file
COPY server.py .

# Create empty data.json file
RUN echo '{}' > data.json

# Expose port (Railway will override with PORT env var)
EXPOSE 8080

# Run the server
CMD ["python3", "server.py"]
