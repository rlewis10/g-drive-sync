const fs = require('fs')

const read = async (file) => {
    const getFile = await fs.promises.readFile(file)
        .catch(err => {console.log(`Error reading from file: ${err}`)})
    return JSON.parse(getFile)
}

const write = async (file, path) => {
    await fs.promises.writeFile(path, JSON.stringify(file))
        .catch(err => {console.error(`Error writing to file: ${err}`)})
    return path
}

module.exports = {
    read : read,
    write: write
}