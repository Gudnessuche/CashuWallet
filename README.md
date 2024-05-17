<h1>Creating a Web wallet with cashu-ts: A Beginner’s tutorial.<h1/>

Introduction to Cashu Protocol

Before we begin to get our hands dirty, let’s give a little introduction on how Cashu’s protocol works. Cashu is an open-source protocol based on Chaumian e-cash, a digital cash payment system that uses cryptography to create a blind payment system where payments can be made anonymously, with Bitcoin as the underpinning value of the system’s token, known as e-cash notes. For more.

Core Technology Components

Mint: Mints are Lightning node runners that have decided to let you use their Lightning infrastructure to offer you a service. They will act as a custodian for your satoshis on the Lightning network, while they issue equivalent ecash to the user on the Mint. In simpler terms. A user “converts” his satoshi to equivalent e-cash by paying a mint and receving e-cash tokens he/she can use to transact on a mint. A user can also use his e-cash notes to perform transactions outside the mint by having a mint make a lightning payment in exchange for e-cash

Wallet: An ecash wallet is a special type of wallet. Ecash wallets are custodial in the sense that your satoshis are held by a mint while your issued ecash token serve as a representative of it’s value. Ecash wallets break the norm of traditional custodial wallets with it’s blind payment system which guarantees privacy of transactions and also a the absence of KYC requirements.

Ecash(Token): A “token” (also known as “ecash” or in slang “a nut”) is a piece of data that consists of a blindly signed secret. It was signed by the mint with the private key for a specific amount. Therefore a token is an IOU representation of satoshis that are custodied at the mint.
Now to the Fun stuff!
We will walk through the basic features of a cashu wallets namely:

Connect to Mint
Create Cashu Wallet
Send Ecash Tokens
Receive Ecash Tokens

Application Setup
We’ll start by creating a NextJS application called Kernel with create-next-app.

npx create-next-app kernel --typescript
Press enter and select all the options you wish to use for your application. For the sake of this tutorial we will not be covernig things like styling. Feel free to use a styling library of your choice for your wallet’s look and feel.

Next, we’ll install cashu-ts using npm

npm i @cashu/cashu-ts
Connect to a Mint

We’ll be creating a reusable hook called useMint to handle all logic relating to our mint. create a Folder called hooks in your app root and a file called useMint.ts and Create the hook useMint within the file

First we’ll import the CashuMint class from cashu-ts and create the hook use

//hooks/useMint.ts
import { CashuMint} from '@cashu/cashu-ts';

export const useMint = ()=>{}
next We’ll create a function loadMint within the hook that connects to the mint. the loadmint will take a parameter called mintUrl which is the url of the mint you want to connect to. The user would need to know the url to connect to it. For this tutorial, we would be using a cashu test mint with URL https://testnut.cashu.space

//hooks/useMint.ts

import { CashuMint, MintActiveKeys, MintAllKeySets } from '@cashu/cashu-ts';

export interface Mint {
  mintURL: string,
  keys: MintAllKeySets,
  keysets: MintActiveKeys,
  isAdded: boolean
}


const useMint = ()=>{

  const loadMint =async(mintURL:string)=>{
        
        let mint = new CashuMint(mintURL);

        const keysets = await mint.getKeySets();
        
        const keys = await mint.getKeys();

        const storeMint: Mint = {
            mintURL: mint.mintUrl,
            keys: keys.keysets,
            keysets: keysets.keysets,
            isAdded: true
        };     
        return storeMint;
    }
    return { loadMint };
};

export default useMint;

The CashuMint class takes a compulsory parameter, mintURL which is the url of the mint you wish to connect to. The CashuMint class returns the getKeySets which returns the currently valid keysets in use by the mint and the getKeys method which returns all keysets, both present and past that have been used by the mint.

NB: Keysets are set of public keys that each correspond to the amount values/denominations of Ecash that the mint supports (e.g. 1, 2, 4, 8, ...) respectively. A mint is free to choose the amount values/denominations of Ecash that it supports.

The keysets gotten from getKeySet and getKeys can then be stored using a Web storage medium such as localStorage, indexedDB or any other robust offline storage medium of your choosing

Creating a Wallet

After Connecting to a mint we can then proceed to create a wallet. We’ll create another hook called useWallet and use the CashuWallet class to create a wallet

//hooks/useWallet.ts

import { CashuWallet } from '@cashu/cashu-ts';
import useMint from './useMint'

const useWallet = ()=>{
  
   const { loadMint } = useMint();  

   const cashuWallet = async(url='https://testnut.cashu.space') =>{
      const { mint, keys } = await loadMint(url);
      const cashuWallet = new CashuWallet(mint, keys);
      return cashuWallet;
   };

  return {createWallet}  
};

export default useWallet;
Receiving Tokens

We’ll create another function in useWallet called receiveToken. This function will receive a parameter called encodedToken which would represent an encoded ecash token shared offline between different users. The user enters his token encoded token and receives ecash tokens within the wallet

//hooks/useWallet.ts

import { CashuWallet, getDecodedToken } from '@cashu/cashu-ts';
import useMint from './useMint'

const useWallet = ()=>{
  
   const { loadMint } = useMint();  

   const createWallet = async(url='https://testnut.cashu.space') =>{
      const { mint, keys } = await loadMint(url);      
      const cashuWallet = new CashuWallet(mint, keys);
      return cashuWallet;
   };

  const receiveToken =  async () => {
   try {
     const {token: decoded}= getDecodedToken(encodedToken);
     if (decoded){
       // create wallet(using default mint url)
       const wallet = await createWallet();
       const { token, tokensWithErrors} = await cashuWallet.receive(encodedToken);      
       return({
         token,
         tokensWithErrors
       });
     };
   };
   catch (error) {
      return ({
        error: 'Error occured with redeeming tokens'
      });
   };
 };

  return {
    createWallet,
    receiveToken,
  }  
}
export default useWallet;
The receiveToken function above verifies if the token is valid using the getDecodedToken method imported from cashu-ts. After validating. tokens can be redeemed using the receive Method accessible from the CashuWallet instance returned from createWallet. The receive method returns token which can be a single token or a set of tokens added to your wallet. If errors are encountered when redeeming some tokens. The method also returns tokensWithErrors which contains the list of tokens that cannot be redeemed

Sending Tokens

To implement sending tokens. We’ll create a sendToken function in the useWallet hook.

//hooks/useWallet.ts
import { CashuWallet, getDecodedToken, Token } from '@cashu/cashu-ts';
import useMint from './useMint'

const useWallet = ()=>{  
   const { loadMint } = useMint();  

   const createWallet = async(url='https://testnut.cashu.space') =>{
      const { mint, keys } = await loadMint(url);      
      const cashuWallet = new CashuWallet(mint, keys);
      return cashuWallet;
   };

  const sendToken =  async (amountToSend:number,tokens:Token) => {
    try {
        // create wallet(using default mint url)
        const wallet = await createWallet();
        const proofs = tokens.token.map((t) => t.proofs).flat();
        const { returnChange, send } = await wallet.send(amountToSend, proofs);
        return ({
            returnChange,
            send
        });
    }
    catch(err){
        return ({
            error:'Error occured with sending token',
        });
    }
  };

};  
Here we use send method in the CashuWallet class. This class converts your desired amount into an encoded token that the recipient can then redeem using a receive method within his wallet.