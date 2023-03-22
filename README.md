# Greenlit API and backend

## Setup (1 time)
1. install tig - to view commit history
2. install docker - to run docker-compose / postgres db
2. install nvm
3. run: nvm install 18.13.0
3. create a .env file
4. copy the contents from .env.local to .env and add the missing parts

## Run locally
1. Set the enviornment variable (NODE_ENV): linux: NODE_ENV='development' windows: set NODE_ENV='development'
1. docker-compose up -d
1. nvm use 18.13.0
2. npm install
3. npx sequelize-cli db:migrate
3. npm start (to replicate how it runs in live environment) or npm run dev (if you are coding and want to see changes fast)

## Development process
1. git branch -b <name of feature or thing you are doing> example: git branch add-new-button
2. make your code changes
3. git add --all
4. git commit -m "what you did" (do 3 and 4 as many times as you need)
5. git fetch --all
6. git rebase origin/main
7. git push origin HEAD or git push (and then follow the prompt)

### Production
npx sequelize-cli db:migrate; NODE_ENV=production node app.js

## Pinging the API locally
https://getgreenlit-server-dev.herokuapp.com/api/spaces/space?spaceId=4ccbe0c9-f498-468e-9911-6b491bb584ab
http://localhost:3001/api/spaces/