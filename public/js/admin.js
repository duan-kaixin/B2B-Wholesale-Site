let currentPage = 'dashboard';
let credentials = null;
let currentLang = localStorage.getItem('adminLang') || 'en';

const translations = {
  en: {
    login: { title: 'Admin Login', username: 'Username', password: 'Password', loginBtn: 'Login', invalidCreds: 'Invalid username or password', loginFailed: 'Login failed. Please try again.' },
    nav: { dashboard: 'Dashboard', products: 'Products', categories: 'Categories', slides: 'Slides', solutions: 'Solutions', cases: 'Cases', news: 'News', pages: 'Pages', inquiries: 'Inquiries', leads: 'Leads', quotes: 'Price List', settings: 'Settings', seo: 'SEO & JSON-LD', robots: 'Robots.txt', aiChat: 'AI Chat' },
    quotes: { title: 'Price List (internal)', viewPublic: 'View public page', allCats: 'All categories', allRatings: 'All ratings', category: 'Category', rating: 'Rating', product: 'Product', supplier: 'Supplier', cny: '1688 price ¥', sales: 'Sales', repeat: 'Repeat', landed: 'Landed ¥', cost: 'Cost $', price: 'Price $', margin: 'Margin $', moq: 'MOQ', listed: 'Listed', isPublic: 'Public', notes: 'Notes', yes: 'Yes', no: 'No', saved: 'Saved', saveFailed: 'Save failed', summary: '{n} items, {l} listed as products, {p} shown on the public price list. Supplier and cost columns are visible only here.' },
    dashboard: { title: 'Dashboard', totalProducts: 'Total Products', totalInquiries: 'Total Inquiries', pendingInquiries: 'Pending Inquiries', totalLeads: 'Total Leads', totalCases: 'Total Cases', totalNews: 'Total News' },
    common: { add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', actions: 'Actions', status: 'Status', active: 'Active', inactive: 'Inactive', active2: 'Active', inactive2: 'Inactive', featured: 'Featured', name: 'Name', title: 'Title', description: 'Description', image: 'Image', images: 'Images', url: 'URL', slug: 'Slug', sortOrder: 'Sort Order', selectCategory: 'Select Category', parent: 'Parent', noParent: 'No Parent', createdAt: 'Created', updatedAt: 'Updated', confirmDelete: 'Are you sure?', deleteSuccess: 'Deleted successfully', saveSuccess: 'Saved successfully', error: 'Error', loading: 'Loading...', noData: 'No data', viewAll: 'View All', addNew: 'Add New', uploadImage: 'Upload Image', imageUrl: 'Image URL', upload: 'Upload', logout: 'Logout', clearCache: 'Clear Cache', cacheCleared: 'Cache cleared successfully', cacheClearFailed: 'Failed to clear cache' },
    products: { title: 'Products', addProduct: 'Add Product', editProduct: 'Edit Product', productName: 'Product Name', shortDescription: 'Short Description', fullDescription: 'Full Description', price: 'Price', moq: 'MOQ (Min Order Qty)', category: 'Category', allCategories: 'All Categories', search: 'Search products...' },
    categories: { title: 'Categories', addCategory: 'Add Category', editCategory: 'Edit Category', categoryName: 'Category Name', parentCategory: 'Parent Category' },
    slides: { title: 'Slides', addSlide: 'Add Slide', editSlide: 'Edit Slide', slideTitle: 'Title', subtitle: 'Subtitle', slideDescription: 'Description', slideImage: 'Background Image', linkUrl: 'Link URL', linkText: 'Button Text' },
    solutions: { title: 'Solutions', addSolution: 'Add Solution', editSolution: 'Edit Solution' },
    cases: { title: 'Cases', addCase: 'Add Case', editCase: 'Edit Case', clientName: 'Client Name' },
    news: { title: 'News', addNews: 'Add News', editNews: 'Edit News', content: 'Content', author: 'Author' },
    pages: { title: 'Pages', editPage: 'Edit Page', metaTitle: 'Meta Title', metaDescription: 'Meta Description', content: 'Page Content' },
    inquiries: { title: 'Inquiries', reply: 'Reply', replySubject: 'Reply Subject', replyMessage: 'Reply Message', sendReply: 'Send Reply', company: 'Company', phone: 'Phone', read: 'Read', unread: 'Unread', pending: 'Pending', completed: 'Completed' },
    leads: { title: 'Leads', leadName: 'Name', phone: 'Phone', whatsapp: 'WhatsApp', message: 'Message' },
    settings: { title: 'Settings', generalSettings: 'General Settings', siteName: 'Site Name', siteTitle: 'Site Title', siteDescription: 'Site Description', siteKeywords: 'Site Keywords', logoUrl: 'Logo URL', popupSettings: 'Popup Settings', enablePopup: 'Enable Popup', popupDelay: 'Delay (seconds)', popupTitle: 'Popup Title', popupDescription: 'Popup Description', socialLinks: 'Social Links', contactInfo: 'Contact Info', addSocial: 'Add Social Link', platform: 'Platform', socialUrl: 'URL', contactType: 'Type', contactValue: 'Value', contactLabel: 'Label', email: 'Email', phone2: 'Phone', whatsapp2: 'WhatsApp', saveSettings: 'Save Settings', aiChatSettings: 'AI Chat Settings', aiChatSessions: 'Recent Conversations' },
    seo: { title: 'JSON-LD Configuration', addConfig: 'Add Configuration', name: 'Name', schemaType: 'Schema Type', configValue: 'Configuration', extraData: 'Extra Data (JSON)' },
    robots: { title: 'Robots.txt Configuration', addRule: 'Add Rule', userAgent: 'User Agent', rule: 'Rule', allow: 'Allow', disallow: 'Disallow', preview: 'Preview robots.txt', robotRules: 'Robot Rules' },
    aiChat: { title: 'AI Chat Settings', enable: 'Enable AI Chat', welcomeMessage: 'Welcome Message', systemPrompt: 'System Prompt', model: 'Model', apiUrl: 'API URL', themeColor: 'Theme Color', position: 'Bubble Position', positionRight: 'Right', positionLeft: 'Left', collectLead: 'Collect Contact Info', answerTechQuestions: 'Answer Technical Questions', maxHistory: 'Context History Length', keyConfigured: 'API Key configured', keyMissing: 'API Key NOT configured — run: wrangler secret put AI_API_KEY', recentSessions: 'Recent Conversations', noSessions: 'No conversations yet', messages: 'messages', viewConversation: 'View' },
    form: { required: 'Required', optional: 'Optional', selectOption: 'Select an option', enterText: 'Enter text', enterUrl: 'Enter URL', enterNumber: 'Enter number' }
  },
  zh: {
    login: { title: '管理员登录', username: '用户名', password: '密码', loginBtn: '登录', invalidCreds: '用户名或密码错误', loginFailed: '登录失败，请重试' },
    nav: { dashboard: '仪表盘', products: '产品', categories: '分类', slides: '幻灯片', solutions: '解决方案', cases: '案例', news: '新闻', pages: '页面', inquiries: '询盘', leads: '潜在客户', quotes: '报价表', settings: '设置', seo: 'SEO 和 JSON-LD', robots: 'Robots.txt', aiChat: 'AI 客服' },
    quotes: { title: '报价表（内部完整版）', viewPublic: '查看客户版页面', allCats: '全部分类', allRatings: '全部建议', category: '分类', rating: '建议', product: '产品', supplier: '供应商', cny: '1688 起价 ¥', sales: '销量', repeat: '回头率', landed: '到手成本 ¥', cost: '成本 $', price: '售价 $', margin: '毛利 $', moq: '起订量', listed: '已上架', isPublic: '客户可见', notes: '备注', yes: '是', no: '否', saved: '已保存', saveFailed: '保存失败', summary: '共 {n} 款，其中 {l} 款已上架为产品，{p} 款显示在客户版报价单。供应商和成本只在这里显示。' },
    dashboard: { title: '仪表盘', totalProducts: '产品总数', totalInquiries: '询盘总数', pendingInquiries: '待处理询盘', totalLeads: '潜在客户', totalCases: '案例总数', totalNews: '新闻总数' },
    common: { add: '添加', edit: '编辑', delete: '删除', save: '保存', cancel: '取消', actions: '操作', status: '状态', active: '启用', inactive: '禁用', active2: '启用中', inactive2: '已禁用', featured: '推荐', name: '名称', title: '标题', description: '描述', image: '图片', images: '图片', url: '链接', slug: '别名', sortOrder: '排序', selectCategory: '选择分类', parent: '父级', noParent: '无父级', createdAt: '创建时间', updatedAt: '更新时间', confirmDelete: '确定要删除吗？', deleteSuccess: '删除成功', saveSuccess: '保存成功', error: '错误', loading: '加载中...', noData: '暂无数据', viewAll: '查看全部', addNew: '新增', uploadImage: '上传图片', imageUrl: '图片地址', upload: '上传', logout: '退出登录', clearCache: '清除缓存', cacheCleared: '缓存已清除成功', cacheClearFailed: '清除缓存失败' },
    products: { title: '产品', addProduct: '添加产品', editProduct: '编辑产品', productName: '产品名称', shortDescription: '简短描述', fullDescription: '完整描述', price: '价格', moq: '最小起订量', category: '分类', allCategories: '全部分类', search: '搜索产品...' },
    categories: { title: '分类', addCategory: '添加分类', editCategory: '编辑分类', categoryName: '分类名称', parentCategory: '父级分类' },
    slides: { title: '幻灯片', addSlide: '添加幻灯片', editSlide: '编辑幻灯片', slideTitle: '标题', subtitle: '副标题', slideDescription: '描述', slideImage: '背景图片', linkUrl: '链接地址', linkText: '按钮文字' },
    solutions: { title: '解决方案', addSolution: '添加解决方案', editSolution: '编辑解决方案' },
    cases: { title: '案例', addCase: '添加案例', editCase: '编辑案例', clientName: '客户名称' },
    news: { title: '新闻', addNews: '添加新闻', editNews: '编辑新闻', content: '内容', author: '作者' },
    pages: { title: '页面', editPage: '编辑页面', metaTitle: 'SEO 标题', metaDescription: 'SEO 描述', content: '页面内容' },
    inquiries: { title: '询盘', reply: '回复', replySubject: '回复主题', replyMessage: '回复内容', sendReply: '发送回复', company: '公司', phone: '电话', read: '已读', unread: '未读', pending: '处理中', completed: '已完成' },
    leads: { title: '潜在客户', leadName: '姓名', phone: '电话', whatsapp: 'WhatsApp', message: '留言' },
    settings: { title: '设置', generalSettings: '基本设置', siteName: '网站名称', siteTitle: '网站标题', siteDescription: '网站描述', siteKeywords: '网站关键词', logoUrl: 'Logo 地址', popupSettings: '弹窗设置', enablePopup: '启用弹窗', popupDelay: '延迟时间（秒）', popupTitle: '弹窗标题', popupDescription: '弹窗描述', socialLinks: '社交媒体链接', contactInfo: '联系方式', addSocial: '添加社交链接', platform: '平台', socialUrl: '链接地址', contactType: '类型', contactValue: '值', contactLabel: '标签', email: '邮箱', phone2: '电话', whatsapp2: 'WhatsApp', saveSettings: '保存设置', aiChatSettings: 'AI 客服设置', aiChatSessions: '最近会话' },
    seo: { title: 'JSON-LD 配置', addConfig: '添加配置', name: '名称', schemaType: 'Schema 类型', configValue: '配置内容', extraData: '额外数据 (JSON)' },
    robots: { title: 'Robots.txt 配置', addRule: '添加规则', userAgent: '用户代理', rule: '规则', allow: '允许', disallow: '禁止', preview: '预览 robots.txt', robotRules: '爬虫规则' },
    aiChat: { title: 'AI 客服设置', enable: '启用 AI 客服', welcomeMessage: '欢迎语', systemPrompt: '系统提示词', model: '模型', apiUrl: 'API 接口地址', themeColor: '主题色', position: '气泡位置', positionRight: '右侧', positionLeft: '左侧', collectLead: '收集联系方式', answerTechQuestions: '允许回答技术问题', maxHistory: '上下文历史条数', keyConfigured: 'API Key 已配置', keyMissing: 'API Key 未配置 — 请执行：wrangler secret put AI_API_KEY', recentSessions: '最近会话', noSessions: '暂无会话记录', messages: '条消息', viewConversation: '查看' },
    form: { required: '必填', optional: '选填', selectOption: '请选择', enterText: '请输入', enterUrl: '请输入链接', enterNumber: '请输入数字' }
  }
};

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

/** 轻量 Toast 提示，避免使用阻塞式 alert */
function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.textContent = message;
  const bg = type === 'success' ? '#16a34a' : '#dc2626';
  el.style.cssText = `position:fixed;top:24px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;font-size:14px;opacity:0;transition:opacity .2s;`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 2200);
}

