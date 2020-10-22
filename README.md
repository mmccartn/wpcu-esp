Wright Patt Credit Union Electronic Statement Parser
====================================================
[WPCU](https://www.wpcu.coop/en-us) reports monthly bank summaries and transactions, but only as `pdf` files.
`wpcu-esp` extracts the information contained in these files and exports them to `csv`.

It generates two types of comma-delimited `csv` files with headers:

### Statements
Contain the monthly balance summary totals of *all accounts*.

### Transactions
Are split up into 3 separate files for **withdrawals**, **deposits**, and **dividends**.

Requirements
------------
 * Node 10+

Installation
------------
`npm install`

Usage
----
```
usage: index.js [-h] [-v] [-i INPUT] [-o OUTPUT]

Wright Patt Credit Union eStatement Parser

optional arguments:
  -h, --help            show this help message and exit
  -v, --version         show program's version number and exit
  -i INPUT, --input INPUT
                        path to input directory (default: data)
  -o OUTPUT, --output OUTPUT
                        path to output directory (default: out)
```
