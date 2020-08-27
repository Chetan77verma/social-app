const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./social-app-9bee3-firebase-adminsdk-ckdj6-362488a62c.json");

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   databaseURL: "https://social-app-9bee3.firebaseio.com"
});

const express = require('express');
const app = express();

app.get('/screams', (req, res) => { 
   admin.firestore().collection('screams').orderBy('createAt','desc').get().then((data) => {
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
   admin
      .firestore()
      .collection('screams')
      .add(newScream)
      .then(doc => {
         return res.status(200).json({ message: `Scream ${doc.id} created successfully !` })
      })
      .catch((err) => {
         res.status(500).json({ error: "Something Went Wrong" })
         console.error(err)
      })
});

exports.api = functions.https.onRequest(app)
