const {google} = require('googleapis');
const gOAuth = require('./googleOAuth')
const aws = require('aws-sdk');

// initialize google oauth credentenatials 
let readCredentials = gOAuth.readOauthDetails('credentials.json')
let authorized = gOAuth.authorize(readCredentials, listFolders)

/**
 * Lists all folders in drive
 */
async function listFolders(auth) {
  let folders = []
  let nextPgToken = null
  const drive = google.drive({version: 'v3', auth})

  //get root folder
  const rootFolderParams = {
                            corpora: 'user', 
                            fields: 'files(name, parents)', 
                            q: "'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'"
                          }
  let getrootFolder = await drive.files.list(rootFolderParams)
  let rootFolder = getrootFolder.data.files[0].parents[0]

  //cycle through pageTokens to get all folders
  do {
    const params = {
                    corpora: 'user',
                    fields: 'files(id,name,parents), nextPageToken',
                    q: "trashed = false and mimeType = 'application/vnd.google-apps.folder'",
                    pageToken: nextPgToken
                  }

    let res = await drive.files.list(params)
    folders.push(...res.data.files)
    nextPgToken = res.data.nextPageToken
  } 
  while (nextPgToken !== undefined)

  // pass folderList through makeTree to build object tree of folders
  console.log(folders)
  return folders
}