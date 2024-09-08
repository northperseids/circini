# circini
![Image showing two embedded proxies in conversation](/image.png)<br><br>
Small bot to allow a version of semi-proxying in Discord DMs.<br><br>
I made this in my spare time because I was bored. It's a utility intended to be of a Pluralkit-esque nature that allows semi-proxying in DMs through the use of embeds. It takes up a chunk of visual space in the chat, but it's the best I could do with no webhooks available in DMs.<br><br>
This will not be a regularly-updated project, but I've come back to it on occasion.

# Usage
The bot can only be configured for one system profile at a time. Management can be done entirely through Discord (ideally).<br><br>
Also, please note that the maximum members possible in a system (currently) is 41 (I know that may seem small for some folks, but Discord allows 50 slash commands per bot, and 9 of those are taken up by utility commands). I might try to figure out a way to use subcommands to allow more, but - well, haven't done that yet.
### Commands
/resetsys - reset and set up a system<br>
/add - add a member<br>
/list - get a list of system members and their properties<br>
/delete - delete a member<br>
/proxy - change a member's proxy<br>
/avatar - change a member's avatar<br>
/color - change a member's color<br>
/help - about the bot and commands<br>
/register - registers new proxy commands<br>

### Self-hosting
This bot has to be self-hosted. If you're new to self-hosting a Discord bot, there's a lot of resources and videos available on how to get started.

*Note that in order to use it in DMs you'll need to enable "User Install" in the Discord developer portal under Installation, and install/authorize the bot on your USER ACCOUNT, not on a server.*

***Also, please note that if you allow other people to authorize your bot, EVERYONE WHO AUTHORIZES THE BOT will be able to access your profile and send messages in DMs with your proxies!!! This is meant to be ONE BOT INSTANCE PER PROFILE!***

If you get stuck, there's plenty of decent videos and etc. showing how to get a bot up and running!

# Support/Contact
If you're running into issues *with the bot, not with HOSTING the bot,* you can contact me on Discord @neartsua!
