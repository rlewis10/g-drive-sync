  
const gDocs = require('./getGDocs')
const aws = require('./awsUpload')

let file2 =     {
  "id": "0B1r2V6Rg_NByLVFqYnItU1FUREE",
  "name": "tash.jpg",
  "mimeType": "image/jpeg",
  "parents": [
      "0B1r2V6Rg_NByR0RDQUsyRWVoTU0"
  ],
  "webContentLink": "https://drive.google.com/uc?id=0B1r2V6Rg_NByLVFqYnItU1FUREE&export=download",
  "modifiedTime": "2016-02-29T10:40:18.000Z",
  "fullFileExtension": "jpg",
  "path": [
      "People",
      "Family",
      "Tash"
  ]
}

const run = async () => {

  await aws.awsAuth()

  //gDocs.getGPaths(gKeys).then(data => {
  //  console.log(data)
  //})

  gDocs.getGFiles(file2)


}

run()