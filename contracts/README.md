# SecretVote Backend - Smart Contracts

完整的 FHE 加密投票智能合约系统，使用 Zama fhEVM 技术。

## 📁 项目结构

```
contracts/
├── SecretVoteGovernance.sol    # 主合约
scripts/
├── deploy.ts                    # 部署脚本
test/
├── SecretVoteGovernance.test.ts # 测试文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
# 或
bun install
```

### 2. 配置环境变量

复制 `.env.example` 并创建 `.env` 文件：

```bash
cp .env.example .env
```

填写以下关键配置：

```env
PRIVATE_KEY=your_private_key_without_0x
GATEWAY_ADDRESS=0x... # Zama Gateway 地址
ADMIN_ADDRESS=0x...   # 管理员地址
```

### 3. 编译合约

```bash
npm run compile
```

### 4. 运行测试

```bash
npm test
```

### 5. 部署合约

```bash
# 部署到 Zama 测试网
npm run deploy:testnet

# 或指定网络
npx hardhat run scripts/deploy.ts --network zamaTestnet
```

### 6. 验证合约

```bash
npx hardhat verify --network zamaTestnet DEPLOYED_ADDRESS "GATEWAY_ADDRESS" "ADMIN_ADDRESS"
```

## 📚 核心功能

### 1. 提案创建

```solidity
function createProposal(
    string memory _title,
    string memory _description,
    uint256 _votingDuration
) external returns (uint256 proposalId)
```

- **权限**: 需要 `PROPOSER_ROLE`
- **参数限制**:
  - 标题: 最多 200 字符
  - 描述: 最多 2000 字符
  - 投票时长: 1 小时 - 30 天

### 2. 加密投票

```solidity
function castVote(
    uint256 _proposalId,
    einput _encryptedVote,
    bytes calldata _inputProof
) external
```

- **权限**: 需要 `VOTER_ROLE`
- **投票选项**:
  - `0` = FOR (赞成)
  - `1` = AGAINST (反对)
  - `2` = ABSTAIN (弃权)
- **加密**: 使用 fhevmjs 在客户端加密

### 3. 结果解密

```solidity
function requestDecryption(uint256 _proposalId)
    external returns (uint256[] memory)
```

- 投票结束后请求 Gateway 解密
- Gateway 回调 `fulfillDecryption()` 返回结果

### 4. 角色管理

```solidity
// 授予投票权
function grantVoterRole(address _voter) external

// 授予提案权
function grantProposerRole(address _proposer) external

// 撤销角色
function revokeVoterRole(address _voter) external
function revokeProposerRole(address _proposer) external
```

- **权限**: 仅限 `ADMIN_ROLE`

## 🔐 FHE 加密原理

### 加密流程

```typescript
// 1. 前端: 创建加密输入
const fhe = await initializeFHE();
const input = await fhe.createEncryptedInput(contractAddress, userAddress);
input.add32(voteChoice); // 0, 1, 或 2

// 2. 生成加密数据和证明
const { handles, inputProof } = await input.encrypt();

// 3. 发送到合约
await contract.castVote(proposalId, handles[0], inputProof);
```

### 合约处理

```solidity
// 1. 验证并转换加密输入
euint32 encryptedChoice = FHE.asEuint32(_encryptedVote, _inputProof);

// 2. 使用 FHE.select 条件累加
ebool isFor = FHE.eq(encryptedChoice, FHE.asEuint32(0));
euint32 toAdd = FHE.select(isFor, FHE.asEuint32(1), FHE.asEuint32(0));
proposal.votesFor = FHE.add(proposal.votesFor, toAdd);

// 3. 授权合约访问
FHE.allowThis(proposal.votesFor);
```

### 解密流程

```solidity
// 1. 请求 Gateway 解密
bytes32[] memory cts = new bytes32[](3);
cts[0] = FHE.toBytes32(proposal.votesFor);
cts[1] = FHE.toBytes32(proposal.votesAgainst);
cts[2] = FHE.toBytes32(proposal.votesAbstain);

uint256 requestId = FHE.requestDecryption(cts, this.fulfillDecryption.selector);

// 2. Gateway 回调
function fulfillDecryption(
    uint256 _proposalId,
    uint256 _decryptedFor,
    uint256 _decryptedAgainst,
    uint256 _decryptedAbstain
) external onlyGateway
```

## 📊 事件监听

### ProposalCreated

```solidity
event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    string title,
    uint256 startTime,
    uint256 endTime
);
```

### VoteCast

```solidity
event VoteCast(
    uint256 indexed proposalId,
    address indexed voter
);
```

### ProposalFinalized

```solidity
event ProposalFinalized(
    uint256 indexed proposalId,
    uint256 votesFor,
    uint256 votesAgainst,
    uint256 votesAbstain,
    bool passed
);
```

