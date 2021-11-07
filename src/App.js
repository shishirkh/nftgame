import './App.css';
import { Connection, PublicKey } from "@solana/web3.js";
import * as web3 from '@solana/web3.js';
import { useEffect, useState } from 'react';
import nftImage from './nftImage.png'
import { Creator, dataURLtoFile, mintNFT } from './utils/nftCreation';
import domToImage from 'dom-to-image';

const NETWORK = web3.clusterApiUrl("devnet");
const connection = new Connection(NETWORK);

function App() {

  const [provider, setProvider] = useState()
  const [providerPubKey, setProviderPub] = useState()
  const [nftDetails, setNftDetails] = useState({})

const convertDOMtoBase64 = async () => {
  const node = document.getElementById('nftImage');
  return domToImage.toPng(node);
};


const mintNewNFT = async () =>{
  try{
    const img = await convertDOMtoBase64();
    const templateImage = dataURLtoFile(img, 'My_NFT.png');
    const ownerPublicKey = new PublicKey(provider.publicKey).toBase58();
    const selfCreator = new Creator({
      address: ownerPublicKey,
      verified: true,
      share: 100,
    });
    const metadata = {
      name: `SOLG_NFT`,
      symbol: 'MNFT',
      creators: [selfCreator],
      description: '',
      sellerFeeBasisPoints: 0,
      image: templateImage.name,
      animation_url: '',
      external_url: '',
      properties: {
        files: [templateImage],
        category: 'image',
      },
    };

    const _nft = await mintNFT(
      connection,
      provider,
      {},
      [templateImage],
      metadata,
      1000000000
    );
    setNftDetails(_nft)
  }catch(err){
    console.log(err)
  }
}

const connectToWallet = () =>{
  if(!provider && window.solana){
    setProvider(window.solana)
  }
  if(!provider){
    console.log("No provider found")
    return
  }
  if(provider && !provider.isConnected){
    provider.connect()
  }
}


  useEffect(() => {
    if (provider) {
        provider.on("connect", async() => {
          console.log("wallet got connected")
          setProviderPub(provider.publicKey)

        });
        provider.on("disconnect", () => {
          console.log("Disconnected from wallet");
        });
    }
  }, [provider]);

  useEffect(() => {
    if ("solana" in window && !provider) {
      console.log("Phantom wallet present")
      setProvider(window.solana)
    }
  },[])

  return (
    <div className="App">
      <header className="App-header">
          
           <button onClick={connectToWallet}> {providerPubKey ? 'Connected' : 'Connect'} to wallet {providerPubKey ? (providerPubKey).toBase58() : ""}</button>
           <br></br>
           <img src={nftImage} style={{width:"200px"}} id="nftImage"></img>
          <button onClick={mintNewNFT}> {nftDetails && nftDetails.mintKey ? `NFT created, mintkey: ${nftDetails.mintKey}`:'Create NFT' } </button>
      </header>
    </div>
  );
}

export default App;
