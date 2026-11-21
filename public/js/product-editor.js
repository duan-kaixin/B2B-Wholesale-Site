/*
 * 产品编辑器：大页面布局
 * 左侧：完善建议导航 + 实时预览；右侧：基本信息 / 商品详情 / 销售信息 / 其他设置
 * 依赖 admin.js 里的全局变量：credentials、currentLang、loadProducts()
 */
(function () {
  'use strict';

  var zh = function () { return (typeof currentLang !== 'undefined' ? currentLang : 'en') === 'zh'; };
  var L = function (cn, en) { return zh() ? cn : en; };
  var esc = function (v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  var authHeader = function () { return { 'Authorization': 'Basic ' + credentials }; };
  var slugify = function (s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  };
  var MAX_ATTRS = 3;
  var MAX_FILE = 5 * 1024 * 1024;
  var NAME_MAX = 200;
  var SMALL_SLOTS = 8;
  var SECTIONS = [
    ['basic', function () { return L('基本信息', 'Basic Info'); }],
    ['detail', function () { return L('商品详情', 'Details'); }],
    ['sales', function () { return L('销售信息', 'Sales Info'); }],
    ['other', function () { return L('其他设置', 'Other Settings'); }]
  ];

  var S = null; // 编辑器状态

  function skuKey(values) { return values.join('||'); }

  function cartesian(attrs) {
    var lists = attrs.filter(function (a) { return a.values.length; }).map(function (a) { return a.values; });
    if (!lists.length) return [];
    return lists.reduce(function (acc, list) {
      var out = [];
      acc.forEach(function (prev) { list.forEach(function (v) { out.push(prev.concat([v])); }); });
      return out;
    }, [[]]);
  }

  function parseMaybe(v, fallback) {
    if (typeof v !== 'string') return v == null ? fallback : v;
    try { return JSON.parse(v); } catch (e) { return fallback; }
  }

  function initState(p) {
    p = p || {};
    var specs = parseMaybe(p.specifications, {}) || {};
    var variants = parseMaybe(p.variants, null);
    var images = parseMaybe(p.images, []);
    var skuMap = {};
    ((variants && variants.skus) || []).forEach(function (s) {
      if (Array.isArray(s.values)) skuMap[skuKey(s.values)] = s;
    });
    S = {
      id: p.id || null,
      base: {
        name: p.name || '', slug: p.slug || '', category_id: p.category_id || '',
        short_description: p.short_description || '', description: p.description || '',
        price: p.price != null ? p.price : '', min_order_qty: p.min_order_qty || 1,
        is_featured: !!p.is_featured, is_active: p.is_active === undefined ? true : !!p.is_active
      },
      images: Array.isArray(images) ? images.slice() : [],
      specs: Object.keys(specs).map(function (k) { return [k, String(specs[k])]; }),
      attrs: ((variants && variants.attrs) || []).map(function (a) {
        return { name: a.name || '', values: (a.values || []).slice() };
      }),
      skuMap: skuMap,
      categories: [],
      uploading: 0,
      dirty: false,
      preview: { img: 0, chosen: [] }
    };
    if (!S.specs.length) S.specs.push(['', '']);
  }

  function touch() { S.dirty = true; schedulePreview(); }

  var inputCls = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500';
  var req = '<span class="text-red-500 mr-1">*</span>';

  function section(id, title, body) {
    return '<section id="pe-sec-' + id + '" data-sec="' + id + '" class="pe-sec bg-white rounded-lg shadow-sm p-6 mb-6 scroll-mt-32">' +
      '<h3 class="text-xl font-bold mb-6">' + title + '</h3>' + body + '</section>';
  }
  function field(label, hint, body, required) {
    return '<div class="mb-6"><label class="block font-medium mb-1">' + (required ? req : '') + label + '</label>' +
      (hint ? '<p class="text-xs text-gray-500 mb-2">' + hint + '</p>' : '') + body + '</div>';
  }

  /* ---------- 页面骨架 ---------- */
  function shell() {
    var navItems = SECTIONS.map(function (s) {
      return '<button type="button" class="pe-nav w-full flex items-center justify-between text-left px-4 py-3 rounded hover:bg-gray-50" data-go="' + s[0] + '">' +
        '<span>' + s[1]() + '</span><span class="pe-nav-ok text-sm" data-ok="' + s[0] + '"></span></button>';
    }).join('');
    var tabs = SECTIONS.map(function (s) {
      return '<button type="button" class="pe-tab whitespace-nowrap px-1 py-3 mr-6 font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900" data-go="' + s[0] + '">' + s[1]() + '</button>';
    }).join('');
    return '' +
      '<div id="pe-modal" class="fixed inset-0 z-50 bg-gray-100 overflow-y-auto">' +
      '<div class="max-w-[1400px] mx-auto px-6 pt-6 pb-28">' +
      '  <div class="flex items-center gap-3 mb-6">' +
      '    <button type="button" id="pe-back" class="w-9 h-9 rounded bg-white shadow-sm flex items-center justify-center hover:bg-gray-50" title="' + L('返回', 'Back') + '">&larr;</button>' +
      '    <h2 class="text-2xl font-bold">' + (S.id ? L('编辑商品', 'Edit Product') : L('添加商品', 'Add Product')) + '</h2>' +
      '    <span id="pe-status" class="text-sm text-gray-500 ml-2"></span>' +
      '  </div>' +
      '  <div class="flex gap-6 items-start">' +
      '    <aside class="w-80 shrink-0 sticky top-6 space-y-6 hidden lg:block">' +
      '      <div class="bg-white rounded-lg shadow-sm p-5">' +
      '        <h4 class="text-lg font-bold">' + L('建议', 'Suggestions') + '</h4>' +
      '        <p class="text-xs text-gray-500 mb-3">' + L('完善商品信息，提高询盘转化。', 'Complete the listing to get more inquiries.') + '</p>' +
      '        <div>' + navItems + '</div>' +
      '        <ul id="pe-tips" class="mt-3 space-y-1 text-xs text-amber-700"></ul>' +
      '      </div>' +
      '      <div class="bg-white rounded-lg shadow-sm p-5">' +
      '        <h4 class="text-lg font-bold mb-3">' + L('预览', 'Preview') + ' <span class="text-xs font-normal text-gray-400">' + L('（客户看到的样子）', '(what buyers see)') + '</span></h4>' +
      '        <div id="pe-preview" class="border rounded-xl overflow-hidden bg-white max-h-[70vh] overflow-y-auto"></div>' +
      '      </div>' +
      '    </aside>' +
      '    <main class="flex-1 min-w-0">' +
      '      <div class="sticky top-0 z-10 bg-gray-100 pt-1 mb-4"><div class="bg-white rounded-lg shadow-sm px-6 flex overflow-x-auto">' + tabs + '</div></div>' +
      '      <div id="pe-sections"></div>' +
      '    </main>' +
      '  </div>' +
      '</div>' +
      '<div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">' +
      '  <div class="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-end gap-3">' +
      '    <span id="pe-active-label" class="text-sm text-gray-500 mr-auto whitespace-nowrap"></span>' +
      '    <button type="button" id="pe-cancel" class="whitespace-nowrap px-5 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">' + L('取消', 'Cancel') + '</button>' +
      '    <button type="button" id="pe-draft" class="whitespace-nowrap px-5 py-2 rounded bg-gray-200 hover:bg-gray-300 font-medium">' + L('另存为草稿（不上架）', 'Save as Draft') + '</button>' +
      '    <button type="button" id="pe-publish" class="whitespace-nowrap px-5 py-2 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium">' + L('保存并上架', 'Save & Publish') + '</button>' +
      '  </div>' +
      '</div>' +
      '</div>';
  }

  /* ---------- 基本信息 ---------- */
  function sectionBasic() {
    var b = S.base;
    return section('basic', L('基本信息', 'Basic Info'),
      field(L('图片', 'Images'),
        L('第一张是主图，建议用 800×800 以上的白底正方形图，不要带中文字。单张不超过 5MB，格式 JPG / PNG / WebP。拖动可调整顺序，也可以把文件直接拖进来。',
          'First image is the main image. Square, white background, 800×800+. Max 5MB. Drag to reorder.'),
        '<div id="pe-images"></div>' +
        '<input id="pe-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple class="hidden">' +
        '<p id="pe-upload-msg" class="text-sm text-gray-500 mt-2"></p>' +
        '<div class="flex gap-2 mt-2"><input id="pe-img-url" class="' + inputCls + '" placeholder="' + L('也可以粘贴图片网址，多个用逗号分隔', 'Or paste image URLs, comma separated') + '">' +
        '<button type="button" id="pe-img-url-add" class="px-4 py-2 rounded border border-gray-300 whitespace-nowrap hover:bg-gray-50">' + L('添加网址', 'Add URL') + '</button></div>', true) +
      field(L('商品名称', 'Product Name'), L('显示给海外客户，请填英文。建议 60–150 个字符，包含品类词和主要卖点。', 'English, 60–150 characters.'),
        '<div class="relative"><input id="pe-name" class="' + inputCls + ' pr-20" value="' + esc(b.name) + '" maxlength="' + NAME_MAX + '" placeholder="' + L('请输入英文', 'Enter English name') + '">' +
        '<span class="absolute right-3 top-2 text-xs text-gray-400 bg-gray-100 px-1 rounded"><span id="pe-name-count">' + b.name.length + '</span>/' + NAME_MAX + '</span></div>', true) +
      field(L('类目', 'Category'), '', '<select id="pe-category" class="' + inputCls + '"><option value="">' + L('请选择', 'Select') + '</option></select>', true) +
      field(L('网址别名', 'URL Slug'), L('产品详情页网址的最后一段，留空会按名称自动生成。', 'Leave empty to generate from name.'),
        '<div class="flex items-center"><span class="text-sm text-gray-400 mr-1">/product/</span><input id="pe-slug" class="' + inputCls + '" value="' + esc(b.slug) + '" placeholder="solar-step-light"></div>'));
  }

  function renderImages() {
    var slot = function (u, i) {
      var main = i === 0;
      return '<div class="pe-img relative group border ' + (main ? 'border-teal-500' : 'border-gray-200') + ' rounded-lg bg-white flex items-center justify-center p-2 cursor-move aspect-square" draggable="true" data-i="' + i + '">' +
        '<img src="' + esc(u) + '" class="max-w-full max-h-full object-contain pointer-events-none">' +
        '<span class="absolute top-1 left-1 ' + (main ? 'bg-teal-600' : 'bg-gray-700 bg-opacity-70') + ' text-white text-xs px-2 py-0.5 rounded">' + (main ? L('主图', 'Main') : (i + 1)) + '</span>' +
        '<div class="absolute bottom-1 right-1 hidden group-hover:flex gap-1">' +
        (main ? '' : '<button type="button" class="pe-img-main bg-white border rounded px-2 py-0.5 text-xs hover:bg-teal-50" data-i="' + i + '">' + L('设为主图', 'Set main') + '</button>') +
        '<button type="button" class="pe-img-del bg-white border rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50" data-i="' + i + '">' + L('删除', 'Delete') + '</button>' +
        '</div></div>';
    };
    var empty = function (big) {
      return '<button type="button" class="pe-img-empty border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-teal-50 hover:border-teal-400 flex flex-col items-center justify-center text-gray-400 aspect-square w-full">' +
        '<span class="' + (big ? 'text-3xl' : 'text-2xl') + '">&#8682;</span>' +
        (big ? '<span class="text-sm text-gray-600 mt-1">' + L('上传主图', 'Upload main image') + '</span>' : '<span class="text-xs mt-1">' + L('上传', 'Upload') + '</span>') +
        '</button>';
    };
    var smalls = [];
    for (var i = 1; i < Math.max(SMALL_SLOTS + 1, S.images.length + 1); i++) {
      smalls.push(S.images[i] ? slot(S.images[i], i) : empty(false));
    }
    var html = '<div id="pe-drop" class="grid grid-cols-6 gap-3">' +
      '<div class="col-span-2 row-span-2">' + (S.images[0] ? slot(S.images[0], 0) : empty(true)) + '</div>' +
      smalls.map(function (h) { return '<div>' + h + '</div>'; }).join('') + '</div>' +
      '<p class="text-xs text-gray-400 mt-2">' + L('已上传 ', 'Uploaded ') + S.images.length + L(' 张', '') + '</p>';
    $('#pe-images').html(html);
  }

  /* ---------- 商品详情 ---------- */
  function sectionDetail() {
    var tools = [
      ['insertUnorderedList', '&#8226;&#8801;', L('项目符号列表', 'Bullet list')],
      ['insertOrderedList', '1.&#8801;', L('编号列表', 'Numbered list')],
      ['image', '&#128444;', L('插入图片', 'Insert image')],
      ['|'],
      ['h3', 'H', L('标题', 'Heading')],
      ['bold', '<b>B</b>', L('加粗', 'Bold')],
      ['italic', '<i>I</i>', L('斜体', 'Italic')],
      ['underline', '<u>U</u>', L('下划线', 'Underline')],
      ['|'],
      ['justifyLeft', '&#8676;', L('左对齐', 'Left')],
      ['justifyCenter', '&#8596;', L('居中', 'Center')],
      ['justifyRight', '&#8677;', L('右对齐', 'Right')],
      ['|'],
      ['removeFormat', 'T&#824;', L('清除格式', 'Clear format')],
      ['source', '&lt;/&gt;', L('查看 / 编辑 HTML 源码', 'HTML source')]
    ].map(function (t) {
      if (t[0] === '|') return '<span class="w-px h-5 bg-gray-300 mx-1"></span>';
      return '<button type="button" class="pe-rt w-8 h-8 rounded hover:bg-gray-100 text-sm" data-cmd="' + t[0] + '" title="' + t[2] + '">' + t[1] + '</button>';
    }).join('');
    return section('detail', L('商品详情', 'Details'),
      field(L('简短描述', 'Short Description'), L('显示在产品卡片和详情页标题下方，1–2 句话说清楚产品是什么、用在哪。', 'One or two sentences.'),
        '<textarea id="pe-short" rows="2" class="' + inputCls + '">' + esc(S.base.short_description) + '</textarea>') +
      field(L('描述', 'Description'), L('粘贴时会自动去掉外部格式。', 'Pasted text is cleaned of external formatting.'),
        '<div class="border border-gray-300 rounded">' +
        '<div class="flex items-center flex-wrap gap-0.5 px-2 py-1 border-b bg-gray-50">' + tools + '</div>' +
        '<div id="pe-desc" contenteditable="true" class="pe-rich min-h-[220px] max-h-[520px] overflow-y-auto px-4 py-3 focus:outline-none">' + S.base.description + '</div>' +
        '<textarea id="pe-desc-src" class="hidden w-full min-h-[220px] px-4 py-3 font-mono text-sm focus:outline-none"></textarea>' +
        '<input id="pe-desc-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden">' +
        '</div>', true) +
      field(L('产品属性', 'Specifications'), L('显示在详情页的规格表里，请填英文。可以把「属性名: 属性值」一行一条批量粘贴。', 'Spec table on the product page.'),
        '<div id="pe-specs"></div>'));
  }

  function renderSpecs() {
    var rows = S.specs.map(function (r, i) {
      return '<tr>' +
        '<td class="border px-2 py-1"><input class="pe-spec ' + inputCls + '" data-i="' + i + '" data-c="0" value="' + esc(r[0]) + '" placeholder="Battery Capacity"></td>' +
        '<td class="border px-2 py-1"><input class="pe-spec ' + inputCls + '" data-i="' + i + '" data-c="1" value="' + esc(r[1]) + '" placeholder="600mAh"></td>' +
        '<td class="border px-2 py-1 text-center whitespace-nowrap">' +
        '<button type="button" class="pe-spec-up px-1 text-gray-500 hover:text-teal-600" data-i="' + i + '" title="' + L('上移', 'Up') + '">&uarr;</button>' +
        '<button type="button" class="pe-spec-down px-1 text-gray-500 hover:text-teal-600" data-i="' + i + '" title="' + L('下移', 'Down') + '">&darr;</button>' +
        '<button type="button" class="pe-spec-del px-1 text-red-500 hover:text-red-700" data-i="' + i + '" title="' + L('删除', 'Remove') + '">&times;</button>' +
        '</td></tr>';
    }).join('');
    $('#pe-specs').html(
      '<table class="w-full text-sm border mb-3"><thead class="bg-gray-50"><tr>' +
      '<th class="border px-3 py-2 text-left w-2/5">' + L('属性名', 'Name') + '</th>' +
      '<th class="border px-3 py-2 text-left">' + L('属性值', 'Value') + '</th>' +
      '<th class="border px-3 py-2 w-24"></th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="flex items-center gap-4"><button type="button" id="pe-spec-add" class="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50">+ ' + L('添加一行', 'Add row') + '</button>' +
      '<details class="text-sm flex-1"><summary class="cursor-pointer text-teal-700">' + L('批量粘贴', 'Bulk paste') + '</summary>' +
      '<textarea id="pe-spec-bulk" rows="5" class="' + inputCls + ' mt-2 font-mono text-sm" placeholder="Light Source: LED&#10;Battery: 600mAh Ni-MH&#10;Waterproof: IP44"></textarea>' +
      '<button type="button" id="pe-spec-bulk-apply" class="px-3 py-1.5 rounded bg-teal-600 text-white text-sm mt-2">' + L('追加到表格', 'Append') + '</button></details></div>');
  }

  /* ---------- 销售信息 ---------- */
  function sectionSales() {
    var b = S.base;
    return section('sales', L('销售信息', 'Sales Info'),
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">' +
      field(L('起价 (USD)', 'Starting Price (USD)'), L('填了 SKU 价格时，保存会自动取最低的 SKU 价。', 'Auto = lowest SKU price.'),
        '<input id="pe-price" type="number" step="0.01" min="0" class="' + inputCls + '" value="' + esc(b.price) + '">') +
      field(L('起订量', 'MOQ'), L('单位：件', 'units'),
        '<input id="pe-moq" type="number" min="1" class="' + inputCls + '" value="' + esc(b.min_order_qty) + '">', true) +
      '</div>' +
      field(L('销售属性', 'Variants'),
        L('例如 Shell Color = Black / Brown / White，Light Color = White / Warm / RGB。属性名和属性值会显示给客户，请填英文。最多 3 个属性，没有多款式可以不填。',
          'e.g. Shell Color = Black / Brown / White. Max 3.'),
        '<div id="pe-attrs"></div><div id="pe-skus"></div>'));
  }

  function renderSales() {
    var attrsHtml = S.attrs.map(function (a, ai) {
      return '<div class="border rounded-lg p-4 mb-3 bg-gray-50">' +
        '<div class="flex items-center gap-3 mb-3">' +
        '<label class="text-sm font-medium w-16">' + L('属性名', 'Name') + '</label>' +
        '<input class="pe-attr-name ' + inputCls + ' max-w-xs" data-ai="' + ai + '" value="' + esc(a.name) + '" placeholder="Shell Color">' +
        '<button type="button" class="pe-attr-del ml-auto text-red-600 text-sm hover:underline" data-ai="' + ai + '">' + L('删除此属性', 'Remove') + '</button>' +
        '</div>' +
        '<div class="flex items-start gap-3">' +
        '<label class="text-sm font-medium w-16 pt-1">' + L('属性值', 'Values') + '</label>' +
        '<div class="flex-1"><div class="flex flex-wrap gap-2 mb-2">' +
        a.values.map(function (v, vi) {
          return '<span class="inline-flex items-center gap-1 bg-white border border-teal-300 text-teal-700 rounded px-2 py-1 text-sm">' + esc(v) +
            '<button type="button" class="pe-val-del text-gray-400 hover:text-red-600" data-ai="' + ai + '" data-vi="' + vi + '" title="' + L('删除', 'Remove') + '">&times;</button></span>';
        }).join('') +
        '</div>' +
        '<div class="flex gap-2"><input class="pe-val-input ' + inputCls + ' max-w-xs" data-ai="' + ai + '" placeholder="' + L('输入后按回车，逗号可一次加多个', 'Type and press Enter') + '">' +
        '<button type="button" class="pe-val-add px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-white" data-ai="' + ai + '">' + L('添加', 'Add') + '</button></div>' +
        '</div></div></div>';
    }).join('');
    $('#pe-attrs').html(attrsHtml +
      (S.attrs.length < MAX_ATTRS ? '<button type="button" id="pe-attr-add" class="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50">+ ' + L('添加销售属性', 'Add attribute') + '</button>' : ''));
    renderSkus();
  }

  function currentSkus() {
    return cartesian(S.attrs).map(function (values) {
      var k = skuKey(values);
      var old = S.skuMap[k];
      if (!old) {
        // 新增了属性时，从原来的较短组合继承价格、起订量和图片（例如 Black → Black / Warm）
        for (var n = values.length - 1; n > 0 && !old; n--) {
          var parent = S.skuMap[skuKey(values.slice(0, n))];
          if (parent) old = { price: parent.price, moq: parent.moq, image: parent.image, enabled: parent.enabled };
        }
      }
      old = old || {};
      var row = {
        values: values, code: old.code || '', price: old.price != null ? old.price : '',
        moq: old.moq != null ? old.moq : '', image: old.image || '', enabled: old.enabled !== false
      };
      S.skuMap[k] = row;
      return row;
    });
  }

  function renderSkus() {
    var skus = currentSkus();
    if (!skus.length) { $('#pe-skus').html(''); return; }
    var named = S.attrs.filter(function (a) { return a.values.length; });
    var imgOptions = function (sel) {
      return '<option value="">' + L('无', 'None') + '</option>' + S.images.map(function (u, i) {
        return '<option value="' + esc(u) + '"' + (u === sel ? ' selected' : '') + '>' + L('图', 'Img ') + (i + 1) + '</option>';
      }).join('');
    };
    $('#pe-skus').html(
      '<div class="mt-6"><div class="flex items-center justify-between mb-2"><h4 class="font-semibold">' + L('SKU 列表', 'SKU List') + ' <span class="text-sm font-normal text-gray-500">(' + skus.length + ')</span></h4>' +
      '<span class="text-xs text-gray-500">' + L('价格、起订量留空则用上面的起价和起订量。图片从上面的商品图片里选。', 'Empty = use base price / MOQ.') + '</span></div>' +
      '<div class="flex flex-wrap items-center gap-2 mb-3 p-3 bg-teal-50 rounded text-sm">' +
      '<span class="font-medium">' + L('批量填写', 'Batch fill') + '：</span>' +
      '<input id="pe-batch-price" type="number" step="0.01" min="0" class="px-2 py-1 border rounded w-28" placeholder="' + L('价格', 'Price') + '">' +
      '<input id="pe-batch-moq" type="number" min="1" class="px-2 py-1 border rounded w-28" placeholder="' + L('起订量', 'MOQ') + '">' +
      '<button type="button" id="pe-batch-apply" class="px-3 py-1 rounded bg-teal-600 text-white">' + L('应用到全部', 'Apply to all') + '</button>' +
      '</div>' +
      '<div class="overflow-x-auto"><table class="w-full text-sm border">' +
      '<thead class="bg-gray-50"><tr>' +
      named.map(function (a) { return '<th class="border px-3 py-2 text-left">' + esc(a.name || L('未命名', 'Unnamed')) + '</th>'; }).join('') +
      '<th class="border px-3 py-2 text-left">' + L('SKU 编码', 'SKU Code') + '</th>' +
      '<th class="border px-3 py-2 text-left">' + L('价格 (USD)', 'Price') + '</th>' +
      '<th class="border px-3 py-2 text-left">' + L('起订量', 'MOQ') + '</th>' +
      '<th class="border px-3 py-2 text-left">' + L('SKU 图片', 'Image') + '</th>' +
      '<th class="border px-3 py-2 text-center">' + L('启用', 'On') + '</th>' +
      '</tr></thead><tbody>' +
      skus.map(function (s) {
        var k = esc(skuKey(s.values));
        return '<tr class="' + (s.enabled ? '' : 'bg-gray-100 text-gray-400') + '">' +
          s.values.map(function (v) { return '<td class="border px-3 py-2 whitespace-nowrap">' + esc(v) + '</td>'; }).join('') +
          '<td class="border px-2 py-1"><input class="pe-sku-f px-2 py-1 border rounded w-32" data-k="' + k + '" data-f="code" value="' + esc(s.code) + '"></td>' +
          '<td class="border px-2 py-1"><input type="number" step="0.01" min="0" class="pe-sku-f px-2 py-1 border rounded w-24" data-k="' + k + '" data-f="price" value="' + esc(s.price) + '"></td>' +
          '<td class="border px-2 py-1"><input type="number" min="1" class="pe-sku-f px-2 py-1 border rounded w-24" data-k="' + k + '" data-f="moq" value="' + esc(s.moq) + '"></td>' +
          '<td class="border px-2 py-1"><div class="flex items-center gap-2">' +
          (s.image ? '<img src="' + esc(s.image) + '" class="w-10 h-10 object-contain border rounded bg-white">' : '<span class="w-10 h-10 border rounded bg-gray-50 inline-block"></span>') +
          '<select class="pe-sku-f px-2 py-1 border rounded" data-k="' + k + '" data-f="image">' + imgOptions(s.image) + '</select></div></td>' +
          '<td class="border px-2 py-1 text-center"><input type="checkbox" class="pe-sku-f" data-k="' + k + '" data-f="enabled" ' + (s.enabled ? 'checked' : '') + '></td>' +
          '</tr>';
      }).join('') +
      '</tbody></table></div></div>');
  }

  function addValues(ai, raw) {
    var a = S.attrs[ai];
    if (!a) return;
    String(raw || '').split(/[,，\n]/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (v) {
      if (a.values.indexOf(v) === -1) a.values.push(v);
    });
  }

  /* ---------- 其他设置 ---------- */
  function sectionOther() {
    return section('other', L('其他设置', 'Other Settings'),
      '<label class="flex items-center gap-3 mb-4"><input type="checkbox" id="pe-featured" class="w-4 h-4" ' + (S.base.is_featured ? 'checked' : '') + '>' +
      '<span>' + L('首页推荐（显示在首页「特色产品」）', 'Featured on homepage') + '</span></label>' +
      '<p class="text-sm text-gray-500">' + L('上架状态由底部按钮决定：「另存为草稿」不会在前台显示，「保存并上架」会立即显示。', 'Draft = hidden; Publish = visible.') + '</p>');
  }

  /* ---------- 预览 ---------- */
  var previewTimer = null;
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () { renderPreview(); renderNav(); }, 150);
  }

  function previewSku() {
    var attrs = S.attrs.filter(function (a) { return a.values.length; });
    var ch = S.preview.chosen;
    if (!attrs.length || ch.length !== attrs.length || ch.some(function (v) { return v == null; })) return null;
    var row = S.skuMap[skuKey(ch)];
    return row && row.enabled !== false ? row : null;
  }

  function renderPreview() {
    var box = $('#pe-preview');
    if (!box.length) return;
    var b = S.base, imgs = S.images;
    var attrs = S.attrs.filter(function (a) { return a.values.length; });
    S.preview.chosen = attrs.map(function (a, i) {
      var v = S.preview.chosen[i]; return a.values.indexOf(v) !== -1 ? v : null;
    });
    var sku = previewSku();
    var skuPrices = currentSkus().filter(function (s) { return s.enabled && s.price !== '' && s.price != null; })
      .map(function (s) { return parseFloat(s.price); }).filter(isFinite);
    var basePrice = skuPrices.length ? Math.min.apply(null, skuPrices) : (b.price === '' ? null : parseFloat(b.price));
    var price = sku && sku.price !== '' && sku.price != null ? parseFloat(sku.price) : basePrice;
    var moq = sku && sku.moq !== '' && sku.moq != null ? sku.moq : b.min_order_qty;
    if (S.preview.img >= imgs.length) S.preview.img = 0;
    var mainSrc = sku && sku.image ? sku.image : imgs[S.preview.img];
    var specs = S.specs.filter(function (r) { return String(r[0] || '').trim(); });

    var html =
      '<div class="aspect-square bg-white flex items-center justify-center border-b">' +
      (mainSrc ? '<img src="' + esc(mainSrc) + '" class="max-w-full max-h-full object-contain">' :
        '<span class="text-gray-300 text-sm">' + L('添加图片', 'Add image') + '</span>') + '</div>' +
      (imgs.length > 1 ? '<div class="flex gap-1 p-2 overflow-x-auto">' + imgs.map(function (u, i) {
        return '<img src="' + esc(u) + '" data-i="' + i + '" class="pe-pv-thumb w-12 h-12 object-contain border-2 rounded cursor-pointer ' +
          (i === S.preview.img && !(sku && sku.image) ? 'border-teal-500' : 'border-gray-200') + '">';
      }).join('') + '</div>' : '') +
      '<div class="p-3">' +
      '<p class="font-semibold leading-snug mb-2 ' + (b.name ? '' : 'text-gray-300') + '">' + esc(b.name || L('商品名称', 'Product name')) + '</p>' +
      (price != null && isFinite(price) ? '<p class="text-xl font-bold text-blue-600">' + (sku || !skuPrices.length ? '' : 'From ') + '$' + esc(price) + '</p>' :
        '<p class="text-sm text-gray-400">' + L('未填价格（前台显示询价）', 'No price') + '</p>') +
      '<p class="text-xs text-gray-500 mb-3">Min. Order: ' + esc(moq) + ' units</p>' +
      attrs.map(function (a, ai) {
        return '<p class="text-xs font-medium text-gray-700 mb-1">' + esc(a.name || '?') + ': <span class="text-gray-900">' + esc(S.preview.chosen[ai] || '') + '</span></p>' +
          '<div class="flex flex-wrap gap-1 mb-2">' + a.values.map(function (v) {
            var on = S.preview.chosen[ai] === v;
            return '<button type="button" class="pe-pv-opt px-2 py-1 border-2 rounded text-xs ' + (on ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200') + '" data-ai="' + ai + '" data-v="' + esc(v) + '">' + esc(v) + '</button>';
          }).join('') + '</div>';
      }).join('') +
      '<div class="w-full bg-amber-500 text-white text-center text-sm font-semibold py-2 rounded mb-3">Request a Quote</div>' +
      (specs.length ? '<p class="text-sm font-semibold mb-1">Specifications</p><table class="w-full text-xs mb-3"><tbody>' + specs.slice(0, 8).map(function (r) {
        return '<tr class="border-b"><td class="py-1 text-gray-500 w-2/5">' + esc(r[0]) + '</td><td class="py-1">' + esc(r[1]) + '</td></tr>';
      }).join('') + '</tbody></table>' + (specs.length > 8 ? '<p class="text-xs text-gray-400 mb-3">+' + (specs.length - 8) + '</p>' : '') : '') +
      (b.description ? '<p class="text-sm font-semibold mb-1">Product Description</p><div class="pe-rich pe-pv-desc text-xs text-gray-700">' + b.description + '</div>' : '') +
      '</div>';
    box.html(html);
  }

  /* ---------- 完善建议 ---------- */
  function checks() {
    var b = S.base;
    var plain = String(b.description || '').replace(/<[^>]*>/g, '').trim();
    var hasPrice = b.price !== '' || currentSkus().some(function (s) { return s.price !== '' && s.price != null; });
    var ok = {
      basic: S.images.length > 0 && !!b.name.trim() && !!b.category_id,
      detail: !!plain && S.specs.some(function (r) { return String(r[0] || '').trim(); }),
      sales: hasPrice && !!b.min_order_qty,
      other: true
    };
    var tips = [];
    if (!S.images.length) tips.push(L('上传至少 1 张商品图片', 'Upload at least 1 image'));
    else if (S.images.length < 5) tips.push(L('建议上传 5 张以上图片（现在 ', 'Upload 5+ images (now ') + S.images.length + L(' 张）', ')'));
    if (!b.name.trim()) tips.push(L('填写商品名称', 'Enter a product name'));
    else if (b.name.trim().length < 40) tips.push(L('商品名称偏短，建议加上用途和卖点', 'Name is short; add use case and key features'));
    if (/[一-鿿]/.test(b.name + b.short_description + plain)) tips.push(L('名称或描述里有中文，海外客户看不懂', 'Chinese text detected'));
    if (!b.category_id) tips.push(L('选择类目', 'Pick a category'));
    if (!plain) tips.push(L('填写商品描述', 'Add a description'));
    if (!hasPrice) tips.push(L('没填价格，前台不会显示价格', 'No price set'));
    if (S.attrs.some(function (a) { return a.values.length && !a.name.trim(); })) tips.push(L('有销售属性没填属性名', 'A variant has no name'));
    return { ok: ok, tips: tips };
  }

  function renderNav() {
    var c = checks();
    Object.keys(c.ok).forEach(function (k) {
      $('.pe-nav-ok[data-ok="' + k + '"]').html(c.ok[k] ? '<span class="text-teal-600">&#10004;</span>' : '<span class="text-amber-500">' + L('待完善', 'To do') + '</span>');
    });
    $('#pe-tips').html(c.tips.map(function (t) { return '<li>&#8226; ' + esc(t) + '</li>'; }).join(''));
    $('#pe-active-label').text(S.id ? (S.base.is_active ? L('当前状态：已上架', 'Status: Published') : L('当前状态：草稿（未上架）', 'Status: Draft')) : '');
  }

  function setActiveNav(id) {
    $('.pe-tab').removeClass('border-teal-600 text-teal-700').addClass('border-transparent text-gray-600')
      .filter('[data-go="' + id + '"]').addClass('border-teal-600 text-teal-700').removeClass('border-transparent text-gray-600');
    $('.pe-nav').removeClass('bg-gray-100 font-semibold').filter('[data-go="' + id + '"]').addClass('bg-gray-100 font-semibold');
  }

  /* ---------- 图片上传 ---------- */
  function setUploadMsg(msg, isErr) {
    $('#pe-upload-msg').text(msg || '').toggleClass('text-red-600', !!isErr).toggleClass('text-gray-500', !isErr);
  }

  function validFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    var allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    var bad = files.filter(function (f) { return allowed.indexOf(f.type) === -1 || f.size > MAX_FILE; });
    if (bad.length) alert(L('以下文件格式不支持或超过 5MB，已跳过：\n', 'Skipped (type or >5MB):\n') + bad.map(function (f) { return f.name; }).join('\n'));
    return files.filter(function (f) { return bad.indexOf(f) === -1; });
  }

  function uploadOne(f) {
    var fd = new FormData();
    fd.append('file', f);
    return fetch('/api/upload/image', { method: 'POST', headers: authHeader(), body: fd })
      .then(function (r) { return r.json(); })
      .then(function (d) { return d && d.success && d.data && d.data.url ? d.data.url : null; })
      .catch(function () { return null; });
  }

  function uploadFiles(fileList) {
    var files = validFiles(fileList);
    if (!files.length) return Promise.resolve();
    var total = files.length, done = 0, failed = 0;
    var slots = files.map(function () { return null; });
    S.uploading += total;
    setUploadMsg(L('上传中 0/', 'Uploading 0/') + total);
    // 逐张上传，保持选择顺序；网络慢时比并发更稳
    return files.reduce(function (p, f, idx) {
      return p.then(function () {
        return uploadOne(f).then(function (url) {
          if (url) slots[idx] = url; else failed++;
          done++; S.uploading--;
          setUploadMsg(L('上传中 ', 'Uploading ') + done + '/' + total);
        });
      });
    }, Promise.resolve()).then(function () {
      slots.forEach(function (u) { if (u) S.images.push(u); });
      renderImages(); renderSkus(); touch();
      setUploadMsg(failed ? L('上传完成，失败 ', 'Done, failed: ') + failed + L(' 张', '') : L('上传完成', 'Upload complete'), failed > 0);
    });
  }

  /* ---------- 富文本 ---------- */
  function syncDesc() {
    var src = $('#pe-desc-src');
    if (src.length && !src.hasClass('hidden')) S.base.description = src.val();
    else S.base.description = ($('#pe-desc').html() || '').replace(/^(<br\s*\/?>|\s)+$/i, '');
  }

  function richCmd(cmd) {
    var ed = $('#pe-desc')[0], src = $('#pe-desc-src');
    if (cmd === 'source') {
      if (src.hasClass('hidden')) { src.val(ed.innerHTML).removeClass('hidden'); $(ed).addClass('hidden'); }
      else { ed.innerHTML = src.val(); src.addClass('hidden'); $(ed).removeClass('hidden'); }
      $('.pe-rt').not('[data-cmd="source"]').prop('disabled', !src.hasClass('hidden'));
      syncDesc(); touch(); return;
    }
    if (cmd === 'image') { saveSelection(); $('#pe-desc-file').trigger('click'); return; }
    ed.focus();
    restoreSelection();
    if (cmd === 'h3') document.execCommand('formatBlock', false, '<h3>');
    else document.execCommand(cmd, false, null);
    syncDesc(); touch();
  }

  var savedRange = null;
  function saveSelection() {
    var sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount && $('#pe-desc')[0].contains(sel.anchorNode)) savedRange = sel.getRangeAt(0);
  }
  function restoreSelection() {
    if (!savedRange) return;
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); savedRange = null;
  }

  function insertDescImage(file) {
    var files = validFiles([file]);
    if (!files.length) return;
    setUploadMsg(L('描述图片上传中…', 'Uploading description image…'));
    S.uploading++;
    uploadOne(files[0]).then(function (url) {
      S.uploading--;
      if (!url) { alert(L('图片上传失败', 'Upload failed')); return; }
      var ed = $('#pe-desc')[0];
      ed.focus(); restoreSelection();
      var html = '<p><img src="' + esc(url) + '" alt="" style="max-width:100%"></p>';
      if (!document.execCommand('insertHTML', false, html)) ed.insertAdjacentHTML('beforeend', html);
      syncDesc(); touch(); setUploadMsg('');
    });
  }

  /* ---------- 事件 ---------- */
  function bind() {
    var m = $('#pe-modal');
    var scrollTo = function (id) {
      var el = document.getElementById('pe-sec-' + id);
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(id);
    };
    m.on('click', '.pe-tab, .pe-nav', function () { scrollTo($(this).data('go')); });
    m.on('scroll', function () {
      var top = this.getBoundingClientRect ? this.getBoundingClientRect().top : 0, cur = 'basic';
      $('.pe-sec').each(function () { if (this.getBoundingClientRect().top - top < 160) cur = $(this).data('sec'); });
      setActiveNav(cur);
    });

    m.on('click', '#pe-back, #pe-cancel', function () {
      if (!S.dirty || confirm(L('放弃未保存的修改？', 'Discard unsaved changes?'))) close();
    });
    m.on('click', '#pe-draft', function () { save(false); });
    m.on('click', '#pe-publish', function () { save(true); });

    // 基本字段
    m.on('input change', '#pe-name', function () { S.base.name = this.value; $('#pe-name-count').text(this.value.length); touch(); });
    m.on('input change', '#pe-slug', function () { S.base.slug = this.value.trim(); touch(); });
    m.on('change', '#pe-category', function () { S.base.category_id = this.value; touch(); });
    m.on('input change', '#pe-short', function () { S.base.short_description = this.value; touch(); });
    m.on('input change', '#pe-price', function () { S.base.price = this.value; touch(); });
    m.on('input change', '#pe-moq', function () { S.base.min_order_qty = this.value; touch(); });
    m.on('change', '#pe-featured', function () { S.base.is_featured = this.checked; touch(); });

    // 描述编辑器
    m.on('mousedown', '.pe-rt', function (e) { e.preventDefault(); saveSelection(); }); // 不让按钮抢走光标
    m.on('click', '.pe-rt', function () { richCmd($(this).data('cmd')); });
    m.on('input', '#pe-desc, #pe-desc-src', function () { syncDesc(); touch(); });
    m.on('keyup mouseup', '#pe-desc', saveSelection);
    m.on('paste', '#pe-desc', function (e) {
      var cd = e.originalEvent && e.originalEvent.clipboardData;
      if (!cd) return;
      var file = Array.prototype.slice.call(cd.files || []).filter(function (f) { return /^image\//.test(f.type); })[0];
      e.preventDefault();
      if (file) { saveSelection(); insertDescImage(file); return; }
      var text = cd.getData('text/plain') || '';
      var html = text.split(/\r?\n/).map(function (ln) { return ln.trim() ? '<p>' + esc(ln) + '</p>' : ''; }).join('');
      if (!document.execCommand('insertHTML', false, html)) this.insertAdjacentHTML('beforeend', html);
      syncDesc(); touch();
    });
    m.on('change', '#pe-desc-file', function () { if (this.files && this.files[0]) insertDescImage(this.files[0]); this.value = ''; });

    // 销售属性
    m.on('click', '#pe-attr-add', function () { if (S.attrs.length < MAX_ATTRS) { S.attrs.push({ name: '', values: [] }); renderSales(); touch(); } });
    m.on('click', '.pe-attr-del', function () {
      if (!confirm(L('删除这个属性会重新生成 SKU 列表，确定吗？', 'Remove this attribute?'))) return;
      S.attrs.splice(+$(this).data('ai'), 1); renderSales(); touch();
    });
    m.on('change', '.pe-attr-name', function () { S.attrs[+$(this).data('ai')].name = this.value.trim(); renderSkus(); touch(); });
    m.on('keydown', '.pe-val-input', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault(); var ai = +$(this).data('ai');
        addValues(ai, this.value); renderSales(); touch(); $('.pe-val-input[data-ai="' + ai + '"]').focus();
      }
    });
    m.on('click', '.pe-val-add', function () {
      var ai = +$(this).data('ai'); addValues(ai, $('.pe-val-input[data-ai="' + ai + '"]').val()); renderSales(); touch();
    });
    m.on('click', '.pe-val-del', function () { S.attrs[+$(this).data('ai')].values.splice(+$(this).data('vi'), 1); renderSales(); touch(); });
    m.on('change', '.pe-sku-f', function () {
      var row = S.skuMap[$(this).attr('data-k')], f = $(this).data('f');
      if (!row) return;
      row[f] = f === 'enabled' ? this.checked : this.value;
      if (f === 'enabled' || f === 'image') renderSkus();
      touch();
    });
    m.on('click', '#pe-batch-apply', function () {
      var p = $('#pe-batch-price').val(), q = $('#pe-batch-moq').val();
      currentSkus().forEach(function (s) { if (p !== '') s.price = p; if (q !== '') s.moq = q; });
      renderSkus(); touch();
    });

    // 产品属性
    m.on('input', '.pe-spec', function () { S.specs[+$(this).data('i')][+$(this).data('c')] = this.value; touch(); });
    m.on('click', '#pe-spec-add', function () { S.specs.push(['', '']); renderSpecs(); touch(); });
    m.on('click', '.pe-spec-del', function () { S.specs.splice(+$(this).data('i'), 1); if (!S.specs.length) S.specs.push(['', '']); renderSpecs(); touch(); });
    m.on('click', '.pe-spec-up, .pe-spec-down', function () {
      var i = +$(this).data('i'), j = $(this).hasClass('pe-spec-up') ? i - 1 : i + 1;
      if (j < 0 || j >= S.specs.length) return;
      var t = S.specs[i]; S.specs[i] = S.specs[j]; S.specs[j] = t; renderSpecs(); touch();
    });
    m.on('click', '#pe-spec-bulk-apply', function () {
      var lines = String($('#pe-spec-bulk').val() || '').split('\n');
      S.specs = S.specs.filter(function (r) { return r[0] || r[1]; });
      lines.forEach(function (ln) {
        var mm = ln.match(/^\s*([^:：\t]+)[:：\t]\s*(.+?)\s*$/);
        if (mm) S.specs.push([mm[1].trim(), mm[2]]);
      });
      if (!S.specs.length) S.specs.push(['', '']);
      renderSpecs(); touch();
    });

    // 图片
    m.on('click', '.pe-img-empty', function () { $('#pe-file').trigger('click'); });
    m.on('change', '#pe-file', function () { uploadFiles(this.files); this.value = ''; });
    m.on('click', '#pe-img-url-add', function () {
      String($('#pe-img-url').val() || '').split(/[,\s]+/).map(function (x) { return x.trim(); })
        .filter(function (x) { return /^(https?:\/\/|\/)/.test(x); })
        .forEach(function (u) { if (S.images.indexOf(u) === -1) S.images.push(u); });
      $('#pe-img-url').val('');
      renderImages(); renderSkus(); touch();
    });
    m.on('click', '.pe-img-del', function (e) { e.stopPropagation(); S.images.splice(+$(this).data('i'), 1); renderImages(); renderSkus(); touch(); });
    m.on('click', '.pe-img-main', function (e) {
      e.stopPropagation(); var i = +$(this).data('i'); S.images.unshift(S.images.splice(i, 1)[0]); renderImages(); renderSkus(); touch();
    });
    var dragFrom = null;
    m.on('dragstart', '.pe-img', function (e) {
      dragFrom = +$(this).data('i');
      var dt = e.originalEvent.dataTransfer;
      dt.effectAllowed = 'move';
      try { dt.setData('text/plain', String(dragFrom)); } catch (err) { /* Firefox 需要 setData 才能拖动 */ }
    });
    m.on('dragover', '.pe-img', function (e) { if (dragFrom !== null) { e.preventDefault(); $(this).addClass('ring-2 ring-teal-400'); } });
    m.on('dragleave', '.pe-img', function () { $(this).removeClass('ring-2 ring-teal-400'); });
    m.on('drop', '.pe-img', function (e) {
      if (dragFrom === null) return;
      e.preventDefault(); e.stopPropagation();
      var to = +$(this).data('i');
      if (to !== dragFrom) { var it = S.images.splice(dragFrom, 1)[0]; S.images.splice(to, 0, it); }
      dragFrom = null; renderImages(); renderSkus(); touch();
    });
    m.on('dragend', '.pe-img', function () { dragFrom = null; });
    // 从电脑拖文件进来：拖到描述框以外的任何位置都当作商品图片上传
    m.on('dragover', function (e) { e.preventDefault(); });
    m.on('drop', function (e) {
      e.preventDefault();
      var dt = e.originalEvent && e.originalEvent.dataTransfer;
      if (dragFrom === null && dt && dt.files && dt.files.length) {
        if ($(e.target).closest('#pe-desc').length) insertDescImage(dt.files[0]);
        else uploadFiles(dt.files);
      }
      dragFrom = null;
    });

    // 预览里的交互
    m.on('click', '.pe-pv-thumb', function () { S.preview.img = +$(this).data('i'); S.preview.chosen = []; renderPreview(); });
    m.on('click', '.pe-pv-opt', function () {
      var ai = +$(this).data('ai'), v = String($(this).attr('data-v'));
      S.preview.chosen[ai] = S.preview.chosen[ai] === v ? null : v; renderPreview();
    });
  }

  /* ---------- 保存 ---------- */
  function buildPayload(publish) {
    syncDesc();
    var b = S.base;
    var specs = {};
    S.specs.forEach(function (r) { var k = String(r[0] || '').trim(); if (k) specs[k] = String(r[1] || '').trim(); });
    var attrs = S.attrs.map(function (a) { return { name: a.name.trim(), values: a.values.slice() }; })
      .filter(function (a) { return a.values.length; });
    var skus = cartesian(attrs).map(function (values) {
      var s = S.skuMap[skuKey(values)] || {};
      var price = s.price === '' || s.price == null ? null : parseFloat(s.price);
      var moq = s.moq === '' || s.moq == null ? null : parseInt(s.moq, 10);
      return {
        values: values, code: String(s.code || '').trim(),
        price: isFinite(price) ? price : null, moq: isFinite(moq) ? moq : null,
        image: s.image && S.images.indexOf(s.image) !== -1 ? s.image : '',
        enabled: s.enabled !== false
      };
    });
    var price = b.price === '' ? null : parseFloat(b.price);
    var skuPrices = skus.filter(function (s) { return s.enabled && s.price != null; }).map(function (s) { return s.price; });
    if (skuPrices.length) price = Math.min.apply(null, skuPrices);
    return {
      name: b.name.trim(),
      slug: b.slug || slugify(b.name),
      category_id: b.category_id ? parseInt(b.category_id, 10) : null,
      short_description: b.short_description,
      description: b.description,
      price: isFinite(price) ? price : null,
      min_order_qty: parseInt(b.min_order_qty, 10) || 1,
      is_featured: b.is_featured ? 1 : 0,
      is_active: publish ? 1 : 0,
      images: S.images.slice(),
      specifications: specs,
      variants: attrs.length ? { attrs: attrs, skus: skus } : null
    };
  }

  function validate(p, publish) {
    if (!p.name) return L('请填写商品名称', 'Product name is required');
    if (!p.slug) return L('网址别名无法从名称生成，请手动填写英文别名', 'Please enter a slug');
    if (S.uploading > 0) return L('图片还在上传，请稍等', 'Images are still uploading');
    if (S.attrs.some(function (a) { return a.values.length && !a.name.trim(); })) return L('有销售属性没填属性名', 'A variant attribute has no name');
    if (publish && !p.images.length) return L('上架前请至少上传 1 张图片', 'Upload at least one image before publishing');
    if (publish && !p.category_id) return L('上架前请选择类目', 'Pick a category before publishing');
    return '';
  }

  function save(publish) {
    var p = buildPayload(publish);
    var err = validate(p, publish);
    if (err) { alert(err); return Promise.resolve(false); }
    var btns = $('#pe-draft, #pe-publish').prop('disabled', true).addClass('opacity-60');
    return fetch(S.id ? '/api/admin/products/' + S.id : '/api/admin/products', {
      method: S.id ? 'PUT' : 'POST',
      headers: $.extend({ 'Content-Type': 'application/json' }, authHeader()),
      body: JSON.stringify(p)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
    }).then(function (res) {
      if (!res.ok || res.d.success === false) throw new Error(res.d.error || 'HTTP error');
      if (!S.id && res.d.data && res.d.data.id) S.id = res.d.data.id;
      S.base.is_active = !!publish; S.dirty = false;
      $('#pe-status').text((publish ? L('已保存并上架 ', 'Published ') : L('已存为草稿 ', 'Draft saved ')) + new Date().toLocaleTimeString());
      renderNav();
      if (typeof loadProducts === 'function') loadProducts();
      return true;
    }).catch(function (e) {
      var msg = String(e && e.message || '');
      alert(L('保存失败：', 'Save failed: ') + (/UNIQUE/i.test(msg) ? L('网址别名已被其他商品使用，请换一个', 'slug already used') : msg));
      return false;
    }).then(function (ok) {
      btns.prop('disabled', false).removeClass('opacity-60');
      return ok;
    });
  }

  function close() {
    $('#pe-modal').remove();
    $('body').css('overflow', '');
  }

  function loadCategories() {
    return fetch('/api/admin/list/categories', { headers: authHeader() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        S.categories = (d && d.data) || [];
        var sel = $('#pe-category');
        S.categories.forEach(function (c) {
          sel.append('<option value="' + c.id + '">' + esc(c.name) + (c.is_active ? '' : L('（已隐藏）', ' (hidden)')) + '</option>');
        });
        if (S.base.category_id) sel.val(String(S.base.category_id));
        renderNav();
      })
      .catch(function () { /* 分类加载失败不影响编辑 */ });
  }

  function injectStyle() {
    if (document.getElementById('pe-style')) return;
    var css = '.pe-rich h3{font-size:1.15em;font-weight:700;margin:.6em 0 .3em}.pe-rich p{margin:.4em 0}' +
      '.pe-rich ul{list-style:disc;padding-left:1.4em;margin:.4em 0}.pe-rich ol{list-style:decimal;padding-left:1.4em;margin:.4em 0}' +
      '.pe-rich img{max-width:100%;height:auto}#pe-desc:empty:before{content:attr(data-ph);color:#9ca3af}';
    $('head').append('<style id="pe-style">' + css + '</style>');
  }

  function open(product) {
    initState(product);
    injectStyle();
    $('#pe-modal').remove();
    $('body').append(shell()).css('overflow', 'hidden');
    $('#pe-sections').html(sectionBasic() + sectionDetail() + sectionSales() + sectionOther());
    $('#pe-desc').attr('data-ph', L('介绍产品用途、卖点、材质、包装等，请用英文。', 'Describe uses, features, materials, packaging…'));
    renderImages(); renderSpecs(); renderSales(); renderPreview(); renderNav();
    setActiveNav('basic');
    bind();
    loadCategories();
  }

  // 替换 admin.js 里的旧弹窗
  window.showAddProductModal = function () { open(null); };
  window.editProduct = function (id) {
    fetch('/api/admin/item/products/' + id, { headers: authHeader() })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.success) open(d.data); else alert(L('读取商品失败', 'Failed to load product')); })
      .catch(function () { alert(L('读取商品失败', 'Failed to load product')); });
  };
  window.ProductEditor = { open: open, save: save, _state: function () { return S; }, _buildPayload: buildPayload, _cartesian: cartesian };
})();
