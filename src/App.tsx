/* eslint-disable react-hooks/exhaustive-deps */
import '../shim';
import Web3 from 'web3';
import '../shim';
import React, {useEffect, useState} from 'react';
import {Alert, SafeAreaView} from 'react-native';
import {Header} from './Components/header';
import Token from './abis/Token.json';
import EthSwap from './abis/EthSwap.json';
import {Main} from './Components/Main';
import {Loader} from './Components/loader';
import HDWalletProvider from '@truffle/hdwallet-provider';
import {PRIVATE_KEYS, PROVIDER} from './constants';

function App() {
  const [account, setAccount] = useState('');
  const [ethBalance, setEthBalance] = useState('');
  const [tokenContract, setTokenContract] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');
  const [ethSwapContract, setEthSwapContract] = useState('');
  const [loader, setLoader] = useState(false);

  var hdWalletProvider = new HDWalletProvider({
    privateKeys: PRIVATE_KEYS,
    providerOrUrl: PROVIDER,
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
    console.log('Load Block Data ===> '); // Init Web3 Block Chain
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
        const token = new web3.eth.Contract(Token.abi, tokenData.address);
        setTokenContract(token);
        const tokenBalanceValue = await token.methods
          .balanceOf(accounts[0])
          .call(); // Fetching Token Balance
        console.log('tokenBalance', tokenBalance);
        setTokenBalance(tokenBalanceValue);
      } else {
        alert('Token is not Deployed to Network');
      }
    } else {
      const tokenBalanceValue = await tokenContract.methods
        .balanceOf(accounts[0])
        .call(); // Fetching Token Balance
      console.log('tokenBalance', tokenBalanceValue);
      setTokenBalance(tokenBalanceValue);
    }

    if (!ethSwapContract) {
      const ethSwapData = EthSwap.networks[networkId];
      if (ethSwapData) {
        const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
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
      .on('transactionHash', async (hash: any) => {
        console.log('buyTokens transaction Hash ===>', hash);
      })
      .on('confirmation', async (confirmation: number, receipt: any) => {
        if (confirmation === 0) {
          setLoader(false);
          alert('Transaction  Successful ' + receipt.transactionHash);
          await loadBlockChainData();
        }
      })
      .on('error', (err: any) => {
        setLoader(false);
        console.log('Buy Tokens err', err);
      });
  }
  async function sellTokens(value: string) {
    setLoader(true);
    tokenContract.methods
      .approve(ethSwapContract._address, value)
      .send({from: account})
      .on('transactionHash', async (hash: any) => {
        console.log('transactionHash===>', hash);
      })
      .on('confirmation', async (approvedConfirmation: Number) => {
        if (approvedConfirmation === 0) {
          await ethSwapContract.methods
            .sellTokens(value)
            .send({from: account})
            .on('transactionHash', async (hash: any) => {
              console.log('hash', hash);
            })
            .on(
              'confirmation',
              async (sellConfirmation: Number, receipt: any) => {
                if (sellConfirmation === 0) {
                  setLoader(false);
                  alert('Transaction Successful' + receipt.transactionHash);
                  await loadBlockChainData();
                }
              },
            )
            .on('error', (err: any) => {
              alert(err);
              setLoader(false);
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
