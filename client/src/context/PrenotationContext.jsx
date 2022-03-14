import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';

import {contractABI, contractAddress} from '../utils/constants';

const PrenotationContext = React.createContext();

export default PrenotationContext;

const {ethereum} = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const prenotationContract = new ethers.Contract(contractAddress, contractABI, signer);

    return prenotationContract;
}

export const PrenotationProvider = ({children}) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({addressTo: "", amount:"", keyword:"", description:"" });
    const [isLoading, setIsLoading] = useState(false);



    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    };

    const checkIfWalletConnected = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({method: 'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0]);

                //getAllPrenotation();
            } else{
                console.log("No accounts found");
            }
        } catch (error) {
            
            console.log(error);
        }
        
    };

    // Questo metodo dovrebbe essere il rentOutPlace
    const sendPrenotation = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");
            const {addressTo, amount, keyword, description} = formData;
            const prenotationContract = getEthereumContract();

            //send place to blockchain




        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    };

    const connectWallet = async () => {
        try {
          if (!ethereum) return alert("Please install MetaMask.");
    
          const accounts = await ethereum.request({ method: 'eth_requestAccounts', });
          console.log(accounts)
          setCurrentAccount(accounts[0]);
          window.location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    };

    useEffect(() => {
        checkIfWalletConnected();
    },[]);

    return (
        <PrenotationContext.Provider 
        value={{
            connectWallet,
            currentAccount,
            formData, 
            sendPrenotation, 
            handleChange,}}>
                {children}
        </PrenotationContext.Provider>
    );
};
