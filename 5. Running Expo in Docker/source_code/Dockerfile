FROM node:latest
LABEL version=1.2.1

ENV ADB_IP="192.168.1.1"
ENV REACT_NATIVE_PACKAGER_HOSTNAME="192.255.255.255"

EXPOSE 19000
EXPOSE 19001

RUN apt-get update && \
    apt-get install android-tools-adb
WORKDIR /app

COPY package.json yarn.lock app.json ./
RUN yarn --network-timeout 100000
CMD adb connect $ADB_IP && \
        yarn run android