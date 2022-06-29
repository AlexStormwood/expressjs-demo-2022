# expressjs-demo-2022
 Demo of common web server functionalities in ExpressJS, including deployment, CRUD, CORS, and testing.


## TODO

- CRUD


# Notable Parts

## ExpressJS Architecture

This app has a specific architecture to help facilitate testing and CICD features.

In a typical ExpressJS app or tutorial, you've probably seen structures like this:

```mermaid
	graph TD;
		index.js-->credential files;
		index.js-->route files;
		route files-->model files;
		route files-->function files (eg. auth, validate);
		test files-->index.js
```

While that's good, that layout is sometimes not great for CICD and other automated things. An `index.js` file in this structure has server configuration _and_ server boot-up contained in the same file -- that "app.listen" that you've probably written once per project and forgotten about. That's not great for anything that needs to import that server _and_ control when that server starts and stops, such as Jest. 

Instead, we need to split the `index.js` into multiple parts.

```mermaid
	graph TD;
		index.js (server boot)-->server config;
		server config-->route files;
		route files-->model files;
		route files-->function files (eg. auth, validate);
		test files-->server config
```

Basically, the `index.js` file should only start the server. It should not contain any configuration or options or routing or anything else - just import a configured server and start it. 

This is essential for stuff like using Jest in GitHub Actions; if you don't use this architecture, Jest can't close the server properly after testing and it causes GitHub Actions to hang open. That causes issues like broken automation workflows - or worse, high billing costs.

Have a look at these files to see this in action:
- [src/index.js](src/index.js)
- [src/server.js](src/server.js)


## CICD

This section covers the automation features run by GitHub Actions, as well as deployment to Heroku.

This section assumes you've read through these files:
- [package.json](package.json) -- specifically the "scripts" section
- [.github/workflows/ci.yml](.github/workflows/ci.yml)
- [.github/workflows/cd.yml](.github/workflows/cd.yml)
- [Procfile](Procfile)


### The package.json file
The `package.json` file contains a few script commands that help facilitate CICD features. Of note are:

- `"test-ci": "jest --detectOpenHandles --ci --reporters='default' --reporters='./tests/GithubActionReporter'",`

This "test-ci" command runs Jest with extra options. The "detectOpenHandles" option helps close servers in CICD environments, and the "ci" flag changes the output of Jest a bit to work better in CICD environments too. The "reporters" flags then format the output _again_ to make it easier to read in the git repo's Action section on the GitHub website. The "GithubActionReporter" is a custom reporter that is found in the repo's `test` directory - it literally just formats the Jest test results in a better way for GitHub Actions.

- `"start-production": "NODE_ENV=production node src/index.js"`

This "start-production" command is like ye olde `npm start`, but specifically for production! It doesn't do much here, but it shows how an environment variable can be passed in from the command.

It's tidier to keep your production and development commands separate - if dev works but prod fails, there could be something wrong with this command. Or if prod works and dev fails, there could be something wrong with the dev command. 

It's something that you wouldn't really edit very often, but it's a nice structural thing.

### The CI workflow file

Make sure you're referring to this file when reading through here: [.github/workflows/ci.yml](.github/workflows/ci.yml)

This workflow begins the full testing _and_ deployment process. If tests fail, no new deployment gets pushed to the live website. If tests pass, this workflow triggers the deployment workflow.

The workflow uses GitHub Actions syntax to only trigger on commits (or pushes) and pull request creation. 

```yml
on: 
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

```

The testing step installs the required NPM packages and runs the project's tests.

```yml
  run_server_tests:
    name: Run server tests 
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Configure Node.js '16.x'
      uses: actions/setup-node@v3
      with:
        node-version: '16.x'
    - run: npm install

    - name: Run tests
      run: npm run test-ci
      env:
        CI: true

```

When tests pass, the deployment step triggers.

```yml
  call_deploy_workflow:
    if: github.event.push == true
    needs: run_server_tests
    name: Deploy
    uses: ./.github/workflows/cd.yml
    secrets: inherit
    

```

However, the deployment step doesn't trigger on pull requests - a pull request being merged into main makes another commit, which would then trigger the deployment. A pull request being created should _not_ trigger a deployment.

Due to the way GitHub Actions triggers workflows, we have to specify that we want any secret variables (eg. database configs) to pass along to the next workflow.


### The CD workflow file

Make sure you're referring to this file when reading through here: [.github/workflows/cd.yml](.github/workflows/cd.yml)

The deployment workflow is pretty sparse;

```yml
name: Automated Heroku Deployment

on: 
  workflow_call

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "expressjs-demo-2022"
          heroku_email: "alex.holder@bigfootds.com"

```

That code is configured to my own Heroku account;
- the email address must match your own account
- the app name must match an existing empty Heroku app available in your Heroku dashboard
- the Heroku API key must be one that you've generated

To generate a Heroku API key and add it to your GitHub repo, the "heroku-deploy" action has this short and sweet guide written up:

```
Now go to your Heroku account and go to Account Settings. Scroll to the bottom until you see API Key. Copy this key and go to your project's repository on GitHub.

In your Repo, go to Settings -> Secrets and click on "New Secret". Then enter HEROKU_API_KEY as the name and paste the copied API Key as the value.

```

That action's documentation is very comprehensive, so if you want to read it please visit [this page](https://github.com/marketplace/actions/deploy-to-heroku#getting-started). Digging through their docs is not required if you're just reading this markdown and copying files to your own repo!

One last catch for deployment: Heroku needs your ExpressJS project to contain a Procfile. This Procfile is just an instruction file for Heroku - we have to tell it what command to run to actually boot up the server. Check out the Procfile for this project here:

- [Procfile](Procfile)

As you can see, it literally just contains:
`web: npm run start-production`