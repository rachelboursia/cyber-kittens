const express = require('express');
const { JsonWebTokenError } = require('jsonwebtoken');
const app = express();
const { User } = require('./db');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', async (req, res, next) => {
  try {
    res.send(`
      <h1>Welcome to Cyber Kittens!</h1>
      <p>Cats are available at <a href="/kittens/1">/kittens/:id</a></p>
      <p>Create a new cat at <b><code>POST /kittens</code></b> and delete one at <b><code>DELETE /kittens/:id</code></b></p>
      <p>Log in via POST /login or register via POST /register</p>
    `);
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// Verifies token with jwt.verify and sets req.user
// TODO - Create authentication middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.sendStatus(401);
}
jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
  if (err) return res.sendStatus(403);
  req.user = user;
  next();
});


// POST /register
// OPTIONAL - takes req.body of {username, password} and creates a new user with the hashed password

app.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    res.status(201).json({ username, password });
  } catch (error) {
    next(error);
  }
});
// POST /login
// OPTIONAL - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB

app.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const accessToken = jwt.sign({ username: username }, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken });
  } catch (error) {
    next(error);
  }
});
// GET /kittens/:id
// TODO - takes an id and returns the cat with that id
app.get('/kittens/:id', async (req, res, next) => {
  try {
    const kittenId = req.params.id;
    if (kitten.ownerId === req.user.id) {
      res.json(kitten);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    next(error);
  }
});
// POST /kittens
// TODO - takes req.body of {name, age, color} and creates a new cat with the given name, age, and color
app.post('/kittens', async (req, res, next) => {
  try { 
    const { name, age, color } = req.body;
    if (!req.user) {
      return res.sendStatus(401);
    }
    const kitten = await Kitten.create({ name, age, color, ownerId: req.user.id });
    res.status(201).json({ name: kitten.name, age: kitten.age, color: kitten.color });
  } catch (error) {
    next(error);
  }
});
// DELETE /kittens/:id
// TODO - takes an id and deletes the cat with that id
app.delete('/kittens/:id', async (req, res, next) => {
  try {
    const kittenId = req.params.id;
    if (!req.user) {
      return res.sendStatus(401);
    }
     const kitten = await Kitten.findByPk(kittenId);
     if (kitten.ownerId !== req.user.id) {
       await kitten.destroy();
        res.sendStatus(204);
     } else {
        res.sendStatus(401);
     }
    } catch (error) {
      next(error);
  }
});
// error handling middleware, so failed tests receive them
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
