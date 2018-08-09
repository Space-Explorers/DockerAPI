FROM node:8

# Create app directory
# WORKDIR /usr/src/app
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
# CMD is the command you want to be executed inside the container once it's set up
# maybe this is where we would run something like "mocha userCode.js" etc.
