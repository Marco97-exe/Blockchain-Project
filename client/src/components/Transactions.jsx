import React, {useContext} from 'react';
import  PrenotationContext  from '../context/PrenotationContext.jsx';
import { shortenAddress } from '../utils/shortenAddress.js';

const PlaceCard = ({id, placeAddress,description,price, owner, isActive}) => {
  const {setInactive} = useContext(PrenotationContext);

  const handleInactive = (e) => {
    //avoids to reload the page
    e.preventDefault();
    console.log(id)
    setInactive(id);
  }
  if(isActive){
    return (
      <div className="bg-[#181918] m-4 flex flex-1
        2xl:min-w-[450px]
        2xl:max-w-[500px]
        sm:min-w-[270px]
        sm:max-w-[300px]
        min-w-full
        flex-col p-3 rounded-md hover:shadow-2xl"
      >
        <div className="flex flex-col items-center w-full mt-3">
          <div className="w-full mb-6 p-2">
            <p className="text-white text-base">Place Id: {id}</p>
            <p className="text-white text-base"> Owner: {shortenAddress(owner)}</p>
            <p className="text-white text-base">Amount: {price} ETH</p>
            {description && (
              <>
                <br />
                <p className="text-white text-base">Address: {placeAddress}</p>
                <br/>
                <p className="text-white text-base">Description: {description} </p>
              </>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={handleInactive}
              className="text-white w-full mt-2 border-[1px] p-2 border-[#3d4f7c] rounded-full cursor-pointer">
                  Set as Inactive
            </button>
          </div>
        </div>
      </div>
    );
  }else{
    return("");
  }
};




const Transactions = () => {
    const {currentAccount, places} = useContext(PrenotationContext);
    return (
        <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
            <div className="flex flex-col md:p-12 py-12 px-4">
                {currentAccount !== "" ? (
                  <div>
                    <h3 className="text-white text-3xl text-center my-2 text-gradient">
                        Latest Available Places
                    </h3>
                    <div className="flex flex-wrap justify-center items-center mt-10">
                    {places.reverse().map((place,i) => (
                        <PlaceCard key={i} {...place}/>
                    ))}
                    </div>
                  </div>
                ) : (
                    <h3 className="text-white text-3xl text-center my-2 text-gradient">
                        Connect your account to see the Places
                    </h3>
                )}
                
            </div>
        </div>
    );
}

export default Transactions;
