#!/usr/bin/env node
const { ArgumentParser, ArgumentDefaultsHelpFormatter } = require('argparse')
const { description, name, version } = require('./package.json')
const { extractStatements } = require('./extract.js')
const { writeStatements, writeTransactions } = require('./csv.js')
const fs = require('fs')
const path = require('path')

const main = async function({ input, output }) {
    const statements = await extractStatements(input)
    statements.sort((a, b) => a.period[0] - b.period[0])
    await fs.promises.mkdir(output, { recursive: true })
    const results = await Promise.all([
        writeStatements(statements, path.join(output, 'statements.csv')),
        writeTransactions(statements, path.join(output, 'deposits.csv'), 'deposits'),
        writeTransactions(statements, path.join(output, 'withdrawals.csv'), 'withdrawals'),
        writeTransactions(statements, path.join(output, 'dividends.csv'), 'dividends')
    ])
    console.info('Wrote:', results.reduce((sum, val) => sum + val, 0), 'bytes')
}

const parser = new ArgumentParser({
    add_help: true,
    description,
    formatter_class: ArgumentDefaultsHelpFormatter
})
parser.add_argument(
    '-v', '--version',
    { action: 'version', help: 'show program\'s version number and exit', version }
)
parser.add_argument(
    '-i', '--input',
    { help: 'path to input directory', default: path.join(__dirname, 'data') }
)
parser.add_argument(
    '-o', '--output',
    { help: 'path to output directory', default: path.join(__dirname, 'out') }
)

console.info(`~~~ Begin ${name}`)
main(parser.parse_args())
