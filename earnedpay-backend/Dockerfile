# Using Python 3.11 to ensure compatibility with pre-built wheels for pydantic and others
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application using gunicorn with uvicorn workers
# We use shell form to allow variable expansion if needed, but array form is safer.
# We'll use a common pattern compatible with Render's expectation of $PORT.
CMD ["sh", "-c", "gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:${PORT:-8000}"]
