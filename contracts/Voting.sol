// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Voting - simple educational blockchain voting contract
/// @notice Demo only; not suitable for legally binding or secret elections.
contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public immutable owner;
    bool public votingEnded;
    uint256 public candidateCount;

    mapping(uint256 => Candidate) private candidates;
    mapping(address => bool) public hasVoted;

    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event VotingEnded();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only election owner");
        _;
    }

    modifier electionOpen() {
        require(!votingEnded, "Voting has ended");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCandidate(string calldata name) external onlyOwner electionOpen {
        require(bytes(name).length > 0, "Candidate name required");
        require(bytes(name).length <= 80, "Name too long");
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, name, 0);
        emit CandidateAdded(candidateCount, name);
    }

    function vote(uint256 candidateId) external electionOpen {
        require(!hasVoted[msg.sender], "Wallet has already voted");
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate");
        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;
        emit VoteCast(msg.sender, candidateId);
    }

    function endVoting() external onlyOwner electionOpen {
        votingEnded = true;
        emit VotingEnded();
    }

    function getCandidate(uint256 candidateId)
        external view returns (uint256 id, string memory name, uint256 voteCount)
    {
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate");
        Candidate storage c = candidates[candidateId];
        return (c.id, c.name, c.voteCount);
    }
}
