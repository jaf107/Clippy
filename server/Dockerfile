FROM ubuntu:20.04
ENV TZ=Asia/Kolkata \
    DEBIAN_FRONTEND=noninteractive
RUN mkdir -p /home/backend  
COPY . /home/backend
WORKDIR /home/backend/Clippy/server
RUN  apt-get update
RUN  apt-get install curl gnupg2 ca-certificates lsb-release -y
RUN  curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
RUN  echo "deb https://deb.nodesource.com/node_18.x $(lsb_release -c -s) main" | tee /etc/apt/sources.list.d/nodesource.list
RUN  apt-get update
RUN  apt-get install nodejs -y
RUN  apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev -y
RUN npm install
EXPOSE 8080
CMD ["npm","start"]
