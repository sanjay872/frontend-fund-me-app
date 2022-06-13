import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connect")
const fundButton = document.getElementById("fund")
const balanceButton = document.getElementById("balanceButton")
const balanceTxt = document.getElementById("balance")
const withDrawButton = document.getElementById("withDrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withDrawButton.onclick = withDraw

//connecting wallet
async function connect() {
  //checking if metamask is installed
  if (typeof window.ethereum !== "undefined") {
    //making request to connect website with metamask
    await window.ethereum.request({ method: "eth_requestAccounts" })
    //if connected button text is changed to connected
    document.getElementById("connect").innerText = "connected!!"
  } else {
    console.log("No Metamask")
    document.getElementById("connect").innerText = "Please install Metamask!"
  }
}

//fund function
async function fund() {
  //get provider
  //get signer
  //contract we interact using ABI ,contract address and deployer
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  const ethAmount = document.getElementById("ethAmount").value

  console.log(`funding ${ethAmount}....`)
  if (typeof window.ethereum !== "undefined") {
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      //wait for the transaction to complete
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  }
}

//get balance
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    balanceTxt.innerText = ethers.utils.formatEther(balance)
  }
}

//withdraw
async function withDraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log("WithDraw....")
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  //listen for event
  //we return promise so, we will wait till the provider.once get executed
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations.`
      )
      resolve()
    })
  })
}
