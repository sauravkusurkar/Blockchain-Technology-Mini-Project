(() => {
  const $ = (id) => document.getElementById(id);
  let provider, signer, contract, account, owner, chainId;
  const short = (s) => s ? `${s.slice(0, 6)}…${s.slice(-4)}` : "";
  const setMessage = (msg, type = "", tx = "") => {
    $("message").textContent = msg;
    $("message").className = `message ${type}`;
    $("txInfo").innerHTML = tx;
  };
  const configReady = () => window.VOTING_CONFIG && window.VOTING_CONFIG.address && window.VOTING_CONFIG.abi;
  function updateButtons(connected) {
    $("refreshBtn").disabled = !connected;
    $("addBtn").disabled = !connected || !isOwner() || !!(contract && window.__ended);
    $("endBtn").disabled = !connected || !isOwner() || !!(contract && window.__ended);
  }
  function isOwner() { return !!account && !!owner && account.toLowerCase() === owner.toLowerCase(); }

  async function connect() {
    if (!window.ethereum) {
      setMessage("MetaMask was not detected. Install the MetaMask browser extension, then refresh.", "error");
      return;
    }
    if (!configReady()) {
      setMessage("Contract config is missing. Run npm run deploy:local after starting the Hardhat node, then refresh.", "error");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      const network = await provider.getNetwork();
      chainId = Number(network.chainId);
      contract = new ethers.Contract(window.VOTING_CONFIG.address, window.VOTING_CONFIG.abi, signer);
      owner = await contract.owner();
      $("walletStatus").textContent = `Connected ${short(account)}`;
      $("connectBtn").textContent = "Wallet connected";
      $("networkWarning").classList.toggle("hidden", chainId === 31337);
      if (chainId !== 31337) {
        setMessage("Wrong network. Select Hardhat Local (Chain ID 31337) in MetaMask.", "error");
      } else {
        setMessage("Wallet connected. Blockchain connection is ready.", "success");
      }
      await refresh();
    } catch (e) {
      setMessage(e.shortMessage || e.message || "Could not connect wallet.", "error");
    }
  }

  async function refresh() {
    if (!contract) return;
    try {
      const count = Number(await contract.candidateCount());
      const ended = await contract.votingEnded();
      window.__ended = ended;
      $("candidateTotal").textContent = count;
      $("electionStatus").textContent = ended ? "Ended" : "Open";
      $("electionStatus").style.color = ended ? "#ffb4bd" : "#65e0d1";
      let totalVotes = 0;
      const items = [];
      const alreadyVoted = account ? await contract.hasVoted(account) : false;
      for (let id = 1; id <= count; id++) {
        const c = await contract.getCandidate(id);
        const votes = Number(c.voteCount);
        totalVotes += votes;
        const name = c.name;
        const buttonDisabled = ended || alreadyVoted || chainId !== 31337;
        items.push(`<div class="candidate">
          <div class="avatar">${escapeHtml(name.trim().charAt(0).toUpperCase() || "?")}</div>
          <div class="candidate-info"><div class="candidate-name">${escapeHtml(name)}</div><div class="candidate-meta">Candidate #${id}${alreadyVoted ? " · Your wallet has voted" : ""}</div></div>
          <div class="vote-count">${votes}<small>VOTES</small></div>
          <button class="btn primary vote-btn" data-vote="${id}" ${buttonDisabled ? "disabled" : ""}>Vote</button>
        </div>`);
      }
      $("voteTotal").textContent = totalVotes;
      $("candidateList").innerHTML = items.length ? items.join("") : '<div class="empty">No candidates yet. The election owner can add candidates from the admin panel.</div>';
      $("candidateList").querySelectorAll("[data-vote]").forEach((btn) => btn.addEventListener("click", () => castVote(Number(btn.dataset.vote))));
      $("adminStatus").textContent = isOwner()
        ? "Connected wallet is the contract owner. Admin actions are enabled."
        : `Admin actions are restricted to the deploying wallet (${short(owner)}).`;
      updateButtons(true);
    } catch (e) {
      setMessage(e.shortMessage || e.message || "Could not load election data. Check the local node.", "error");
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  async function transact(label, action) {
    try {
      setMessage(`${label}: waiting for MetaMask approval…`);
      const tx = await action();
      setMessage(`${label}: transaction submitted. Waiting for confirmation…`);
      const receipt = await tx.wait();
      setMessage(`${label} confirmed successfully.`, "success",
        `Transaction hash: <span>${receipt.hash}</span>`);
      await refresh();
    } catch (e) {
      const msg = e.shortMessage || e.reason || e.message || "Transaction failed.";
      setMessage(msg, "error");
    }
  }
  async function castVote(id) {
    await transact("Vote", () => contract.vote(id));
  }
  async function addCandidate() {
    const name = $("candidateName").value.trim();
    if (!name) { setMessage("Enter a candidate name first.", "error"); return; }
    if (!isOwner()) { setMessage("Only the deploying wallet can add candidates.", "error"); return; }
    await transact("Add candidate", () => contract.addCandidate(name));
    $("candidateName").value = "";
  }
  async function endVoting() {
    if (!isOwner()) { setMessage("Only the deploying wallet can end voting.", "error"); return; }
    if (!confirm("End voting now? This action cannot be undone on this deployed contract.")) return;
    await transact("End voting", () => contract.endVoting());
  }

  $("connectBtn").addEventListener("click", connect);
  $("refreshBtn").addEventListener("click", refresh);
  $("addBtn").addEventListener("click", addCandidate);
  $("endBtn").addEventListener("click", endVoting);
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => location.reload());
    window.ethereum.on("chainChanged", () => location.reload());
  }
  if (!configReady()) {
    setMessage("Deployment config not found yet. Follow the README setup steps, then refresh this page.");
  }
})();
