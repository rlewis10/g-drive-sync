const {google} = require('googleapis');
const gOAuth = require('./googleOAuth')
const aws = require('aws-sdk');

// initialize google oauth credentenatials 
let readCredentials = gOAuth.readOauthDetails('credentials.json')
let authorized = gOAuth.authorize(readCredentials, getGfiles)

async function getGfiles(auth) {
  let rootFolder = getGdrive(auth, {corpora: 'user', 
                                  fields: 'files(name, parents)', 
                                  q: "'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'"
                                 })

  let folders = getGdrive(auth, {corpora: 'user',
                                fields: 'files(id,name,parents), nextPageToken',
                                q: "trashed = false and mimeType = 'application/vnd.google-apps.folder'"
                                })
}

const getGdrive = async (auth, params) => {
  let list = []
  let nextPgToken = null
  const drive = google.drive({version: 'v3', auth})

  do {
    let res = await drive.files.list(params)
    list.push(...res.data.files)
    nextPgToken = res.data.nextPageToken
    params.pageToken = nextPgToken
  }
  while (nextPgToken !== undefined)
  
  console.log(list)
  return list
}