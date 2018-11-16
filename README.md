# scheduler-api
This is a Scheduler API that I created with Node/Express/Mongoose with a MongoDB backend for a WhenIWork code challenge. I chose Node for the backend because of the speed and ease of creating simple APIs in Node with Express. I also built a simple React/Redux UI based around a scheduler calendar component that I found called [react-big-scheduler](https://github.com/StephenChou1017/react-big-scheduler).

# Install steps
Requires [node.js](https://nodejs.org) to be installed.

From the project root, run:
```
npm install
npm install client
```

# Running development environment
From the project root, run:
```
npm run dev
```
This will start the Node API server at localhost:5000 and the React client at [localhost:3000](http://localhost:3000). 

Swagger UI docs are available at [localhost:5000/api-docs](http://localhost:5000/api-docs).