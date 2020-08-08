const { google } = require('googleapis')
const gOAuth =  require('./googleOAuth')

// download gFile, non google docs files. Downloaded as a stream of data and pipped into the awsUpload function
const getGFileContent = async (fileObj) => {
  const gKeys = await gOAuth.get()
  const drive = google.drive({version: 'v3', auth: gKeys})
  return drive.files.get({fileId: fileObj.id, mimeType: fileObj.mimeType, alt: 'media'}, {responseType: 'stream'})
    .then(res => {
      return new Promise((resolve, reject) => {
        res.data
          .on('end', () => {resolve()})
          .on('error', err => {reject(`Error downloading Google file: ${err}`)})
          .pipe(awsUpload(fileObj.path))
          })
      })
}

// resolve the promises for getting G files and folders
const getGFilePaths = async () => {
  //update to use Promise.All()
  let gRootFolder = await getGfiles().then(result => {return result[2][0]['parents'][0]})
  let gFolders = await getGfiles().then(result => {return result[1]})
  let gFiles = await getGfiles().then(result => {return result[0]})
  // create the path files and create a new key with array of folder paths, returning an array of files with their folder paths
  return pathFiles = gFiles
                      .filter((file) => {return file.hasOwnProperty('parents')})
                      .map((file) => ({...file, path: makePathArray(gFolders, file['parents'][0], gRootFolder)}))
}

// recursive function to build an array of the file paths top -> bottom
let makePathArray = (folders, fileParent, rootFolder) => {
  if(fileParent === rootFolder){return []}
  else {
    let filteredFolders = folders.filter((f) => {return f.id === fileParent})
    if(filteredFolders.length >= 1 && filteredFolders[0].hasOwnProperty('parents')) {
      let path = makePathArray(folders, filteredFolders[0]['parents'][0])
      path.push(filteredFolders[0]['name'])
      return path
    }
    else {return []}
  }
}

// get meta-data list of files from gDrive, with query parameters
const getGfiles = () => {
  try {
    let getRootFolder = getGdriveList({corpora: 'user', includeItemsFromAllDrives: false,
    fields: 'files(name, parents)', 
    q: "'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'"})
  
    let getFolders = getGdriveList({corpora: 'user', includeItemsFromAllDrives: false,
    fields: 'files(id,name,parents), nextPageToken', 
    q: "trashed = false and mimeType = 'application/vnd.google-apps.folder'"})
  
    let getFiles = getGdriveList({corpora: 'user', includeItemsFromAllDrives: false,
    fields: 'files(id,name,parents, mimeType, fullFileExtension, webContentLink, exportLinks, modifiedTime), nextPageToken', 
    q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'"})
  
    return Promise.all([getFiles, getFolders, getRootFolder])
  }
  catch(error) {
    return `Error in retriving a file reponse from Google Drive: ${error}`
  }
}

// make call out gDrive to get meta-data files. Code adds all files in a single array which are returned in pages
const getGdriveList = async (params) => {
  const gKeys = await gOAuth.get()
  const drive = google.drive({version: 'v3', auth: gKeys})
  let list = []
  let nextPgToken
  do {
    let res = await drive.files.list(params)
    list.push(...res.data.files)
    nextPgToken = res.data.nextPageToken
    params.pageToken = nextPgToken
  }
  while (nextPgToken)
  return list
}

module.exports =  {
  getGFilePaths: getGFilePaths,
  getGFileContent: getGFileContent
}