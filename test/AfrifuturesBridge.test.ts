import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AfrifuturesBridge } from '../typechain-types'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'

describe('AfrifuturesBridge', function () {
  let bridge: AfrifuturesBridge
  let owner: SignerWithAddress
  let user: SignerWithAddress
  let relayer: SignerWithAddress
  let mockWormhole: any
  let mockUSDC: any
  let mockAFF: any

  const SOLANA_CHAIN_ID = 1
  const POLYGON_CHAIN_ID = 5

  beforeEach(async function () {
    [owner, user, relayer] = await ethers.getSigners()

    // Deploy mock Wormhole
    const MockWormhole = await ethers.getContractFactory('MockWormhole')
    mockWormhole = await MockWormhole.deploy()

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory('MockERC20')
    mockUSDC = await MockERC20.deploy('USDC', 'USDC', 6)
    mockAFF = await MockERC20.deploy('AfrifuturesToken', 'AFF', 18)

    // Mint tokens to user
    await mockUSDC.mint(user.address, ethers.parseUnits('1000', 6)) // 1000 USDC
    await mockAFF.mint(user.address, ethers.parseUnits('10000', 18)) // 10000 AFF

    // Deploy bridge
    const Bridge = await ethers.getContractFactory('AfrifuturesBridge')
    bridge = await Bridge.deploy(
      await mockWormhole.getAddress(),
      await mockUSDC.getAddress(),
      await mockAFF.getAddress()
    )

    // Grant relayer role
    const RELAYER_ROLE = await bridge.RELAYER_ROLE()
    await bridge.grantRole(RELAYER_ROLE, relayer.address)
  })

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const DEFAULT_ADMIN_ROLE = await bridge.DEFAULT_ADMIN_ROLE()
      expect(await bridge.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true
    })

    it('Should set correct token addresses', async function () {
      expect(await bridge.usdc()).to.equal(await mockUSDC.getAddress())
      expect(await bridge.affToken()).to.equal(await mockAFF.getAddress())
    })

    it('Should set initial bridge fee', async function () {
      expect(await bridge.bridgeFee()).to.equal(ethers.parseEther('0.01'))
    })
  })

  describe('Bridge USDC', function () {
    it('Should bridge USDC to Solana', async function () {
      const amount = ethers.parseUnits('100', 6) // 100 USDC
      const solanaRecipient = ethers.randomBytes(32)
      const marketId = 1
      const isYes = true

      // Approve USDC
      await mockUSDC.connect(user).approve(await bridge.getAddress(), amount)

      // Bridge USDC
      const bridgeFee = await bridge.bridgeFee()
      const tx = await bridge.connect(user).bridgeUSDCForStaking(
        amount,
        solanaRecipient,
        marketId,
        isYes,
        { value: bridgeFee }
      )

      // Check event emission
      await expect(tx)
        .to.emit(bridge, 'USDCBridged')
        .withArgs(user.address, amount, ethers.hexlify(solanaRecipient), 0)

      // Check USDC transferred to bridge
      expect(await mockUSDC.balanceOf(await bridge.getAddress())).to.equal(amount)

      // Check stats updated
      const stats = await bridge.getBridgeStats()
      expect(stats.totalUSDCBridged).to.equal(amount)
      expect(stats.totalStakes).to.equal(1)
    })

    it('Should fail if insufficient bridge fee', async function () {
      const amount = ethers.parseUnits('100', 6)
      const solanaRecipient = ethers.randomBytes(32)

      await mockUSDC.connect(user).approve(await bridge.getAddress(), amount)

      await expect(
        bridge.connect(user).bridgeUSDCForStaking(
          amount,
          solanaRecipient,
          0,
          true,
          { value: 0 } // No fee
        )
      ).to.be.revertedWith('Insufficient bridge fee')
    })

    it('Should fail if amount is zero', async function () {
      const solanaRecipient = ethers.randomBytes(32)
      const bridgeFee = await bridge.bridgeFee()

      await expect(
        bridge.connect(user).bridgeUSDCForStaking(
          0,
          solanaRecipient,
          0,
          true,
          { value: bridgeFee }
        )
      ).to.be.revertedWith('Amount must be > 0')
    })
  })

  describe('Bridge $AFF', function () {
    it('Should bridge $AFF to Solana', async function () {
      const amount = ethers.parseUnits('1000', 18) // 1000 AFF
      const solanaRecipient = ethers.randomBytes(32)

      // Approve AFF
      await mockAFF.connect(user).approve(await bridge.getAddress(), amount)

      // Bridge AFF
      const bridgeFee = await bridge.bridgeFee()
      const tx = await bridge.connect(user).bridgeAFF(
        amount,
        solanaRecipient,
        { value: bridgeFee }
      )

      // Check event emission
      await expect(tx)
        .to.emit(bridge, 'AFFBridged')
        .withArgs(user.address, amount, ethers.hexlify(solanaRecipient), 0)

      // Check AFF transferred to bridge
      expect(await mockAFF.balanceOf(await bridge.getAddress())).to.equal(amount)

      // Check stats updated
      const stats = await bridge.getBridgeStats()
      expect(stats.totalAFFBridged).to.equal(amount)
    })
  })

  describe('Bridge Receipt', function () {
    it('Should bridge warehouse receipt', async function () {
      const receiptId = 12345
      const solanaRecipient = ethers.randomBytes(32)
      const commodity = 'COFFEE'
      const quantity = 1000

      const bridgeFee = await bridge.bridgeFee()
      const tx = await bridge.connect(user).bridgeReceipt(
        receiptId,
        solanaRecipient,
        commodity,
        quantity,
        { value: bridgeFee }
      )

      // Check event emission
      await expect(tx)
        .to.emit(bridge, 'MessageSent')

      const stats = await bridge.getBridgeStats()
      expect(stats.totalMessages).to.be.greaterThan(0)
    })
  })

  describe('Bridge Vote', function () {
    it('Should bridge governance vote', async function () {
      const proposalId = 5
      const votes = ethers.parseUnits('100', 18)
      const support = true
      const solanaRecipient = ethers.randomBytes(32)

      const bridgeFee = await bridge.bridgeFee()
      const tx = await bridge.connect(user).bridgeVote(
        proposalId,
        votes,
        support,
        solanaRecipient,
        { value: bridgeFee }
      )

      // Check event emission
      await expect(tx)
        .to.emit(bridge, 'VoteBridged')
        .withArgs(user.address, proposalId, votes, ethers.hexlify(solanaRecipient))
    })
  })

  describe('Fee Management', function () {
    it('Should update fees', async function () {
      const newBridgeFee = ethers.parseEther('0.02')
      const newRelayerFee = ethers.parseEther('0.01')

      await bridge.updateFees(newBridgeFee, newRelayerFee)

      expect(await bridge.bridgeFee()).to.equal(newBridgeFee)
      expect(await bridge.relayerFee()).to.equal(newRelayerFee)
    })

    it('Should allow admin to withdraw fees', async function () {
      // Bridge some USDC to collect fees
      const amount = ethers.parseUnits('100', 6)
      const solanaRecipient = ethers.randomBytes(32)
      await mockUSDC.connect(user).approve(await bridge.getAddress(), amount)

      const bridgeFee = await bridge.bridgeFee()
      await bridge.connect(user).bridgeUSDCForStaking(
        amount,
        solanaRecipient,
        0,
        true,
        { value: bridgeFee }
      )

      // Withdraw fees
      const balanceBefore = await ethers.provider.getBalance(owner.address)
      await bridge.withdrawFees(owner.address)
      const balanceAfter = await ethers.provider.getBalance(owner.address)

      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })
  })

  describe('Access Control', function () {
    it('Should not allow non-admin to update fees', async function () {
      await expect(
        bridge.connect(user).updateFees(
          ethers.parseEther('0.02'),
          ethers.parseEther('0.01')
        )
      ).to.be.reverted
    })

    it('Should not allow non-admin to withdraw fees', async function () {
      await expect(
        bridge.connect(user).withdrawFees(user.address)
      ).to.be.reverted
    })
  })
})

