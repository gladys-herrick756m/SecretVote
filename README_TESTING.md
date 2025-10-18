# SecretVote - 本地测试指南

## 🎉 当前状态：✅ 已部署并通过测试

本项目已成功在本地 Hardhat 环境中部署并测试。以下是完整的使用指南。

---

## 📋 快速开始

### 1. 启动服务（已启动）

当前运行中的服务：

```bash
# Hardhat 本地节点 (已启动)
✅ http://127.0.0.1:8545 - Chain ID: 31337

# 前端开发服务器 (已启动)
✅ http://localhost:8081
```

### 2. 使用 MetaMask 连接

#### 添加本地网络
- **Network Name**: Localhost 8545
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Currency Symbol**: ETH

#### 导入测试账户
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 3. 测试功能

打开浏览器访问: http://localhost:8081

---

## 🔧 合约信息

### 部署信息
```
合约地址: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
网络: localhost (Hardhat)
Chain ID: 31337
```

### 已验证的功能
- ✅ 创建提案
- ✅ 查看提案列表
- ✅ 查看提案详情
- ✅ 角色权限管理
- ⚠️ FHE 加密投票（需要 Sepolia 测试网）

---

## 🧪 运行测试

### 快速测试
```bash
npx hardhat run scripts/quick-test.cjs --network localhost
```

**预期输出**:
```
✅ Proposal count: 1
✅ PROPOSER_ROLE: 0xb09aa...
✅ Transaction confirmed!
✅ Gas used: 327055
```

### 完整集成测试
```bash
npx hardhat run scripts/test-integration.cjs --network localhost
```

---

## 📊 测试结果

最新测试运行于: **2025-10-14 15:35**

### 通过的测试
| 测试项 | 状态 | Gas 消耗 |
|--------|------|----------|
| 合约部署 | ✅ | 2,067,565 |
| 读取状态 | ✅ | - |
| 创建提案 | ✅ | 327,055 |
| 角色验证 | ✅ | - |

**通过率**: 100% (基础功能)

---

## 🎯 可测试的功能

### ✅ 本地环境支持

1. **提案管理**
   - 创建提案
   - 查看提案列表
   - 查看提案详情
   - 提案状态管理

2. **权限控制**
   - Admin 角色
   - Proposer 角色
   - Voter 角色
   - 权限验证

3. **前端交互**
   - 钱包连接
   - UI 组件
   - 表单验证
   - 交易确认

### ⚠️ 需要 Sepolia 测试网

1. **FHE 加密投票**
   - 加密投票数据
   - 隐私保护投票
   - Gateway 异步解密
   - 结果公开

---

## 📚 相关文档

| 文档 | 描述 |
|------|------|
| [LOCAL_DEPLOYMENT.md](LOCAL_DEPLOYMENT.md) | 完整部署说明 |
| [INTEGRATION_TEST_REPORT.md](INTEGRATION_TEST_REPORT.md) | 测试报告 |
| [deployment-local.json](deployment-local.json) | 部署配置 |
| [BACKEND_DEV.md](docs/BACKEND_DEV.md) | 后端开发文档 |

---

## 🛠️ 重启服务

如果需要重启：

### 停止服务
```bash
# 找到进程并停止
lsof -ti:8545 | xargs kill -9  # Hardhat 节点
lsof -ti:8081 | xargs kill -9  # 前端服务
```

### 启动服务
```bash
# 终端 1 - 启动 Hardhat 节点
npx hardhat node

# 终端 2 - 启动前端
npm run dev
```

### 重新部署合约
```bash
npx hardhat run scripts/deploy-local.cjs --network localhost
```

---

## 💡 常见问题

### Q: 为什么无法加密投票？
A: 本地环境使用模拟 Gateway。完整的 FHE 加密投票需要：
- Zama KMS Verifier
- Decryption Oracle
- Coprocessor

这些只在 Sepolia 测试网可用。

### Q: 如何测试投票功能？
A: 目前可以测试：
1. 创建提案 ✅
2. 查看提案 ✅
3. 前端交互 ✅

加密投票需要部署到 Sepolia。

### Q: Gas 消耗正常吗？
A: 是的。创建提案消耗 327,055 gas，这是使用 IR 编译器和 FHE 操作的正常水平。

---

## 🚀 部署到 Sepolia

要测试完整的 FHE 功能：

### 1. 准备工作
```bash
# 获取 Sepolia ETH
# 访问: https://sepoliafaucet.com

# 配置环境变量
cp .env.example .env
# 编辑 .env 添加你的私钥
```

### 2. 部署
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### 3. 验证合约
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <GATEWAY> <ADMIN>
```

---

## 📞 技术支持

### 查看日志

**Hardhat 节点日志**:
- 实时查看交易
- 合约调用记录
- Gas 消耗统计

**前端开发工具**:
- 浏览器控制台
- Network 标签页
- MetaMask 活动

### 诊断工具

```bash
# 检查合约状态
npx hardhat run scripts/quick-test.cjs --network localhost

# 完整测试套件
npx hardhat run scripts/test-integration.cjs --network localhost

# Hardhat 控制台
npx hardhat console --network localhost
```

---

## ✅ 验证清单

测试前确保：

- [ ] Hardhat 节点运行在 8545 端口
- [ ] 前端服务运行在 8081 端口
- [ ] MetaMask 连接到 localhost:8545
- [ ] 已导入测试账户私钥
- [ ] 浏览器可以访问 http://localhost:8081

---

## 🎊 测试成功标志

当你看到以下内容时，说明一切正常：

1. ✅ 浏览器打开 http://localhost:8081
2. ✅ 页面显示 "DAO Governance"
3. ✅ MetaMask 显示 "Connected"
4. ✅ 可以看到提案列表（至少 1 个测试提案）
5. ✅ 点击 "Create" 可以打开创建表单
6. ✅ 创建提案后 MetaMask 弹出确认窗口
7. ✅ 交易确认后可以在列表中看到新提案

---

**最后更新**: 2025-10-14 15:35
**测试状态**: ✅ 通过
**环境**: 本地 Hardhat 节点
**下一步**: 测试前端 UI 或部署到 Sepolia
