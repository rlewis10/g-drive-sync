const {google} = require('googleapis')
const gOAuth = require('./googleOAuth')
const aws = require('aws-sdk')
const fs = require('fs')

// initialize google oauth credentenatials 
let readCredentials = gOAuth.readOauthDetails('credentials.json')
let authorized = gOAuth.authorize(readCredentials, run)

async function run(auth){
  
  let gRootFolder = await getGfiles(auth).then(result => {return result[2][0]['parents'][0]})
  let gFolders = await getGfiles(auth).then(result => {return result[1]})
  let gFiles = await getGfiles(auth).then(result => {return result[0]})

  let pathFiles = gFiles
                      .filter((file) => {return file.parents !== undefined })
                      .map((file) => ({...file, path: [file['parents'][0], file.name]}))
                       
  
  //pathFiles.path.unshift(...makePathArray(gFolders, pathFiles['parents'][0], gRootFolder))

  const data = JSON.stringify(gFolders, null, 4)
  fs.writeFile("gFolders.json", data, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  })

}

let makePathArray = (folders, fileParent, rootFolder) => {
  if(fileParent === rootFolder){return []}
  let filteredFolders = folders.filter((f) => {return f.id === fileParent})
  let path = makePathArray(folders, filteredFolders[0]['parents'][0])
  path.push(filteredFolders[0]['parents'][0])
  return path
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