require('dotenv').config()

//set to production to locally migrate to live server
//process.env.NODE_ENV = 'production'; 

module.exports = {
  development: {
    cor_origin: process.env.CORS,
    secret: process.env.SECRET,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    aws_access_key_id:process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key:process.env.AWS_SECRET_ACCESS_KEY,
    port: process.env.PORT || 3000,
  },
  test: {
    cor_origin: process.env.CORS,
    secret: process.env.SECRET,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    aws_access_key_id:process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key:process.env.AWS_SECRET_ACCESS_KEY,
    port: process.env.PORT,
  },
  production: {
    cor_origin: process.env.CORS,
    secret: process.env.SECRET,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    aws_access_key_id:process.env.AWS_ACCESS_KEY_ID,
    aws_secret_access_key:process.env.AWS_SECRET_ACCESS_KEY,
    port: process.env.PORT,
  },
}