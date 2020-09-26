//const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.onCreateFollower = functions.firestore
  .document("/followers/{userId}/userFollowers/{followerId}")
  .onCreate(async (snapshot, context) => {
    console.log("Follower Created", snapshot.id);
    const userId = context.params.userId;
    const followerId = context.params.followerId;

    // 1) Create followed users posts ref
    const followedUserPostsRef = admin
      .firestore()
      .collection("posts")
      .doc(userId)
      .collection("userPosts");

    // 2) Create following user's timeline ref
    const timelinePostsRef = admin
      .firestore()
      .collection("timeline")
      .doc(followerId)
      .collection("timelinePosts");

    // 3) Get followed users posts
    const querySnapshot = await followedUserPostsRef.get();

    // 4) Add each user post to following user's timeline
    querySnapshot.forEach(doc => {
      if (doc.exists) {
        const postId = doc.id;
        const postData = doc.data();
        timelinePostsRef.doc(postId).set(postData);
      }
    });
  });

exports.onDeleteFollower = functions.firestore
  .document("/followers/{userId}/userFollowers/{followerId}")
  .onDelete(async (snapshot, context) => {
    console.log("Follower Deleted", snapshot.id);

    const userId = context.params.userId;
    const followerId = context.params.followerId;

    const timelinePostsRef = admin
      .firestore()
      .collection("timeline")
      .doc(followerId)
      .collection("timelinePosts")
      .where("ownerId", "==", userId);

    const querySnapshot = await timelinePostsRef.get();
    querySnapshot.forEach(doc => {
      if (doc.exists) {
        doc.ref.delete();
      }
    });
  });

// when a post is created, add post to timeline of each follower (of post owner)
exports.onCreatePost = functions.firestore
  .document("/posts/{userId}/userPosts/{postId}")
  .onCreate(async (snapshot, context) => {
    const postCreated = snapshot.data();
    const userId = context.params.userId;
    const postId = context.params.postId;

    // 1) Get all the followers of the user who made the post
    const userFollowersRef = admin
      .firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // 2) Add new post to each follower's timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;

      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelinePosts")
        .doc(postId)
        .set(postCreated);
    });
  });

exports.onUpdatePost = functions.firestore
  .document("/posts/{userId}/userPosts/{postId}")
  .onUpdate(async (change, context) => {
    const postUpdated = change.after.data();
    const userId = context.params.userId;
    const postId = context.params.postId;

    // 1) Get all the followers of the user who made the post
    const userFollowersRef = admin
      .firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // 2) Update each post in each follower's timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;

      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelinePosts")
        .doc(postId)
        .get()
        .then(doc => {
          if (doc.exists) {
            doc.ref.update(postUpdated);
          }
        });
    });
  });

exports.onDeletePost = functions.firestore
  .document("/posts/{userId}/userPosts/{postId}")
  .onDelete(async (snapshot, context) => {
    const userId = context.params.userId;
    const postId = context.params.postId;

    // 1) Get all the followers of the user who made the post
    const userFollowersRef = admin
      .firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // 2) Delete each post in each follower's timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;

      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelinePosts")
        .doc(postId)
        .get()
        .then(doc => {
          if (doc.exists) {
            doc.ref.delete();
          }
        });
    });
  });

  exports.onCreateFollowerEvent = functions.firestore
  .document("/followers/{userId}/userFollowers/{followerId}")
  .onCreate(async (snapshot, context) => {
    console.log("Follower Created", snapshot.id);
    const userId = context.params.userId;
    const followerId = context.params.followerId;

    // 1) Create followed users events ref
    const followedUserEventsRef = admin
      .firestore()
      .collection("events")
      .doc(userId)
      .collection("userEvents");

    // 2) Create following user's timeline ref
    const timelineEventsRef = admin
      .firestore()
      .collection("timeline")
      .doc(followerId)
      .collection("timelineEvents");

    // 3) Get followed users events
    const querySnapshot = await followedUserEventsRef.get();

    // 4) Add each user event to following user's timeline
    querySnapshot.forEach(doc => {
      if (doc.exists) {
        const eventId = doc.id;
        const eventData = doc.data();
        timelineEventsRef.doc(eventId).set(eventData);
      }
    });
  });

