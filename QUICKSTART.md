# SecretVote - 快速开始指南

## 🚀 5 分钟快速上手

### 前提条件
- Node.js >= 18.0.0
- npm 或 bun
- MetaMask 钱包
- 测试网 ETH（Sepolia 或 Zama Devnet）

## 📦 安装

```bash
# 1. 安装依赖
npm install
# 或
bun install
```

## ⚙️ 配置

```bash
# 2. 创建环境配置
cp .env.example .env

# 3. 编辑 .env 文件
# 填入以下信息：
# - PRIVATE_KEY: 你的钱包私钥（不含 0x）
# - GATEWAY_ADDRESS: Zama Gateway 地址
# - ADMIN_ADDRESS: 管理员地址（可选）
```

## 🔨 编译和测试

```bash
# 编译合约
npm run compile

# 运行测试
npm test

# 查看测试覆盖
npm run test -- --coverage
```

## 🚀 部署

```bash
# 部署到 Zama 测试网
npm run deploy:testnet

# 完整流程（编译 + 部署 + 导出 ABI）
npm run deploy:full

# 部署后，保存显示的合约地址到 contracts.config.ts
```

## 🎯 使用合约

### 1. 初始化角色

```typescript
import { ethers } from "ethers";
import SecretVoteABI from "./artifacts/contracts/SecretVoteGovernance.sol/SecretVoteGovernance.json";

const contract = new ethers.Contract(contractAddress, SecretVoteABI.abi, signer);

// 授予投票权
await contract.grantVoterRole("0x...");

// 授予提案权
await contract.grantProposerRole("0x...");
```

### 2. 创建提案

```typescript
const tx = await contract.createProposal(
  "提案标题",
  "提案详细描述",
  7 * 24 * 60 * 60 // 7 天投票期
);

const receipt = await tx.wait();
const event = receipt.events.find(e => e.event === "ProposalCreated");
const proposalId = event.args.proposalId;
```

### 3. 加密投票

```typescript
// 初始化 FHE
const sdk = await import("https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js");
const { initSDK, createInstance, SepoliaConfig } = sdk;
await initSDK();
const fhe = await createInstance({ ...SepoliaConfig, network: window.ethereum });

// 创建加密输入
const input = await fhe.createEncryptedInput(contractAddress, userAddress);
input.add32(0); // 0=FOR, 1=AGAINST, 2=ABSTAIN

// 加密
const { handles, inputProof } = await input.encrypt();

// 提交投票
await contract.castVote(proposalId, handles[0], inputProof);
```

### 4. 查看结果

```typescript
// 检查投票是否结束
const isActive = await contract.isVotingActive(proposalId);

// 请求解密（投票结束后）
if (!isActive) {
  await contract.requestDecryption(proposalId);
}

// 获取解密结果（Gateway 回调后）
const proposal = await contract.getProposal(proposalId);
if (proposal.finalized) {
  const results = await contract.getDecryptedResults(proposalId);
  console.log("For:", results.votesFor);
  console.log("Against:", results.votesAgainst);
  console.log("Abstain:", results.votesAbstain);
}
```

## 📚 常用命令

```bash
# 开发
npm run compile          # 编译合约
npm test                 # 运行测试
npm run deploy:testnet   # 部署到测试网

# 工具
npm run export-abi       # 导出 ABI
npm run verify           # 验证合约

# 前端
npm run dev             # 启动前端开发服务器
npm run build           # 构建生产版本
```

## 🔗 重要链接

- [完整后端文档](./contracts/README.md)
- [实现报告](./BACKEND_IMPLEMENTATION.md)
- [开发规范](./BACKEND_DEV.md)
- [FHE 指南](../../docs/FHE_COMPLETE_GUIDE_FULL_CN.md)

## 🆘 遇到问题？

### 编译失败
```bash
npx hardhat clean
npm run compile
```

### 测试失败
- 确保使用 Node.js 18+
- 清理缓存：`rm -rf cache artifacts`
- 重新安装：`rm -rf node_modules && npm install`

### 部署失败
- 检查 .env 配置
- 确认钱包有足够 ETH
- 验证 Gateway 地址正确
- 查看错误日志

### FHE 加密问题
- 使用 CDN 版本 SDK (0.2.0)
- 确保合约地址使用 checksum 格式
- 检查 inputProof 格式正确

## 💡 提示

1. **首次部署**：记得保存合约地址到 `contracts.config.ts`
2. **测试投票**：使用多个测试账户模拟真实投票
3. **Gas 优化**：批量授予角色以节省 Gas
4. **事件监听**：使用 ethers.js 监听合约事件
5. **错误处理**：始终捕获和处理合约调用错误

## 🎯 下一步

1. ✅ 完成后端部署
2. 🔄 集成前端界面
3. 🧪 进行功能测试
4. 🚀 发布到主网

祝你开发顺利！🎉
