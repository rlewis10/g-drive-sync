const fs = require('fs')

const read = async (file) => {
    const getFile = await fs.promises.readFile(file)
        .catch(err => {console.log(`Error reading from file: ${err}`)})
    return JSON.parse(getFile)
}

const write = async (file, path) => {
    let data = await file
    fs.promises.writeFile(path, JSON.stringify(data, undefined, 2))
        .catch(err => {console.error(`Error writing to file: ${err}`)})
    return path
}

module.exports = {
    read : read,
    write: write
}