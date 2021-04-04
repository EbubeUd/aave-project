import React, { Component } from 'react';
import Web3 from 'web3';
import testContractABI from '../artifacts/abi/testcontract.json';
import erc20ContractABI from '../artifacts/abi/erc20.json';
import addresses from '../artifacts/addresses.json';

export default class Index extends Component {
    constructor(props){
        super(props);
        this.state = {
            testContract: null,
            daiERC20Contract: null,
            accounts: []
        };
    }


    async componentDidMount()
    {
        await this.loadWeb3()
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
        let testContract = new web3.eth.Contract(testContractABI, addresses.testcontract);
        let daiERC20 = new web3.eth.Contract(erc20ContractABI, addresses.daiERC20);
        let accounts = await window.web3.eth.getAccounts();

        this.setState({testContract: testContract, daiERC20Contract: daiERC20, accounts: accounts});


        if(testContract != null){
            console.log("Test Contract Initiated");
        }

        if(daiERC20 != null){
            console.log("daiERC20 Contract Initiated");
        }
      }



    deposit = async () =>
    {
        var BN = window.web3.utils.BN;
        var depositAmount = new BN("100000000000000000000");
        this.state.testContract.methods.deposit(addresses.daiERC20, depositAmount).send({from: this.state.accounts[0]}).on('transactionHash', function(hash){
            console.log(hash);
        });
    }

    withdraw = async () =>
    {
        var BN = window.web3.utils.BN;
        var withdrawalAmount = new BN("100000000000000000000");
        this.state.testContract.methods.withdraw(addresses.daiERC20, withdrawalAmount).send({from: this.state.accounts[0]}).on('transactionHash', function(hash){
            console.log(hash);
        });
    }

    approve = async () =>
    {
        var BN = window.web3.utils.BN;
        let approvalAmount = new BN("1000000000000000000000");
        this.state.daiERC20Contract.methods.approve(addresses.aavelendingpoolcontract, approvalAmount).send({from: this.state.accounts[0]}).on('transaction', function(hash){
            console.log(hash);
        })
    }

    render() {
        return (
            <div className="container">
               <button id="deposit" onClick={this.deposit}>Deposit</button>
                <button id="withdraw" onClick={this.withdraw}>Withdraw</button>
                <button id="approve" onClick={this.approve}>Approve</button>
          </div>
        )
    }
}