function applyTranslations() {
  currentLang = localStorage.getItem('adminLang') || 'en';
  $('#lang-select').val(currentLang);
  
  $('[data-i18n]').each(function() {
    const key = $(this).attr('data-i18n');
    const translated = t(key);
    if ($(this).is('input[placeholder]')) {
      $(this).attr('placeholder', translated);
    } else {
      $(this).text(translated);
    }
  });
}

$(document).ready(function() {
  applyTranslations();
  
  $('#lang-select').on('change', function() {
    currentLang = $(this).val();
    localStorage.setItem('adminLang', currentLang);
    location.reload();
  });
  
  const savedCreds = localStorage.getItem('adminCreds');
  if (savedCreds) {
    credentials = savedCreds;
    showAdminView();
  }
  
  $('#login-form').on('submit', async function(e) {
    e.preventDefault();
    const username = $(this).find('#username').val();
    const password = $(this).find('#password').val();

    const creds = btoa(`${username}:${password}`);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${creds}` }
      });

      if (res.ok) {
        credentials = creds;
        localStorage.setItem('adminCreds', creds);
        showAdminView();
      } else {
        $('#login-error').text(t('login.invalidCreds')).fadeIn();
      }
    } catch (err) {
      $('#login-error').text(t('login.loginFailed')).fadeIn();
    }
  });
  
  $('#logout-btn').on('click', function() {
    localStorage.removeItem('adminCreds');
    credentials = null;
    location.reload();
  });

  $('#clear-cache-btn').on('click', async function() {
    try {
      const res = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t('common.cacheCleared'), 'success');
      } else {
        showToast(data.error || t('common.cacheClearFailed'), 'error');
      }
    } catch (err) {
      showToast(t('common.cacheClearFailed'), 'error');
    }
  });
  
  $('.admin-nav .nav-item').on('click', function(e) {
    e.preventDefault();
    const page = $(this).attr('href').slice(1);
    switchPage(page);
  });
});

function showAdminView() {
  $('#login-view').hide();
  $('#admin-view').removeClass('hidden').addClass('flex');
  applyTranslations();
  loadDashboard();
}

function switchPage(page) {
  $('.nav-item').removeClass('active');
  $('.page').removeClass('active').addClass('hidden');
  
  $(`.nav-item[href="#${page}"]`).addClass('active');
  $(`#${page}-page`).removeClass('hidden').addClass('active');
  
  const titleKey = 'nav.' + page;
  $('#page-title').text(t(titleKey));
  currentPage = page;
  
  if (page === 'products') {
    loadProducts();
    $('#add-product-btn').off('click').on('click', showAddProductModal);
  }
  else if (page === 'categories') {
    loadCategories();
    $('#add-category-btn').off('click').on('click', showAddCategoryModal);
  }
  else if (page === 'solutions') {
    loadSolutions();
    $('#add-solution-btn').off('click').on('click', showAddSolutionModal);
  }
  else if (page === 'cases') {
    loadCases();
    $('#add-case-btn').off('click').on('click', showAddCaseModal);
  }
  else if (page === 'news') {
    loadNews();
    $('#add-news-btn').off('click').on('click', showAddNewsModal);
  }
  else if (page === 'pages') loadPages();
  else if (page === 'inquiries') loadInquiries();
  else if (page === 'leads') loadLeads();
  else if (page === 'quotes') loadQuotes();
  else if (page === 'settings') loadSettings();
  else if (page === 'slides') {
    loadSlides();
    $('#add-slide-btn').off('click').on('click', () => showSlideModal());
  }
  else if (page === 'seo') loadJsonLdConfigs();
  else if (page === 'robots') loadRobotsConfigs();
  else if (page === 'ai-chat') loadAiChatSettings();
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      $('#stat-products').text(data.data.totalProducts);
      $('#stat-inquiries').text(data.data.totalInquiries);
      $('#stat-pending').text(data.data.pendingInquiries);
      $('#stat-leads').text(data.data.totalLeads);
      $('#stat-cases').text(data.data.totalCases);
      $('#stat-news').text(data.data.totalNews);
    }
  } catch (err) {
    console.error('Failed to load dashboard');
  }
}

async function loadProducts() {
  const container = document.getElementById('product-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/admin/list/products', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderProductsTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load products');
  }
}

function renderProductsTable(products) {
  const container = document.getElementById('product-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Price</th>
          <th>MOQ</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price ? `$${p.price}` : '-'}</td>
            <td>${p.min_order_qty}</td>
            <td>${p.is_featured ? '✓' : '-'}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editProduct(${p.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadCategories() {
  const container = document.getElementById('category-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/admin/list/categories', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderCategoriesTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load categories');
  }
}

function renderCategoriesTable(categories) {
  const container = document.getElementById('category-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Slug</th>
          <th>Sort</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${categories.map(c => `
          <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.slug}</td>
            <td>${c.sort_order}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editCategory(${c.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadSolutions() {
  const container = document.getElementById('solution-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/admin/list/solutions', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderSolutionsTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load solutions');
  }
}

function renderSolutionsTable(solutions) {
  const container = document.getElementById('solution-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${solutions.map(s => `
          <tr>
            <td>${s.id}</td>
            <td>${s.title}</td>
            <td>${s.is_featured ? '✓' : '-'}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editSolution(${s.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteSolution(${s.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadCases() {
  const container = document.getElementById('case-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/admin/list/cases', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderCasesTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load cases');
  }
}

function renderCasesTable(cases) {
  const container = document.getElementById('case-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Client</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${cases.map(c => `
          <tr>
            <td>${c.id}</td>
            <td>${c.title}</td>
            <td>${c.client_name || '-'}</td>
            <td>${c.is_featured ? '✓' : '-'}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editCase(${c.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCase(${c.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadNews() {
  const container = document.getElementById('news-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/admin/list/news', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderNewsTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load news');
  }
}

function renderNewsTable(news) {
  const container = document.getElementById('news-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Author</th>
          <th>Views</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${news.map(n => `
          <tr>
            <td>${n.id}</td>
            <td>${n.title}</td>
            <td>${n.author || '-'}</td>
            <td>${n.view_count}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editNews(${n.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteNews(${n.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadPages() {
  const container = document.getElementById('pages-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/admin/list/pages', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderPagesTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load pages');
  }
}

function renderPagesTable(pages) {
  const container = document.getElementById('pages-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${pages.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>${p.slug}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editPage(${p.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deletePage(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadInquiries() {
  const container = document.getElementById('inquiry-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/inquiries?status=pending&limit=50', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderInquiriesTable(data.data.items);
    }
  } catch (err) {
    console.error('Failed to load inquiries');
  }
}

function renderInquiriesTable(inquiries) {
  const container = document.getElementById('inquiry-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Email</th>
          <th>Company</th>
          <th>Message</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${inquiries.map(i => `
          <tr>
            <td>${new Date(i.created_at).toLocaleDateString()}</td>
            <td>${i.name}</td>
            <td>${i.email}</td>
            <td>${i.company || '-'}</td>
            <td>${i.message.substring(0, 50)}...</td>
            <td>${i.status}</td>
            <td>
              <button class="btn btn-sm" onclick="viewInquiry(${i.id})">View</button>
              <button class="btn btn-sm" onclick="markInquiryReplied(${i.id})">Mark Replied</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadLeads() {
  const container = document.getElementById('leads-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/leads?limit=50', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderLeadsTable(data.data.items);
    }
  } catch (err) {
    console.error('Failed to load leads');
  }
}

function renderLeadsTable(leads) {
  const container = document.getElementById('leads-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Phone</th>
          <th>WhatsApp</th>
          <th>Email</th>
          <th>Source</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map(l => `
          <tr>
            <td>${new Date(l.created_at).toLocaleDateString()}</td>
            <td>${l.name}</td>
            <td>${l.phone || '-'}</td>
            <td>${l.whatsapp || '-'}</td>
            <td>${l.email || '-'}</td>
            <td>${l.source}</td>
            <td>${l.status}</td>
            <td>
              <button class="btn btn-sm" onclick="viewLead(${l.id})">View</button>
              <button class="btn btn-sm" onclick="markLeadContacted(${l.id})">Mark Contacted</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadSettings() {
  const page = document.getElementById('settings-page');
  if (!page) return;
  
  loadGeneralSettings();
  loadPopupSettings();
  loadSocialLinks();
  loadContactInfo();
  loadTranslationSettings();
}

async function loadGeneralSettings() {
  const container = document.getElementById('settings-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const fields = [
        { key: 'site_name', label: 'Site Name' },
        { key: 'site_title', label: 'Site Title (TDK)' },
        { key: 'site_description', label: 'Site Description (TDK)' },
        { key: 'site_keywords', label: 'Site Keywords (TDK)' },
        { key: 'contact_email', label: 'Contact Email' },
        { key: 'contact_phone', label: 'Contact Phone' },
        { key: 'whatsapp_number', label: 'WhatsApp Number' },
        { key: 'logo_url', label: 'Logo URL' },
        { key: 'favicon_url', label: 'Favicon URL' },
      ];
      
      container.innerHTML = `
        <form id="settings-form-content">
          ${fields.map(f => `
            <div class="form-group">
              <label for="${f.key}">${f.label}</label>
              <input type="text" id="${f.key}" name="${f.key}" value="${data.data[f.key] || ''}">
            </div>
          `).join('')}
          <button type="submit" class="btn">Save Settings</button>
        </form>
      `;
      
      document.getElementById('settings-form-content')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        for (const [key, value] of Object.entries(Object.fromEntries(formData))) {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify({ key, value })
          });
        }
        alert('Settings saved successfully!');
      });
    }
  } catch (err) {
    console.error('Failed to load settings');
  }
}

async function loadPopupSettings() {
  const container = document.getElementById('popup-settings-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings/popup', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success && data.data) {
      const settings = data.data;
      container.innerHTML = `
        <form id="popup-settings-content">
          <div class="form-group">
            <label>
              <input type="checkbox" name="is_enabled" ${settings.is_enabled ? 'checked' : ''}> Enable Popup
            </label>
          </div>
          <div class="form-group">
            <label for="delay_seconds">Popup Delay (seconds)</label>
            <input type="number" id="delay_seconds" name="delay_seconds" value="${settings.delay_seconds || 15}">
          </div>
          <div class="form-group">
            <label for="popup_title">Popup Title</label>
            <input type="text" id="popup_title" name="title" value="${settings.title || ''}">
          </div>
          <div class="form-group">
            <label for="popup_description">Popup Description</label>
            <textarea id="popup_description" name="description" rows="3">${settings.description || ''}</textarea>
          </div>
          <button type="submit" class="btn">Save Popup Settings</button>
        </form>
      `;
      
      document.getElementById('popup-settings-content')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        await fetch('/api/settings/popup', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
          },
          body: JSON.stringify({
            is_enabled: data.is_enabled ? 1 : 0,
            delay_seconds: parseInt(data.delay_seconds),
            title: data.title,
            description: data.description,
          })
        });
        alert('Popup settings saved successfully!');
      });
    }
  } catch (err) {
    console.error('Failed to load popup settings');
  }
}

/** ===== AI 客服设置 ===== */
async function loadAiChatSettings() {
  const container = document.getElementById('ai-chat-form');
  if (!container) return;

  try {
    const res = await fetch('/api/ai-chat/admin/config', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (!data.success) {
      container.innerHTML = `<p class="text-red-500">${t('common.error')}</p>`;
      return;
    }

    const cfg = data.data || {};
    const keyStatus = cfg.api_key_configured
      ? `<span class="text-green-600 font-medium">✅ ${t('aiChat.keyConfigured')}</span>`
      : `<span class="text-red-600 font-medium">⚠️ ${t('aiChat.keyMissing')}</span>`;

    container.innerHTML = `
      <form id="ai-chat-form-content" class="bg-white p-6 rounded-lg shadow max-w-3xl">
        <div class="form-group mb-4">${keyStatus}</div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2">
            <input type="checkbox" id="ac_is_enabled" ${cfg.is_enabled ? 'checked' : ''}> ${t('aiChat.enable')}
          </label>
        </div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2" for="ac_welcome_message">${t('aiChat.welcomeMessage')}</label>
          <input type="text" id="ac_welcome_message" value="${escapeAttr(cfg.welcome_message || '')}">
        </div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2" for="ac_system_prompt">${t('aiChat.systemPrompt')}</label>
          <textarea id="ac_system_prompt" rows="6">${escapeHtmlText(cfg.system_prompt || '')}</textarea>
        </div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2" for="ac_model">${t('aiChat.model')}</label>
          <input type="text" id="ac_model" value="${escapeAttr(cfg.model || '')}" placeholder="gpt-4o-mini / deepseek-chat">
        </div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2" for="ac_api_url">${t('aiChat.apiUrl')}</label>
          <input type="text" id="ac_api_url" value="${escapeAttr(cfg.api_url || '')}" placeholder="https://api.deepseek.com/v1">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group mb-4">
            <label class="block font-medium mb-2" for="ac_theme_color">${t('aiChat.themeColor')}</label>
            <input type="color" id="ac_theme_color" value="${escapeAttr(cfg.theme_color || '#2563eb')}">
          </div>
          <div class="form-group mb-4">
            <label class="block font-medium mb-2" for="ac_position">${t('aiChat.position')}</label>
            <select id="ac_position">
              <option value="right" ${cfg.position !== 'left' ? 'selected' : ''}>${t('aiChat.positionRight')}</option>
              <option value="left" ${cfg.position === 'left' ? 'selected' : ''}>${t('aiChat.positionLeft')}</option>
            </select>
          </div>
        </div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2">
            <input type="checkbox" id="ac_collect_lead" ${cfg.collect_lead ? 'checked' : ''}> ${t('aiChat.collectLead')}
          </label>
        </div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2">
            <input type="checkbox" id="ac_answer_tech_questions" ${cfg.answer_tech_questions ? 'checked' : ''}> ${t('aiChat.answerTechQuestions')}
          </label>
        </div>
        <div class="form-group mb-4">
          <label class="block font-medium mb-2" for="ac_max_history">${t('aiChat.maxHistory')}</label>
          <input type="number" id="ac_max_history" min="0" max="20" value="${cfg.max_history ?? 10}">
        </div>
        <button type="submit" class="btn">${t('common.save')}</button>
      </form>
    `;

    document.getElementById('ai-chat-form-content')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveAiChatSettings();
    });

    loadAiChatSessions();
  } catch (err) {
    console.error('Failed to load AI chat settings', err);
    container.innerHTML = `<p class="text-red-500">${t('common.error')}</p>`;
  }
}

async function saveAiChatSettings() {
  try {
    const payload = {
      is_enabled: document.getElementById('ac_is_enabled')?.checked ? 1 : 0,
      welcome_message: document.getElementById('ac_welcome_message')?.value || '',
      system_prompt: document.getElementById('ac_system_prompt')?.value || '',
      model: document.getElementById('ac_model')?.value || '',
      api_url: document.getElementById('ac_api_url')?.value || '',
      theme_color: document.getElementById('ac_theme_color')?.value || '#2563eb',
      position: document.getElementById('ac_position')?.value || 'right',
      collect_lead: document.getElementById('ac_collect_lead')?.checked ? 1 : 0,
      answer_tech_questions: document.getElementById('ac_answer_tech_questions')?.checked ? 1 : 0,
      max_history: parseInt(document.getElementById('ac_max_history')?.value || '10'),
    };

    const res = await fetch('/api/ai-chat/admin/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(t('common.saveSuccess'));
    } else {
      showToast(data.error || t('common.error'), 'error');
    }
  } catch (err) {
    console.error('Failed to save AI chat settings', err);
    showToast(t('common.error'), 'error');
  }
}

async function loadAiChatSessions() {
  const container = document.getElementById('ai-chat-sessions');
  if (!container) return;

  try {
    const res = await fetch('/api/ai-chat/admin/sessions', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (!data.success || !data.data || !data.data.length) {
      container.innerHTML = `<p class="text-gray-500">${t('aiChat.noSessions')}</p>`;
      return;
    }

    container.innerHTML = `
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="admin-table w-full">
          <thead>
            <tr>
              <th>Session</th>
              <th>${t('leads.message')}</th>
              <th>${t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${data.data.map(s => `
              <tr>
                <td class="text-xs font-mono">${escapeHtmlText((s.session_id || '').slice(0, 12))}…<br><span class="text-gray-400">${s.message_count} ${t('aiChat.messages')}</span></td>
                <td class="max-w-md truncate">${escapeHtmlText(s.last_message || '')}</td>
                <td><button class="btn btn-sm" onclick="viewAiChatSession('${escapeAttr(s.session_id)}')">${t('aiChat.viewConversation')}</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="ai-chat-transcript" class="mt-4"></div>
    `;
  } catch (err) {
    console.error('Failed to load AI chat sessions', err);
    container.innerHTML = `<p class="text-red-500">${t('common.error')}</p>`;
  }
}

window.viewAiChatSession = async function (sessionId) {
  const container = document.getElementById('ai-chat-transcript');
  if (!container) return;
  try {
    const res = await fetch(`/api/ai-chat/admin/messages/${encodeURIComponent(sessionId)}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (!data.success) return;
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow p-6 max-h-96 overflow-y-auto">
        ${data.data.map(m => `
          <div class="mb-3">
            <span class="font-semibold ${m.role === 'user' ? 'text-blue-600' : 'text-green-600'}">${m.role === 'user' ? 'Visitor' : 'AI'}:</span>
            <span class="whitespace-pre-wrap">${escapeHtmlText(m.content)}</span>
          </div>
        `).join('')}
      </div>
    `;
    container.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Failed to load transcript', err);
  }
};

/** 转义 HTML，防止后台渲染用户内容时注入 */
function escapeHtmlText(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 转义 HTML 属性值（用于 value="..." / onclick 参数） */
function escapeAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function loadSocialLinks() {
  const container = document.getElementById('social-links-form');
  if (!container) return;
  try {
    const res = await fetch('/api/settings/social');
    const data = await res.json();
    if (data.success) {
      container.innerHTML = `
        <div id="social-links-list">
          ${data.data.map(s => `
            <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
              <input type="text" value="${s.name}" style="flex: 1;">
              <input type="text" value="${s.url}" style="flex: 2;">
              <button class="btn btn-sm btn-danger" onclick="deleteSocialLink(${s.id})">Delete</button>
            </div>
          `).join('')}
        </div>
        <button class="btn" onclick="addSocialLink()">Add Social Link</button>
      `;
    }
  } catch (err) {
    console.error('Failed to load social links');
  }
}

window.addSocialLink = function() {
  const container = document.getElementById('social-links-list');
  if (container) {
    container.innerHTML += `
      <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
        <input type="text" placeholder="Platform Name" id="new-social-name" style="flex: 1;">
        <input type="text" placeholder="URL" id="new-social-url" style="flex: 2;">
        <button class="btn btn-sm" onclick="saveSocialLink()">Save</button>
      </div>
    `;
  }
};

window.saveSocialLink = async function() {
  const name = document.getElementById('new-social-name')?.value;
  const url = document.getElementById('new-social-url')?.value;
  
  if (name && url) {
    await fetch('/api/settings/social', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        platform: name.toLowerCase(),
        name,
        url,
      })
    });
    loadSocialLinks();
  }
};

window.deleteSocialLink = async function(id) {
  if (confirm('Are you sure you want to delete this social link?')) {
    await fetch(`/api/settings/social/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadSocialLinks();
  }
};

async function loadContactInfo() {
  const container = document.getElementById('contact-info-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings/contact');
    const data = await res.json();
    if (data.success) {
      container.innerHTML = `
        <div id="contact-info-list">
          ${data.data.map(c => `
            <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
              <select id="contact-type-${c.id}" style="width: 120px;">
                <option value="email" ${c.type === 'email' ? 'selected' : ''}>Email</option>
                <option value="phone" ${c.type === 'phone' ? 'selected' : ''}>Phone</option>
                <option value="whatsapp" ${c.type === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
              </select>
              <input type="text" value="${c.value}" id="contact-value-${c.id}" style="flex: 1;">
              <button class="btn btn-sm btn-warning" onclick="updateContactInfo(${c.id})">Update</button>
              <button class="btn btn-sm btn-danger" onclick="deleteContactInfo(${c.id})">Delete</button>
            </div>
          `).join('')}
        </div>
        <button class="btn" onclick="addContactInfo()">Add Contact Info</button>
      `;
    }
  } catch (err) {
    console.error('Failed to load contact info');
  }
}

window.addContactInfo = function() {
  const container = document.getElementById('contact-info-list');
  if (container) {
    container.innerHTML += `
      <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
        <select id="new-contact-type" style="width: 120px;">
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <input type="text" placeholder="Value" id="new-contact-value" style="flex: 1;">
        <button class="btn btn-sm" onclick="saveContactInfo()">Save</button>
      </div>
    `;
  }
};

window.saveContactInfo = async function() {
  const type = document.getElementById('new-contact-type')?.value;
  const value = document.getElementById('new-contact-value')?.value;
  
  if (type && value) {
    await fetch('/api/settings/contact', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ type, value })
    });
    loadContactInfo();
  }
};

window.updateContactInfo = async function(id) {
  const type = document.getElementById(`contact-type-${id}`)?.value;
  const value = document.getElementById(`contact-value-${id}`)?.value;
  
  if (type && value) {
    await fetch('/api/settings/contact', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ id, type, value })
    });
    alert('Contact info updated successfully!');
  }
};

window.deleteContactInfo = async function(id) {
  if (confirm('Are you sure you want to delete this contact info?')) {
    await fetch(`/api/settings/contact/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadContactInfo();
  }
};

// Product CRUD Modal Functions
window.showAddProductModal = function() {
  showProductModal();
};

window.editProduct = async function(id) {
  try {
    const res = await fetch(`/api/admin/item/products/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      showProductModal(data.data);
    }
  } catch (err) {
    alert('Failed to load product');
  }
};

function showProductModal(product = null) {
  const modalHtml = `
    <div id="product-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">${product ? t('products.editProduct') : t('products.addProduct')}</h3>
        <form id="product-form">
          <input type="hidden" name="id" value="${product?.id || ''}">
          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">${t('products.productName')}</label>
              <input type="text" name="name" value="${product?.name || ''}" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Slug</label>
              <input type="text" name="slug" value="${product?.slug || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">${t('products.shortDescription')}</label>
              <textarea name="short_description" rows="2" class="w-full px-3 py-2 border rounded">${product?.short_description || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">${t('products.fullDescription')}</label>
              <textarea name="description" rows="4" class="w-full px-3 py-2 border rounded">${product?.description || ''}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-medium mb-1">${t('products.price')}</label>
                <input type="number" step="0.01" name="price" value="${product?.price || ''}" class="w-full px-3 py-2 border rounded">
              </div>
              <div>
                <label class="block font-medium mb-1">${t('products.moq')}</label>
                <input type="number" name="min_order_qty" value="${product?.min_order_qty || 1}" class="w-full px-3 py-2 border rounded">
              </div>
            </div>
            <div>
              <label class="block font-medium mb-1">${t('products.category')}</label>
              <select name="category_id" class="w-full px-3 py-2 border rounded">
                <option value="">${t('products.allCategories')}</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Images (URLs, comma separated)</label>
              <textarea name="images" rows="2" class="w-full px-3 py-2 border rounded">${product?.images ? product.images.join(',') : ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Specifications (JSON, e.g. {"Power":"22kW","Capacity":"1-2 t/h"})</label>
              <textarea name="specifications" rows="3" class="w-full px-3 py-2 border rounded font-mono text-sm">${product?.specifications ? (typeof product.specifications === 'string' ? product.specifications : JSON.stringify(product.specifications)) : ''}</textarea>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_featured" ${product?.is_featured ? 'checked' : ''}>
                <span>${t('common.featured')}</span>
              </label>
            </div>
          </div>
          <div class="flex gap-4 mt-6">
            <button type="submit" class="btn btn-primary">${t('common.save')}</button>
            <button type="button" onclick="closeProductModal()" class="btn">${t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  loadCategoriesForSelect(product);
  
  $('#product-form').off('submit').on('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const id = data.id;
    delete data.id;
    
    // Parse images
    if (data.images) {
      data.images = data.images.split(',').map(s => s.trim()).filter(s => s);
    }

    // Parse specifications JSON（用于产品详情页规格表）
    if (data.specifications && typeof data.specifications === 'string') {
      try {
        data.specifications = JSON.parse(data.specifications);
      } catch (err) {
        alert('Specifications 必须是合法 JSON');
        return;
      }
    }
    
    // Convert types
    data.min_order_qty = parseInt(data.min_order_qty) || 1;
    data.price = parseFloat(data.price) || null;
    data.is_featured = data.is_featured ? 1 : 0;
    data.category_id = data.category_id ? parseInt(data.category_id) : null;
    
    try {
      const response = await fetch(id ? `/api/admin/products/${id}` : '/api/admin/products', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert(t('common.saveSuccess'));
        closeProductModal();
        loadProducts();
      } else {
        const result = await response.json();
        alert(result.error || 'Save failed');
      }
    } catch (err) {
      alert(t('common.error'));
    }
  });
}

window.closeProductModal = function() {
  $('#product-modal').remove();
};

async function loadCategoriesForSelect(product = null) {
  try {
    const res = await fetch('/api/categories', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const options = (Array.isArray(data.data) ? data.data : (data.data.items || [])).map((c) => 
        `<option value="${c.id}">${c.name}</option>`
      ).join('');
      $('select[name="category_id"]').append(options);
      if (product && product.category_id) $('select[name="category_id"]').val(String(product.category_id));
    }
  } catch (err) {
    console.error('Failed to load categories');
  }
}

window.deleteProduct = async function(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadProducts();
  } catch (err) {
    alert('Failed to delete product');
  }
};

window.deleteCategory = async function(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  
  try {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadCategories();
  } catch (err) {
    alert('Failed to delete category');
  }
};

// Category CRUD Modal Functions
window.showAddCategoryModal = function() {
  showCategoryModal();
};

window.editCategory = async function(id) {
  try {
    const res = await fetch(`/api/admin/item/categories/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      showCategoryModal(data.data);
    } else {
      alert(data.error || 'Failed to load category');
    }
  } catch (err) {
    alert('Failed to load category');
  }
};

function showCategoryModal(category = null) {
  const modalHtml = `
    <div id="category-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-xl w-full">
        <h3 class="text-xl font-bold mb-4">${category ? t('categories.editCategory') : t('categories.addCategory')}</h3>
        <form id="category-form">
          <input type="hidden" name="id" value="${category?.id || ''}">
          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">${t('categories.categoryName')}</label>
              <input type="text" name="name" value="${category?.name || ''}" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Slug</label>
              <input type="text" name="slug" value="${category?.slug || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Description</label>
              <textarea name="description" rows="3" class="w-full px-3 py-2 border rounded">${category?.description || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">${t('common.parent')}</label>
              <select name="parent_id" class="w-full px-3 py-2 border rounded">
                <option value="">${t('common.noParent')}</option>
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">${t('common.sortOrder')}</label>
              <input type="number" name="sort_order" value="${category?.sort_order || 0}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_active" ${category?.is_active !== 0 ? 'checked' : ''}>
                <span>${t('common.active')}</span>
              </label>
            </div>
          </div>
          <div class="flex gap-4 mt-6">
            <button type="submit" class="btn btn-primary">${t('common.save')}</button>
            <button type="button" onclick="closeCategoryModal()" class="btn">${t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  loadCategoriesForParentSelect(category);
  
  $('#category-form').off('submit').on('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const id = data.id;
    delete data.id;
    
    data.sort_order = parseInt(data.sort_order) || 0;
    data.is_active = data.is_active ? 1 : 0;
    data.parent_id = data.parent_id ? parseInt(data.parent_id) : null;
    
    try {
      const response = await fetch(id ? `/api/admin/categories/${id}` : '/api/admin/categories', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert(t('common.saveSuccess'));
        closeCategoryModal();
        loadCategories();
      } else {
        const result = await response.json();
        alert(result.error || 'Save failed');
      }
    } catch (err) {
      alert(t('common.error'));
    }
  });
}

window.closeCategoryModal = function() {
  $('#category-modal').remove();
};

async function loadCategoriesForParentSelect(current = null) {
  try {
    const res = await fetch('/api/categories', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const options = (Array.isArray(data.data) ? data.data : (data.data.items || []))
        .filter((c) => !current || c.id !== current.id)
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join('');
      $('select[name="parent_id"]').append(options);
      if (current && current.parent_id) $('select[name="parent_id"]').val(String(current.parent_id));
    }
  } catch (err) {
    console.error('Failed to load categories');
  }
}

window.deleteSolution = async function(id) {
  if (!confirm('Are you sure you want to delete this solution?')) return;
  
  try {
    await fetch(`/api/admin/solutions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadSolutions();
  } catch (err) {
    alert('Failed to delete solution');
  }
};

window.deleteCase = async function(id) {
  if (!confirm('Are you sure you want to delete this case?')) return;
  
  try {
    await fetch(`/api/admin/cases/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadCases();
  } catch (err) {
    alert('Failed to delete case');
  }
};

window.deleteNews = async function(id) {
  if (!confirm('Are you sure you want to delete this news?')) return;
  
  try {
    await fetch(`/api/admin/news/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadNews();
  } catch (err) {
    alert('Failed to delete news');
  }
};

window.deletePage = async function(id) {
  if (!confirm('Are you sure you want to delete this page?')) return;
  
  try {
    await fetch(`/api/admin/pages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadPages();
  } catch (err) {
    alert('Failed to delete page');
  }
};

window.viewInquiry = async function(id) {
  try {
    const res = await fetch(`/api/inquiries/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const i = data.data;
      alert(`Inquiry Details:\n\nName: ${i.name}\nEmail: ${i.email}\nCompany: ${i.company || 'N/A'}\n\nMessage:\n${i.message}\n\nStatus: ${i.status}`);
    }
  } catch (err) {
    alert('Failed to load inquiry details');
  }
};

window.markInquiryReplied = async function(id) {
  try {
    await fetch(`/api/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ status: 'replied' })
    });
    loadInquiries();
  } catch (err) {
    alert('Failed to update inquiry status');
  }
};

window.viewLead = async function(id) {
  try {
    const res = await fetch(`/api/leads/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const l = data.data;
      alert(`Lead Details:\n\nName: ${l.name}\nPhone: ${l.phone || 'N/A'}\nWhatsApp: ${l.whatsapp || 'N/A'}\nEmail: ${l.email || 'N/A'}\n\nMessage:\n${l.message}\n\nSource: ${l.source}\nStatus: ${l.status}`);
    }
  } catch (err) {
    alert('Failed to load lead details');
  }
};

window.markLeadContacted = async function(id) {
  try {
    await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ status: 'contacted' })
    });
    loadLeads();
  } catch (err) {
    alert('Failed to update lead status');
  }
};

// Solution CRUD Modal Functions
window.showAddSolutionModal = function() {
  showSolutionModal();
};

window.editSolution = async function(id) {
  try {
    const res = await fetch(`/api/admin/item/solutions/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      showSolutionModal(data.data);
    }
  } catch (err) {
    alert('Failed to load solution');
  }
};

function showSolutionModal(solution = null) {
  const modalHtml = `
    <div id="solution-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">${solution ? t('solutions.editSolution') : t('solutions.addSolution')}</h3>
        <form id="solution-form">
          <input type="hidden" name="id" value="${solution?.id || ''}">
          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">Title</label>
              <input type="text" name="title" value="${solution?.title || ''}" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Slug</label>
              <input type="text" name="slug" value="${solution?.slug || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Short Description</label>
              <textarea name="short_description" rows="2" class="w-full px-3 py-2 border rounded">${solution?.short_description || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Content</label>
              <textarea name="content" rows="6" class="w-full px-3 py-2 border rounded">${solution?.content || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Industries</label>
              <input type="text" name="industries" value="${solution?.industries || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Images (URLs, comma separated)</label>
              <textarea name="images" rows="2" class="w-full px-3 py-2 border rounded">${solution?.images ? solution.images.join(',') : ''}</textarea>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_featured" ${solution?.is_featured ? 'checked' : ''}>
                <span>Featured</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_active" ${solution?.is_active !== 0 ? 'checked' : ''}>
                <span>Active</span>
              </label>
            </div>
          </div>
          <div class="flex gap-4 mt-6">
            <button type="submit" class="btn btn-primary">${t('common.save')}</button>
            <button type="button" onclick="closeSolutionModal()" class="btn">${t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  $('#solution-form').off('submit').on('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const id = data.id;
    delete data.id;
    
    if (data.images) {
      data.images = data.images.split(',').map(s => s.trim()).filter(s => s);
    }
    data.is_featured = data.is_featured ? 1 : 0;
    data.is_active = data.is_active ? 1 : 0;
    
    try {
      const response = await fetch(id ? `/api/admin/solutions/${id}` : '/api/admin/solutions', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert(t('common.saveSuccess'));
        closeSolutionModal();
        loadSolutions();
      } else {
        const result = await response.json();
        alert(result.error || 'Save failed');
      }
    } catch (err) {
      alert(t('common.error'));
    }
  });
}

window.closeSolutionModal = function() {
  $('#solution-modal').remove();
};

// Case CRUD Modal Functions
window.showAddCaseModal = function() {
  showCaseModal();
};

window.editCase = async function(id) {
  try {
    const res = await fetch(`/api/admin/item/cases/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      showCaseModal(data.data);
    }
  } catch (err) {
    alert('Failed to load case');
  }
};

function showCaseModal(caseItem = null) {
  const modalHtml = `
    <div id="case-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">${caseItem ? t('cases.editCase') : t('cases.addCase')}</h3>
        <form id="case-form">
          <input type="hidden" name="id" value="${caseItem?.id || ''}">
          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">Title</label>
              <input type="text" name="title" value="${caseItem?.title || ''}" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Slug</label>
              <input type="text" name="slug" value="${caseItem?.slug || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Client Name</label>
              <input type="text" name="client_name" value="${caseItem?.client_name || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Industry</label>
              <input type="text" name="industry" value="${caseItem?.industry || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Challenge</label>
              <textarea name="challenge" rows="3" class="w-full px-3 py-2 border rounded">${caseItem?.challenge || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Solution</label>
              <textarea name="solution" rows="3" class="w-full px-3 py-2 border rounded">${caseItem?.solution || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Results</label>
              <textarea name="results" rows="3" class="w-full px-3 py-2 border rounded">${caseItem?.results || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Testimonial</label>
              <textarea name="testimonial" rows="3" class="w-full px-3 py-2 border rounded">${caseItem?.testimonial || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Images (URLs, comma separated)</label>
              <textarea name="images" rows="2" class="w-full px-3 py-2 border rounded">${caseItem?.images ? caseItem.images.join(',') : ''}</textarea>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_featured" ${caseItem?.is_featured ? 'checked' : ''}>
                <span>Featured</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_active" ${caseItem?.is_active !== 0 ? 'checked' : ''}>
                <span>Active</span>
              </label>
            </div>
          </div>
          <div class="flex gap-4 mt-6">
            <button type="submit" class="btn btn-primary">${t('common.save')}</button>
            <button type="button" onclick="closeCaseModal()" class="btn">${t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  $('#case-form').off('submit').on('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const id = data.id;
    delete data.id;
    
    if (data.images) {
      data.images = data.images.split(',').map(s => s.trim()).filter(s => s);
    }
    data.is_featured = data.is_featured ? 1 : 0;
    data.is_active = data.is_active ? 1 : 0;
    
    try {
      const response = await fetch(id ? `/api/admin/cases/${id}` : '/api/admin/cases', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert(t('common.saveSuccess'));
        closeCaseModal();
        loadCases();
      } else {
        const result = await response.json();
        alert(result.error || 'Save failed');
      }
    } catch (err) {
      alert(t('common.error'));
    }
  });
}

window.closeCaseModal = function() {
  $('#case-modal').remove();
};

// News CRUD Modal Functions
window.showAddNewsModal = function() {
  showNewsModal();
};

window.editNews = async function(id) {
  try {
    const res = await fetch(`/api/admin/item/news/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      showNewsModal(data.data);
    }
  } catch (err) {
    alert('Failed to load news');
  }
};

function showNewsModal(newsItem = null) {
  const modalHtml = `
    <div id="news-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">${newsItem ? t('news.editNews') : t('news.addNews')}</h3>
        <form id="news-form">
          <input type="hidden" name="id" value="${newsItem?.id || ''}">
          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">Title</label>
              <input type="text" name="title" value="${newsItem?.title || ''}" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Slug</label>
              <input type="text" name="slug" value="${newsItem?.slug || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Short Description</label>
              <textarea name="short_description" rows="2" class="w-full px-3 py-2 border rounded">${newsItem?.short_description || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Content</label>
              <textarea name="content" rows="6" class="w-full px-3 py-2 border rounded">${newsItem?.content || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Author</label>
              <input type="text" name="author" value="${newsItem?.author || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Images (URLs, comma separated)</label>
              <textarea name="images" rows="2" class="w-full px-3 py-2 border rounded">${newsItem?.images ? newsItem.images.join(',') : ''}</textarea>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_featured" ${newsItem?.is_featured ? 'checked' : ''}>
                <span>Featured</span>
              </label>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_active" ${newsItem?.is_active !== 0 ? 'checked' : ''}>
                <span>Active</span>
              </label>
            </div>
          </div>
          <div class="flex gap-4 mt-6">
            <button type="submit" class="btn btn-primary">${t('common.save')}</button>
            <button type="button" onclick="closeNewsModal()" class="btn">${t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  $('#news-form').off('submit').on('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const id = data.id;
    delete data.id;
    
    if (data.images) {
      data.images = data.images.split(',').map(s => s.trim()).filter(s => s);
    }
    data.is_featured = data.is_featured ? 1 : 0;
    data.is_active = data.is_active ? 1 : 0;
    
    try {
      const response = await fetch(id ? `/api/admin/news/${id}` : '/api/admin/news', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert(t('common.saveSuccess'));
        closeNewsModal();
        loadNews();
      } else {
        const result = await response.json();
        alert(result.error || 'Save failed');
      }
    } catch (err) {
      alert(t('common.error'));
    }
  });
}

window.closeNewsModal = function() {
  $('#news-modal').remove();
};

// Page CRUD Modal Functions
window.editPage = async function(id) {
  try {
    const res = await fetch(`/api/admin/item/pages/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      showPageModal(data.data);
    }
  } catch (err) {
    alert('Failed to load page');
  }
};

function showPageModal(page = null) {
  const modalHtml = `
    <div id="page-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">${page ? t('pages.editPage') : 'Add Page'}</h3>
        <form id="page-form">
          <input type="hidden" name="id" value="${page?.id || ''}">
          <div class="space-y-4">
            <div>
              <label class="block font-medium mb-1">Title</label>
              <input type="text" name="title" value="${page?.title || ''}" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Slug</label>
              <input type="text" name="slug" value="${page?.slug || ''}" required class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Meta Title</label>
              <input type="text" name="meta_title" value="${page?.meta_title || ''}" class="w-full px-3 py-2 border rounded">
            </div>
            <div>
              <label class="block font-medium mb-1">Meta Description</label>
              <textarea name="meta_description" rows="2" class="w-full px-3 py-2 border rounded">${page?.meta_description || ''}</textarea>
            </div>
            <div>
              <label class="block font-medium mb-1">Content</label>
              <textarea name="content" rows="8" class="w-full px-3 py-2 border rounded">${page?.content || ''}</textarea>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="is_active" ${page?.is_active !== 0 ? 'checked' : ''}>
                <span>Active</span>
              </label>
            </div>
          </div>
          <div class="flex gap-4 mt-6">
            <button type="submit" class="btn btn-primary">${t('common.save')}</button>
            <button type="button" onclick="closePageModal()" class="btn">${t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  $('#page-form').off('submit').on('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const id = data.id;
    delete data.id;
    
    data.is_active = data.is_active ? 1 : 0;
    
    try {
      const response = await fetch(id ? `/api/admin/pages/${id}` : '/api/admin/pages', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        alert(t('common.saveSuccess'));
        closePageModal();
        loadPages();
      } else {
        const result = await response.json();
        alert(result.error || 'Save failed');
      }
    } catch (err) {
      alert(t('common.error'));
    }
  });
}

window.closePageModal = function() {
  $('#page-modal').remove();
};

// Translation Settings
window.loadTranslationSettings = async function() {
  const container = document.getElementById('translation-settings-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/translations/config');
    const data = await res.json();
    if (data.success) {
      const config = data.data || {};
      const enabledLanguages = config.enabled_languages || [];
      const allLanguages = [
        { code: 'en', name: 'English' },
        { code: 'zh', name: '中文' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'ru', name: 'Русский' },
        { code: 'ar', name: 'العربية' },
        { code: 'pt', name: 'Português' },
      ];
      
      container.innerHTML = `
        <div class="form-group">
          <label>Enable Multi-language</label>
          <select id="translation-enabled" class="form-control">
            <option value="0" ${!config.is_enabled ? 'selected' : ''}>Disabled</option>
            <option value="1" ${config.is_enabled ? 'selected' : ''}>Enabled</option>
          </select>
        </div>
        <div class="form-group">
          <label>Translation API URL</label>
          <input type="text" id="translation-api-url" class="form-control" value="${config.api_url || ''}" placeholder="https://api.translation.com/translate">
        </div>
        <div class="form-group">
          <label>API Token</label>
          <input type="password" id="translation-api-token" class="form-control" value="${config.api_token || ''}" placeholder="Your API token">
        </div>
        <div class="form-group">
          <label>Enabled Languages</label>
          <div class="language-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem;">
            ${allLanguages.map(lang => `
              <label style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" value="${lang.code}" ${enabledLanguages.includes(lang.code) ? 'checked' : ''}>
                <span>${lang.name} (${lang.code})</span>
              </label>
            `).join('')}
          </div>
        </div>
        <button type="button" class="btn btn-primary" onclick="saveTranslationSettings()">Save Translation Settings</button>
      `;
    }
  } catch (err) {
    console.error('Failed to load translation settings');
  }
};

window.saveTranslationSettings = async function() {
  const enabled = document.getElementById('translation-enabled')?.value === '1';
  const apiUrl = document.getElementById('translation-api-url')?.value || '';
  const apiToken = document.getElementById('translation-api-token')?.value || '';
  
  const enabledLanguages = [];
  document.querySelectorAll('.language-grid input[type="checkbox"]:checked').forEach(cb => {
    enabledLanguages.push(cb.value);
  });
  
  try {
    const res = await fetch('/api/translations/config', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        is_enabled: enabled,
        api_url: apiUrl,
        api_token: apiToken,
        enabled_languages: enabledLanguages,
      })
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Translation settings saved successfully!');
    } else {
      alert('Failed to save translation settings: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    alert('Failed to save translation settings');
  }
};


// ==================== 通用小工具 ====================
function escHtml(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function adminRequest(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Authorization': `Basic ${credentials}` } };
  if (body !== null) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function openSimpleModal(id, title, fieldsHtml, onSubmit) {
  $(`#${id}`).remove();
  $('body').append(`
    <div id="${id}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">${title}</h3>
        <form id="${id}-form">
          <div class="space-y-4">${fieldsHtml}</div>
          <div class="flex gap-4 mt-6">
            <button type="submit" class="btn btn-primary">${t('common.save')}</button>
            <button type="button" class="btn" onclick="$('#${id}').remove()">${t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>`);
  $(`#${id}-form`).on('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    $(e.target).find('input[type=checkbox]').each(function () { data[this.name] = this.checked ? 1 : 0; });
    try {
      await onSubmit(data);
      alert(t('common.saveSuccess'));
      $(`#${id}`).remove();
    } catch (err) {
      alert(err.message || t('common.error'));
    }
  });
}

function fieldInput(label, name, value, type = 'text', extra = '') {
  return `<div><label class="block font-medium mb-1">${label}</label>
    <input type="${type}" name="${name}" value="${escHtml(value)}" class="w-full px-3 py-2 border rounded" ${extra}></div>`;
}
function fieldTextarea(label, name, value, rows = 3, extra = '') {
  return `<div><label class="block font-medium mb-1">${label}</label>
    <textarea name="${name}" rows="${rows}" class="w-full px-3 py-2 border rounded" ${extra}>${escHtml(value)}</textarea></div>`;
}
function fieldCheckbox(label, name, checked) {
  return `<div><label class="flex items-center gap-2"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''}><span>${label}</span></label></div>`;
}

// ==================== 幻灯片 ====================
async function loadSlides() {
  const container = document.getElementById('slide-table');
  if (!container) return;
  try {
    const data = await adminRequest('/api/admin/list/slides');
    const items = data.data || [];
    if (!items.length) { container.innerHTML = `<p class="text-gray-500">${t('common.noData')}</p>`; return; }
    container.innerHTML = `
      <table>
        <thead><tr><th>ID</th><th>${t('common.image')}</th><th>${t('common.title')}</th><th>${t('common.sortOrder')}</th><th>${t('common.status')}</th><th>${t('common.actions')}</th></tr></thead>
        <tbody>
          ${items.map(s => `
            <tr>
              <td>${s.id}</td>
              <td>${s.image_url ? `<img src="${escHtml(s.image_url)}" style="width:80px;height:45px;object-fit:cover;border-radius:4px">` : '-'}</td>
              <td>${escHtml(s.title)}</td>
              <td>${s.sort_order ?? 0}</td>
              <td>${s.is_active ? t('common.active2') : t('common.inactive2')}</td>
              <td>
                <button class="btn btn-sm btn-warning" onclick="editSlide(${s.id})">${t('common.edit')}</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSlide(${s.id})">${t('common.delete')}</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<p class="text-red-600">${escHtml(err.message)}</p>`;
  }
}

function showSlideModal(slide = null) {
  const fields =
    fieldInput(t('slides.slideTitle'), 'title', slide?.title, 'text', 'required') +
    fieldInput(t('slides.subtitle'), 'subtitle', slide?.subtitle) +
    fieldTextarea(t('slides.slideDescription'), 'description', slide?.description, 2) +
    fieldInput(t('slides.slideImage') + ' (URL)', 'image_url', slide?.image_url) +
    fieldInput(t('slides.linkUrl'), 'link_url', slide?.link_url) +
    fieldInput(t('slides.linkText'), 'link_text', slide?.link_text) +
    fieldInput(t('common.sortOrder'), 'sort_order', slide?.sort_order ?? 0, 'number') +
    fieldCheckbox(t('common.active'), 'is_active', slide ? slide.is_active : 1);
  openSimpleModal('slide-modal', slide ? t('slides.editSlide') : t('slides.addSlide'), fields, async (data) => {
    data.sort_order = parseInt(data.sort_order) || 0;
    if (slide) await adminRequest(`/api/slides/${slide.id}`, 'PUT', data);
    else await adminRequest('/api/slides', 'POST', data);
    loadSlides();
  });
}

window.editSlide = async function (id) {
  try {
    const data = await adminRequest(`/api/admin/item/slides/${id}`);
    showSlideModal(data.data);
  } catch (err) { alert(err.message); }
};

window.deleteSlide = async function (id) {
  if (!confirm(t('common.confirmDelete'))) return;
  try { await adminRequest(`/api/slides/${id}`, 'DELETE'); loadSlides(); }
  catch (err) { alert(err.message); }
};

// ==================== SEO / JSON-LD ====================
async function loadJsonLdConfigs() {
  const container = document.getElementById('jsonld-form');
  if (!container) return;
  try {
    const data = await adminRequest('/api/admin/list/jsonld');
    const items = data.data || [];
    container.innerHTML = `
      <div class="mb-4 text-sm text-gray-600">这些配置会以 JSON-LD 结构化数据的形式输出到首页，帮助 Google 识别你的公司信息。通常只需添加一条 Organization 即可。</div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4" onclick="showJsonLdModal()">${t('seo.addConfig')}</button>
      ${items.length ? `
      <table>
        <thead><tr><th>ID</th><th>${t('seo.schemaType')}</th><th>${t('seo.name')}</th><th>URL</th><th>${t('common.status')}</th><th>${t('common.actions')}</th></tr></thead>
        <tbody>
          ${items.map(c => `
            <tr>
              <td>${c.id}</td>
              <td>${escHtml(c.page_type)}</td>
              <td>${escHtml(c.name || '-')}</td>
              <td>${escHtml(c.url || '-')}</td>
              <td>${c.is_active ? t('common.active2') : t('common.inactive2')}</td>
              <td>
                <button class="btn btn-sm btn-warning" onclick="editJsonLd(${c.id})">${t('common.edit')}</button>
                <button class="btn btn-sm btn-danger" onclick="deleteJsonLd(${c.id})">${t('common.delete')}</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>` : `<p class="text-gray-500">${t('common.noData')}</p>`}`;
  } catch (err) {
    container.innerHTML = `<p class="text-red-600">${escHtml(err.message)}</p>`;
  }
}

window.showJsonLdModal = function (config = null) {
  const types = ['Organization', 'LocalBusiness', 'WebSite', 'Store', 'Corporation'];
  const cur = config?.page_type || 'Organization';
  const typeOptions = (types.includes(cur) ? types : [cur, ...types])
    .map(x => `<option value="${escHtml(x)}" ${x === cur ? 'selected' : ''}>${escHtml(x)}</option>`).join('');
  const fields =
    `<div><label class="block font-medium mb-1">${t('seo.schemaType')}</label>
      <select name="page_type" class="w-full px-3 py-2 border rounded">${typeOptions}</select></div>` +
    fieldInput(t('seo.name'), 'name', config?.name) +
    fieldTextarea(t('common.description'), 'description', config?.description, 2) +
    fieldInput('URL', 'url', config?.url, 'text', 'placeholder="https://"') +
    fieldInput('Logo URL', 'logo', config?.logo) +
    fieldTextarea('Same As（社交主页链接，每行一个）', 'same_as', config?.same_as, 3) +
    fieldTextarea(t('seo.extraData'), 'extra_data', config?.extra_data, 4, 'style="font-family:monospace;font-size:13px" placeholder=\'{"foundingDate": "2015"}\'') +
    fieldCheckbox(t('common.active'), 'is_active', config ? config.is_active : 1);
  openSimpleModal('jsonld-modal', t('seo.addConfig'), fields, async (data) => {
    if (data.extra_data && data.extra_data.trim()) {
      try { JSON.parse(data.extra_data); } catch (e) { throw new Error('Extra Data 不是有效的 JSON'); }
    }
    if (config) await adminRequest(`/api/jsonld/${config.id}`, 'PUT', data);
    else await adminRequest('/api/jsonld', 'POST', data);
    loadJsonLdConfigs();
  });
};

window.editJsonLd = async function (id) {
  try {
    const data = await adminRequest(`/api/admin/item/jsonld/${id}`);
    showJsonLdModal(data.data);
  } catch (err) { alert(err.message); }
};

window.deleteJsonLd = async function (id) {
  if (!confirm(t('common.confirmDelete'))) return;
  try { await adminRequest(`/api/jsonld/${id}`, 'DELETE'); loadJsonLdConfigs(); }
  catch (err) { alert(err.message); }
};

// ==================== Robots.txt ====================
async function loadRobotsConfigs() {
  const container = document.getElementById('robots-form');
  if (!container) return;
  try {
    const data = await adminRequest('/api/admin/list/robots');
    const items = data.data || [];
    container.innerHTML = `
      <div class="mb-4 text-sm text-gray-600">一条规则对应 robots.txt 里的一个 User-agent 段。路径每行一个，例如 Disallow 填 <code>/admin</code>。</div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4" onclick="showRobotsModal()">${t('robots.addRule')}</button>
      ${items.length ? `
      <table>
        <thead><tr><th>ID</th><th>${t('robots.userAgent')}</th><th>${t('robots.allow')}</th><th>${t('robots.disallow')}</th><th>${t('common.status')}</th><th>${t('common.actions')}</th></tr></thead>
        <tbody>
          ${items.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>${escHtml(r.user_agent)}</td>
              <td><pre class="text-xs">${escHtml(r.allow_paths || '-')}</pre></td>
              <td><pre class="text-xs">${escHtml(r.disallow_paths || '-')}</pre></td>
              <td>${r.is_active ? t('common.active2') : t('common.inactive2')}</td>
              <td>
                <button class="btn btn-sm btn-warning" onclick="editRobots(${r.id})">${t('common.edit')}</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRobots(${r.id})">${t('common.delete')}</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>` : `<p class="text-gray-500">${t('common.noData')}</p>`}
      <pre id="robots-preview" class="mt-4 p-4 bg-gray-900 text-green-300 rounded text-sm hidden" style="white-space:pre-wrap"></pre>`;
  } catch (err) {
    container.innerHTML = `<p class="text-red-600">${escHtml(err.message)}</p>`;
  }
}

window.showRobotsModal = function (config = null) {
  const fields =
    fieldInput(t('robots.userAgent'), 'user_agent', config?.user_agent ?? '*', 'text', 'required') +
    fieldTextarea(t('robots.allow') + '（每行一个路径）', 'allow_paths', config?.allow_paths ?? '/', 3) +
    fieldTextarea(t('robots.disallow') + '（每行一个路径）', 'disallow_paths', config?.disallow_paths ?? '/admin\n/api/', 3) +
    fieldInput('Sitemap URL（留空则自动使用 站点地址/sitemap.xml）', 'sitemap_url', config?.sitemap_url) +
    fieldInput(t('common.sortOrder'), 'sort_order', config?.sort_order ?? 0, 'number') +
    fieldCheckbox(t('common.active'), 'is_active', config ? config.is_active : 1);
  openSimpleModal('robots-modal', t('robots.addRule'), fields, async (data) => {
    data.sort_order = parseInt(data.sort_order) || 0;
    if (config) await adminRequest(`/api/robots/${config.id}`, 'PUT', data);
    else await adminRequest('/api/robots', 'POST', data);
    loadRobotsConfigs();
  });
};

window.editRobots = async function (id) {
  try {
    const data = await adminRequest(`/api/admin/item/robots/${id}`);
    showRobotsModal(data.data);
  } catch (err) { alert(err.message); }
};

window.deleteRobots = async function (id) {
  if (!confirm(t('common.confirmDelete'))) return;
  try { await adminRequest(`/api/robots/${id}`, 'DELETE'); loadRobotsConfigs(); }
  catch (err) { alert(err.message); }
};

window.previewRobots = async function () {
  try {
    const res = await fetch('/robots.txt?_=' + Date.now(), { cache: 'no-store' });
    const text = await res.text();
    const box = document.getElementById('robots-preview');
    if (box) { box.textContent = text; box.classList.remove('hidden'); }
    else alert(text);
  } catch (err) { alert(t('common.error')); }
};


// ===== 报价表（内部完整版）=====
let quoteRows = [];

function quoteEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

async function loadQuotes() {
  const container = document.getElementById('quotes-table');
  if (!container) return;
  try {
    const res = await fetch('/api/admin/quotes', { headers: { 'Authorization': `Basic ${credentials}` } });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'load failed');
    quoteRows = data.data;
    const cats = [...new Set(quoteRows.map(r => r.category_name).filter(Boolean))];
    const ratings = [...new Set(quoteRows.map(r => r.rating).filter(Boolean))];
    $('#quotes-cat').html(`<option value="">${t('quotes.allCats')}</option>` + cats.map(c => `<option>${quoteEsc(c)}</option>`).join('')).off('change').on('change', renderQuotesTable);
    $('#quotes-rating').html(`<option value="">${t('quotes.allRatings')}</option>` + ratings.map(c => `<option>${quoteEsc(c)}</option>`).join('')).off('change').on('change', renderQuotesTable);
    renderQuotesTable();
  } catch (err) {
    console.error('Failed to load quotes', err);
    container.innerHTML = '<p class="p-4 text-red-600">Failed to load price list.</p>';
  }
}

function renderQuotesTable() {
  const container = document.getElementById('quotes-table');
  if (!container) return;
  const cat = $('#quotes-cat').val();
  const rating = $('#quotes-rating').val();
  const rows = quoteRows.filter(r => (!cat || r.category_name === cat) && (!rating || r.rating === rating));
  const num = (v, d = 2) => (typeof v === 'number' ? v.toFixed(d) : '-');
  $('#quotes-summary').text(t('quotes.summary')
    .replace('{n}', quoteRows.length)
    .replace('{l}', quoteRows.filter(r => r.product_id).length)
    .replace('{p}', quoteRows.filter(r => r.show_public).length));
  container.innerHTML = `
    <table style="min-width:1300px">
      <thead>
        <tr>
          <th>${t('quotes.category')}</th><th>${t('quotes.rating')}</th><th>${t('quotes.product')}</th><th>${t('quotes.supplier')}</th>
          <th>${t('quotes.cny')}</th><th>${t('quotes.sales')}</th><th>${t('quotes.repeat')}</th><th>${t('quotes.landed')}</th>
          <th>${t('quotes.cost')}</th><th>${t('quotes.price')}</th><th>${t('quotes.margin')}</th><th>${t('quotes.moq')}</th>
          <th>${t('quotes.listed')}</th><th>${t('quotes.isPublic')}</th><th>${t('quotes.notes')}</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${quoteEsc((r.category_name || '').replace(/^Solar /, ''))}</td>
            <td>${quoteEsc(r.rating || '')}</td>
            <td style="min-width:260px">
              <div class="font-medium">${quoteEsc(r.en_name)}</div>
              <div class="text-xs text-gray-500">${r.link_1688 ? `<a href="${quoteEsc(r.link_1688)}" target="_blank" rel="noopener" class="hover:underline">${quoteEsc(r.cn_title || '')}</a>` : quoteEsc(r.cn_title || '')}</div>
            </td>
            <td style="min-width:150px">${quoteEsc(r.supplier || '')}<div class="text-xs text-gray-500">${quoteEsc(r.origin || '')}</div></td>
            <td>${num(r.cny_price)}</td>
            <td>${quoteEsc(r.sales || '-')}</td>
            <td>${typeof r.repeat_rate === 'number' ? Math.round(r.repeat_rate * 100) + '%' : '-'}</td>
            <td>${num(r.landed_cny)}</td>
            <td>${num(r.cost_usd)}</td>
            <td><input type="number" step="0.01" min="0" value="${num(r.price_usd)}" class="border border-gray-300 rounded px-1 py-0.5 w-20" onchange="updateQuote(${r.id}, { price_usd: this.value })"></td>
            <td>${num(r.margin_usd)}</td>
            <td><input type="number" step="1" min="1" value="${r.moq || ''}" class="border border-gray-300 rounded px-1 py-0.5 w-16" onchange="updateQuote(${r.id}, { moq: this.value })"></td>
            <td>${r.product_slug ? `<a href="/product/${quoteEsc(r.product_slug)}" target="_blank" class="text-blue-600 hover:underline">${t('quotes.yes')}</a>` : t('quotes.no')}</td>
            <td><input type="checkbox" ${r.show_public ? 'checked' : ''} onchange="updateQuote(${r.id}, { show_public: this.checked })"></td>
            <td class="text-xs text-gray-600" style="min-width:180px">${quoteEsc(r.notes || '')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateQuote(id, patch) {
  try {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'save failed');
    showToast(t('quotes.saved'), 'success');
    await loadQuotesKeepFilters();
  } catch (err) {
    showToast(t('quotes.saveFailed'), 'error');
  }
}

async function loadQuotesKeepFilters() {
  const cat = $('#quotes-cat').val();
  const rating = $('#quotes-rating').val();
  await loadQuotes();
  $('#quotes-cat').val(cat);
  $('#quotes-rating').val(rating);
  renderQuotesTable();
}
