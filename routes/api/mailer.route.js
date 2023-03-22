const express = require('express');
const auth = require('../utils/auth');

const upload = require('./upload');

const imagesUpload = upload.fields([
  {
      name: 'bannerImg',
      maxCount: 1
  },
  {
      name: 'featuredImg',
      maxCount: 1
  }
])

module.exports = (app) => {
  const mailer = require("../../controllers/mailer.controller");

  var router = express.Router();


  router.post("/send", imagesUpload, mailer.sendMail);
  
  
  app.use('/api/mailer', router);
  
}