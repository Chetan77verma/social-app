const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./social-app-9bee3-firebase-adminsdk-ckdj6-362488a62c.json");

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   databaseURL: "https://social-app-9bee3.firebaseio.com"
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", { structuredData: true });
   response.send("Hello World!");
});

exports.getScreams = functions.https.onRequest((req, res) => {
   admin.firestore().collection('screams').get().then((data) => {
      let screams = [];
      data.forEach(doc => {
         screams.push(doc.data())
      });
      return res.json(screams);
   }).catch(err => console.error(err))
});

exports.createScream = functions.https.onRequest((req, res) => {
   if (req.method !== 'POST') {
      return res.status(400).json({ error: "Method Not Allowed !" })
   }
   const newScream = {
      body: req.body.body,
      userHandle: req.body.userHandle,
      createAt: admin.firestore.Timestamp.fromDate(new Date())
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
