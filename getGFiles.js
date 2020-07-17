const { google } = require('googleapis')
const gOAuth =  require('./googleOAuth')

// initialize google oauth creds 
let readCredentials = gOAuth.readOauthDetails('credentials.json')
let authorized = gOAuth.authorize(readCredentials, getGFilePaths)

// resolve the promises for getting G files and folders
async function getGFilePaths(auth){
  
  let gRootFolder = await getGfiles(auth).then(result => {return result[2][0]['parents'][0]})
  let gFolders = await getGfiles(auth).then(result => {return result[1]})
  let gFiles = await getGfiles(auth).then(result => {return result[0]})

  // create the path files and create a new key with array of folder paths, returning an array of files with their folder paths
  let pathFiles = gFiles
                      .filter((file) => {return file.hasOwnProperty('parents')})
                      .map((file) => ({...file, path: makePathArray(gFolders, file['parents'][0], gRootFolder)}))

  return pathFiles

}

// recursive function to build an array of the file paths top -> bottom
let makePathArray = (folders, fileParent, rootFolder) => {
  if(fileParent === rootFolder){return []}
  else {
    let filteredFolders = folders.filter((f) => {return f.id === fileParent})
    if(filteredFolders.length >= 1 && filteredFolders[0].hasOwnProperty('parents')){
      let path = makePathArray(folders, filteredFolders[0]['parents'][0])
      path.push(filteredFolders[0]['name'])
      return path
    }
    else{return []}
  }
}

// get Google meta data on files and folders
const getGfiles = (auth) => {
  try {
    let getRootFolder = getGdriveList(auth, {corpora: 'user', includeItemsFromAllDrives: false,
    fields: 'files(name, parents)', 
    q: "'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'"})
  
    let getFolders = getGdriveList(auth, {corpora: 'user', includeItemsFromAllDrives: false,
    fields: 'files(id,name,parents), nextPageToken', 
    q: "trashed = false and mimeType = 'application/vnd.google-apps.folder'"})
  
    let getFiles = getGdriveList(auth, {corpora: 'user', includeItemsFromAllDrives: false,
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

module.exports = {getGFilePaths: getGFilePaths}