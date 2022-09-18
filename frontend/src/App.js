import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

import Staking from "./artifacts/contracts/Sushi.sol/SushiBar.json";
import Sushi from "./artifacts/contracts/SushiToken.sol/SushiToken.json";

const TokenAddress = "0x2617e85caBD6bC038f6Dd60cB94f4d94655394D5";
const stakingAddress = "0xCe13dB2459b1175b4f95DEBFCeE7A925FdD6FeAa";

function App() {
  const [value, setValue] = useState(null);

  const [balance, setBalance] = useState(null);

  const [stake, setStake] = useState("");

  const[claim,setClaim] = useState(null);

  const [successMessage, setSuccessMessage] = useState(false);
  const [error, setError] = useState(false);

  const [selectedContract, setSelectedContract] = useState(null);

  const requestAccount = useCallback(async () => {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  }, []);

  const setMint = useCallback(async () => {
    if (!value) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(TokenAddress, Sushi.abi, signer);
      try {
        const transaction = await contract.mint(value);
        await transaction.wait();
      } catch (error) {
        setError(error);
      }
      
    }
  }, [value, requestAccount]);

  const setBalances = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(TokenAddress, Sushi.abi, signer);
      try {
        const signerAddress = await signer.getAddress();
        const transaction = await contract.balanceOf(signerAddress);
        await transaction.wait();
      } catch (error) {
        setError(error);
      }
    }
  }, [balance, requestAccount]);

  const setApprove = useCallback(async () => {
    if (!value) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(TokenAddress, Sushi.abi, signer);
      try {
        const transaction = await contract.approve("0xCe13dB2459b1175b4f95DEBFCeE7A925FdD6FeAa",claim);
        await transaction.wait();
      } catch (error) {
        setError(error);
      }
      
    }
  }, [value, requestAccount]);

  const setStakingValue = useCallback(async () => {
    if (!stake) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(stakingAddress, Staking.abi, signer);
      try {
        const transaction = await contract.enter(stake);
        await transaction.wait();
      } catch (error) {
        setError(error);
      }
      
    }
  }, [stake, requestAccount]);

  const setClaimingValue = useCallback(async () => {
    if (!stake) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(stakingAddress, Staking.abi, signer);
      try {
        const transaction = await contract.leave(stake);
        //await transaction.wait();
        setClaim(transaction.message);
      } catch (error) {
        setError(error);
      }
      
    }
  }, [stake, requestAccount]);


  useEffect(() => {
    setTimeout(() => setSuccessMessage(false), 5000);
  }, [successMessage]);


  const returnContractBySelection = (contract) => {
    switch (contract) {
      case "stake":
        return (
          <div className="main">
            
            <br></br>

            {error ? (
              <span>{error?.data?.message || error?.message}</span>
            ) : null}

            

            <br></br>
            <input
              onChange={(event) => setValue(event?.target.value)}
              placeholder="Amount"
            />
            <button onClick={() => setMint(value)}>
              Mint Tokens
            </button>

            <br></br>
            <input
              onChange={(event) => setClaim(event?.target.value)}
              placeholder="Amount"
            />
            <button onClick={() => setApprove(claim)}>
              Approve SushiBar
            </button>

            <br></br>
            <input
              onChange={(event) => setStake(event?.target.value)}
              placeholder="Amount"
            />
            <button onClick={() => setStakingValue(stake)}>
              Stake Tokens
            </button>

            <br></br>
            <input
              onChange={(event) => setStake(event?.target.value)}
              placeholder="Amount"
            />
            <button onClick={() => setClaimingValue(stake)}>
              Unstake Tokens
            </button>

            <br></br><br></br>
            <button onClick={() => setSelectedContract(null)}>Go back</button>
          </div>
        );
      
      default:
        break;
    }
  };

  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selectedContract ? (
          returnContractBySelection(selectedContract)
        ) : (
          <div className="choose_contract">
            <button onClick={() => setSelectedContract("stake")}>
              Stake
            </button>


          </div>
        )}
      </header>
    </div>
  );
}

export default App;