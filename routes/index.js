const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/playlists', (req, res, next) => {
  res.render('playlists');
});

router.get('/create-playlist', (req, res, next) => {
  res.render('create-playlist');
})


module.exports = router;
