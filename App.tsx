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

import HDWalletProvider from '@truffle/hdwallet-provider';
import {identifier} from '@babel/types';

const MNEMONIC =
  'split axis exist miracle have input kite stock laugh govern property call';
const App: React.FC = () => {
  const [account, setAccount] = React.useState('');
  const [ethBalance, setEthBalance] = useState('');
  const [tokenContract, setTokenContract] = useState({});
  const [tokenBalance, setTokenBalance] = useState('');
  const [ethSwapContract, setEthSwapContract] = useState({});
  var hdWalletProvider = new HDWalletProvider(
    MNEMONIC,
    'wss://ropsten.infura.io/ws/v3/e55d95fe5dfd4191b0ea5769dc6bf515',
  );
  var web3 = new Web3(hdWalletProvider);
  useEffect(() => {
    const init = async () => {
      await loadBlockChainData();
    };
    init();
  }, []);

  async function loadBlockChainData() {
    console.log('web3', web3.eth.accounts.wallet);
    // Init Web3 Block Chain

    let accounts = await web3.eth.getAccounts();
    console.log('Private key of wallet ====> ', accounts);
    let balance = await web3.eth.getBalance(accounts[0]);
    console.log('balance', balance);
    // Fetching the default account
    setAccount(accounts[0]);
    setEthBalance(balance);
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    const tokenData = Token.networks[networkId];
    // Init Token Contract
    if (tokenData) {
      const token = await new web3.eth.Contract(Token.abi, tokenData.address);
      setTokenContract(token);
      console.log('token', token);
      const tokenBalance = await token.methods.balanceOf(accounts[0]).call();
      // Fetching Token Balance
      console.log('tokenBalance', tokenBalance);
      setTokenBalance(tokenBalance);
    } else {
      alert('Token is not Deployed to Network');
    }

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

  async function buyTokens(value: string) {
    console.log('value', value);
    console.log('account', account);
    await ethSwapContract.methods
      .buyTokens()
      .send({value: value, from: account})
      .on('transactionHash', async hash => {
        if (hash) {
          console.log('transactionHash', hash);
          await loadBlockChainData();
        }
      });
  }
  async function sellTokens(value: string) {
    tokenContract.methods
      .approve(ethSwapContract._address, value)
      .send({from: account})
      .on('transactionHash', async hash => {
        console.log('transactionHash===>', hash);
        await ethSwapContract.methods
          .sellTokens(value)
          .send({from: account})
          .on('transactionHash', async hash => {
            console.log('hash', hash);
            await loadBlockChainData();
          });
      });
  }

  return (
    <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
      <Header title={'Dapp'} accountAddress={account} />

      <Main
        ethBalance={ethBalance}
        tokenBalance={tokenBalance}
        buyTokens={buyTokens}
        sellTokens={sellTokens}
      />
    </SafeAreaView>
  );
};

export default App;
