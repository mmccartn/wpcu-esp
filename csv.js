const FileWriter = require('./file-writer.js')

const SUMMARIES_HEADER = 'date,accounts,inital,deposit,withdraw,final,delta'
const TRANSACTIONS_HEADER = 'date,account,name,amount,balance'

const total = function(accounts, key) {
    return accounts.reduce((sum, account) => sum + account[key], 0)
}
const writeStatements = async function(statements, outpath) {
    let wrote = 0
    const writer = new FileWriter(outpath)
    await writer.writeLine(SUMMARIES_HEADER)
    for (const statement of statements) {
        const [initial, deposit, withdraw, final] = [
            total(statement.accounts, 'initial'),
            total(statement.accounts, 'deposit'),
            total(statement.accounts, 'withdraw'),
            total(statement.accounts, 'final')
        ]
        wrote += await writer.writeLine([
            statement.period[0].toISOString().slice(0, 7),
            statement.accounts.length,
            initial,
            deposit,
            withdraw,
            final,
            deposit - withdraw
        ].join(','))
    }
    return wrote
}
const writeTransactions = async function(statements, outpath, type) {
    let wrote = 0
    const writer = new FileWriter(outpath)
    await writer.writeLine(TRANSACTIONS_HEADER)
    const transactions = statements.reduce((tsx, stmt) => {
        tsx.push(...stmt[type])
        return tsx
    }, []).sort((a, b) => a.date - b.date)
    for (const tsx of transactions) {
        wrote += await writer.writeLine([
            tsx.date.toISOString().slice(0, 10),
            tsx.account,
            tsx.name,
            tsx.amount,
            tsx.balance
        ].join(','))
    }
    return wrote
}

module.exports = { writeStatements, writeTransactions }
