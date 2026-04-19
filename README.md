# ComfyUI Frontend

## 开发环境配置

### Video服务环境变量

Video服务需要设置`ENV`环境变量，`debug`或`test`模式下跳过JWT认证：

Windows PowerShell:
```powershell
$env:ENV = "debug"
```

Windows CMD:
```cmd
set ENV=debug
```

### 前端开发服务器

```bash
pnpm dev
```