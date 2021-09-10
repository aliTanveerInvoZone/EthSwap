var HDWalletProvider = require('@truffle/hdwallet-provider');
var {PRIVATE_KEYS, HTTP_PROVIDER} = require('./src/constants');

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
          privateKeys: PRIVATE_KEYS,
          providerOrUrl: HTTP_PROVIDER,
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
