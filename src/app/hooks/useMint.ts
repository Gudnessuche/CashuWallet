//hooks/useMint.ts

import { CashuMint, MintActiveKeys, MintAllKeySets } from '@cashu/cashu-ts';

export interface Mint {
  mintURL: string,
  keys: MintAllKeySets,
  keysets: MintActiveKeys,
  isAdded: boolean
}

export const useMint = ()=>{

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