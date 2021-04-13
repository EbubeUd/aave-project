import React, { Component } from 'react';
import Web3 from 'web3';
import testContractABI from '../artifacts/abi/testcontract.json';
import erc20ContractABI from '../artifacts/abi/erc20.json';
import lendingPoolContractABI from '../artifacts/abi/lendingPool.json';
import uniswapRouterABI from '../artifacts/abi/uniswapRouter.json';

import addresses from '../artifacts/addresses.json';

export default class Index extends Component {
    constructor(props){
        super(props);
        this.state = {
            testContract: null,
            daiERC20Contract: null,
            lendingPoolContract: null,
            aDAIContract: null,
            uniswapRouterContract : null,
            uniswapEthDaiPool : null,
            accounts: [],
            allowances: [],
            daiBalance: 0,
            aDaiBalance: 0,
            uniBalance: 0
            
        };
    }


    async componentDidMount()
    {
        await this.loadWeb3()
        await this.balanceOfDAI()
        await this.balanceOfADAI()
        await this.allowance(addresses.aavelendingpoolcontract)
        await this.allowance(addresses.uniswapRouter);

    }

    async loadWeb3() {
        if(window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert('non Ethereum browser detected. Download Metamask')
        }

        const web3 = window.web3;
        console.log(uniswapRouterABI, addresses.uniswapRouter );
        let testContract = new web3.eth.Contract(testContractABI, addresses.testcontract);
        let daiERC20 = new web3.eth.Contract(erc20ContractABI, addresses.daiERC20);
        let lendingPoolContract = new web3.eth.Contract(lendingPoolContractABI, addresses.aavelendingpoolcontract);
        let aDAIContract = new web3.eth.Contract(erc20ContractABI, addresses.aDAI);
        let uniswapRouterContract = new web3.eth.Contract(uniswapRouterABI, addresses.uniswapRouter);
        let uniswapEthDaiPool = new web3.eth.Contract(erc20ContractABI, addresses.uniswapEthDaiPool); 

        let accounts = await window.web3.eth.getAccounts(); // or requestAccounts()

        this.setState({
            testContract: testContract,
            daiERC20Contract: daiERC20,
            lendingPoolContract: lendingPoolContract,
            accounts: accounts,
            aDAIContract: aDAIContract,
            uniswapRouterContract : uniswapRouterContract,
            uniswapEthDaiPool : uniswapEthDaiPool
        });


        if(testContract != null){
            console.log("Test Contract Initiated");
        }

        if(daiERC20 != null){
            console.log("daiERC20 Contract Initiated");
        }
      }


    provideEthDaiLiquidity = () => 
    {
        
        var BN = window.web3.utils.BN;
        var depositAmount = new BN("100000000000000000000");
        var amountTokenDesired =  depositAmount ;
        var amountTokenMin = new BN("90000000000000000000");
        var amountETHMin = new BN("100000000000000000");
        var amountEth = new BN("1000000000000000000");
        var deadline = new BN("300000");
        this.state.uniswapRouterContract.methods.addLiquidityETH(addresses.daiERC20,amountTokenDesired, amountTokenMin, amountETHMin, this.state.accounts[0], deadline).send({from: this.state.accounts[0], value: amountEth}).on('transactionHash', function(hash){
            console.log(hash);
        });
    }

    directDeposit =() =>
    {
        var BN = window.web3.utils.BN;
        var depositAmount = new BN("100000000000000000000");
        this.state.lendingPoolContract.methods.deposit(addresses.daiERC20,depositAmount, this.state.accounts[0], 0).send({from: this.state.accounts[0]}).on('transactionHash', function(hash){
            console.log(hash);
        });
    }

    directWithdrawal = () =>
    {
        var BN = window.web3.utils.BN;
        var depositAmount = new BN("100000000000000000000");
        this.state.lendingPoolContract.methods.withdraw(addresses.daiERC20,depositAmount, this.state.accounts[0]).send({from: this.state.accounts[0]}).on('transactionHash', function(hash){
            console.log(hash);
        });
    }

    deposit = async () =>
    {
        var BN = window.web3.utils.BN;
        var depositAmount = new BN("100000000000000000000");
        this.state.testContract.methods.deposit(addresses.daiERC20,addresses.aavelendingpoolcontract, depositAmount).send({from: this.state.accounts[0]}).on('transactionHash', function(hash){
            console.log(hash);
        });
    }

    withdraw = async () =>
    {
        var BN = window.web3.utils.BN;
        var withdrawalAmount = new BN("100000000000000000000");
        this.state.testContract.methods.withdraw(addresses.daiERC20, addresses.aavelendingpoolcontract, withdrawalAmount).send({from: this.state.accounts[0]}).on('transactionHash', function(hash){
            console.log(hash);
        });
    }

    approveDAI = async (spender, amount) =>
    {
        var BN = window.web3.utils.BN;
        let approvalAmount = new BN(amount);
        this.state.daiERC20Contract.methods.approve( spender, approvalAmount).send({from: this.state.accounts[0]}).on('receipt', function(receipt){
            console.log(receipt);
        })
    }

    allowance = async (spender) =>
    {
        let balance = await this.state.daiERC20Contract.methods.allowance(this.state.accounts[0],spender).call({from: this.state.accounts[0]});
        balance = balance / 1000000000000000000;
        console.log("Allowance",balance);
        let allowances = this.state.allowances;
        allowances[spender] = balance;
        this.setState({allowances : allowances})
    }

    balanceOfDAI = async() =>
    {
        let balance = await this.state.daiERC20Contract.methods.balanceOf(this.state.accounts[0]).call({from: this.state.accounts[0]});
        balance = balance / 1000000000000000000;
        this.setState({daiBalance: balance});
    }

    balanceOfADAI = async() =>
    {
        let balance = await this.state.aDAIContract.methods.balanceOf(this.state.accounts[0]).call({from: this.state.accounts[0]});
        balance = balance / 1000000000000000000;
        this.setState({aDaiBalance: balance});
    }
    
    balanceOfUniTokens = async() =>
    {
        let balance = await this.state.uniswapEthDaiPool.methods.balanceOf(this.state.accounts[0]).call({from: this.state.accounts[0]});
        balance = balance / 1000000000000000000;
        this.setState({uniBalance: balance});
    }
    


    render() {
        return (
            <div className="container">
                <p>Aave Approved Balance: {this.state.allowances[addresses.aavelendingpoolcontract]} DAI</p>
                <p>Uniswap Approved Balance: {this.state.allowances[addresses.uniswapRouter]} DAI</p>

                <p>Actual Balance: {this.state.daiBalance} DAI</p>
                <p>Pool Balance: {this.state.aDaiBalance} ADAI</p>
                <p>Uni Balance: {this.state.uniBalance} UNI</p>


               <button id="deposit" onClick={this.directDeposit}>Direct Deposit</button>
               <button id="deposit" onClick={this.deposit}>Deposit</button><br/><br/>

                <button id="withdraw" onClick={this.directWithdrawal}>Direct Withdraw</button>
                <button id="withdraw" onClick={this.withdraw}>Withdraw</button><br/><br/>

                <button id="withdraw" onClick={this.provideEthDaiLiquidity}>Direct Liq</button>
                <button id="withdraw" onClick={this.withdraw}>Withdraw</button><br/><br/>

                <button id="approve" onClick= {()=>this.approveDAI(addresses.aavelendingpoolcontract, "1000000000000000000000")}>Approve Aave Lending Pool</button>
                <button id="approve" onClick= {()=>this.approveDAI(addresses.uniswapRouter, "1000000000000000000000")}>Approve Uniswap Router</button>
          </div>
        )
    }
}