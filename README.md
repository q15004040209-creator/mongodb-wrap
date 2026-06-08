# MongoDB-Wrap

[![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-SSPL-blue.svg)](https://www.mongodb.com/licensing/server-side-public-license)
[![Stars](https://img.shields.io/github/stars/mongodb/mongo?style=social)](https://github.com/mongodb/mongo)

> MongoDB C++ 文档型 NoSQL 数据库封装 - 让数据操作更简单
> 
> MongoDB C++ Document-Oriented NoSQL Database Wrapper - Making Data Operations Simpler

## 简介 | Introduction

MongoDB 是一个基于分布式文件存储的 NoSQL 数据库，由 C++ 编写，文档存储，高性能、高可用性、易于扩展。

MongoDB is a document-oriented NoSQL database written in C++, featuring high performance, high availability, and easy scalability.

### 特性 | Features

- 📦 **文档存储** - JSON-like BSON 文档格式
- 🚀 **高性能** - 索引支持、内存计算
- 🔧 **高可用** - 复制集、自动故障转移
- 📈 **易扩展** - 分片集群、水平扩展
- 🔍 **丰富查询** - 支持复杂查询和聚合管道

## 快速开始 | Quick Start

### 安装 MongoDB | Installation

#### Windows

```powershell
# 使用 Chocolatey
choco install mongodb

# 或下载 MSI 安装包
# https://www.mongodb.com/try/download/community
```

#### macOS

```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu/Debian)

```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Docker

```bash
docker run -d --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### Python Demo

```python
"""
MongoDB Python Demo - 使用 pymongo 进行数据库操作
MongoDB Python Demo - Database operations using pymongo
"""

from pymongo import MongoClient
from datetime import datetime

# 连接 MongoDB | Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['wrap_demo']

# 创建集合 | Create collection
users = db['users']

# 插入文档 | Insert document
user_data = {
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 28,
    "skills": ["Python", "MongoDB", "Node.js"],
    "created_at": datetime.now()
}
result = users.insert_one(user_data)
print(f"Inserted user ID: {result.inserted_id}")

# 批量插入 | Insert many
users.insert_many([
    {"name": "李四", "email": "lisi@example.com", "age": 25},
    {"name": "王五", "email": "wangwu@example.com", "age": 30}
])

# 查询文档 | Query documents
print("\n=== 查找所有用户 ===")
for user in users.find():
    print(f"{user['name']} - {user['email']}")

print("\n=== 条件查询 ===")
query = {"age": {"$gt": 26}}
for user in users.find(query):
    print(f"{user['name']} - 年龄：{user['age']}")

# 更新文档 | Update document
users.update_one(
    {"name": "张三"},
    {"$set": {"age": 29, "title": "高级工程师"}}
)

# 聚合查询 | Aggregation
pipeline = [
    {"$group": {"_id": None, "avg_age": {"$avg": "$age"}}}
]
result = users.aggregate(pipeline)
print(f"\n平均年龄：{list(result)[0]['avg_age']:.1f}")

# 创建索引 | Create index
users.create_index("email", unique=True)

client.close()
```

### Node.js Demo

```javascript
/**
 * MongoDB Node.js Demo - 使用原生 MongoDB 驱动
 * MongoDB Node.js Demo - Using native MongoDB driver
 */

const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ 已连接到 MongoDB');

    const db = client.db('wrap_demo');
    const products = db.collection('products');

    // 插入商品 | Insert products
    const productDocs = [
      {
        name: 'MacBook Pro',
        category: 'Electronics',
        price: 12999,
        stock: 50,
        tags: ['apple', 'laptop', 'premium'],
        specs: {
          cpu: 'M3 Pro',
          ram: '18GB',
          storage: '512GB SSD'
        },
        createdAt: new Date()
      },
      {
        name: 'AirPods Pro',
        category: 'Electronics',
        price: 1899,
        stock: 200,
        tags: ['apple', 'audio', 'wireless']
      },
      {
        name: '机械键盘',
        category: 'Peripherals',
        price: 699,
        stock: 150,
        tags: ['keyboard', 'mechanical', 'gaming']
      }
    ];

    const insertResult = await products.insertMany(productDocs);
    console.log(`✅ 插入了 ${insertResult.insertedCount} 个商品`);

    // 查询 | Query
    console.log('\n=== 所有商品 ===');
    const allProducts = await products.find().toArray();
    allProducts.forEach(p => console.log(`${p.name} - ¥${p.price}`));

    console.log('\n=== 价格 > 1000 ===');
    const expensive = await products
      .find({ price: { $gt: 1000 } })
      .toArray();
    expensive.forEach(p => console.log(`${p.name} - ¥${p.price}`));

    // 更新 | Update
    await products.updateOne(
      { name: 'MacBook Pro' },
      { $set: { stock: 45 }, $inc: { price: -500 } }
    );

    // 聚合 | Aggregation
    const stats = await products.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]).toArray();

    console.log('\n=== 分类统计 ===');
    stats.forEach(s => 
      console.log(`${s._id}: ${s.count} 个商品，平均价格 ¥${s.avgPrice.toFixed(2)}`)
    );

    // 创建索引 | Create index
    await products.createIndex({ name: 1 });
    await products.createIndex({ category: 1, price: 1 });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await client.close();
  }
}

main();
```

## MongoDB 基础命令 | Basic Commands

### Shell 操作

```javascript
// 连接数据库
use wrap_demo

// 查看集合
show collections

// 插入文档
db.users.insertOne({
  name: "John",
  age: 30,
  email: "john@example.com"
})

// 查询
db.users.find({ age: { $gt: 25 } })
db.users.findOne({ name: "John" })

// 更新
db.users.updateOne(
  { name: "John" },
  { $set: { age: 31 } }
)

// 删除
db.users.deleteOne({ name: "John" })

// 创建索引
db.users.createIndex({ email: 1 }, { unique: true })

// 聚合管道
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$customer", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])
```

## 使用场景 | Use Cases

### 1. 内容管理系统
- 文章、博客、文档存储
- 灵活的 schema 适应不同内容类型

### 2. 用户数据存储
- 用户档案、偏好设置
- 会话数据、购物车

### 3. 物联网数据
- 设备状态、传感器数据
- 时序数据处理

### 4. 实时分析
- 日志收集与分析
- 用户行为追踪

### 5. 产品目录
- 电商商品管理
- 多变体产品支持

## 性能优化建议 | Performance Tips

1. **合理使用索引** - 为常用查询字段创建索引
2. **避免全表扫描** - 使用覆盖索引
3. **分片策略** - 大数据集使用分片集群
4. **内存优化** - 调整 WiredTiger 缓存
5. **查询优化** - 使用 explain() 分析查询

## 参考资源 | Resources

- 📖 [官方文档](https://docs.mongodb.com/)
- 🎓 [MongoDB University](https://university.mongodb.com/)
- 🔧 [MongoDB Compass](https://www.mongodb.com/products/compass)
- 📊 [MongoDB Shell](https://www.mongodb.com/products/shell)

## 许可证 | License

MongoDB is licensed under the Server Side Public License (SSPL).

---

**Made with ❤️ by q15004040209-creator**

_封装 MongoDB，让数据库操作更简单_