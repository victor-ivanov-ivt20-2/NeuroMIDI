FROM node:18

# RUN apk add --update python
RUN apt-get update || : && apt-get install python -y
RUN apt-get install -y fluidsynth
RUN apt-get update && apt-get install -y python3-pip
RUN pip install mido
RUN pip install midi2audio

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "index.js" ]