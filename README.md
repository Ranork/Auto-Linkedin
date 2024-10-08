![Auto Linkedin](https://github.com/Ranork/Auto-Linkedin/blob/main/logo.png?raw=true)

# Auto LinkedIn

Auto LinkedIn is a project that provides automation for LinkedIn using Node.js and Puppeteer. This project helps you save time by automating various tasks on LinkedIn.

Check out the the [wiki](https://github.com/Ranork/Auto-Linkedin/wiki) for details.

Check out the [desktop app](https://github.com/Ranork/Auto-Linkedin-App)

## Important Note
Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.


## Features

- Sign in functionalities
- Search user profiles with keywords, network distance etc.
- Sending messages and getting history
- Sending connection requests
- Visit profiles
- Company invitations

## Installation

### Prerequisites
- Make sure you have Node.js and npm installed. [Node.js Installation](https://nodejs.org/)
- Puppeteer library is used, which requires Chrome browser for automation.

### Installation Steps
1. Create a new directory
```bash
mkdir linkedinAutomationProject
cd linkedinAutomationProject
```

2. Install NPM
```bash
npm init -y
```

3. Install package:
```bash
npm install auto-linkedin
```

## Methods and objects

| Class           | Method             | Explanation                      | Publish Version |
|-----------------|--------------------|----------------------------------|-----------------|
| Linkedin        | login              | Authentication for linkedin      | 1.0.0           |
| Linkedin        | close              | Close the client and browser     | 1.3.1           |
| Linkedin        | searchPeople       | Find people from search          | 1.0.0           |
| Linkedin        | getLastConnections | Find latest connected people     | 1.1.3           |
| Linkedin        | getMyProfile       | Get self profile details         | 1.3.4           |
| Linkedin        | getMyCompany       | Get owned company                | 1.1.3           |
| Linkedin        | getBrowser         | Get client's puppeteer browser   | 1.3.1           |
| LinkedinProfile | getProfile         | Get profile from url or id       | 1.2.0           |
| LinkedinProfile | sendMessage        | Send message to a profile        | 1.3.0           |
| LinkedinProfile | getMessageHistory  | Get history of messages          | 1.3.0           |
| LinkedinProfile | visitProfile       | Visit user's profile for a while | 1.1.0           |
| LinkedinProfile | connectionRequest  | Send connection request          | 1.1.0           |
| LinkedinCompany | fetchDetails       | Fetch details of owned company   | 1.1.3           |
| LinkedinCompany | sendInvite         | Send invitation to a user        | 1.1.3           |

## Usage

1. Create a linkedin client and login:
```js
const { LinkedIn } = require('auto-linkedin')

const client = new LinkedIn()
await client.login(process.env.USERNAME, process.env.PASSWORD)

//-- Console
// [TASK] Login
//   New Browser created.
//   Login completed.
```
Follow the console even though there is an extra instruction.


Usage with ES6
```js
import { LinkedIn } from 'auto-linkedin'

const client = new LinkedIn()
await client.login(process.env.USERNAME, process.env.PASSWORD)

//-- Console
// [TASK] Login
//   New Browser created.
//   Login completed.
```


2. Search for users with keyword and 2. network distance (200 limit):
```js
const profiles = await client.searchPeople({
   keywords: 'venture capital',
   network: ['S']
}, 200)

// profiles = [LinkedinProfile, LinkedinProfile, ...]

//-- Console
// [TASK] Search People: 200 ({"keywords":"venture capital","network":["S"]})
//   Page: 1/30 -> 10
//   Page: 2/30 -> 10
//   Page: 3/30 -> 10
//   Page: 4/30 -> 10
// ....
//   Search complete: 200
```
You can use profile methods or access properties like name, url, title etc.

3. Send connection request with a note:
```js
for (let p of profiles) {
   await p.connectionRequest(client, 'Hi! Please accept my request')
}

//-- Console
// [TASK] Conection request: Test User - test-user
//   Connection request send to Test User (test-user)
//....
```


## Contact

For any questions or feedback about the project, please contact us through GitHub or emir@akatron.net


## Contributions

If you would like to contribute, please feel free to submit a pull request. We welcome any contributions!

## License

This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for more information.
