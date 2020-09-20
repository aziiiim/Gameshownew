const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const userService = require('./user.service');
const { Sequelize } = require('sequelize');
const db = require('_helpers/db');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
//router.get('/', authorize(), getAll);
router.post('/getAll', getAll);
//router.get('/', getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
//router.put('/update/:id', authorize(), updateSchema, update);
router.post('/update/:id',update);
//router.delete('/:id', authorize(), _delete);
router.post('/delete/:id',  _deleteBy);
router.post('/forgetpassword', _forGetPassword);
router.post('/reset', _resetPassword);
router.post('/editUsers/:id', getById);

//router.get('/',_resetPassword);
const bcrypt = require('bcryptjs');

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(console.log(req.body, "body")
            //user => res.json(user)

        )
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        username: Joi.string(),
        password: Joi.string().min(6).required(),
        imgPath: Joi.string(),
        phoneNo: Joi.string(),
        email: Joi.string(),
        isActive: Joi.string(),
        isAdmin: Joi.string(),
        isDeleted: Joi.string(),
        Address: Joi.string(),
        PostalCode: Joi.string()


    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req)
        .then(() => res.json({ message: 'Registration successful' }))
        .catch(next);
}

async function getAll(req, res, next) {
    console.log('ok ok ok 1');
    const email = req.body.email;
    console.log('ok ok ok 2', email);
    const pass = req.body.password;
    console.log('ok ok ok 3');
    const user = await db.User.scope('withHash').findOne({ where: { email } });
    console.log(user, 'user');
    console.log('ok ok ok 4');
    if (!user || !(await bcrypt.compare(pass, user.hash))) {
        //throw 'Username or password is incorrect';
        //res.render("login",{error : true});
        res.redirect('/login');
        //res.render("gridView", { users })
        console.log('ok ok ok 5');
    }
    else {
        req.session.username = user.id;
        req.session.username = user.email;
        //req.session.username = user.id;
        userService.getAll()
            .then(
                users => res.render("gridView", { users })
            )
            .catch(next);
    }
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().empty(''),
        //password: Joi.string().min(6).empty(''),
        phoneNo: Joi.string().empty(''),
        Address: Joi.string().empty(''),
        PostalCode: Joi.string().empty(''),
    });
    validateRequest(req, next, schema);
}
// function findUserByid(params) {
//     userService.getById(params.body.id);
// }
function update(req, res, next) {

    console.log('uupdate',1)
    const sequelize = new Sequelize('gameshow', 'root', null, {
        dialect: 'mysql'
      })
      console.log('uupdate',2)
     var query = `UPDATE users SET firstName='${req.body.firstName}',lastName='${req.body.lastName}',phoneNo='${req.body.phoneNo}',email='${req.body.email}',Address='${req.body.Address}',PostalCode='${req.body.PostalCode}',updatedAt='${new Date().toString()}' WHERE id = ${req.params.id}`;
     console.log('uupdate',3)
      const records =  sequelize.query(query, {
          //type: QueryTypes.UPDATE
        }).then(function () {
             res.json({status:true})
            //console.log('uupdate',4)
        }).catch(function() {
            res.json({status:false})
            //console.log('uupdate',5)
        }); 
}

async function _deleteBy(req, res, next) {
    //_delete

const sequelize = new Sequelize('gameshow', 'root', null, {
    dialect: 'mysql'
  })
var queyr = `DELETE FROM users WHERE id = ${req.params.id}  and isAdmin  = '0' `;

    const records = await sequelize.query(queyr, {
        //type: QueryTypes.UPDATE
      }).then(function() {
          return res.json({status : true});
      }).catch(function () {
        
       return res.json({status: false});
      }); 
  
}

function _forGetPassword(req, res, next) {
    console.log(req.body, "body");
    userService.forget(req.body)
        .then(() => res.json({ message: 'link have been sent to your email.' }))
        .catch(next);
}

function _resetPassword(req, res, next) {
    console.log(req.body.id, 'token data');
    userService.resetPassword(req)
        .then(() => res.json({ message: 'passwored reset successfully.' }))
        .catch(next);
}