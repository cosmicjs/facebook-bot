
## Building A Facebook Bot With NodeJS and CosmicJS
*if you missed the facebook/express guide read it here*

Today i'm going to show you how to use javascript and to create a customizable Facebook Messenger bot. Once you do this you'll be able to modify and change it however you wish.
*insert usage gif right here*

### Setup
If you've read and done everything in the last guide you should have an app that communicates with facebook and the code should look something like this. 
```js
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const Cosmic = require('cosmicjs')
const BootBot = require('bootbot')
require('dotenv').config()
const chrono = require('chrono-node')
var schedule = require('node-schedule')
const EventEmitter = require('events').EventEmitter

var config = {}

const reminders = []

const eventEmitter = new EventEmitter()

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send("hey there boi")
})

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === process.env.APP_SECRET){
    res.send(req.query['hub.challenge'])
    console.log(hub.challenge)
    const newtoken = hub.challenge
  }
  res.send('wrong token')
})

app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
})
```
Now go on over to [here](https://github.com/NoahVlncrt/ReminderBuddy/blob/master/index.js) and make sure that both files match exactly. If you have already done the setup guide you can just delete everything and copy the file in it's place. 

## Overview
This deck comes with a few interactions to get us off the ground. Each one is completely seperate from the others so you can remove and modify them as you wish. I left it as bare as possible for this purpose. Let's take a look at them.
```js
const bot = new BootBot({
  accessToken: process.env.ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
}) // 1

bot.setGreetingText("Hello, I'm here to help you manage your tasks. Be sure to setup your bucket by typing 'Setup'. ") // 2

bot.setGetStartedButton((payload, chat) => {
  if(config.bucket === undefined){
    chat.say('Hello my name is Note Buddy and I can help you keep track of your thoughts')
    chat.say("It seems like you have not setup your bucket settings yet. That has to be done before you can do anything else. Make sure to type 'setup'")
  }
  BotUserId = payload.sender.id
}); // 3
```
1. This creates an object that talks to the bootbot npm package. This allows us to use webhooks and such things.
2. This shows you a nice little message before you decide to message the facebook page.
3. Creates a get started button as a barrier to entry before you message the bot. It also checks if you have setup the bucket config information yet. This is done later on by calling a certain command. You can also modify it so It is hardwired with your bucket information.

```js
bot.hear('setup', (payload, chat) => { // 1 
  const getBucketSlug = (convo) => { // 2
    convo.ask("What's your buckets slug?", (payload, convo) => {
      var slug = payload.message.text;
      convo.set('slug', slug) // 3
      convo.say("setting slug as "+slug).then(() => getBucketReadKey(convo)); // 3 
    })
  }
  const getBucketReadKey = (convo) => {
    convo.ask("What's your buckets read key?", (payload, convo) => {
      var readkey = payload.message.text;
      convo.set('read_key', readkey)
      convo.say('setting read_key as '+readkey).then(() => getBucketWriteKey(convo))
    })
  }
  const getBucketWriteKey = (convo) => {
    convo.ask("What's your buckets write key?", (payload, convo) => {
      var writekey = payload.message.text
      convo.set('write_key', writekey)
      convo.say('setting write_key as '+writekey).then(() => finishing(convo))
    })
  }
  const finishing = (convo) => {
    var newConfigInfo = {
      slug: convo.get('slug'),
      read_key: convo.get('read_key'),
      write_key: convo.get('write_key')
    } 
    config.bucket = newConfigInfo // 4
    convo.say('All set :)')
    convo.end();
  }
  
  chat.conversation((convo) => {
    getBucketSlug(convo) // 5
  })
})
```
1. This initiates a function that listens for specific keyworks. Here we are listening for 'setup' but it can be changed to be anything. It can even accept regex statements.
2. Creates a function that can be called later to start the chain.
3. Takes what you send as an answer and sets that to a slug value that can be called in this instance of the conversation. If you started another conversation later in a seperate instance this value would not be remembered.
4. Now we are starting to finish up the setup process with our final touches. First thing we have to do is get all of the information together. Right here we are grabbing all of the info by calling 'convo.get'. Then we add it to the config object declared earlier.
5. This is where everything starts. We start the conversation and start passing the convo value around.

```js
bot.hear(['hello', 'hey', 'sup'], (payload, chat)=>{
  chat.getUserProfile().then((user) => {
    chat.say(`Hey ${user.first_name}, How are you today?`)
  })
})
```
Here we are utilizing the 'bot.hear' method and being friendly to the user. Remember earlier when I said you can use regex to listen for user input? You can also use an array of specific words! When the user says 'hello' we grab there profile information from facebook and greet them by name. It may seem weird at first but I promise robots knowing your name is normal.

```js
bot.hear('create', (payload, chat) => {
  chat.conversation((convo) => { 
    convo.ask("What would you like your reminder to be? etc 'I have an appointment tomorrow from 10 to 11 AM' the information will be added automatically", (payload, convo) => { // 1
      datetime = chrono.parseDate(payload.message.text) // 2
      var params = {
        write_key: config.bucket.write_key,
        type_slug: 'reminders',
        title: payload.message.text,
        metafields: [
         {
           key: 'date',
           type: 'text',
           value: datetime
         }
        ]
      } // 3
      Cosmic.addObject(config, params, function(error, response){ // 4
        if(!error){
          eventEmitter.emit('new', response.object.slug, datetime) //5
          convo.say("reminder added correctly :)")
          convo.end()
        } else {
          convo.say("there seems to be a problem. . .")
          convo.end()
        }
      })
    })
  })
})
```
1. Inside of the conversation we ask the user a question and wait for the reply.
2. Now we take what the user said and parse it using a [naturl date parsing](https://github.com/wanasit/chrono) package.
3. We build the params object to be used with the cosmicjs object addition.
4. Now we take the CosmicJS package and insert our new object using the params we created earlier.
5. Here we are sending a nodejs event emitter passing the slug from the return and the datetime we created earlier.

```js
eventEmitter.on('new', function(itemSlug, time) { // 1
  schedule.scheduleJob(time, function(){ // 2
    Cosmic.getObject(config, {slug: itemSlug}, function(error, response){ // 3
      if(response.object.metadata.date == new Date(time).toISOString()){ // 4
        bot.say(BotUserId, response.object.title) // 5
        console.log('firing reminder')
      } else {
        eventEmitter.emit('new', response.object.slug, response.object.metafield.date.value) // 6
        console.log('times do not match checking again at '+response.object.metadata.date)
      }
    })
  })
})
```
Now we are playing with [event emitters](https://nodejs.org/api/events.html) these are neat functions provided by NodeJS out of the box. They work almost like calling functions but they are way more versatile.
6. We create an event emitter that listens for the new event to be passed.
7. Now we use the schedule package and tell it to wait unitl the time you passed earlier.
8. Next we call cosmicjs and grab the specific object you just created.
9. Now we take the response and compare it to the time you passed originally if the time changed we then send it back to the event emitter and check again at the changed time.
10. here we call the event emitter again.

If you did everything correctly you should be able to start the bot up by typing in a few commands.
```sh
npm run start
```
Now in a different terminal window
```sh
npm run foward
```
This will use local tunnel to let your application talk to facebook. Now you can modify this as much as you want and it should work just like you want it to. Thanks for reading and if you liked it be sure to check out CosmicJS. 