import { struct } from 'buffer-layout'
import { Connection, PublicKey } from '@solana/web3.js'
import { publicKey, u128, u64 } from '@project-serum/borsh'
import fetch from 'node-fetch'
import os from 'os'
import fs from 'fs'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const connection = new Connection('https://api.mainnet-beta.solana.com')

async function getHolders() {
    const dataHolders = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getProgramAccounts",
        "params": [
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            {
                "filters": [
                    {
                        "dataSize": 165
                    },
                    {
                        "memcmp": {
                            "offset": 0,
                            "bytes": "GHvFFSZ9BctWsEc5nujR1MTmmJWY7tgQz2AXE6WVFtGN"
                        }
                    }
                ]
            }
        ]
    }
    return await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataHolders),
    }).then(res => res.json())
        .then((data) => data)
}

async function getOwnerFromTokenAccount(pubkey) {
    const data = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [
            pubkey,
            {
                "encoding": "jsonParsed"
            }
        ]
    }
    return await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    }).then(res => res.json())
        .then((data) =>
            data.result.value.data.parsed.info.owner
        )
}

async function getBalance(pubkey) {
    const data = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountBalance",
        "params": [
            pubkey,
        ]
    }
    return await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    }).then(res => res.json())
        .then((data) =>
            data.result.value.amount
        )
}

async function main() {
    const holders = await getHolders()
    let i = 0
    for (const holder of holders.result) {
        i++
        if (i % 100 == 0)
            console.log('----------------' + (i / holders.result.length * 100).toFixed(2) + "% done ----------------")
        let balance = await getBalance(holder.pubkey.toString())
        console.log(balance)
        if(balance > 200){
            let account = await getOwnerFromTokenAccount(holder.pubkey.toString())
            let otp1 = account + " has " + balance
            let otp2 = account
            console.log(otp1)
            fs.open('output1.txt', 'a', function (e, id) {
                fs.write(id, otp1 + os.EOL, function (e, id) {
                    if (e) {
                        console.log('error')
                    }
                }
                )
            })
            fs.open('output2.txt', 'a', function (e, id) {
                fs.write(id, otp2 + os.EOL, function (e, id) {
                    if (e) {
                        console.log('error')
                    }
                }
                )
            })
        }
        await sleep(150)
    }
}

main()
