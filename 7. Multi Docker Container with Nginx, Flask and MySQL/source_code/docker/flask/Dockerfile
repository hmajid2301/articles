# Base Image
FROM python:3.6-alpine as BASE

RUN apk add --no-cache linux-headers g++ postgresql-dev gcc build-base linux-headers ca-certificates python3-dev libffi-dev libressl-dev libxslt-dev
RUN pip wheel --wheel-dir=/root/wheels psycopg2
RUN pip wheel --wheel-dir=/root/wheels cryptography

# Actual Image
FROM python:3.6-alpine as RELEASE

EXPOSE 8080
WORKDIR /app 

ENV POSTGRES_USER="" POSTGRES_PASSWORD="" POSTGRES_HOST=postgres POSTGRES_PORT=5432 POSTGRES_DB=""

COPY dist/ ./dist/
COPY docker/flask/uwsgi.ini ./
COPY --from=BASE /root/wheels /root/wheels

RUN apk add --no-cache build-base linux-headers postgresql-dev pcre-dev libpq uwsgi-python3 && \
    pip install --no-index --find-links=/root/wheels /root/wheels/* && \
    pip install dist/*

CMD ["uwsgi", "--ini", "/app/uwsgi.ini"]