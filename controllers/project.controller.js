const db = require( '../database/models' );

const PinataUtils = require('./../routes/utils/pinata');
const Project =  db['project'];
const Role =  db['role'];
const License =  db['license'];
const Token =  db['token'];
const Space =  db['space'];

const {sendMail} = require( '../controllers/mailer.controller' );
const {getUserIdBySpaceId, userInfo} = require( '../functs/helper' );
const config = require('../config/config')[process.env.NODE_ENV || 'development'];

exports.create = async  ( req, res ) => 
{
    // Validate content
    if(!req.body.projectTitle){
        res.status(400).send({
            message: 'Content can not be empty'
        })
        return;
    }
    const userId = req.body.userId;
    const spaceId = req.body.spaceId;
    const bannerIpfsUrl = await PinataUtils.saveImagePinata(req.files['bannerImg'][0], 'bannerImg')

    const featuredIpfsUrl = await PinataUtils.saveImagePinata(req.files['featuredImg'][0], 'featuredImg')

    const bannerImg = bannerIpfsUrl;
    const featuredImg = featuredIpfsUrl;

     const project = {
        userId: userId,
        spaceId: req.body.spaceId,
        stakingTierId: req.body.tid,
        address: req.body.address,
        projectTitle: req.body.projectTitle,
        projectDescription: req.body.projectDescription,
        projectEmail: req.body.projectEmail,
        projectCategory: req.body.projectCategory,
        projectAnticipatedRelease: req.body.projectAnticipatedRelease,
        twitter: req.body.twitter,
        discord: req.body.discord,
        bannerImg: bannerImg,
        featuredImg: featuredImg,
        status: req.body.adminApproval == 'true'?'pending':'approved'
     };
      // Save Project in the database
     try{
      await Project.create(project)
        .then(async data => {
            const role = {
                creator: 'owner',
                role: 'PROJECT_ADMIN',
                mid: data.id,
                address: data.address,
                status: true
            }
             Role.create(role);
       
        if(req.body.adminApproval === 'true'){
            let spaceOwnerEmail
            let spaceOwnerName
            let projectOwnerEmail
            let projectOwnerName
            await getUserIdBySpaceId(req.body.spaceId, Space).then(async userId => {
                await userInfo(userId).then(data => {
                    spaceOwnerEmail = data.email;
                    spaceOwnerName =  data.name.split(' ')[0]
                }) 
             })
             await userInfo(userId).then(data => {
                projectOwnerEmail = data.email;
                projectOwnerName =  data.name.split(' ')[0]
              })  
              console.log('DEBUGING: email')
              console.log(config.cor_origin)
              const redirectLink = `${config.cor_origin}/space/projects/${spaceId}`
              const spaceOwnerParams = {
                email: spaceOwnerEmail,
                subject: 'New Project Notification',
                message: '<!DOCTYPE html>'+
                '<html>'+
                '<body><div>'+
                "Hey "+spaceOwnerName + "! <br/><br/> You have a pending request to review a new project created in your space. Kindly <a href="+ redirectLink +">visit</a> your dashboard to give your approval . <br/>"+
                '</div></body></html>'
             }
             const projectOwnerParams = {
                email: projectOwnerEmail,
                subject: 'Awaiting Approval',
                message: '<!DOCTYPE html>'+
                '<html>'+
                '<body><div>'+
                "Hi "+projectOwnerName + "! <br/><br/> Your project was successfully created and awaiting approval. You will receive a notification upon approval. Thank You."+
                '</div></body></html>'
             }
             await sendMail(spaceOwnerParams)
             await sendMail(projectOwnerParams)
        } res.send({
            data,
            status: true
         }); 
      })
      .catch(err => {
        res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Project."
        });
      });
    }catch(e){
        throw e
    }
}

exports.update = async  ( req, res ) => 
{
    let bannerIpfsUrl, featuredIpfsUrl
   
    const pid = req.body.pid;

    if(req.files['bannerImg']){
        bannerIpfsUrl = await PinataUtils.saveImagePinata(req.files['bannerImg'][0], 'bannerImg')
    }else{
       bannerIpfsUrl = req.body.bannerUrl
   }
     
   if(req.files['featuredImg']){
        featuredIpfsUrl = await PinataUtils.saveImagePinata(req.files['featuredImg'][0], 'featuredImg')
    }else{
       featuredIpfsUrl = req.body.featuredUrl 
    }

    const bannerImg = bannerIpfsUrl;
    const featuredImg = featuredIpfsUrl;
    const status = req.body.status;
    let project = req.body;

     if(status == 'released'){
         project = {
            projectTitle: req.body.projectTitle,
            projectDescription: req.body.projectDescription,
            projectEmail: req.body.projectEmail,
            projectRelease: req.body.projectRelease,
            projectAction: req.body.projectAction,
            projectActionLink: req.body.projectActionLink,
            twitter: req.body.twitter,
            discord: req.body.discord,
            bannerImg: bannerImg,
            featuredImg: featuredImg,
         };
     }else{
         project = {
            projectTitle: req.body.projectTitle,
            projectDescription: req.body.projectDescription,
            projectEmail: req.body.projectEmail,
            projectAnticipatedRelease: req.body.projectAnticipatedRelease,
            projectCategory: req.body.projectCategory,
            twitter: req.body.twitter,
            discord: req.body.discord,
            bannerImg: bannerImg,
            featuredImg: featuredImg,
         };
     }   
      // Update Project in the database
     try{
      await Project.update(project, {
        where:{ id: pid}
    }).then( num => {
        if(num == 1){
            res.send({
                message: "Project was updated succcessfully.",
                status: true
            });
        }else{
            res.send({
                message: `Can not update Project with id = ${pid}. Maybe project was not found or req.body is empty`,
                status: false
            });
        }   
    }).catch(err => {
        res.status(500).send({
        message:
          err.message || "Some errors occurred while updating the Project."
        });
      });
 }catch(e){
        throw e
    }
}