// Mock contracts for testing

contract MockWormhole {
  uint64 public sequence;

  function publishMessage(
    uint32 nonce,
    bytes memory payload,
    uint8 consistencyLevel
  ) external payable returns (uint64) {
    return sequence++;
  }

  function messageFee() external pure returns (uint256) {
    return 0.001 ether;
  }

  function parseAndVerifyVM(
    bytes calldata encodedVM
  ) external pure returns (
    IWormhole.VM memory vm,
    bool valid,
    string memory reason
  ) {
    vm = IWormhole.VM({
      version: 1,
      timestamp: uint32(block.timestamp),
      nonce: 0,
      emitterChainId: 5,
      emitterAddress: bytes32(0),
      sequence: 0,
      consistencyLevel: 15,
      payload: "",
      guardianSetIndex: 0,
      signatures: "",
      hash: bytes32(0)
    });
    valid = true;
    reason = "";
  }
}

contract MockERC20 {
  string public name;
  string public symbol;
  uint8 public decimals;
  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  constructor(string memory _name, string memory _symbol, uint8 _decimals) {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
  }

  function mint(address to, uint256 amount) external {
    balanceOf[to] += amount;
    totalSupply += amount;
  }

  function approve(address spender, uint256 amount) external returns (bool) {
    allowance[msg.sender][spender] = amount;
    return true;
  }

  function transfer(address to, uint256 amount) external returns (bool) {
    require(balanceOf[msg.sender] >= amount, "Insufficient balance");
    balanceOf[msg.sender] -= amount;
    balanceOf[to] += amount;
    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) external returns (bool) {
    require(balanceOf[from] >= amount, "Insufficient balance");
    require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
    balanceOf[from] -= amount;
    balanceOf[to] += amount;
    allowance[from][msg.sender] -= amount;
    return true;
  }
}

interface IWormhole {
  struct VM {
    uint8 version;
    uint32 timestamp;
    uint32 nonce;
    uint16 emitterChainId;
    bytes32 emitterAddress;
    uint64 sequence;
    uint8 consistencyLevel;
    bytes payload;
    uint32 guardianSetIndex;
    bytes signatures;
    bytes32 hash;
  }
}
