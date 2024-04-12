# Use an official Node.js runtime as the base image
FROM node:16.20-buster-slim

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN yarn install

# Copy the rest of the application code to the container
COPY . .

# Expose the port on which the server will listen
EXPOSE 3000

# Start the server
CMD [ "yarn", "start" ]
