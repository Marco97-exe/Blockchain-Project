require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks:{
    ropsten:{
      url: 'https://eth-ropsten.alchemyapi.io/v2/C5d6qCOJq09n9oZJfeoT9nkbDjtw9__H',
      accounts: ['7292e335739690917554144ce281ccbb9d33527730ca3cbe88eb65e2382cc8f3']
    }
  }
}
