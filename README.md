![Auto Linkedin](https://github.com/Ranork/Auto-Linkedin/blob/main/logo.png?raw=true)

# Auto LinkedIn

This project provides automation for LinkedIn using Node.js and Puppeteer.

## Installation

1. Clone the project:
```bash
git clone https://github.com/Ranork/Auto-Linkedin.git
```

2. Navigate to the project directory:
```bash
cd Auto-Linkedin
mkdir cache
```

3. Install the dependencies:
```bash
npm install
```

## Usage

1. Open the `.env` file and configure your LinkedIn account credentials (username & password) and other necessary settings for automation tasks.

2. Run the application:
```bash
npm run start
```


### Example Usage

1. Create a linkedin client and login:
```js
const client = new LinkedIn({ headless: true })
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

// profiles = [Profile, Profile, ...]

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


## Features

- Sign in and sign out functionalities.
- Search user profiles with keywords etc.
- Sending connection requests.
- Visit profiles.
- (WIP) Sending messages.

## Contributions

If you would like to contribute, please feel free to submit a pull request. We welcome any contributions!

## License

This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for more information.