exports.findAll = async(req, res) => 
{
    const spaceId = req.query.spaceId;

        await Project.findAll({ where: {spaceId: spaceId},
        order: [
            ["id", "DESC"],
          ] })
        .then(data => {
         const projects = JSON.parse(JSON.stringify(data));      
          return res.json(projects);
        })
        .catch(err => console.log(err)) 
}

exports.findOne = async(req, res) => 
{
    const spaceId = req.query.spaceId;
    const projectId = req.query.projectId;
        await Project.findOne({ where: {id: projectId, spaceId: spaceId}, include: ['stakedtokens', 'tier']})
        .then(async data => {
         const project = JSON.parse(JSON.stringify(data));  
         await License.findByPk(project.tier.licenseId).then( async data => {
               project.license = data;
               await Token.findByPk(project.tier.tokenId).then(data => {
                 project.token = data;
               })
         });
          return res.json(project);
        })
        .catch(err => console.log(err)) 
}

exports.isProjectAdmin = async(req, res) => 
{
        
        const address = req.query.address ? req.query.address : null;
        const projectId = req.query.projectId;   
            await Role.findOne({where: {address: address, mid: projectId, role: 'PROJECT_ADMIN'}})
            .then(data => {   
                console.log(data)       
             if(data){
                res.json(
                    {
                        status: true
                    }
                );
            } else{
                res.json(
                    {
                        status: false
                    }
                );
            } 
                
            })
            .catch(err => console.log(err)) 
        
}

exports.setProjectStatus = async (req, res) => { 
    const sid = req.body.sid;
    const pid = req.body.pid;
    const statusNote = req.body.statusNote ? req.body.statusNote : null;
    const status = req.body.status;
    const authored = req.body.authored;
    const project = 
     {
        status: status,
        authored: authored,
        statusNote: statusNote,
        updatedAt: new Date()
     };
     
     if(status == 'delete'){
        try{
       
            Project.destroy({
               where:{ id: pid, spaceId: sid}
           }).then( num => {
               if(num == 1){
                   res.send({
                       status: true
                   });
               }else{
                   res.send({
                       status: false
                   });   
               }
           }).catch(err => {
               res.status(500).send({
                   message: "Error deleting project with id " + pid
               })
           });
         }catch(err){
          
         }
     }else{
        try{    
            Project.update(project, {
               where:{ id: pid, spaceId: sid}
           }).then(async num => {
               if(num == 1){
                if(status === "approved"){
                    let projectOwnerEmail
                    let projectOwnerName
                    await getUserIdBySpaceId(pid, Project).then(async userId => {
                       await userInfo(userId).then(data => {
                           projectOwnerEmail = data.email;
                           projectOwnerName = data.name.split(' ')[0]
                         }) 
                    })
                    const projectOwnerParams = {
                       email: projectOwnerEmail,
                       subject: 'Project Proposal Approved!!!',
                       message: '<!DOCTYPE html>'+
                       '<html>'+
                       '<body><div>'+
                       "Dear "+projectOwnerName + "! <br/><br/> Your project proposal has been approved by the space owner. You can can proceed to complete your project setup and explore more features. See you there!"+
                       '</div></body></html>'
                    }
                    await sendMail(projectOwnerParams)
                }
                if(status === "rejected"){
                    let projectOwnerEmail
                 let projectOwnerName
                 await getUserIdBySpaceId(pid, Project).then(async userId => {
                    await userInfo(userId).then(data => {
                        projectOwnerEmail = data.email;
                        projectOwnerName =  data.name.split(' ')[0]
                      }) 
                 })
                 const projectOwnerParams = {
                    email: projectOwnerEmail,
                    subject: 'Project Proposal Rejected!!!',
                    message: '<!DOCTYPE html>'+
                    '<html>'+
                    '<body><div>'+
                    "Dear "+projectOwnerName + "! <br/><br/> So sorry, your project proposal was rejected by the space owner. For more information, please visit your dashboard to see reasons for the disapproval."+
                    '</div></body></html>'
                 }
                 await sendMail(projectOwnerParams)
                }
                   res.send({
                       status: true
                   });
               }else{
                   res.send({
                       status: false
                   });   
               }
           }).catch(err => {
               res.status(500).send({
                   message: "Error updating project with id " + pid
               })
           });
         }catch(err){
          
         } 
     }
    
}