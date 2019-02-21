const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const configPassport = require('./config/passport');
const path = require("path");
const port = process.env.PORT || 3090;
const cors = require('cors');

const app = express();

//Cors middleware
app.use(cors());

const users = require("./routes/usersAuth");
const profile = require("./routes/profile");
const image = require("./routes/image");

// DB
const db = require('./config/keys').mongoURI;
mongoose.connect(db, {useCreateIndex: true, useNewUrlParser: true, })
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.log(err));


app.use(express.json());
app.use(express.urlencoded({ extended: false, }));
app.use(cookieParser());
app.use(bodyParser.text());

// Passport middleware
app.use(passport.initialize());

//passport config
configPassport(passport);


//Use Routes
app.use("/api/users", users);
app.use("/api/profiles", profile);
app.use("/api/images", image);

//Server static assets if in production
if (process.env.NODE_ENV === "production") {
    //set static folder
    app.use(express.static("client/build"));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
  }



app.listen(port, console.log(`Server is running on port ${port}`));