exports.onDeleteFollowerEvent = functions.firestore
  .document("/followers/{userId}/userFollowers/{followerId}")
  .onDelete(async (snapshot, context) => {
    console.log("Follower Deleted", snapshot.id);

    const userId = context.params.userId;
    const followerId = context.params.followerId;

    const timelineEventsRef = admin
      .firestore()
      .collection("timeline")
      .doc(followerId)
      .collection("timelineEvents")
      .where("ownerId", "==", userId);

    const querySnapshot = await timelineEventsRef.get();
    querySnapshot.forEach(doc => {
      if (doc.exists) {
        doc.ref.delete();
      }
    });
  });

// when a event is created, add event to timeline of each follower (of event owner)
exports.onCreateEvent = functions.firestore
  .document("/events/{userId}/userEvents/{eventId}")
  .onCreate(async (snapshot, context) => {
    const eventCreated = snapshot.data();
    const userId = context.params.userId;
    const eventId = context.params.eventId;

    // 1) Get all the followers of the user who made the event
    const userFollowersRef = admin
      .firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // 2) Add new event to each follower's timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;

      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelineEvents")
        .doc(eventId)
        .set(eventCreated);
    });
  });

exports.onUpdateEvent = functions.firestore
  .document("/events/{userId}/userEvents/{eventId}")
  .onUpdate(async (change, context) => {
    const eventUpdated = change.after.data();
    const userId = context.params.userId;
    const eventId = context.params.eventId;

    // 1) Get all the followers of the user who made the event
    const userFollowersRef = admin
      .firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // 2) Update each event in each follower's timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;

      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelineEvents")
        .doc(eventId)
        .get()
        .then(doc => {
          if (doc.exists) {
            doc.ref.update(eventUpdated);
          }
        });
    });
  });

exports.onDeleteEvent = functions.firestore
  .document("/events/{userId}/userEvents/{eventId}")
  .onDelete(async (snapshot, context) => {
    const userId = context.params.userId;
    const eventId = context.params.eventId;

    // 1) Get all the followers of the user who made the event
    const userFollowersRef = admin
      .firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // 2) Delete each event in each follower's timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;

      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelineEvents")
        .doc(eventId)
        .get()
        .then(doc => {
          if (doc.exists) {
            doc.ref.delete();
          }
        });
    });
  });

   exports.onCreateActivityFeedItem = functions.firestore
   .document('/feed/{userId}/feedItems/{activityFeedItem}')
   .onCreate(async(snapshot, context)=>{
     console.log('Activity Feed Item Created', snapshot.data());
     
     //1) get user connected to the feed
     const userId = context.params.userId;

     const userRef = admin.firestore().doc(`users/${userId}`);
     const doc = await userRef.get();

     //2) Once we have user, check if they have a notification token
     // send notification if they have a token
     const androidNotificationToken = doc.data().androidNotificationToken;
     const createdActivityFeedItem = snapshot.data();
     if(androidNotificationToken){
       //send notification
       sendNotitfication(androidNotificationToken,createdActivityFeedItem);
     }else{
       console.log("No token for user, cannot send notification");
     }
     function sendNotitfication(androidNotificationToken, activityFeedItem){
       let body;

       //3) switch body value based off of notitfication type
       switch (activityFeedItem.type) {
         case "comment":
           body = `${activityFeedItem.username} replied: ${activityFeedItem.commentData}`;
           break;
        case "like":
           body = `${activityFeedItem.username} liked your post`;
           break;
        case "follow":
            body = `${activityFeedItem.username} started following you`;
            break;
         default:
           break;
       }

       //4) Create message for push notification
       const message = {
         notification:{body},
         token:androidNotificationToken,
         data:{recepient:userId}
       };
       //5) Send message with admin.messging()
       admin
       .messaging()
       .send(message)
       .then(response => {
         //repsonse is a message ID string
         console.log("Successfully send message",response);
       })
       .catch(error =>{
         console.log("Error sending message",error);
       })
     }
   })