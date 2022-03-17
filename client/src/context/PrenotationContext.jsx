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
    //TODO: non ho bisogno dell'addressTo ma solo del prezzo a cui lo voglio fittare al giorno, il titolo (keyword) e la description (description)
    const [formData, setFormData] = useState({addressTo: "", amount:"", keyword:"", description:"" });
    const [isLoading, setIsLoading] = useState(false);
    const [places, setPlaces] = useState([])



    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    };


    const setInactive = async (placeId) => {
        if(!ethereum) return alert("Please install MetaMask");
        const prenotationContract = getEthereumContract();
        prenotationContract.markPropertyAsInactive(placeId);
    }

    //TODO: vedere se sto metodo funziona
    const fetchAllPlaces = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");
            const prenotationContract = getEthereumContract();
            const placeId = await prenotationContract.getPlaceId();


            //return object containing places object
            const places = [];
            for (var i = 0; i < placeId; i++) {
                const place = await prenotationContract.places(i);
                places.push({
                    id: i,
                    placeAddress: place.name,
                    description: place.description,
                    price: parseInt(place.price._hex) / (10 ** 18),
                    owner: place.owner,
                    isActive: place.isActive
                })
            }
            setPlaces(places)
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const checkIfWalletConnected = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({method: 'eth_accounts'});

            if(accounts.length){
                setCurrentAccount(accounts[0]);

                fetchAllPlaces();
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




    //Method that puts on the blockchain a place
    const  rentOutPlace = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");
            const { amount, placeAddress, description } = formData;
            const prenotationContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);
            console.log(parsedAmount)

            const rentoOutHash = await prenotationContract.rentOutplace(placeAddress, description, parsedAmount._hex);

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
            rentOutPlace, 
            handleChange,
            places,
            isLoading,
            setInactive,
            }}>
                {children}
        </PrenotationContext.Provider>
    );
};
