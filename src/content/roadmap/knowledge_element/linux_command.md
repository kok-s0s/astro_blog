---
title: '也许会忘记的 Linux 指令'
---

# 系统管理

```bash
# 查看当前目录的路径
pwd
# 查看磁盘使用情况
df -h
# 查看文件/目录的大小
du -sh file_name
# 查看系统内存使用情况
free -h
# 查看当前登录的用户
who
```

# 权限管理
```bash
# 查看文件权限
ls -l file_name
# 修改文件权限
chmod 755 file_name
```

# 网络操作
```bash
# 查看网络状态
ifconfig
# 测试网络连通性
ping host_name
# 下载文件
wget url
```

# 进程管理
```bash
# 查看系统进程
ps aux
# 实时查看系统进程
top
# 杀死进程
kill pid
# 强制结束进程
kill -9 pid
```

# 压缩和解压缩
```bash
# 压缩文件
tar -zcvf archive.tar.gz dir_name
# 解压文件
tar -zxvf archive.tar.gz
```
