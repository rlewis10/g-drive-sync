const {google} = require('googleapis');
const gOAuth = require('./googleOAuth')
const aws = require('aws-sdk');

// initialize google oauth credentenatials 
let readCredentials = gOAuth.readOauthDetails('credentials.json')
let authorized = gOAuth.authorize(readCredentials, getGfiles)

// get Google meta data on files and folders
function getGfiles(auth) {
  let rootFolder = getGdriveList(auth, {corpora: 'user', 
                                        fields: 'files(name, parents)', 
                                        q: "'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'"})

  let folders = getGdriveList(auth, {corpora: 'user', 
                                    fields: 'files(id,name,parents), nextPageToken', 
                                    q: "trashed = false and mimeType = 'application/vnd.google-apps.folder'"})

  let files = getGdriveList(auth, {corpora: 'user', 
                                    fields: 'files(id,name,parents, mimeType), nextPageToken', 
                                    q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'"})

  files.then(result => {console.log(result)})
  folders.then(result => {console.log(result)})
  rootFolder.then(result => {console.log(result)})
}

const getGdriveList = async (auth, params) => {
  let list = []
  let nextPgToken
  const drive = google.drive({version: 'v3', auth})
  do {
    let res = await drive.files.list(params)
    list.push(...res.data.files)
    nextPgToken = res.data.nextPageToken
    params.pageToken = nextPgToken
  }
  while (nextPgToken)
  return list
}