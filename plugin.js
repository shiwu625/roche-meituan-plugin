window.registerPlugin({
  id: "meituan-simulator",
  name: "美团外卖模拟器",
  version: "1.0.0",
  icon: "store",
  iconImage: "",
  styleEl: null,

  async mount(container, roche) {
    // 注入隔离样式
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = `
      .roche-plugin-meituan { padding:12px; font-size:14px; }
      .mt-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
      .mt-close { padding:4px 10px; background:#f53855; color:#fff; border:none; border-radius:6px; }
      .mt-search { width:100%; padding:8px; border:1px solid #eee; border-radius:6px; margin-bottom:10px; box-sizing:border-box; }
      .ai-tip { background:#e8f4ff; padding:8px; border-radius:6px; margin-bottom:12px; }
      .shop-card { border:1px solid #eee; border-radius:8px; padding:10px; margin-bottom:8px; }
      .shop-name { font-weight:bold; font-size:15px; }
      .food-item { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f6f6f6; }
      .cart-bar { position:sticky; bottom:0; background:#fff; padding:10px; border-top:1px solid #eee; display:flex; justify-content:space-between; }
    `;
    document.head.appendChild(this.styleEl);

    const shopList = [
      {
        name: "老黄牛肉面",
        star: 4.8,
        foods: [
          { name: "红烧牛肉面", price: 18 },
          { name: "牛肉粉", price: 15 },
          { name: "卤蛋", price: 2 }
        ]
      },
      {
        name: "甜心奶茶店",
        star: 4.6,
        foods: [
          { name: "珍珠奶茶", price: 12 },
          { name: "芋泥波波", price: 14 },
          { name: "柠檬水", price: 6 }
        ]
      }
    ];

    // 渲染主页面
    async function render() {
      const cart = (await roche.storage.get("mt_cart")) || [];
      const orders = (await roche.storage.get("mt_orders")) || [];
      const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

      let html = `
        <div class="roche-plugin-meituan">
          <div class="mt-header">
            <h2>美团外卖模拟器</h2>
            <button class="mt-close" id="closeBtn">关闭</button>
          </div>

          <input class="mt-search" id="searchInput" placeholder="搜索商家或菜品">

          <div class="ai-tip">
            <button id="aiRecommend">AI一键推荐今日美食</button>
          </div>
      `;

      // 商户列表
      for(const shop of shopList) {
        html += `<div class="shop-card">
          <div class="shop-name">${shop.name}</div>
          <div class="shop-info">⭐${shop.star} 分</div>`;

        for(const food of shop.foods) {
          html += `
            <div class="food-item">
              <span>${food.name}</span>
              <span>¥${food.price} <button class="addFood" data-name="${food.name}" data-price="${food.price}">+加入购物车</button></span>
            </div>
          `;
        }
        html += `</div>`;
      }

      // 购物车底部栏
      html += `
        <div class="cart-bar">
          <span>购物车合计：¥${totalPrice}</span>
          <button id="submitOrder" ${totalPrice <=0 ? 'disabled' : ''}>提交订单</button>
        </div>
        </div>
      `;

      container.innerHTML = html;

      // 加入购物车事件
      document.querySelectorAll(".addFood").forEach(btn => {
        btn.onclick = async () => {
          const name = btn.dataset.name;
          const price = Number(btn.dataset.price);
          let cart = (await roche.storage.get("mt_cart")) || [];
          cart.push({name,price});
          await roche.storage.set("mt_cart", cart);
          render();
        };
      });

      // 提交订单
      document.getElementById("submitOrder").onclick = async () => {
        let cart = (await roche.storage.get("mt_cart")) || [];
        let orders = (await roche.storage.get("mt_orders")) || [];
        orders.push({ list: cart, time: new Date().toLocaleString() });
        await roche.storage.set("mt_orders", orders);
        await roche.storage.set("mt_cart", []);
        alert("下单成功！");
        render();
      };

      // AI推荐
      document.getElementById("aiRecommend").onclick = async () => {
        const res = await roche.ai.chat("帮我推荐一份好吃的外卖搭配，简短一点");
        alert("AI推荐：" + res.content);
      };

      // 关闭按钮
      document.getElementById("closeBtn").onclick = () => {
        roche.plugin.close();
      };
    }

    render();
  },

  async unmount() {
    if(this.styleEl) this.styleEl.remove();
  }
});
