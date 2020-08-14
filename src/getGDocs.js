const { google } = require('googleapis')
const gOAuth  =  require('./googleOAuth')
const aws = require('./awsUpload')

let gapi

// get OAuth2Client 
const getOAuth2Client = async () => {
  let OAuth2Client = await gOAuth.get()
  gapi = google.drive({ version: 'v3', auth: OAuth2Client} )
  console.log(gapi)
}

// select where to use 'list' or 'export' API based on gdocs file type and upload to s3.
const gFileContentDownload = (fileObj) => {
  if(fileObj.mimeType.includes('application/vnd.google-apps')) {
    if(fileObj.mimeType == 'application/vnd.google-apps.shortcut') {
      return
    }
    return getGDocsContent(aws.uploadS3,fileObj)
  }
  else {
    return getGFileContent(aws.uploadS3,fileObj)
  }
}

// download stream of gdocs files and pipe to destination
const getGDocsContent = async (pipeTo, fileObj) => { 
  let mimeTypeSplit = fileObj.mimeType.split('.')
  let mimeTypeLookup = mimeTypeSplit[mimeTypeSplit.length-1]
  let mimeTypeExt = await gOAuth.read('./data/gMimeType.json')
  let fileExt = fileObj.path.join('/').concat('/',fileObj.name,'.',mimeTypeExt[mimeTypeLookup]['ext'])

  return gapi.files.export({fileId: fileObj.id, mimeType: mimeTypeExt[mimeTypeLookup]['format']}, {responseType: 'stream'})
    .then(res => {
      return new Promise((resolve, reject) => {
        res.data
          .on('end', () => {resolve(console.log(`Done downloading gdocs file: ${fileExt}`))})
          .on('error', err => {reject(console.log(`Error downloading file ${err}`))})
          .pipe(pipeTo(fileExt))
      })
    })
}

// download stream of NON gdocs files and pipe to destination
const getGFileContent = async (pipeTo, fileObj) => {  
  let fileExt = fileObj.path.join('/').concat('/',fileObj.name)

  return gapi.files.get({fileId: fileObj.id, mimeType: fileObj.mimeType, alt: 'media'}, {responseType: 'stream'})
    .then(res => {
      return new Promise((resolve, reject) => {
        res.data
          .on('end', () => {resolve(console.log(`Done downloading gdocs file: ${fileExt}`))})
          .on('error', err => {reject(console.log(`Error downloading file ${err}`))})
          .pipe(pipeTo(fileExt))
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

  let list = []
  let nextPgToken
  do {
    let res = await gapi.files.list(params)
    list.push(...res.data.files)
    nextPgToken = res.data.nextPageToken
    params.pageToken = nextPgToken
  }
  while (nextPgToken)
  return list
}

module.exports =  {
  getGPaths: getGFilePaths,
  getGFiles : gFileContentDownload,
  getOAuth2Client : getOAuth2Client
}