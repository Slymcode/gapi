const express = require('express');

module.exports = (app) => {
  const health = require("../../controllers/health.controller");

  var router = express.Router();


  router.get("/check", health.check);

 
  app.use('/api/health', router);
  
}