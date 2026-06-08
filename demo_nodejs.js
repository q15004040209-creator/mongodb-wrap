/**
 * MongoDB Node.js Demo - 使用原生 MongoDB 驱动
 * MongoDB Node.js Demo - Using native MongoDB driver
 * 
 * 安装依赖 | Install dependencies:
 *   npm install mongodb
 * 
 * 运行示例 | Run example:
 *   node demo_nodejs.js
 */

const { MongoClient, ObjectId } = require('mongodb');

async function main() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    // 连接 MongoDB | Connect to MongoDB
    console.log('🔌 正在连接 MongoDB...');
    await client.connect();
    console.log('✅ 连接成功！\n');

    const db = client.db('wrap_demo');
    
    // ============ 1. 插入操作 | Insert Operations ============
    console.log('=' .repeat(50));
    console.log('📝 插入操作 | Insert Operations');
    console.log('=' .repeat(50));

    const products = db.collection('products');

    // 插入单个商品 | Insert single product
    const productData = {
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
    };

    const result1 = await products.insertOne(productData);
    console.log(`✅ 插入商品 ID: ${result1.insertedId}`);

    // 批量插入 | Insert many
    const moreProducts = [
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
      },
      {
        name: '27 寸显示器',
        category: 'Monitors',
        price: 2499,
        stock: 80,
        tags: ['display', '4K', 'professional']
      },
      {
        name: '鼠标垫',
        category: 'Accessories',
        price: 99,
        stock: 500,
        tags: ['accessory', 'gaming']
      }
    ];

    const result2 = await products.insertMany(moreProducts);
    console.log(`✅ 批量插入 ${result2.insertedCount} 个商品\n`);

    // ============ 2. 查询操作 | Query Operations ============
    console.log('=' .repeat(50));
    console.log('🔍 查询操作 | Query Operations');
    console.log('=' .repeat(50));

    // 查询所有 | Find all
    console.log('\n【所有商品】');
    const allProducts = await products.find().toArray();
    allProducts.forEach(p => {
      console.log(`  📦 ${p.name} - ¥${p.price} (库存：${p.stock})`);
    });

    // 条件查询 | Conditional query
    console.log('\n【价格 > 1000 的商品】');
    const expensive = await products.find({ price: { $gt: 1000 } }).toArray();
    expensive.forEach(p => {
      console.log(`  💎 ${p.name} - ¥${p.price}`);
    });

    // 模糊查询 | Fuzzy query (regex)
    console.log('\n【名称包含"键盘"的商品】');
    const keyboards = await products.find({ 
      name: { $regex: '键盘' } 
    }).toArray();
    keyboards.forEach(p => {
      console.log(`  ⌨️  ${p.name}`);
    });

    // 包含查询 | IN query
    console.log('\n【 Electronics 或 Accessories 分类】');
    const electronics = await products.find({
      category: { $in: ['Electronics', 'Accessories'] }
    }).toArray();
    electronics.forEach(p => {
      console.log(`  🏷️  ${p.name} - ${p.category}`);
    });

    // 字段投影 | Projection
    console.log('\n【仅查询名称和价格】');
    const projection = await products.find(
      {}, 
      { _id: 0, name: 1, price: 1 }
    ).toArray();
    projection.forEach(p => {
      console.log(`  💰 ${p.name}: ¥${p.price}`);
    });

    // 排序 | Sort
    console.log('\n【按价格降序排列】');
    const sorted = await products.find().sort({ price: -1 }).toArray();
    sorted.forEach(p => {
      console.log(`  💵 ¥${p.price} - ${p.name}`);
    });

    // 限制数量 | Limit
    console.log('\n【最便宜的 2 个商品】');
    const cheapest = await products.find().sort({ price: 1 }).limit(2).toArray();
    cheapest.forEach(p => {
      console.log(`  🏷️  ${p.name}: ¥${p.price}`);
    });

    // ============ 3. 更新操作 | Update Operations ============
    console.log('\n' + '=' .repeat(50));
    console.log('✏️  更新操作 | Update Operations');
    console.log('=' .repeat(50));

    // 更新单个字段 | Update single field
    const update1 = await products.updateOne(
      { name: 'MacBook Pro' },
      { $set: { stock: 45, price: 12499 } }
    );
    console.log(`✅ 更新了 ${update1.modifiedCount} 个文档`);

    // 数值增加 | Increment
    const update2 = await products.updateOne(
      { name: 'AirPods Pro' },
      { $inc: { stock: 10 } }
    );
    console.log(`✅ AirPods Pro 库存 +10`);

    // 添加数组元素 | Add to array
    const update3 = await products.updateOne(
      { name: '机械键盘' },
      { $addToSet: { tags: 'RGB' } }
    );
    console.log(`✅ 机械键盘新增标签：RGB`);

    // 数组删除 | Remove from array
    const update4 = await products.updateOne(
      { name: '鼠标垫' },
      { $pull: { tags: 'gaming' } }
    );
    console.log(`✅ 鼠标垫移除标签：gaming`);

    // ============ 4. 删除操作 | Delete Operations ============
    console.log('\n' + '=' .repeat(50));
    console.log('🗑️  删除操作 | Delete Operations');
    console.log('=' .repeat(50));

    const delete1 = await products.deleteOne({ name: '鼠标垫' });
    console.log(`✅ 删除了 ${delete1.deletedCount} 个商品`);

    // ============ 5. 索引操作 | Index Operations ============
    console.log('\n' + '=' .repeat(50));
    console.log('📇 索引操作 | Index Operations');
    console.log('=' .repeat(50));

    try {
      await products.createIndex({ name: 1 });
      console.log('✅ 创建 name 索引');
    } catch (e) {
      console.log('⚠️  name 索引已存在');
    }

    try {
      await products.createIndex({ category: 1, price: 1 });
      console.log('✅ 创建复合索引 (category, price)');
    } catch (e) {
      console.log('⚠️  复合索引已存在');
    }

    // 查看索引 | List indexes
    const indexes = await products.listIndexes().toArray();
    console.log('\n【当前索引】');
    indexes.forEach(idx => {
      const keys = Object.entries(idx.key)
        .map(([k, v]) => `${k}:${v === 1 ? 'ASC' : 'DESC'}`)
        .join(', ');
      console.log(`  📇 ${idx.name}: ${keys}`);
    });

    // ============ 6. 聚合查询 | Aggregation ============
    console.log('\n' + '=' .repeat(50));
    console.log('📊 聚合查询 | Aggregation');
    console.log('=' .repeat(50));

    // 按分类统计 | Group by category
    const stats = await products.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          totalStock: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: 1,
          maxPrice: 1
        }
      }
    ]).toArray();

    console.log('\n【按分类统计】');
    stats.forEach(s => {
      console.log(`  📊 ${s.category || '未知分类'}:`);
      console.log(`     商品数：${s.count}`);
      console.log(`     总库存：${s.totalStock}`);
      console.log(`     均价：¥${s.avgPrice}`);
      console.log(`     价格区间：¥${s.minPrice} - ¥${s.maxPrice}`);
    });

    // 库存价值计算 | Inventory value
    const inventoryValue = await products.aggregate([
      {
        $addFields: {
          value: { $multiply: ['$price', '$stock'] }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' }
        }
      }
    ]).toArray();

    if (inventoryValue.length > 0) {
      console.log(`\n【库存总价值】¥${inventoryValue[0].totalValue.toLocaleString()}`);
    }

    // ============ 7. 事务示例 | Transaction Example ============
    console.log('\n' + '=' .repeat(50));
    console.log('🔐 事务示例 | Transaction Example');
    console.log('=' .repeat(50));

    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 订单创建示例 | Order creation example
        const orders = db.collection('orders');
        const order = {
          customerId: 'C001',
          items: [
            { productId: 'P001', name: 'MacBook Pro', quantity: 1, price: 12499 },
            { productId: 'P002', name: 'AirPods Pro', quantity: 2, price: 1899 }
          ],
          total: 12499 + (1899 * 2),
          status: 'pending',
          createdAt: new Date()
        };

        await orders.insertOne(order, { session });
        console.log('✅ 订单已创建（事务中）');

        // 更新库存 | Decrease stock
        await products.updateOne(
          { name: 'MacBook Pro' },
          { $inc: { stock: -1 } },
          { session }
        );
        console.log('✅ MacBook Pro 库存 -1（事务中）');

        // 提交事务 | Commit will be automatic
      });
      
      console.log('✅ 事务提交成功');
    } catch (error) {
      console.log('❌ 事务失败:', error.message);
    } finally {
      await session.endSession();
    }

    // ============ 8. 全文搜索 | Text Search ============
    console.log('\n' + '=' .repeat(50));
    console.log('🔎 全文搜索 | Text Search');
    console.log('=' .repeat(50));

    try {
      // 创建文本索引 | Create text index
      await products.createIndex({ name: 'text', tags: 'text' });
      console.log('✅ 创建文本索引');

      // 文本搜索 | Text search query
      const searchResults = await products
        .find({ $text: { $search: 'apple' } })
        .toArray();
      
      if (searchResults.length > 0) {
        console.log('\n【搜索"apple"的结果】');
        searchResults.forEach(p => {
          console.log(`  🍎 ${p.name} - ¥${p.price}`);
        });
      }
    } catch (e) {
      console.log('⚠️  文本索引搜索:', e.message);
    }

    console.log('\n' + '=' .repeat(50));
    console.log('✅ 所有示例完成！');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ 错误:', error);
    console.log('\n请确保 MongoDB 正在运行：');
    console.log('  Windows: net start MongoDB');
    console.log('  macOS:   brew services start mongodb-community');
    console.log('  Linux:   sudo systemctl start mongod');
    console.log('  Docker:  docker run -d -p 27017:27017 mongo:7.0');
  } finally {
    await client.close();
  }
}

main();