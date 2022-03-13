import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';

import {contractABI, contractAddress} from '../utils/constants';

export const PrenotationContext = React.createContext();

const {ethereum} = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const prenotationContract = new ethers.Contract(contractAddress, contractABI, signer);

    return prenotationContract;
}

export const PrenotationProvider = ({children}) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({addressTo: "", amount:"", keyword:"", message:"" });
    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    };

    const checkIfWalletConnected = async () => {

        try {
            if(!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({method: 'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0]);

                //getAllTransactions();
            } else{
                console.log("No accounts found");
            }
        } catch (error) {
            
            console.log(error);
        }
        
    };

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");
            const {addressTo, amount, keyword, message} = formData;
            getEthereumContract();



        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    };

    const connectWallet = async () => {
        try {
          if (!ethereum) return alert("Please install MetaMask.");
    
          const accounts = await ethereum.request({ method: "eth_requestAccounts", });
    
          setCurrentAccount(accounts[0]);
          window.location.reload();
        } catch (error) {
          console.log(error);
    
          throw new Error("No ethereum object");
        }
      };

    useEffect(()=>{
        checkIfWalletConnected();
    },[]);

    return (
        <PrenotationContext.Provider 
        value={{
            connectWallet,
            currentAccount,
            formData, 
            sendTransaction, 
            handleChange,}}>
            {children}
        </PrenotationContext.Provider>
    );
};
