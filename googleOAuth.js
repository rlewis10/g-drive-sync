
const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = 'token.json';

// Create a new OAuth2Client, and go through the OAuth2 content workflow.
const gAuth = async () => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file, which should be downloaded from the Google Developers Console.
    const keys = await getKeys('./keys.json')
    const oAuth2Client = new google.auth.OAuth2(
        keys.web.client_id,
        keys.web.client_secret,
        keys.web.redirect_uris[0]
    )

    const getToken = await TokenCheck(oAuth2Client)
    return oAuth2Client.setCredentials(JSON.parse(getToken)) 
}

const getKeys = async (keyFile) => {
    // Download your OAuth2 configuration from the Google console and save as keys.json file
    const keys = await fs.promises.readFile(keyFile)
        .catch(err => {console.log(`Error reading keys from file: ${err}`)})
    return JSON.parse(keys)
}

const TokenCheck = async (oAuth2Client) => {
    // Check if we have previously stored a token.
    if (fs.existsSync(TOKEN_PATH)) {
        return  await fs.promises.readFile('./token.json')
            .catch(err => {console.log(`Error reading Token from file: ${err}`)})
    }
    else {
        return await getNewToken(oAuth2Client)
    }
}

const getNewToken = (oAuth2Client) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        })

    return new Promise(resolve => {
        // Generate the url that will be used for the consent dialog.
        console.log(`Authorize this app by visiting this url: ${authUrl}`);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        // get auth code from url after accepting consent
        rl.question('Enter the code from that page here: ', async (code) => {
            console.log(`returned token: ${code}`)
            const token = await oAuth2Client.getToken(code)

            // Store the token to disk for later program executions
            await fs.promises.writeFile(TOKEN_PATH, JSON.stringify(token))
                .catch(err => {console.error(`Error writing token to file: ${err}`)})
            console.log(`Token stored to file: ${TOKEN_PATH}`)
            rl.close()
            resolve(JSON.stringify(token))
        })

    })
}    
module.exports = {get: gAuth}