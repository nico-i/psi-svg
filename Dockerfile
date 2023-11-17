FROM node:21-alpine3.17

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Install module
RUN npm install -g .

ENV PORT=3000

CMD ["npm", "start", "--", "--port", "$PORT"]