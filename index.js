const {google} = require('googleapis');
const gOAuth = require('./googleOAuth')
const aws = require('aws-sdk');

// initialize google oauth credentenatials 
let readCredentials = gOAuth.readOauthDetails('credentials.json')
let authorized = gOAuth.authorize(readCredentials, run)

function run(auth){
  console.log(`run time:`)
  getGfiles(auth).then(result => {console.log(result)})
}

// get Google meta data on files and folders
const getGfiles = (auth) => {
  try {
    let getRootFolder = getGdriveList(auth, {corpora: 'user', 
    fields: 'files(name, parents)', 
    q: "'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'"})
  
    let getFolders = getGdriveList(auth, {corpora: 'user', 
    fields: 'files(id,name,parents), nextPageToken', 
    q: "trashed = false and mimeType = 'application/vnd.google-apps.folder'"})
  
    let getFiles = getGdriveList(auth, {corpora: 'user', 
    fields: 'files(id,name,parents, mimeType, fullFileExtension, webContentLink, exportLinks, modifiedTime), nextPageToken', 
    q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'"})
  
    return Promise.all([getFiles, getFolders, getRootFolder])
  }
  catch(error) {
    return `Error in retriving a file reponse from Google Drive: ${error}`
  }
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

let buildPaths = (folders) => {
  folders.forEach((element, index, folders) => {
    element['path'] = [element.parent, element.id]
    element.path.unshift(...makePathArray(folders, element['parents'][0]))
  })
}

let makePathArray = (folders, fileParent) => {
  if(fileParent === null){return []}
  let filteredFolders = folders.filter((f) => {return f.id === fileParent})
  let path = makePathArray(folders, filteredFolders[0]['parents'][0])
  path.push(filteredFolders[0]['parents'][0])
  return path
}