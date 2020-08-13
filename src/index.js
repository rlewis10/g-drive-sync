  
const gDocs = require('./getGDocs')
const aws = require('./awsUpload')

let file2 = {
  "id": "1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0",
  "name": "Richard_Lewis_CV_Jun_2020_v1",
  "mimeType": "application/vnd.google-apps.document",
  "parents": [
      "0B503_VQuaCQ2cjRNWnZYa1paTWs"
  ],
  "modifiedTime": "2020-07-12T15:22:53.811Z",
  "exportLinks": {
      "application/rtf": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=rtf",
      "application/vnd.oasis.opendocument.text": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=odt",
      "text/html": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=html",
      "application/pdf": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=pdf",
      "application/epub+zip": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=epub",
      "application/zip": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=zip",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=docx",
      "text/plain": "https://docs.google.com/feeds/download/documents/export/Export?id=1JB_cEI6tOZlmaGytIlaPb_8MO--NMBhqF60-JFduVY0&exportFormat=txt"
  },
  "path": [
      "CV"
  ]
}

const run = async () => {

  await aws.awsAuth()

  //gDocs.getGPaths(gKeys).then(data => {
  //  console.log(data)
  //})

  console.log(await gDocs.getGFiles(file2))


}

run()