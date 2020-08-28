const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
var serviceAccount = require("./social-app-9bee3-firebase-adminsdk-ckdj6-362488a62c.json");

//this is required to run function on localhost:5000
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   databaseURL: "https://social-app-9bee3.firebaseio.com"
});

const db = admin.firestore()


//this config is required for client library "firebase"
var firebaseConfig = require("./firebase-client-app-config.json");

//it is client library but we use it sign-in and signup user and get auth token
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);


app.get('/screams', (req, res) => { 
   db.collection('screams').orderBy('createAt','desc').get().then((data) => {
      let screams = [];
      data.forEach(doc => {
         screams.push({
            screamdId: doc.id,
            ...doc.data()
         })
      });
      return res.json(screams);
   }).catch(err => console.error(err))
})

app.post('/scream',(req, res) => {
   const newScream = {
      body: req.body.body,
      userHandle: req.body.userHandle,
      createAt: new Date().toISOString()
   }
   db.collection('screams')
      .add(newScream)
      .then(doc => {
         return res.status(200).json({ message: `Scream ${doc.id} created successfully !` })
      })
      .catch((err) => {
         res.status(500).json({ error: "Something Went Wrong" })
         console.error(err)
      })
});

//signup route
app.post('/signup', (req, res) => { 
   const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle
   }

   // TODO: validate user


   let authToken,userId
   db.doc(`/users/${newUser.handle}`).get().then(doc => { 
      if (doc.exists) {
         return res.status(400).json({handle: "this handle is already taken"})
      } else { 
         return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
   }).then(data => { 
      // console.log("token",data.user.xa) // we can fetch authtoken this way as well
      userId = data.user.uid
      authToken = data.user.xa
      const userCredentials = {
         handle: newUser.handle,
         email: newUser.email,
         userId: userId,
         createdAt: new Date().toISOString()
      }
      return db.doc(`/users/${newUser.handle}`).set(userCredentials)
   }).then(() =>{
      return res.status(201).json({authToken})
   }).catch((err) => {
      console.error(err)
      if (err.code === "auth/email-already-in-use") {
         return res.status(400).json({ email: "Email is already in use" })
      } else {
         return res.status(500).json({ error: err.code })
      }
   })
})

exports.api = functions.https.onRequest(app)
