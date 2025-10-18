# SecretVote 本地部署成功 ✅

## 部署概览

项目已成功在本地 Hardhat 节点上部署和运行，模拟 Sepolia 测试网环境。

### 部署时间
**2025-10-14 11:44:28 (UTC+8)**

---

## 🎯 部署信息

### 合约地址
```
0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 网络配置
- **Network**: localhost (Hardhat)
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Gateway Address**: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Mock)
- **Admin Address**: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

### 测试账户

| 账户 # | 地址 | 角色 | 私钥 |
|--------|------|------|------|
| **0** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | ADMIN, PROPOSER, VOTER | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **1** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | PROPOSER, VOTER | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **2** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | PROPOSER, VOTER | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

---

## 🚀 启动的服务

### 1. Hardhat 本地节点
- **状态**: ✅ 运行中
- **端口**: 8545
- **URL**: http://127.0.0.1:8545

### 2. 前端开发服务器
- **状态**: ✅ 运行中
- **端口**: 8081
- **URL**: http://localhost:8081
- **框架**: Vite + React + TypeScript

---

## 📦 部署的合约

### SecretVoteGovernance.sol

**完整的 FHE 加密投票治理合约**

#### 核心功能
1. **提案创建** (`createProposal`)
   - 标题、描述、投票期限
   - 仅 PROPOSER_ROLE 可创建

2. **加密投票** (`castVote`)
   - 使用 FHE 完全同态加密
   - 投票选项：FOR (0), AGAINST (1), ABSTAIN (2)
   - 仅 VOTER_ROLE 可投票

3. **解密结果** (`requestDecryption`)
   - 异步 Gateway 解密
   - 回调函数 `resolveTallyCallback`

4. **角色管理**
   - ADMIN_ROLE: 管理员
   - PROPOSER_ROLE: 提案创建者
   - VOTER_ROLE: 投票者

#### 技术栈
- Solidity 0.8.24
- Zama fhEVM (Fully Homomorphic Encryption)
- @fhevm/solidity ^0.8.0
- Gateway 异步解密机制

---

## 🔧 配置文件

### 1. 合约配置 ([src/config/contract.ts](src/config/contract.ts))
```typescript
export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const CONTRACT_CHAIN_ID = 31337;
export const GATEWAY_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
```

### 2. 合约 ABI ([src/config/SecretVoteGovernance.json](src/config/SecretVoteGovernance.json))
- 完整的合约 ABI 已导出
- 包含所有函数、事件和错误定义

### 3. 部署信息 ([deployment-local.json](deployment-local.json))
- 部署地址、时间、网络信息
- 测试账户和角色配置

---

## 📝 测试前后端联通步骤

### 1. 配置 MetaMask

1. **添加本地网络**
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **导入测试账户**
   ```
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

### 2. 访问前端

打开浏览器访问：**http://localhost:8081**

### 3. 连接钱包

1. 点击右上角 "Connect Wallet"
2. 选择 MetaMask
3. 确认连接到 localhost 网络

### 4. 测试流程

#### 创建提案
1. 点击 "Create" 按钮
2. 填写提案标题和描述
3. 选择投票期限
4. 点击 "Create Proposal"
5. MetaMask 确认交易

#### 投票
1. 在主页查看提案列表
2. 点击提案卡片查看详情
3. 点击 "Cast Your Vote"
4. 选择 FOR / AGAINST / ABSTAIN
5. 确认投票交易

#### 查看结果
1. 等待投票结束
2. 管理员请求解密
3. 查看最终投票结果

---

## 🔍 验证部署

### 检查合约状态
```bash
npx hardhat console --network localhost
```

```javascript
const contract = await ethers.getContractAt("SecretVoteGovernance", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
const proposalCount = await contract.getProposalCount();
console.log("Proposal Count:", proposalCount.toString());
```

### 查看 Hardhat 节点日志
```bash
# 在另一个终端查看节点输出
tail -f hardhat.log
```

---

## 📚 项目文件结构

```
SecretVote/
├── contracts/
│   └── SecretVoteGovernance.sol      # FHE 加密投票合约
├── scripts/
│   ├── deploy.ts                      # Sepolia 部署脚本
│   └── deploy-local.cjs              # 本地部署脚本 ✅
├── src/
│   ├── config/
│   │   ├── contract.ts               # 合约地址配置 ✅
│   │   ├── abi.ts                    # ABI 导出
│   │   └── SecretVoteGovernance.json # 合约 ABI ✅
│   ├── pages/
│   │   ├── Index.tsx                 # 提案列表页
│   │   ├── CreateProposal.tsx        # 创建提案页
│   │   ├── ProposalDetail.tsx        # 提案详情页
│   │   └── Admin.tsx                 # 管理后台页
│   └── components/
│       ├── proposal/
│       │   └── ProposalCard.tsx      # 提案卡片组件
│       └── voting/
│           └── VoteModal.tsx         # 投票模态框组件
├── deployment-local.json             # 部署信息 ✅
├── hardhat.config.cjs                # Hardhat 配置
└── LOCAL_DEPLOYMENT.md              # 本文档 ✅
```

---

## ⚠️ 重要说明

### 关于 FHE 加密

本地部署使用**模拟 Gateway**，FHE 加密功能在本地环境中：
- ✅ 合约部署成功
- ✅ 前端可以调用合约函数
- ⚠️ 实际的 FHE 加密和解密需要连接到 Zama 的 Sepolia 测试网

### 实际测试 FHE 功能

要测试完整的 FHE 加密投票功能，需要：
1. 部署到 Sepolia 测试网
2. 使用 Zama 的 Gateway 服务
3. 配置正确的 Gateway 地址和 KMS Verifier

---

## 🎉 成功标志

✅ Hardhat 节点运行
✅ 合约成功部署
✅ 前端服务启动
✅ 合约地址和 ABI 配置完成
✅ 测试账户配置完成
✅ 前后端基础联通就绪

---

## 📖 下一步

### 本地测试（当前环境）
- 测试前端 UI 交互
- 测试合约函数调用
- 测试角色权限管理
- 验证提案创建和查询流程

### Sepolia 测试网部署
1. 准备 Sepolia ETH 测试币
2. 配置 `.env` 文件：
   ```bash
   PRIVATE_KEY=your_private_key
   SEPOLIA_RPC_URL=https://rpc.sepolia.org
   ```
3. 运行部署脚本：
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```
4. 测试完整的 FHE 加密投票功能

---

## 🐛 故障排查

### 合约调用失败
- 检查 MetaMask 连接的网络是否正确
- 确认账户有足够的 ETH
- 查看浏览器控制台错误信息

### 前端无法连接合约
- 检查 `src/config/contract.ts` 中的合约地址
- 确认 Hardhat 节点正在运行
- 清除浏览器缓存重试

### 交易 revert
- 检查调用者是否有对应的角色权限
- 确认提案状态和时间限制
- 查看合约的 revert 信息

---

## 📞 支持

如有问题，请检查：
1. [BACKEND_DEV.md](docs/BACKEND_DEV.md) - 后端开发文档
2. [FHE_COMPLETE_GUIDE_FULL_CN.md](docs/FHE_COMPLETE_GUIDE_FULL_CN.md) - FHE 完整指南
3. Hardhat 控制台输出
4. 浏览器开发者工具

---

**部署完成时间**: 2025-10-14 11:44:28
**文档版本**: 1.0.0
**合约版本**: Solidity 0.8.24 + fhEVM 0.8.0
