## paywithTusd 👻

paywithTusd lets anyone privately send and receive crypto with the sharable URL link. Plus, users have the freedom to receive/claim crypto in any tokens they preferred. This is built at BNB Hack Q2. 

Built with 
= [TUSD](https://bscscan.com/address/0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9#code) : TrueUSD
- [Railgun](https://www.railgun.org/): An on-chain & smart contract-based system for private Ethereum/EVM DeFi.
- [Peanut Protocol](https://peanut.to/): A protocol to transfer tokens using URLs

## Core Functionalities
### Private Transfer
Alice can privately deposit an amount of ETH/ERC20 to the peanut contract from her railgun wallet address. This involves unshielding, unwrapping WETH, etc, in a batch call made possible with railgun's cross-contract call.

### Private Claim
Alice can claim ETH from the peanut link and directly shield it to her railgun wallet address. Optionally, she specifies the token asset she receives. In this case, ETH will be swapped for USDC within the shielding batch transaction. Our own railgun's cookbook recipe enables this flexible execution.


## Technologies
- [Railgun Wallet SDK](https://github.com/Railgun-Community/wallet)
- [Railgun Cookbook](https://github.com/Railgun-Community/cookbook)
- [Peanut SDK](https://github.com/peanutprotocol/peanut-sdk/tree/main/src)

### Demo Video
