var express = require('express');
var router = express.Router();
const passport = require('passport');
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");

const localstrategy = require("passport-local");

passport.use(new localstrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/feed',async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const posts = await postModel.find().populate("user");
  res.render('feed' , { footer: true, posts, user });
});

router.get('/courses', function (req, res, next) {
  res.render('courses');
});

router.post('/upload',isLoggedIn, upload.single("file"), async function (req, res, next) {
  if(!req.file) {
    return res.status(404).send('No Files Were Uploaded.');
  }
  const user = await userModel.findOne({username: req.session.passport.user})
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    price: req.body.fileprice,
    user: user._id
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/account");
});

router.get('/account', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render("account", {user});
});

router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('home');
});

router.get('/courses/resume', isLoggedIn, function (req, res, next) {
  res.render('product');
});

router.get('/courses/github', isLoggedIn, function (req, res, next) {
  res.render('producttwo');
});

router.get('/profile/edit', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('edit' , { user });
});

router.get('/buysell', isLoggedIn, function (req, res, next) {
  res.render('buysell');
});

router.get('/like/post/:id', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user});
  const post = await postModel.findOne({_id: req.params.id});

  if(post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  }
  else{
    post.likes.splice( post.likes.indexOf(user._id), 1);
  }

   await post.save();
   res.redirect("/feed");

});

router.get('/media', isLoggedIn, function (req, res, next) {
  res.render('media');
});

router.get('/contact', isLoggedIn, function (req, res, next) {
  res.render('contact');
});


router.post("/update", upload.single('image'), async function(req, res){
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, fullName: req.body.name, bio: req.body.bio },
    { new: true}
  );
  
  if (!user) {
    return res.send("No changes were made.");
  }

  if (req.file) {
    user.profileimage = req.file.filename;
  }
  
  await user.save();
  res.redirect("/account");
});




router.post('/register', function (req, res, next) {
  var userdata = new userModel({
    username: req.body.username,
    secret: req.body.secret,
    email: req.body.email,
    fullName: req.body.fullName,
    userType: req.body.userType,
    branch:req.body.branch

  });

  userModel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profile');
      })
    })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/"
}), function (req, res) {
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.get('/alluserposts', async function (req, res, next) {
  let user = await userModel
    .findOne({
      _id: "65dc733a493e765eb7791fcf"
    })
    .populate('posts')
  res.send(user);
});


module.exports = router;
