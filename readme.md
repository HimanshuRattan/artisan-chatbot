# Artisan
Hey there! 👋. 
This is my submission for the Full-stack Async Exercise.

## 🔧 Running the project
To run the code on your machine, create a .env file inside the backend directory.

🤫 Add the following variables to the file:

    OPENAI_API_KEY=~your_key_here~
    SECRET_KEY=~secret_key~
    

Then please run the following commands to start the servers.

To start the front-end server, open a terminal and run the following commands in the project's root directory.
`$ cd frontend`
`$ npm install`
`$ npm start`

To start the backend server, open another terminal, and run the below commands:
`$ cd backend`
`$ python -m venv venv`
`$ venv\Scripts\activate`
`$ pip install -r requirements.txt`
`$ uvicorn app.main:app --reload`

To view the API documentation, visit the below link once the backend server has started.
`<link>` : <http://127.0.0.1:8000/docs>

> I have added test.db in the last commit in case you'd like to dive right in. Otherwise test.db would automatically be created once you start the backend server. You can start chatting once you register the user.

## 🔮 Future Plans / Areas of Improvement
- Breaking down the front-end code into multiple reusable components (can create components, common, hooks, services, styles, utils directories inside src) (backend is already implemented)
- Caching with redis
- Automates tests for code coverage
- Multiple conversations per user
- Rate limiting APIs
- CI/CD pipeline every time the master branch is merged into the main branch
- UX improvements: timestamps to messages, confirmation for reset conversation



<br/>
🙇 Thank you for time. Hope you like it Looking forward to the feedback. ✨
