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

bot.hear('config', (payload, chat) => {
  if(JSON.stringify(config.bucket) === undefined){
    chat.say("No config found :/ Be sure to run 'setup' to add your bucket details")
  }
  chat.say("A config has been found :) "+ JSON.stringify(config.bucket))
})

bot.hear('create', (payload, chat) => {
  chat.conversation((convo) => {
    convo.ask("What would you like your reminder to be? etc 'I have an appointment tomorrow from 10 to 11 AM' the information will be added automatically", (payload, convo) => {
      console.log(payload.message.text)
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
      var addition = {title: payload.message.text, date: datetime}
      eventEmitter.emit('new', addition)
      Cosmic.addObject(config, params, function(error, response){
      })
      convo.end()
    })
  })
})

bot.hear('active', (payload, chat) => {
  chat.say('finding all of your ongoing reminders.')
})

eventEmitter.on('new', function(itemobject) {
  reminders.push(itemobject)
  schedule.scheduleJob(itemobject.date, function(){
    bot.say(BotUserId, itemobject.title)
  })
})

bot.start()