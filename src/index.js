  
const gOAuth =  require('./googleOAuth')
const gFiles = require('./getGFiles')
const { google } = require('googleapis')
const fs = require('fs')
const stream = require('stream')
const aws = require('aws-sdk')
const aws1 = require('./awsUpload')

const run = async () => {

  aws1.awsAuth()
  console.log(await getGFileContent())

  //gFiles.getGFilePaths(gKeys).then(data => {
  //  console.log(data)
  //})
}

// download gFile
const getGFileContent = async () => {  
  const gKeys = await gOAuth.get()
  const drive = google.drive({ version: 'v3', auth: gKeys })
  return drive.files.get({fileId: '1bNr_ZM90fM0EnPcFPfdd2LnB7Z2Tts3LiQ', mimeType: "image/jpeg", alt: 'media'}, {responseType: 'stream'})
    .then(res => {
      return new Promise((resolve, reject) => {
        res.data
          .on('end', () => {resolve(`Done downloading file`)})
          .on('error', err => {reject(`Error downloading file ${err}`)})
          .pipe(aws1.uploadS3())
      })
    })
}


run()