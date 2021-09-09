/* eslint-disable react-hooks/exhaustive-deps */
import './shim';
import Web3 from 'web3';
import './shim';
import React, {useEffect, useState} from 'react';
import {Text, View, SafeAreaView, Alert} from 'react-native';
import {Header} from './src/Components/header';
import Token from './src/abis/Token.json';
import EthSwap from './src/abis/EthSwap.json';
import {Main} from './src/Components/Main';
import {Loader} from './src/Components/loader';

import HDWalletProvider from '@truffle/hdwallet-provider';

function App() {
  const [account, setAccount] = useState('');
  const [ethBalance, setEthBalance] = useState('');
  const [tokenContract, setTokenContract] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');
  const [ethSwapContract, setEthSwapContract] = useState('');
  const [loader, setLoader] = useState(false);
  const privateKey = [
    'e8862a89dcd4a0dba199679f06f76bdb02b9f80c0241a7efde545034d54b12c9',
  ];
  var hdWalletProvider = new HDWalletProvider({
    privateKeys: privateKey,
    providerOrUrl:
      'wss://rinkeby.infura.io/ws/v3/b2cd755f7efc4b6090ece72c55f77bdd',
    numberOfAddresses: 1,
  });
  var web3 = new Web3(hdWalletProvider);
  useEffect(() => {
    setLoader(true);
    const init = async () => {
      await loadBlockChainData();
    };
    init();
  }, []);

  async function loadBlockChainData() {
    // Init Web3 Block Chain
    console.log('Load Block Data ===> ');
    let accounts = await web3.eth.getAccounts();
    console.log('Accounts Address ====> ', accounts);
    let balance = await web3.eth.getBalance(accounts[0]); // Fetching the default account
    console.log('Account balance ====>', balance);
    setAccount(accounts[0]);
    setEthBalance(balance);

    const networkId = await web3.eth.net.getId();
    console.log('Network ID ====>', networkId);

    if (!tokenContract) {
      const tokenData = Token.networks[networkId];
      if (tokenData) {
        const token = await new web3.eth.Contract(Token.abi, tokenData.address);
        setTokenContract(token);
        const tokenBalance = await token.methods.balanceOf(accounts[0]).call(); // Fetching Token Balance
        console.log('tokenBalance', tokenBalance);
        setTokenBalance(tokenBalance);
      } else {
        alert('Token is not Deployed to Network');
      }
    } else {
      const tokenBalance = await tokenContract.methods
        .balanceOf(accounts[0])
        .call(); // Fetching Token Balance
      console.log('tokenBalance', tokenBalance);
      setTokenBalance(tokenBalance);
    }

    if (!ethSwapContract) {
      const ethSwapData = EthSwap.networks[networkId];
      if (ethSwapData) {
        const ethSwap = await new web3.eth.Contract(
          EthSwap.abi,
          ethSwapData.address,
        );
        setEthSwapContract(ethSwap);
      } else {
        alert('EthSwap contract not deployed to network');
      }
    }
    setLoader(false);
  }

  async function buyTokens(value: string) {
    setLoader(true);
    await ethSwapContract.methods
      .buyTokens()
      .send({value: value, from: account})
      .on('transactionHash', async hash => {
        console.log('buyTokens transaction Hash ===>', hash);
      })
      .on('confirmation', async (confirmation: number, receipt: any) => {
        if (confirmation === 0) {
          setLoader(false);
          alert('Transaction  Successful ' + receipt.transactionHash);
          await loadBlockChainData();
        }
      })
      .on('error', err => {
        setLoader(false);
        console.log('Buy Tokens err', err);
      });
  }
  async function sellTokens(value: string) {
    setLoader(true);
    tokenContract.methods
      .approve(ethSwapContract._address, value)
      .send({from: account})
      .on('transactionHash', async hash => {
        console.log('transactionHash===>', hash);
      })
      .on('confirmation', async (confirmation: Number, receipt: any) => {
        if (confirmation === 0) {
          await ethSwapContract.methods
            .sellTokens(value)
            .send({from: account})
            .on('transactionHash', async hash => {
              console.log('hash', hash);
            })
            .on('confirmation', async (confirmation: Number, receipt: any) => {
              if (confirmation === 0) {
                setLoader(false);
                alert('Transaction Successful' + receipt.transactionHash);
                await loadBlockChainData();
              }
            });
        }
      });
  }

  return (
    <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
      <Header title={'Dapp'} accountAddress={account} />
      <Loader isLoading={loader} />
      <Main
        ethBalance={ethBalance}
        tokenBalance={tokenBalance}
        buyTokens={buyTokens}
        sellTokens={sellTokens}
      />
    </SafeAreaView>
  );
}

export default App;
