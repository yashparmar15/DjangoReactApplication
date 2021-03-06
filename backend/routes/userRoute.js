const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const DIR = './public/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, uuidv4() + '-' + fileName);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
});

router.post('/user-profile', upload.single('picture'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  // console.log(req);
  // console.log(req.file);
  const pictureI = url + '/' + req.file.path;
  // console.log(req.body.id)
  User.findByIdAndUpdate({ _id: req.body.id }, { picture: pictureI }, function (
    err,
    result
  ) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

router.get('/getuserinfo', (req, res, next) => {
  // console.log(req.query)
  Student.findOne(
    { id: req.query.id },
    [
      'name',
      'email',
      'followers',
      'following',
      'views_on_profile',
      'skills',
      'phone',
      'likes',
      'joindate',
      'college',
      'year',
      'branch',
      'exp',
      'about',
    ],
    (err, result) => {
      if (err) console.log(err);
      else {
        res.send(result);
      }
    }
  );
});

router.get('/getuserpicture', (req, res, next) => {
  User.findOne({ _id: req.query.id }, 'picture', (err, result) => {
    if (err) console.log(err);
    else {
      res.send(result);
    }
  });
});

router.get('/getuserdata', (req, res, next) => {
  Student.findOne({ id: req.query.id }, (err, result) => {
    if (err) console.log(err);
    else {
      res.send(result);
    }
  });
});

router.get('/checkalreadyfollowing', (req, res, next) => {
  var a = false;
  Student.findOne({ id: req.query.id }, (err, result) => {
    if (err) console.log(err);
    else {
      result.followedby.map((i) => {
        if (i === req.query.cur_id) {
          a = true;
        }
      });
      res.send(a);
    }
  });
});

router.post('/change', (req, res, next) => {
  Student.findByIdAndUpdate(
    { _id: req.body.dataUser._id },
    { about: req.body.dataUser.about },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.post('/flag2',(req,res,next)=>{
  User.findByIdAndUpdate({_id:req.body.v.id},{flag2 : req.body.v.flag2},(err,result)=>{
    res.send({'r' : 'done'});
  })
})

router.post('/updatefollow', (req, res, next) => {
  // console.log(req.body.Current.followedby)
  let Cur;
  Student.findOne({ _id: req.body.Current._id }, (err, result) => {
    return result;
  }).then((r) => {
    Cur = r;
    if (req.body.Current.Unfollow) {
      var index = 0;
      var i = 0;
      Cur.followedby.map((h) => {
        if (h === req.body.Current.g) index = i;
        i++;
      });
      Cur.followedby.splice(index, 1);
    } else Cur.followedby.push(req.body.Current.g);
    Student.findByIdAndUpdate(
      { _id: req.body.Current._id },
      { followers: req.body.Current.followers, followedby: Cur.followedby },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          // console.log(result);
          res.send({ result: true });
        }
      }
    );
  });
});

router.post('/updatefollowing', (req, res, next) => {
  let Cur;
  Student.findOne({ id: req.body.Current.g }, (err, result) => {
    return result;
  }).then((r) => {
    Cur = r;

    if (req.body.Current.Unfollow) {
      var index = 0;
      var i = 0;
      Cur.follows.map((h) => {
        if (h === req.body.Current.id) index = i;
        i++;
      });
      Cur.follows.splice(index, 1);
      Cur.following = Cur.following - 1;
    } else {
      Cur.follows.push(req.body.Current.id);
      Cur.following = Cur.following + 1;
    }
    // console.log(Cur)
    Student.findByIdAndUpdate(
      { _id: Cur._id },
      { following: Cur.following, follows: Cur.follows },
      function (err, result) {
        // console.log(result,"Yash Parmar");
        res.send(result);
      }
    );
  });
});

router.post('/addtodo', (req, res, next) => {
  Student.findByIdAndUpdate(
    { _id: req.body.C._id },
    { todo: req.body.C.todo },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.post('/adddone', (req, res, next) => {
  // console.log(req.body.dataUser)
  // console.log(req.body.C.done);
  // console.log(req.body.C._id)
  Student.findByIdAndUpdate(
    { _id: req.body.C._id },
    { done: req.body.C.done },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.post('/adddoing', (req, res, next) => {
  // console.log(req.body.dataUser)
  // console.log(req.body.C.done);
  // console.log(req.body.C._id)
  Student.findByIdAndUpdate(
    { _id: req.body.C._id },
    { doing: req.body.C.doing },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.post('/updateuser', (req, res, next) => {
  Student.findByIdAndUpdate(
    { _id: req.body.Current._id },
    {
      name: req.body.Current.name,
      email: req.body.Current.email,
      phone: req.body.Current.phone,
      linkedin: req.body.Current.linkedin,
      github: req.body.Current.github,
      exp: req.body.Current.exp,
      college: req.body.Current.college,
    },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.post('/changeskills', (req, res, next) => {
  // console.log(req.body.dataUser)
  Student.findByIdAndUpdate(
    { _id: req.body.dataUser._id },
    { skills: req.body.dataUser.skills },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.post('/', (req, res, next) => {
  // console.log(req.body.dataUser);
  Student.create(req.body.dataUser, (error, data) => {
    if (error) {
      return next(error);
    } else {
      // console.log(data)
      res.json(data);
    }
  });
});

module.exports = router;
