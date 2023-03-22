const {encrypt, decrypt} = require('../functs/crypto');

const db = require( '../database/models' );
const User =  db['user'];
const AccessToken =  db['accessToken'];

const jwt = require("../controllers/jwt.controller");

const {sendMail} = require( '../controllers/mailer.controller' );

exports.createAndLoginUser = async ( req, res ) => 
{
    const address = req.body.address;
    const email = req.body.email;
    const name = req.body.name;
    const profileImage = req.body.profileImage;

    // check if user exist
    const condition = {address: address};
   
    await User.findOne({where: condition, raw: true})
    .then(async data => {
        
        if(data != null){
            // user exist  
            // Generate an access token
            const userObj = {
                userId: data.id, 
                address: data.address, 
                status: true, 
                email: data.email, 
                name: data.name, 
                profileImage: data.profileImage 
            }
            const accessToken = jwt.generateAccessToken(userObj);
            const refreshToken = jwt.generateRefreshToken(userObj);

            await AccessToken.create({
               token:  refreshToken
            })
            res.json({
                accessToken: accessToken,
                refreshToken: refreshToken
            })
        }else{
            // user does not exist 
            // Create a new user
            const user = {
                address: address,
                email: email,
                userToken: "",
                name: name,
                profileImage: profileImage
            }
                await User.create(user)
                .then( async data => { 
                              
                const userObj = {
                    userId: data.id, 
                    address: data.address, 
                    status: true, 
                    email: data.email, 
                    name: data.name, 
                    profileImage: data.profileImage 
                }
                const accessToken = jwt.generateAccessToken(userObj);
                const refreshToken = jwt.generateRefreshToken(userObj)

                await AccessToken.create({
                    token:  refreshToken
                 })

                   // send email
                 /*  if(email){
                   const newUserParams = {
                    email: email,
                    subject: 'Welcome to getgreenlit',
                    message: '<!DOCTYPE html>'+
                    '<html>'+
                    '<body><div>'+
                    "Hello "+name.split(' ')[0] + "! <br/><br/> Congratulations! Your getgreenlit account was successfully created.<br/>"+
                    '</div></body></html>'
                 }
                 await sendMail(newUserParams)
                }  */
                res.json({
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }) 
                })
                .catch( err =>{ res.status(400).send({message: err.message || "Some error occurred while creating the user"})})
        }
     }).catch(err => {
        res.status(500).send('Unable to complete request.' + err)
    })  
}


exports.updateUserProfile = async ( req, res ) => 
{
    const address = req.body.address;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const emailRecovery = encrypt(email);

    const userInfo = {
        name: firstname+' '+lastname,
        emailRecovery: emailRecovery
    }
    try{
        const params = {
           email: email,
           subject: 'Email Verification',
           message: '<!DOCTYPE html>'+
           '<html>'+
           '<body><div>'+
           "Dear "+firstname + "! <br/><br/> We noticed that you signed up on our platform. Below is your email verification link. <br/> <a href=http://localhost:3000?verify="+ emailRecovery +">Click Here</a> to verify you email address."+
           '</div></body></html>'
        }
        await sendMail(params).then(async result => {
            if(result.status){
                await User.update(userInfo, {
                    where:{ address: address}
                }).then( num => {
                    if(num == 1){
                        res.send({
                            message: "Profile was updated successfully.",
                            status: true
                        });            
                    }else{
                        res.send({
                            message: `Can not update user with address = ${address}. Maybe user was not found or req.body is empty`,
                            status: false
                        });
                    }   
                }).catch(err => {
                    res.status(500).send({
                    message:
                      err.message || "Some errors occurred while updating the user."
                    });
                  });
            } }).catch(err => {
                console.log(err)
            }); 
   }catch(e){
          throw e
      }  
}

exports.verifyEmail = async ( req, res ) => 
{
    const address = req.body.address;
    const encryptedEmail = req.body.email;
    const email = decrypt(encryptedEmail);
     const token = req.body.token;

    //get user 
    const condition = {address: address};
    await User.findOne({where: condition, raw: true}).then(async data => {
         if(data.emailRecovery === encryptedEmail) {

            const userObj = {
                userId: data.id, 
                address: data.address, 
                status: true, 
                email: email, 
                name: data.name, 
                profileImage: data.profileImage 
            }
            const refreshToken = jwt.generateRefreshToken(userObj)
            const accessToken = jwt.generateAccessToken(userObj);

            const userInfo = {
                email: email,
                emailRecovery: null
            }
        
            try{
                    await User.update(userInfo, {
                        where:{ address: address}
                    }).then( async num => {
                        if(num == 1){
                            const newTokenObj = {
                                token: refreshToken
                            }
                            const condition = {token: token};
                            await AccessToken.update(newTokenObj, {where: condition}).then(data => {
    
                            })
                            res.send({
                                message: "Profile was updated succcessfully.",
                                status: true,
                                accessToken: accessToken,
                                refreshToken: refreshToken                           

                            });            
                        }else{
                            res.send({
                                message: `Can not update user with address = ${address}. Maybe user was not found or req.body is empty`,
                                status: false,
                                refreshToken: null
                            });
                        }   
                    }).catch(err => {
                        res.status(500).send({
                        message:
                          err.message || "Some errors occurred while updating the user."
                        });
                      });
                      
           }catch(e){
                  throw e
              } 
         }
    }) 
}

exports.deleteUserAccessToken = async ( req, res ) => 
{
    const token = req.body.token;
    const condition = {token: token};
    await AccessToken.destroy({where: condition})
   .then(rs => {
    if(rs == 1){
        res.send({
            status: true
        });
    }else{
        res.send({
            status: false
        }); 
    }
   }).catch(err => {
      res.status(500).send({status: false})}
    )   
}
