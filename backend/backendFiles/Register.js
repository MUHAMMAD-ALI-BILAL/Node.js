const express = require('express')
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const { secretKey } = require('./config.js');

const app = express()
app.use(cors())
app.use(bodyParser.json());


  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'MovieData',
  });

  pool.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error(error);
      return;
    }
  
    console.log('The solution is: ', results[0].solution);
  });

  app.get("/", (req, res) => {
      return res.json("From backend side");
    });


      app.post("/register", (req, res) => {
        const { name, email, password } = req.body;
        const userEmail = email;
      
        const checkEmailQuery = `SELECT COUNT(*) AS count FROM Users WHERE Email = ?`;
        pool.query(checkEmailQuery, [userEmail], (err, results) => {
          if (err) {
            console.error(err);
            console.log({ message: 'Error occurred during email check' });
            return;
          }
      
          if (results[0].count <= 0) {
            const insertUserQuery = 'INSERT INTO Users (Name, Email, Password) VALUES (?, ?, ?)';
            pool.query(insertUserQuery, [name, email, password], (error, results) => {
              if (error) {
                console.error(error);
                console.log({ message: 'Error occurred during registration' });
                return;
              }
      
              console.log({ message: 'Registration successful', name, email, password });

              // Send the token to the frontend as a response

              const TOKEN_EXPIRATION_TIME = 2 * 60;
              const token = jwt.sign({ email: req.body.email, name: req.body.name ,exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRATION_TIME)}, secretKey);
              // console.log(token);
              res.json({ success: true, message: ' successful', token});

            
            });
          } else {
            res.json({ success: false, message: 'Error' });
          }
        });
      });



      app.post("/login", (req, res) => {
        const { email, password } = req.body;
        const userEmail = email;
        const userPassword = password;
      
        const checkEmailAndPasswordQuery = `SELECT COUNT(*) AS count FROM Users WHERE Email = ? AND Password = ?`;
        pool.query(checkEmailAndPasswordQuery, [userEmail, userPassword], (err, results) => {
          if (err) {
            console.error(err);
            console.log({ message: 'Error occurred during email and password check' });
            return;
          }

          if (results[0].count > 0) {
            // Email and password are correct, perform the login action
            const TOKEN_EXPIRATION_TIME = 2 * 60;
            const token = jwt.sign({ email: req.body.email ,exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRATION_TIME)}, secretKey);
            res.json({ message: 'Login successful', success:true, token });
          } else {
            // Email and/or password are incorrect
            res.json({ message: 'Invalid email or password', success:false });
          }
        });
      });


app.listen(8082, () => {
    console.log("Listening")
})

