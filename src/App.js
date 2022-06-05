import 'regenerator-runtime/runtime'
import React, {useEffect, useCallback, useState } from 'react'
import { login, logout } from './utils'
import './global.css'
import {useDropzone} from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid';
import { utils } from "near-api-js";
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'

const web3StorageToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGRhMjM1MDYwZUVkNWZBOERFMjlFMjAwN2QwNDkzMEExNGE1ZEZhNjgiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTQ0MTMyMzE4MjIsIm5hbWUiOiJwbWFpX3dlYjMifQ.YnV8Y1E9WxN1IBUGJkhBL4NunvtahIeowCWNZ7F_zt0'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {

  const [nfts, setNfts] = useState([])
  
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length === 1) {
      console.log(acceptedFiles[0])
      const client = new Web3Storage({ token: web3StorageToken })
      client.put(acceptedFiles).then(cid => {
        window.contract.nft_mint(
          {
            token_id: uuidv4(),
            receiver_id: window.accountId,
            token_metadata: {
              title: acceptedFiles[0].name,
              media: cid
            }
          }, 
          10000000000000, 
          utils.format.parseNearAmount("0.1")
        )
      })
      
    } else {
      alert("SVG image only !!!")
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    disabled: !window.accountId,
    onDrop, 
    accept: {
      'image/*': ['.svg', '.png', '.jpge']
    }})

  useEffect(() => {
    if (window.accountId) {
      window.contract.nft_tokens_for_owner({
        account_id: window.accountId,
        from_index: "0",
        limit: 100
      }).then((result) => {
        console.log(result)
        setNfts(result)
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [window.accountId])

  return (
    <>
      {window.walletConnection.isSignedIn() ? 
        <button className="link" style={{ float: 'right' }} onClick={logout}>
          Sign out
        </button>
        :
        <button className="link" style={{ float: 'right' }} onClick={login}>
          Sign in
        </button>
      }
      <main>
        <h1>Create your NFT artwork with NEAR</h1>
        <div style={{display: 'flex'}}>
          <div style={{
            width: "30vw",
            padding: "20px",
            marginRight: "20px"
          }}>
            <h2>Upload</h2>
            <div {...getRootProps()} id="myDropzone" style={{border: !isDragActive ? '3px dashed #eeeeee' : '3px dashed #2980b9'}}>
              <input {...getInputProps({className: `dropzone ${!window.accountId ? 'disabled' : ''}`})} />
              {
                !window.accountId ? <p onClick={login}>Sign in first</p> :
                isDragActive ?
                  <p>Drop the files here ...</p> :
                  <p>Drag and drop some files here, or click to select files</p>
              }
            </div>
          </div>
          <div>
            <h2>Your artworks</h2>
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
              {nfts.map((nft) => {
                return (
                  <div style={{
                      width: "340px",
                      height: "340",
                      padding: "20px"
                    }}
                    key={nft.metadata.media}
                  >
                    <img 
                      src={`https://${nft.metadata.media}.ipfs.dweb.link/${nft.metadata.title}`} 
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}