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
    //TODO: non ho bisogno dell'addressTo ma solo del prezzo a qui lo voglio fittare al giorno, il titolo (keyword) e la description (description)
    const [formData, setFormData] = useState({addressTo: "", amount:"", keyword:"", description:"" });
    const [isLoading, setIsLoading] = useState(false);
    const [places, setPlaces] = useState([])



    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    };

    //TODO: sistemare sto metodo
    const getAllPlaces = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");
            const prenotationContract = getEthereumContract();
            //TODO: vedere se esiste nel prenotation.sol un metodo che restituisce i posti disponibili
            const availablePlaces = await prenotationContract.getAllPlaces();

            const structuredPlaces = availablePlaces.map((place) => ({
                addressTo: place.receiver,
                addressFrom: place.sender,
                timestamo: new Date(place.timestamp.toNumber() * 1000).toLocaleString(),
                message: place.message,
                keyword: place.keyword,
                amount: parseInt(place.amount._hex) / (10 ** 18)
            }))

            setPlaces(structuredPlaces);


        } catch (error) {
            
        }
    }

    const checkIfWalletConnected = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({method: 'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0]);

                getAllPlaces();
            } else{
                console.log("No accounts found");
            }
        } catch (error) {
            
            console.log(error);
        }
    };

    const checkIfPrenotationExist = async () => {
        try {
            const prenotationContract = getEthereumContract();
            //TODO: devo vedere se ci sono stati delle operazioni di rentOut 
            const rentOutPlacesCont = 3;
            
            window.localStorage.setItem("rentOutPlacesCont", rentOutPlacesCont)
        } catch (error) {
            throw new Error("No ethereum object");
        }
    }




    //TODO: Sistemare il metodo in modo corretto 
    // Questo metodo dovrebbe essere l'equivalente di rentOutPlace di Prenotation.sol
    const sendPrenotation = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");
            const {addressTo, amount, keyword, description} = formData;
            const prenotationContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEthers(amount);


            //send place to blockchain
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', //21000 GWEI
                    value: parsedAmount._hex, //this need to be transformed in gwei or hexa
                }]
            });

            const rentoOutHash = await prenotationContract.rentOutPlace(keyword, description, parsedAmount);

            setIsLoading(true);
            console.log(`Loading - ${rentoOutHash.hash}`);
            await rentoOutHash.wait();
            setIsLoading(false);
            console.log(`Success - ${rentoOutHash.hash}`);
            
            

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
        checkIfPrenotationExist(); //TODO:vedere come gestire sta cosa del controllo se esistono posti dispoinibili
    },[]);

    return (
        <PrenotationContext.Provider 
        value={{
            connectWallet,
            currentAccount,
            formData, 
            sendPrenotation, 
            handleChange,
            places,
            isLoading}}>
                {children}
        </PrenotationContext.Provider>
    );
};
