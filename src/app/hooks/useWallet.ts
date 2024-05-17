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

  const receiveToken =  async () => {

    const encodedToken = "jashjs"
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
   }
   catch (error) {
      return ({
        error: 'Error occured with redeeming tokens'
      });
   };
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
    return {
        createWallet,
        receiveToken,
        sendToken,
    }
};

   

export default useWallet;