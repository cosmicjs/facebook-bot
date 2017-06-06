# Setting Up Your Machine
The process of building your messenger bot is fairly simple the hardest part is setting up your machine to talk to talk to facebook. That's why today I'm going to walk you throught that real quick. Once it is all donce you can get right on the way to creating your own bot.

### Installing The Project
Go to folder where you would like the project to be and run.
```sh
git clone https://github.com/NoahVlncrt/ReminderBuddy
cd ReminderBuddy
yarn install
```
One more thing! Inside of your index.js file remove everything after line 38. We'll go back in and add that later. It should look like this.
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
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
    return res.send(req.query['hub.challenge'])
  }
  res.send('wrong token')
})

app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
})
```

This will only start the express server and prevent us from getting errors before we get a chance to start. See the line of code that says 'process.env.APP_SECRET' this is an environmental variable. There are a few ways you can set these up but for now we'll use my favorite method the 'env' package.

Create a file to store all of your variables.
```sh
touch .env
```
This allows us to store are variables in plain text and clean up the start command. For example mine looks like this. I removed all the sensitive code.
```
APP_SECRET='some secret string of numbers and letters'
ACCESS_TOKEN='some secret string of numbers'
VERIFY_TOKEN='DogLover49'
```
We will fill in APP_SECRET and ACCESS_TOKEN later but for now make sure that you have something in the VERIFY_TOKEN field. It can be anything at all. For the sake of this example I used DogLover49.

### Starting Your Application
Now your going to need to start your application for the next part to work.
Open two seperate terminal windows inside of your application root folder.
```sh
npm run start
```
Run this first and keep it running. Now in the next terminal window we will install and setup local tunnel.

Local Tunnel is a nice little utility that takes a port you specify and routes it to the outside world by giving it a secure web address. We'll just have to install it real quick.
```sh
npm install -g localtunnel
```
All you need to do now is run.
```sh
lt --port 3000 --subdomain <domainpick>
```
It should return this.
```sh
your url is: https://<domainpick>.localtunnel.me
```
This starts a tunnel that gives your machine a url for facebook to look for. Whenever you start the application make sure that you start it before you initiate local tunnel or else it won't find the port and return errors.

### Facebook Dev Panel Time
First thing you need to do is create a new application. Go to the [Facebook Developer Panel ](https://developers.facebook.com/apps/) and create a new app. Once your inside under 'Add Product' find the Messenger section and click on 'get started'.
![facebook panel when you get started.](https://i.imgur.com/G0Q3GdU.png)
After that you'll need to click on the settings tab which will pop up right after. Scroll down until you see this.
![after creating messenger addon](https://i.imgur.com/FKBbpt9.png)
There are two important sections to note here 'Token Generation' and 'Webhooks'.  The first one we are going to touch on is token generation. Select a facebook page your going to use this will be the account you send a message to.
![p](https://i.imgur.com/Xh9Rwom.png)
After you picked a page from the drop down it will generate a page access token. You can now go back and add this to your .env file. Once that is done we are going to change our focus to the webhooks.

Once you click on the button that says 'setup webhooks' you will see this. It may seem scary at first but don't worry.
![scary webooks. SPOOOKY](https://i.imgur.com/zxt1Mmg.png)
The only subscription fields you need to select are messages, messaging_postbacks, messaging_optins, and message_deliveries. Now for the verification token field. Do you remember the variable you created in your .env file under VERIFY_TOKEN? That is exactly what you want to put inside the box in this modal. For the callback url use the url from local tunnel and add '/webhook' to the end for me that would be https://noahsmessengerbog.localtunnel.me/webhook. If you filled in the fields correctly it should look something like this. 
![enter image description here](https://i.imgur.com/uF15Th3.png)
Now go back to your application and make sure that is is running and you are also fowarding the url. Double check the url and make sure it's the same thing as shown in the callback url field.

Once it is all running succesfully you can click 'verify and save' this will have facebook send a request to the callback url and expect you to return the correct item from a json object. 

At this point you should have almost all of the items you need inside of the .env file except for the App Secret. This can be easily found by going to your dashboard. 

## The Bot Comes Next
Remeber how earlier we removed everything after line 38? Now you can go and paste it back in. It should match [this](https://github.com/NoahVlncrt/ReminderBuddy/blob/master/index.js) file exactly. When that is all done we can go over the code and learn just how it works. It should look like this.
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
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
    return res.send(req.query['hub.challenge'])
  }
  res.send('wrong token')
})

app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
})


const bot = new BootBot({
  accessToken: process.env.ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
})

bot.setGreetingText("Hello, I'm here to help you manage your tasks. Be sure to setup your bucket by typing 'Setup'. ")

bot.setGetStartedButton((payload, chat) => {
  if(config.bucket === undefined){
    chat.say('Hello my name is Note Buddy and I can help you keep track of your thoughts')
    chat.say("It seems like you have not setup your bucket settings yet. That has to be done before you can do anything else. Make sure to type 'setup'")
  }
  BotUserId = payload.sender.id
});

bot.hear('setup', (payload, chat) => {
  const getBucketSlug = (convo) => {
    convo.ask("What's your buckets slug?", (payload, convo) => {
      var slug = payload.message.text;
      convo.set('slug', slug)
      convo.say("setting slug as "+slug).then(() => getBucketReadKey(convo));
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
    config.bucket = newConfigInfo
    convo.say('All set :)')
    convo.end();
  }
  
  chat.conversation((convo) => {
    getBucketSlug(convo)
  })
})

bot.hear(['hello', 'hey', 'sup'], (payload, chat)=>{
  chat.getUserProfile().then((user) => {
    chat.say(`Hey ${user.first_name}, How are you today?`)
  })
})

bot.hear('config', (payloadc, hat) => {
  if(JSON.stringify(config.bucket) === undefined){
    chat.say("No config found :/ Be sure to run 'setup' to add your bucket details")
  }
  chat.say("A config has been found :) "+ JSON.stringify(config.bucket))
})

bot.hear('create', (payload, chat) => {
  chat.conversation((convo) => {
    convo.ask("What would you like your reminder to be? etc 'I have an appointment tomorrow from 10 to 11 AM' the information will be added automatically", (payload, convo) => {
      datetime = chrono.parseDate(payload.message.text)
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
      }
      Cosmic.addObject(config, params, function(error, response){
        if(!error){
          eventEmitter.emit('new', response.object.slug, datetime)
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

bot.hear('active', (payload, chat) => {
  chat.say('finding all of your ongoing reminders.')
})

eventEmitter.on('new', function(itemSlug, time) {
  schedule.scheduleJob(time, function(){
    Cosmic.getObject(config, {slug: itemSlug}, function(error, response){
      if(response.object.metadata.date == new Date(time).toISOString()){
        bot.say(BotUserId, response.object.title)
        console.log('firing reminder')
      } else {
        eventEmitter.emit('new', response.object.slug, response.object.metafield.date.value)
        console.log('times do not match checking again at '+response.object.metadata.date)
      }
    })
  })
})

bot.start()
```

This bot comes with a few interactions to get us off the ground. Each one is completely seperate from the others so you can remove and modify them as you wish. I left it as bare as possible for this purpose. Let's take a look at them.
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
2. Now we take what the user said and parse it using a [natural date parsing](https://github.com/wanasit/chrono) package.
3. We build the params object to be used with the cosmicjs object addition.
4. Now we take the CosmicJS package and insert our new object using the params we created earlier.
5. Here we are sending a nodejs event emitter passing the slug from the return and the datetime we created earlier.

```js
bot.hear('help', (payload, chat) => {
  chat.say('Here are the following commands for use.')
  chat.say("'create': add a new reminder")
  chat.say("'setup': add your bucket info such as slug and write key")
  chat.say("'config': lists your current bucket config")
})
```
This will return a series of messages telling you what you can and can't do with the bot.

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
