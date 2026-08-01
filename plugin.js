window.RochePlugin.register({
  id: "meituan-simulator",
  name: "美团外卖模拟器",
  version: "1.0.0",
  apps: [
    {
      id: "meituan-main",
      name: "美团首页",
      icon: "store",
      iconImage: "",
      styleEl: null,

      async mount(container, roche) {
        // 注入隔离样式
        this.styleEl = document.createElement("style");
        this.styleEl.textContent = `
          .roche-plugin-meituan {
            width: 100%;
            height: 100%;
            padding: 16px;
            box-sizing: border-box;
            overflow-y: auto;
            background: #f5f5f5;
          }
          .mt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .mt-close {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            background: #ddd;
            cursor: pointer;
          }
          .mt-search {
            width: 100%;
            box-sizing: border-box;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid #eee;
            margin-bottom: 16px;
            font-size: 14px;
          }
          .shop-card {
            background: #fff;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 12px;
          }
          .shop-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .shop-info {
            color: #666;
            font-size: 13px;
            margin-bottom: 10px;
          }
          .food-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .food-name { font-size:14px; }
          .food-price { color:#f60; }
          .add-cart {
            border: none;
            background: #f60;
            color: #fff;
            border-radius: 4px;
            padding: 2px 8px;
            cursor: pointer;
          }
          .cart-bar {
            position: sticky;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #fff;
            padding: 10px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
            border-top:1px solid #eee;
            margin:0 -16px -16px -16px;
          }
          .btn-submit {
            background: #f60;
            color: white;
            border: none;
            padding: 6px 16px;
            border-radius: 6px;
            cursor: pointer;
          }
          .ai-tip {
            background: #e8f4ff;
            padding:10px;
            border-radius:8px;
            margin:12px 0;
          }
          .order-item {
            background: #fff;
            padding:10px;
            border-radius:8px;
            margin:8px 0;
          }
          .empty {
            text-align:center;
            color:#999;
            padding:40px 0;
          }
        `;
        container.appendChild(this.styleEl);

        // 模拟商户数据源
        const shopList = [
          { id:1, name:"快乐炸鸡店", star:4.8, send:"30分钟内送达", foods:[
            {fid:101,name:"香辣鸡腿堡",price:16.8},
            {fid:102,name:"薯条大份",price:9.9},
            {fid:103,name:"可乐冰中杯",price:4.5}
          ]},
          { id:2, name:"川味小面馆", star:4.6, send:"25分钟内送达", foods:[
            {fid:201,name:"红烧牛肉面",price:14.0},
            {fid:202,name:"红油抄手",price:12.5},
            {fid:203,name:"冰粉",price:5.0}
          ]},
          { id:3, name:"鲜果奶茶铺", star:4.9, send:"20分钟内送达", foods:[
            {fid:301,name:"杨枝甘露",price:15.8},
            {fid:302,name:"珍珠奶茶",price:10.0},
            {fid:303,name:"芒果班戟",price:8.8}
          ]}
        ];

        // 渲染主页面
        async function render() {
          const cart = (await roche.storage.get("mt_cart")) || [];
          const orders = (await roche.storage.get("mt_orders")) || [];
          const totalPrice = cart.reduce((sum,item)=>sum + item.price, 0).toFixed(2);

          let html = `
            <div class="roche-plugin-meituan">
              <div class="mt-header">
                <h2>美团外卖模拟器</h2>
                <button class="mt-close" id="closeBtn">关闭</button>
              </div>

              <input class="mt-search" id="searchInput" placeholder="搜索美食/店铺，点AI推荐获取好吃的">

              <div class="ai-tip">
                <button id="aiRecommend">AI一键推荐今日美食</button>
              </div>
          `;

          // 商户列表
          for(const shop of shopList) {
            html += `<div class="shop-card">
              <div class="shop-name">${shop.name}</div>
              <div class="shop-info">⭐${shop.star} | ${shop.send}</div>
            `;
            for(const food of shop.foods) {
              html += `
                <div class="food-item" data-fid="${food.fid}" data-shop="${shop.na
