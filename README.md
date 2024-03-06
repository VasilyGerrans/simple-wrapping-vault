# Simple Wrapping Vault

The Vault contract allows ETH and ERC20 deposits, including fee-on-transfer tokens, as well as wrapping/unwrapping ETH inside the Vault.

ETH or tokens transfered to Vault direcly will be lost. Requires approvals and in-built methods. 

Test forks latest Ethereum and impresonates deposits from a large WETH holder.

To run test, create `.env` file, add RPC_URL and run

```shell
npx hardhat test
```
