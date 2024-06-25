![Auto Linkedin](https://github.com/Ranork/Auto-Linkedin/blob/main/logo.png?raw=true)

# Auto LinkedIn

Auto LinkedIn is a project that provides automation for LinkedIn using Node.js and Puppeteer. This project helps you save time by automating various tasks on LinkedIn.

Check out the the [wiki](https://github.com/Ranork/Auto-Linkedin/wiki/Installation) for details.

## Features

- Sign in functionalities
- Search user profiles with keywords, network distance etc.
- Sending connection requests
- Visit profiles
- Company invitations
- (Work In Progress) Sending messages

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
| Linkedin        | searchPeople       | Find people from search          | 1.0.0           |
| Linkedin        | getLastConnections | Find latest connected people     | 1.1.3           |
| Linkedin        | getMyCompany       | Get owned company                | 1.1.3           |
| LinkedinProfile | visitProfile       | Visit user's profile for a while | 1.1.0           |
| LinkedinProfile | connectionRequest  | Send connection request          | 1.1.0           |
| LinkedinCompany | fetchDetails       | Fetch details of owned company   | 1.1.3           |
| LinkedinCompany | sendInvite         | Send invitation to a user        | 1.1.3           |

## Usage

1. Create a linkedin client and login:
```js
const client = new LinkedIn()
await client.login(process.env.USERNAME, process.env.PASSWORD)

//-- Console
// [TASK] Login
//   New Browser created.
//   Login completed.
```
Follow the console even though there is an extra instruction.

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
