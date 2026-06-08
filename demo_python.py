"""
MongoDB Python Demo - 使用 pymongo 进行数据库操作
MongoDB Python Demo - Database operations using pymongo

安装依赖 | Install dependencies:
    pip install pymongo

运行示例 | Run example:
    python demo_python.py
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError
from datetime import datetime
import pprint

def main():
    # 连接 MongoDB | Connect to MongoDB
    print("🔌 正在连接 MongoDB...")
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    
    try:
        # 测试连接 | Test connection
        client.server_info()
        print("✅ 连接成功！")
    except Exception as e:
        print(f"❌ 连接失败：{e}")
        print("\n请确保 MongoDB 正在运行：")
        print("  Windows: net start MongoDB")
        print("  macOS:   brew services start mongodb-community")
        print("  Linux:   sudo systemctl start mongod")
        print("  Docker:  docker run -d -p 27017:27017 mongo:7.0")
        return
    
    db = client['wrap_demo']
    
    # ============ 1. 插入操作 | Insert Operations ============
    print("\n" + "="*50)
    print("📝 插入操作 | Insert Operations")
    print("="*50)
    
    users = db['users']
    
    # 插入单个文档 | Insert single document
    user_data = {
        "name": "张三",
        "email": "zhangsan@example.com",
        "age": 28,
        "skills": ["Python", "MongoDB", "Node.js"],
        "address": {
            "city": "北京",
            "district": "朝阳区"
        },
        "created_at": datetime.now()
    }
    
    try:
        result = users.insert_one(user_data)
        print(f"✅ 插入用户 ID: {result.inserted_id}")
    except DuplicateKeyError:
        print("⚠️  用户已存在（邮箱唯一索引）")
    
    # 批量插入 | Insert many
    new_users = [
        {"name": "李四", "email": "lisi@example.com", "age": 25, "skills": ["Java", "Spring"]},
        {"name": "王五", "email": "wangwu@example.com", "age": 30, "skills": ["C++", "QT"]},
        {"name": "赵六", "email": "zhaoliu@example.com", "age": 27, "skills": ["Go", "Microservices"]}
    ]
    
    result = users.insert_many(new_users)
    print(f"✅ 批量插入 {len(result.inserted_ids)} 个用户")
    
    # ============ 2. 查询操作 | Query Operations ============
    print("\n" + "="*50)
    print("🔍 查询操作 | Query Operations")
    print("="*50)
    
    # 查询所有 | Find all
    print("\n【所有用户】")
    for user in users.find():
        print(f"  👤 {user['name']} - {user['email']} (年龄：{user['age']})")
    
    # 条件查询 | Conditional query
    print("\n【年龄 > 26 的用户】")
    query = {"age": {"$gt": 26}}
    for user in users.find(query):
        print(f"  👤 {user['name']} - {user['age']}岁")
    
    # 模糊查询 | Fuzzy query
    print("\n【姓名包含'三'的用户】")
    query = {"name": {"$regex": "三"}}
    for user in users.find(query):
        print(f"  👤 {user['name']}")
    
    # 选择字段 | Projection
    print("\n【仅查询姓名和邮箱】")
    for user in users.find({}, {"_id": 0, "name": 1, "email": 1}):
        print(f"  📧 {user['name']}: {user['email']}")
    
    # 排序 | Sort
    print("\n【按年龄降序排列】")
    for user in users.find().sort("age", DESCENDING):
        print(f"  👤 {user['name']} - {user['age']}岁")
    
    # ============ 3. 更新操作 | Update Operations ============
    print("\n" + "="*50)
    print("✏️  更新操作 | Update Operations")
    print("="*50)
    
    # 更新单个字段 | Update single field
    result = users.update_one(
        {"name": "张三"},
        {"$set": {"age": 29, "title": "高级工程师"}}
    )
    print(f"✅ 更新了 {result.modified_count} 个文档")
    
    # 增加数值 | Increment
    result = users.update_one(
        {"name": "李四"},
        {"$inc": {"age": 1}}
    )
    print(f"✅ 李四年龄 +1")
    
    # 添加数组元素 | Add to array
    result = users.update_one(
        {"name": "张三"},
        {"$addToSet": {"skills": "Docker"}}
    )
    print(f"✅ 张三新增技能：Docker")
    
    # ============ 4. 删除操作 | Delete Operations ============
    print("\n" + "="*50)
    print("🗑️  删除操作 | Delete Operations")
    print("="*50)
    
    result = users.delete_one({"name": "赵六"})
    print(f"✅ 删除了 {result.deleted_count} 个用户")
    
    # ============ 5. 索引操作 | Index Operations ============
    print("\n" + "="*50)
    print("📇 索引操作 | Index Operations")
    print("="*50)
    
    try:
        users.create_index("email", unique=True)
        print("✅ 创建 email 唯一索引")
    except Exception as e:
        print(f"⚠️  索引已存在：{e}")
    
    try:
        users.create_index([("age", ASCENDING), ("name", ASCENDING)])
        print("✅ 创建复合索引 (age, name)")
    except Exception as e:
        print(f"⚠️  索引已存在：{e}")
    
    # ============ 6. 聚合查询 | Aggregation ============
    print("\n" + "="*50)
    print("📊 聚合查询 | Aggregation")
    print("="*50)
    
    # 统计平均年龄 | Average age
    pipeline = [
        {"$group": {"_id": None, "avg_age": {"$avg": "$age"}}}
    ]
    result = list(users.aggregate(pipeline))
    if result:
        print(f"\n【平均年龄】{result[0]['avg_age']:.1f}岁")
    
    # 按技能统计 | Group by city
    pipeline = [
        {"$group": {
            "_id": "$address.city",
            "count": {"$sum": 1},
            "names": {"$push": "$name"}
        }}
    ]
    result = list(users.aggregate(pipeline))
    if result:
        print(f"\n【按城市统计】")
        for r in result:
            print(f"  🏙️  {r['_id'] or '未知城市'}: {r['count']}人 - {', '.join(r['names'])}")
    
    # ============ 7. 高级查询 | Advanced Queries ============
    print("\n" + "="*50)
    print("🔬 高级查询 | Advanced Queries")
    print("="*50)
    
    # IN 查询 | IN query
    print("\n【年龄是 25 或 30 的用户】")
    query = {"age": {"$in": [25, 30]}}
    for user in users.find(query):
        print(f"  👤 {user['name']} - {user['age']}岁")
    
    # AND 查询 | AND query
    print("\n【年龄>25 且有 Python 技能的用户】")
    query = {"age": {"$gt": 25}, "skills": "Python"}
    for user in users.find(query):
        print(f"  👤 {user['name']} - 技能：{', '.join(user['skills'])}")
    
    # 限制返回数量 | Limit
    print("\n【前 2 个用户】")
    for user in users.find().limit(2):
        print(f"  👤 {user['name']}")
    
    print("\n" + "="*50)
    print("✅ 所有示例完成！")
    print("="*50)
    
    client.close()

if __name__ == "__main__":
    main()