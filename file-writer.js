const { createWriteStream } = require('fs')

module.exports = class {
    constructor(filepath, flags = 'w') {
        this._stream = createWriteStream(filepath, { flags })
    }
    writeLine(chunk) {
        return new Promise((resolve, reject) => {
            this._stream.once('error', reject)
            if (!this._stream.write(`${chunk}\n`)) {
                this._stream.once('drain', () => {
                    this._stream.off('error', reject)
                    resolve(this._stream.writableLength)
                })
            } else {
                this._stream.off('error', reject)
                resolve(this._stream.writableLength)
            }
        })
    }
    stop() {
        if (this._stream) {
            return this._stream.destroy()
        }
    }
}
