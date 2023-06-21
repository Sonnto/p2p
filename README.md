# Project: Picture-to-Pixels (IN-DEVELOPMENT)

## Details
This project is part of an on-going, larger project known as [BrickMMO](https://brickmmo.com/). Picture-to-Pixels (or P2P) is the development project name; the official name is BrickMMO: Pixelate. It serves to convert an image into a pixelated image so a user can recreate it with LEGO bricks.

## Languages, Frameworks, Tools, Technologies
- Node.js
- Express.js
- React.js
- JavaScript

# Instructions

## Using npm

Run commands

1. `npm install`

2. `npm run dev`

## Or using yarn

Run commands

1. `npm install --global yarn`

2. `yarn install`

3. `yarn run dev`

## When you are in the p2p
### Frontend
1. `cd frontend`
2. `npm i`
3. Include ` "dev": "nodemon ./index.js" ` under package.json scripts
4. `npm start`
   
### Backend
1. `cd backend`
2. `npm i express mysql`
3. Include `  "devStart": "nodemon server/server.js" ` under package.json scripts
4. Create an .env file with the SERVER_HOST, SERVER_PORT, APP_PORT, SERVER_DB, SERVER_USER, and SERVER_PASSWORD, and SESSION_SECRET
5. `npm start` 

## What to do?

Select an image and upload the image. Hit "Pixelate" and the user will be presented with a downloadable pixelated image, instructions in PDF to build it, and the amount of LEGO bricks needed along with the corresponding colours.

# Future Developments
- Users can create an account in the future
- Improve on app design and styling
- instructions.pdf includes pixelated image, + more pages
- Mobile responsive application 
- Incorporate Colors API for “closest LEGO colour”
- Segment API endpoint for Radio to fetch segment inspos
- Store and Pixelate larger sized images
- Find more efficient way of storing images
- Administrator(s) should be able to edit current accounts
- Pixelated image should output image with LEGO-bricks instead of square pixels

