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

# Set default whitelist (can be overridden by Railway variables)
ENV WHITELISTED_EMAILS="dtle82@gmail.com,johnnynguyen9299@yahoo.com"
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check - restart container if /health stops responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

# Run the server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
