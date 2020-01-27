FROM node:12

WORKDIR /hexskell-server

# First install only dependencies
COPY ./package.json /hexskell-server/package.json
COPY ./package-lock.json /hexskell-server/package-lock.json
RUN npm install --only=prod

# Add source
COPY . /hexskell-server

EXPOSE 8090

CMD [ "npm", "start" ]