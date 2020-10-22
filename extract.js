const fs = require('fs')
const path = require('path')
const pdf = require('pdf-parse')

const ACCOUNT_PATTERN = /^([A-Z|\s]+) \- \d\d$/
const SUMMARY_PATTERN = /^Beginning Balance\+Deposits & Other Credits \(\d+\)-Withdrawals & Other Debits \(\d+\)=Ending Balance$/
const PERIOD_PATTERN = /^Account Number XXXXXX\d\d\d\dStatement Period (\d\d-\d\d-\d\d) thru (\d\d-\d\d-\d\d)Page \d+ of \d+$/
const DEPOSIT_PATTERN = /(\d\d)-(\d\d)Deposit ([^.]+)\.+([-|\d|,]+\.\d\d)([-|\d|,]+\.\d\d)/
const WITHDRAWAL_PATTERN = /(\d\d)-(\d\d)Withdrawal ([^.]+)\.+([-|\d|,]+\.\d\d)([-|\d|,]+\.\d\d)/
const DIVIDEND_PATTERN = /(\d\d)-(\d\d)(Dividends Paid)\.+([-|\d|,]+\.\d\d)([-|\d|,]+\.\d\d)/

const parseDollar = str => parseFloat(str.replace(/,/g, ''))

const extractAccounts = function(lines) {
    let name
    const accounts = []
    for (let idx = 0; idx < lines.length - 1; idx++) {
        const line = lines[idx]
        const accountMatch = line.match(ACCOUNT_PATTERN)
        if (accountMatch) {
            name = accountMatch[1]
        } else if (line.match(SUMMARY_PATTERN)) {
            if (!name) {
                console.warn('No account found for amounts:', line)
            } else {
                const [initial, deposit, withdraw, final] = lines[idx + 1]
                    .split('$')
                    .filter(v => v)
                    .map(parseDollar)
                accounts.push({ name, initial, deposit, withdraw, final })
            }
            name = false
            idx++
        }
    }
    return accounts
}
const extractPeriod = function(lines) {
    let period = false
    for (const line of lines) {
        const periodMatch = line.match(PERIOD_PATTERN)
        if (periodMatch) {
            period = [new Date(periodMatch[1]), new Date(periodMatch[2])]
            break
        }
    }
    return period
}
const extractTransactions = function(lines, year, pattern) {
    const deps = []
    let account = 'unknown'
    for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx]
        const accountMatch = line.match(ACCOUNT_PATTERN)
        if (accountMatch) {
            account = accountMatch[1]
        } else {
            const depsMatch = line.match(pattern)
            if (depsMatch) {
                const [month, day, name, amount, balance] = depsMatch.slice(1)
                deps.push({
                    date: new Date(`${year}-${month}-${day}`),
                    account,
                    name: name.replace(/,/g, ''),
                    amount: Math.abs(parseDollar(amount)),
                    balance: parseDollar(balance)
                })
            }
        }
    }
    return deps
}
const extractStatements = async function(dirpath) {
    const files = await fs.promises.readdir(dirpath)
    return Promise.all(files.map(async file => {
        const contents = await fs.promises.readFile(path.join(dirpath, file))
        const doc = await pdf(contents)
        const lines = doc.text.split('\n').filter(l => l)
        const period = extractPeriod(lines)
        const year = period[0].getFullYear()
        return {
            period,
            accounts: extractAccounts(lines),
            deposits: extractTransactions(lines, year, DEPOSIT_PATTERN),
            withdrawals: extractTransactions(lines, year, WITHDRAWAL_PATTERN),
            dividends: extractTransactions(lines, year, DIVIDEND_PATTERN)
        }
    }))
}

module.exports = { extractStatements }
