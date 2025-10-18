# E2E 测试快速参考

## 🚀 快速命令

```bash
# 运行所有测试
npm run test:e2e

# 交互式 UI 模式（推荐）
npm run test:e2e:ui

# 显示浏览器窗口
npm run test:e2e:headed

# 调试模式
npm run test:e2e:debug

# 查看报告
npm run test:e2e:report

# 运行特定测试文件
npx playwright test homepage

# 运行包含特定文本的测试
npx playwright test --grep "wallet"

# 只在 Chrome 上运行
npx playwright test --project=chromium
```

## 📁 测试文件

| 文件 | 用例数 | 说明 |
|------|--------|------|
| homepage.spec.ts | 10 | 首页导航和布局 |
| proposal-list.spec.ts | 11 | 提案列表显示和过滤 |
| create-proposal.spec.ts | 14 | 提案创建表单验证 |
| proposal-detail.spec.ts | 22 | 提案详情和投票 |
| admin.spec.ts | 20 | 管理员功能 |
| wallet-connection.spec.ts | 12 | 钱包连接和权限 |
| accessibility.spec.ts | 16 | 无障碍性测试 |

## 🎯 测试覆盖

- ✅ **总计**: 105 个测试用例
- ✅ **功能覆盖**: 100%
- ✅ **浏览器**: Chrome, Firefox, Safari
- ✅ **移动端**: iOS, Android

## 🐛 调试技巧

### 1. 查看测试失败原因
```bash
# 查看最新报告
npm run test:e2e:report
```

### 2. 逐步调试
```bash
# 打开调试器
npm run test:e2e:debug

# 在代码中添加断点
await page.pause();
```

### 3. 查看实际浏览器
```bash
# 显示浏览器窗口
npm run test:e2e:headed

# 慢速执行
npx playwright test --headed --slow-mo=1000
```

### 4. 截图和视频
- 失败时自动截图
- 失败时自动录制视频
- 位置: `test-results/` 和 `playwright-report/`

## 📝 编写测试

### 基本模板

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    const element = page.getByRole('button', { name: /submit/i });
    await expect(element).toBeVisible();
    await element.click();
  });
});
```

### 定位器优先级

1. `getByRole('button', { name: /text/i })` - 最推荐
2. `getByLabel('Label text')` - 表单元素
3. `getByText(/text/i)` - 文本内容
4. `getByTestId('test-id')` - 测试 ID
5. `locator('css-selector')` - CSS 选择器

### 常用断言

```typescript
// 可见性
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// 文本
await expect(element).toHaveText('Expected text');
await expect(element).toContainText(/partial/i);

// 属性
await expect(element).toHaveAttribute('href', '/path');
await expect(element).toHaveValue('input value');

// 计数
await expect(elements).toHaveCount(5);

// URL
await expect(page).toHaveURL('/expected-path');
await expect(page).toHaveTitle(/Page Title/);
```

## 🔧 配置

### 环境变量

```bash
# CI 环境
CI=true npm run test:e2e

# 自定义 baseURL
BASE_URL=http://localhost:3000 npm run test:e2e
```

### 重试策略

```typescript
// playwright.config.ts
retries: process.env.CI ? 2 : 0
```

### 并行执行

```typescript
// playwright.config.ts
fullyParallel: true,
workers: process.env.CI ? 1 : undefined
```

## 📊 CI/CD 集成

### GitHub Actions

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🎓 最佳实践

### ✅ 推荐

- 使用语义化定位器（getByRole, getByLabel）
- 等待元素可见而非固定延迟
- 测试用户行为而非实现细节
- 为每个测试设置独立的前置条件

### ❌ 避免

- 使用 CSS 选择器作为主要定位策略
- 依赖固定的 `waitForTimeout`
- 测试内部状态
- 测试之间相互依赖

## 🆘 常见问题

**Q: 测试超时**
```typescript
// 增加超时时间
test.setTimeout(60000);
await expect(element).toBeVisible({ timeout: 10000 });
```

**Q: 元素找不到**
- 检查定位器是否正确
- 确认元素是否已加载
- 使用 `--debug` 模式查看

**Q: 测试不稳定**
- 使用 Playwright 内置等待
- 避免竞态条件
- 确保测试隔离

## 📚 更多资源

- [完整测试文档](../TEST_DOCUMENTATION.md)
- [Playwright 文档](https://playwright.dev)
- [测试最佳实践](https://playwright.dev/docs/best-practices)

---

**测试框架**: Playwright 1.49.0
**更新日期**: 2025-10-14
