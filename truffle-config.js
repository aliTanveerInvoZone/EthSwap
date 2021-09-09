var HDWalletProvider = require('@truffle/hdwallet-provider');

const MNEMONIC =
  'split axis exist miracle have input kite stock laugh govern property call';

const privateKey = [
  'e8862a89dcd4a0dba199679f06f76bdb02b9f80c0241a7efde545034d54b12c9',
];
module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider({
          privateKeys: privateKey,
          providerOrUrl:
            'https://rinkeby.infura.io/v3/b2cd755f7efc4b6090ece72c55f77bdd',
          numberOfAddresses: 1,
        });
      },
      gas: 5500000,
      confirmations: 1,
      timeoutBlocks: 200,
      network_id: 4,
      skipDryRun: true,
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
