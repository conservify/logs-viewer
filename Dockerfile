FROM node:9.11.1
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 3000
ENTRYPOINT [ "node_modules/.bin/babel-node", "server/server.js" ]
