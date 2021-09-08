var HDWalletProvider = require('@truffle/hdwallet-provider');

const MNEMONIC =
  'split axis exist miracle have input kite stock laugh govern property call';
module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(
          MNEMONIC,
          'https://ropsten.infura.io/v3/e55d95fe5dfd4191b0ea5769dc6bf515',
        );
      },
      network_id: 3,
      gas: 4000000, //make sure this gas allocation isn't over 4M, which is the max
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
