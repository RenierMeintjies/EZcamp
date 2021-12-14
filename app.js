if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express'),
  methodOverride = require('method-override'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  bodyParser = require('body-parser'),
  User = require('./models/user'),
  LocalStrategy = require('passport-local'),
  Comment = require('./models/comment'),
  Campground = require('./models/campground'),
  flash = require('connect-flash'),
  app = express()

// Requiring Routes
var commentRoutes = require('./routes/comments')
var campgroundRoutes = require('./routes/campgrounds')
var authRoutes = require('./routes/auth')

const url = process.env.DB_URL || 'mongodb://localhost/ez_camp'
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.use(flash())

app.locals.moment = require('moment')

// Passport Config
app.use(
  require('express-session')({
    secret: process.env.Session_Secret || 'thisisnotasecretdontdothisitsabadidea',
    resave: false,
    saveUninitialized: false,
  })
)
passport.use(new LocalStrategy(User.authenticate()))
passport.deserializeUser(User.deserializeUser())
passport.serializeUser(User.serializeUser())
app.use(passport.initialize())
app.use(passport.session())

// Passes currentUser & Flash message to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next()
})

app.use('/campgrounds/:id/comments', commentRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use(authRoutes)

app.listen(process.env.PORT || 3000, () => {
  console.log('Server has started')
})
