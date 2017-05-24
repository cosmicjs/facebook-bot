# Setting Up Your Machine
The process of building your messenger bot is fairly simple the hardest part is setting up your machine to talk to talk to facebook. That's why today I'm going to walk you throught that real quick. Once it is all donce you can get right on the way to creating your own bot.

### Installing The Project
Go to folder where you would like the project to be and run.
```sh
git clone https://github.com/NoahVlncrt/ReminderBuddy
cd ReminderBuddy
yarn install
```
One more thing! Make sure the only thing in your index.js is this for now. Later on we'll add the other parts.
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

### Local Tunnel
Local Tunnel is a nice little utility that takes a port you specify and routes it to the outside world by giving it a secure web address. We'll just have to install it real quick.
```sh
sudo apt-get install localtunnel
```
All you need to do now is run.
```sh
lt --port 3000 --subdomain <domainpick>
```
It should return this.
```sh
your url is: https://<domainpick>.localtunnel.me
```
This starts a tunnel that gives your machine a url for facebook to look for. You need to run this after you started your application using 'npm run start'.

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


