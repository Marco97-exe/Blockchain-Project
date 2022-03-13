// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

contract Prenotation {
    struct Place{
        string name;
        string description;
        bool isActive; //tells if the place is active
        uint256 price; //price per day in wei
        address owner; //owner of the place

        //keeps score if the place is booked on a particular day
        //example: isBooked[4] will denote that the place has been booked on th 3th of Jan
        //example 2: isBooked[31] -> the place is booked for the 1th of Feb
        bool[] isBooked;
    }
    
    //Sequential unique placeId for every new Place
    uint256 public placeId;

    mapping(uint256 => Place) public places;

    struct Booking {
        uint256 placeId;
        uint256 checkInDate;
        uint256 checkOutDate;
        address user;
    }

    uint256 public bookingId;

    //mapping of bookingId to booking object
    mapping(uint256 => Booking) public bookings;

    //event launched when a new Place is put available
    event NewPlace (uint256 indexed placeId);

    event newBooking (
        uint256 indexed placeId,
        uint256 indexed bookingId
    );

    /**
    * @param name Name of the property
    * @param description Short description of your property
    * @param price Price per day in wei (1 ether = 10^18 wei)
    */
    function rentOutplace(string memory name, string memory description, uint256 price) public {
        // create a place object
        Place memory place = Place({
            name: name,
            description: description,
            isActive: true,
            price: price,
            owner: msg.sender,
            isBooked: new bool[](365)
        });
        // Persist `place` object to the "permanent" storage
        places[placeId] = place;
        // emit an event to notify the clients
        emit NewPlace(placeId++);
    }   

   /**
   * @param _placeId id of the property to rent out
   * @param checkInDate Check-in date
   * @param checkOutDate Check-out date
   */
    function rentPlace(uint256 _placeId, uint256 checkInDate, uint256 checkOutDate) public payable {
        // Retrieve `place` object from the storage
        Place storage place = places[_placeId];
        // Assert that place is active
        //TODO: could be done with modifiers ?
        require(place.isActive == true, "place with this ID is not active");
        // Assert that place is available for the dates
        //TODO: implement in a way to avoid for loop ?
        for(uint256 i= checkInDate; i< checkOutDate; i++){
            if(place.isBooked[i] == true){
                //if place is booked during one of the days, we need to revert transaction
                revert("Place is not available for the selected dates");
            }
        }
        // Check the customer has sent an amount equal to (pricePerDay * numberOfDays)
        require(msg.value == place.price * (checkOutDate - checkInDate), "The money sent is insufficient");
        // send funds to the owner of the property
        _sendFunds(place.owner, msg.value);

        // conditions for a booking are satisfied, so make the booking
        _createBooking(_placeId, checkInDate, checkOutDate);
    }  

    function _sendFunds(address beneficiary, uint256 value) internal {
        // https://docs.soliditylang.org/en/v0.5.10/050-breaking-changes.html?highlight=address%20payable#explicitness-requirements
        // The address type was split into address and address payable, where only address payable provides the transfer function. 
        // An address payable can be directly converted to an address, but the other way around is not allowed. Converting address to address payable is possible via conversion through uint160.
        payable(beneficiary).transfer(value);
    }

    function _createBooking(uint256 _placeId, uint256 checkInDate, uint256 checkOutDate) internal {
        // Create a new booking object
        Booking memory booking = Booking({
            placeId: _placeId,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            user: msg.sender 
        });
        // persist to storage
        bookings[bookingId] = booking;
        // Retrieve `place` object from the storage
        Place storage place = places[_placeId];
        // Mark the place booked on the requested dates
        for(uint256 i = checkInDate; i < checkOutDate; i++){
            place.isBooked[i] = true;
        }
        // Emit an event to notify clients
        emit newBooking(_placeId, placeId++);
    }
    /**
   * @dev Take down the property from the market
   * @param _placeId Property ID
   */
  function markPropertyAsInactive(uint256 _placeId) public {
    require(
      places[_placeId].owner == msg.sender,
      "THIS IS NOT YOUR PROPERTY"
    );
    places[_placeId].isActive = false;
  }
}