## 🛡️ 安全特性

### 1. 投票隐私

- ✅ 所有投票以 `euint32` 加密存储
- ✅ 链上无法查看个人投票
- ✅ 仅聚合结果可解密
- ✅ 不可追溯投票者

### 2. 访问控制

- ✅ 基于角色的权限系统
- ✅ 防止未授权操作
- ✅ 管理员控制角色分配

### 3. 防双投

- ✅ `hasVoted` 映射追踪
- ✅ 一地址一票
- ✅ 投票前验证

### 4. 时间锁

- ✅ 投票期限强制执行
- ✅ 结束前不可解密
- ✅ 防止提前操纵结果

## 🧪 测试覆盖

```bash
npm test
```

测试包括：

- ✅ 合约部署和初始化
- ✅ 角色管理（授予/撤销）
- ✅ 提案创建（有效/无效参数）
- ✅ 投票功能（单次/重复/权限）
- ✅ 防双投机制
- ✅ 时间锁验证
- ✅ 提案取消
- ✅ 解密流程
- ✅ 视图函数
- ✅ 边界情况

## 📖 API 文档

### 读取函数（无 Gas）

| 函数 | 说明 | 返回值 |
|------|------|--------|
| `getProposal(uint256)` | 获取提案详情 | Proposal 结构体 |
| `getProposalStatus(uint256)` | 获取提案状态 | ProposalStatus 枚举 |
| `isVotingActive(uint256)` | 检查投票是否进行中 | bool |
| `hasVoted(uint256, address)` | 检查是否已投票 | bool |
| `getDecryptedResults(uint256)` | 获取解密结果 | (uint256, uint256, uint256) |
| `getProposalCount()` | 获取提案总数 | uint256 |
| `hasRole(address, bytes32)` | 检查角色 | bool |

### 写入函数（需要 Gas）

| 函数 | 权限 | 说明 |
|------|------|------|
| `createProposal(...)` | PROPOSER_ROLE | 创建新提案 |
| `castVote(...)` | VOTER_ROLE | 提交加密投票 |
| `requestDecryption(uint256)` | Any | 请求解密 |
| `cancelProposal(uint256)` | ADMIN_ROLE | 取消提案 |
| `grantVoterRole(address)` | ADMIN_ROLE | 授予投票权 |
| `revokeVoterRole(address)` | ADMIN_ROLE | 撤销投票权 |
| `grantProposerRole(address)` | ADMIN_ROLE | 授予提案权 |

## 🔗 网络配置

### Sepolia 测试网

```typescript
{
  chainId: 11155111,
  rpcUrl: "https://rpc.sepolia.org",
  gateway: "0x..." // 从 Zama 获取
}
```

### Zama Devnet

```typescript
{
  chainId: 9000,
  rpcUrl: "https://devnet.zama.ai",
  gateway: "0x..." // 从 Zama 获取
}
```

## 📝 使用示例

### 完整工作流程

```typescript
// 1. 管理员授权角色
await contract.grantProposerRole(proposerAddress);
await contract.grantVoterRole(voter1Address);
await contract.grantVoterRole(voter2Address);

// 2. 提案者创建提案
const proposalId = await contract.createProposal(
  "Should we upgrade the protocol?",
  "This proposal suggests upgrading to version 2.0",
  7 * 24 * 60 * 60 // 7 days
);

// 3. 投票者投票
const fhe = await initializeFHE();
const input = await fhe.createEncryptedInput(contractAddress, voter1Address);
input.add32(0); // FOR
const { handles, inputProof } = await input.encrypt();
await contract.castVote(proposalId, handles[0], inputProof);

// 4. 投票结束后解密
await contract.requestDecryption(proposalId);

// 5. Gateway 回调后查看结果
const results = await contract.getDecryptedResults(proposalId);
console.log("For:", results.votesFor);
console.log("Against:", results.votesAgainst);
console.log("Abstain:", results.votesAbstain);
```

## 🐛 故障排除

### 编译错误

```bash
# 清理缓存
npx hardhat clean

# 重新编译
npm run compile
```

### 部署失败

- 检查 `.env` 配置
- 确认账户有足够 ETH
- 验证 Gateway 地址正确

### 测试失败

- 确保 Hardhat 网络正常
- 检查 fhEVM 插件安装
- 查看详细错误日志

## 📚 参考资源

- [Zama fhEVM 文档](https://docs.zama.ai/fhevm)
- [FHE 完整指南](../../docs/FHE_COMPLETE_GUIDE_FULL_CN.md)
- [后端开发文档](../BACKEND_DEV.md)
- [Hardhat 文档](https://hardhat.org/docs)

## 📄 许可证

MIT License
