FROM node:18-slim

WORKDIR /usr/app
COPY ./package.json ./package.json
RUN npm install

ARG MOCKS_PLUGINS_INQUIRER_CLI_ENABLED=false
ENV MOCKS_PLUGINS_INQUIRER_CLI_ENABLED=false
ARG MOCKS_FILES_PATH=/usr/app/input/mocks
ENV MOCKS_FILES_PATH=/usr/app/input/mocks
ARG MOCKS_CONFIG_FILE_SEARCH_FROM=/usr/app/input
ENV MOCKS_CONFIG_FILE_SEARCH_FROM=/usr/app/input

CMD [ "npm", "start" ]