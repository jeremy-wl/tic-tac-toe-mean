Tic-Tac-Toe-MEAN
============

Real-time Tic-Tac-Toe game implemented using MEAN stack and socket.io

 ## Features
 
 - User register/unregister, login/out, social login
 - Real-time multi-player game
 - History game review
 - Mobile-friendly
 - Single-page application
 - Admin CRUD features 
 
## Descriptions

Two user roles are implemented in this web app
1. Player
2. Admin  

 - User can register, or use Facebook/Google login to get access to the games.
 - Player can choose to play locally (with computer) or online (with other players)
   * For local games, I consumed a [third party API endpoint](https://www.npmjs.com/package/tictactoe-agent)
     for game strategies against the player. The API algorithms, however, are so optimized that 
     I am not able to win a single match... Because the restrictions from the API, the local game 
     only supports 3×3 game
   * Players can choose grid from 3 to 10 in multi-player game. By clicking the join room button,
     the app will look for rooms available to join, or if no room available, create a new room.
     Because of the nature of socket.io, all data between users will be transmitted in real time.
 - A normal player can view his game history with computer/human. Inside the listing view, he is 
   also able to view the game move-by-move using back/forward steppers.
 - An admin has some superpowers, he is able to
   * View all users
   * Edit user credentials/roles
   * Remove users
   * View all games by that user
   * And of course, view all games by all users
   
## Note
 - For Local Game:
 
   At the beginning, it will **take the API about 5 seconds to respond** and make a move 
   (the third-party Heroku App needs to wake up from sleep due to inactivity)
 - For Online Game: 
 
   You will need to 
   1. use a different browser OR same browser but the other page in incognito mode 
   2. use two different accounts 
   
   to start the game (so that the user cannot cheat easily :D)
    
## Usage
 0. Make sure you have Node.js and MongoDB installed and configured
 1. `$ git clone https://github.com/jeremylinlin/tic-tac-toe-mean.git`
 2. `$ cd tic-tac-toe-mean/`
 3. `$ npm install`
 4. `$ node server.js`
 5. Visit http://localhost:3000/
 
 In addition, you will need to 
  1. Go to Facebook/Google developer page and create an app for OAuth authentication, 
     and get their client id and client secret
  2. Create a file in project root named `.env` to store those environment variables
  
 These environment variables should be present in your `.env`
  
  - `WD_SESSION_SECRET=?`
  - `GOOGLE_CLIENT_ID=?`		
  - `GOOGLE_CLIENT_SECRET=?`		
  - `GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`		
  - `FACEBOOK_CLIENT_ID=?`		
  - `FACEBOOK_CLIENT_SECRET=?`		
  - `FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback`		 
 
 To login the game as an admin, you will need to register a user, and then manually add a role 'ADMIN' to this user
 from MongoDB.
 
 ## License
 
 MIT
