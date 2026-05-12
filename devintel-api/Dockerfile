FROM python:3.12-slim

RUN apt-get update && apt-get install -y git

WORKDIR /app

# Install dependencies first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:socket_app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
