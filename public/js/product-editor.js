/*
 * 产品编辑器（参照妙手 ERP 的布局）
 * 标签页：基本信息 / 销售属性(SKU) / 产品属性 / 产品图片
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

  function initState(p) {
    p = p || {};
    var specs = p.specifications;
    if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch (e) { specs = {}; } }
    var variants = p.variants;
    if (typeof variants === 'string') { try { variants = JSON.parse(variants); } catch (e) { variants = null; } }
    var images = p.images;
    if (typeof images === 'string') { try { images = JSON.parse(images); } catch (e) { images = []; } }

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
      specs: Object.keys(specs || {}).map(function (k) { return [k, String(specs[k])]; }),
      attrs: ((variants && variants.attrs) || []).map(function (a) {
        return { name: a.name || '', values: (a.values || []).slice() };
      }),
      skuMap: skuMap,
      tab: 'basic',
      uploading: 0
    };
    if (!S.specs.length) S.specs.push(['', '']);
  }

  /* ---------- 外壳 ---------- */
  function shell() {
    var tabs = [
      ['basic', L('基本信息', 'Basic Info')],
      ['sales', L('销售属性', 'Variants / SKU')],
      ['attrs', L('产品属性', 'Specifications')],
      ['images', L('产品图片', 'Images')]
    ];
    return '' +
      '<div id="pe-modal" class="fixed inset-0 z-50 bg-gray-100 flex flex-col">' +
      '  <div class="bg-white border-b px-6 py-3 flex items-center gap-4">' +
      '    <h3 class="text-lg font-bold">' + (S.id ? L('编辑产品', 'Edit Product') : L('添加产品', 'Add Product')) + '</h3>' +
      '    <span id="pe-status" class="text-sm text-gray-500"></span>' +
      '    <label class="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" id="pe-active" ' + (S.base.is_active ? 'checked' : '') + '> ' + L('上架（前台显示）', 'Active (visible)') + '</label>' +
      '    <button type="button" id="pe-cancel" class="btn btn-outline">' + L('取消', 'Cancel') + '</button>' +
      '    <button type="button" id="pe-save" class="btn">' + L('保存', 'Save') + '</button>' +
      '  </div>' +
      '  <div class="bg-white border-b px-6 flex gap-1">' +
      tabs.map(function (t) {
        return '<button type="button" class="pe-tab px-4 py-3 text-sm font-medium border-b-2 ' +
          (t[0] === S.tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900') +
          '" data-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') +
      '  </div>' +
      '  <div class="flex-1 overflow-y-auto"><div class="max-w-6xl mx-auto p-6">' +
      '    <div class="pe-panel" data-panel="basic"></div>' +
      '    <div class="pe-panel hidden" data-panel="sales"></div>' +
      '    <div class="pe-panel hidden" data-panel="attrs"></div>' +
      '    <div class="pe-panel hidden" data-panel="images"></div>' +
      '  </div></div>' +
      '</div>';
  }

  function card(title, hint, body) {
    return '<div class="bg-white rounded-lg shadow-sm p-6 mb-6">' +
      '<div class="mb-4"><h4 class="font-semibold">' + title + '</h4>' +
      (hint ? '<p class="text-xs text-gray-500 mt-1">' + hint + '</p>' : '') + '</div>' + body + '</div>';
  }
  var inputCls = 'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  /* ---------- 基本信息 ---------- */
  function renderBasic() {
    var b = S.base;
    var html = card(L('基本信息', 'Basic Info'), L('标题和描述会直接显示给海外客户，请填英文。', 'Shown to customers.'),
      '<div class="space-y-4">' +
      '<div><label class="block text-sm font-medium mb-1">' + L('产品标题', 'Product Name') + ' <span class="text-red-500">*</span></label>' +
      '<input id="pe-name" class="' + inputCls + '" value="' + esc(b.name) + '" maxlength="200">' +
      '<p class="text-xs text-gray-400 mt-1"><span id="pe-name-count">' + b.name.length + '</span>/200</p></div>' +
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
      '<div><label class="block text-sm font-medium mb-1">' + L('分类', 'Category') + '</label>' +
      '<select id="pe-category" class="' + inputCls + '"><option value="">' + L('请选择', 'Select') + '</option></select></div>' +
      '<div><label class="block text-sm font-medium mb-1">' + L('网址别名 (slug)', 'Slug') + '</label>' +
      '<input id="pe-slug" class="' + inputCls + '" value="' + esc(b.slug) + '" placeholder="' + L('留空则按标题自动生成', 'auto from name') + '"></div>' +
      '</div>' +
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
      '<div><label class="block text-sm font-medium mb-1">' + L('起价 (USD)', 'Starting Price (USD)') + '</label>' +
      '<input id="pe-price" type="number" step="0.01" min="0" class="' + inputCls + '" value="' + esc(b.price) + '">' +
      '<p class="text-xs text-gray-400 mt-1">' + L('设置了 SKU 价格时，保存会自动取最低 SKU 价', 'Auto = lowest SKU price if SKUs have prices') + '</p></div>' +
      '<div><label class="block text-sm font-medium mb-1">' + L('起订量', 'MOQ') + '</label>' +
      '<input id="pe-moq" type="number" min="1" class="' + inputCls + '" value="' + esc(b.min_order_qty) + '"></div>' +
      '</div>' +
      '<div><label class="block text-sm font-medium mb-1">' + L('简短描述（列表卡片上显示）', 'Short Description') + '</label>' +
      '<textarea id="pe-short" rows="2" class="' + inputCls + '">' + esc(b.short_description) + '</textarea></div>' +
      '<div><label class="block text-sm font-medium mb-1">' + L('详细描述（支持 HTML，如 &lt;p&gt; &lt;ul&gt;&lt;li&gt;）', 'Full Description (HTML allowed)') + '</label>' +
      '<textarea id="pe-desc" rows="8" class="' + inputCls + ' font-mono text-sm">' + esc(b.description) + '</textarea></div>' +
      '<label class="flex items-center gap-2 text-sm"><input type="checkbox" id="pe-featured" ' + (b.is_featured ? 'checked' : '') + '> ' + L('首页推荐', 'Featured on homepage') + '</label>' +
      '</div>');
    $('[data-panel="basic"]').html(html);
    loadCategories();
  }

  function loadCategories() {
    fetch('/api/admin/list/categories', { headers: authHeader() })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var list = (d && d.data) || [];
        var sel = $('#pe-category');
        list.forEach(function (c) {
          sel.append('<option value="' + c.id + '">' + esc(c.name) + (c.is_active ? '' : L('（已隐藏）', ' (hidden)')) + '</option>');
        });
        if (S.base.category_id) sel.val(String(S.base.category_id));
      })
      .catch(function () { /* 分类加载失败不影响编辑 */ });
  }

  function readBasic() {
    if (!$('#pe-name').length) return;
    S.base.name = $('#pe-name').val().trim();
    S.base.slug = $('#pe-slug').val().trim();
    S.base.category_id = $('#pe-category').val();
    S.base.price = $('#pe-price').val();
    S.base.min_order_qty = $('#pe-moq').val();
    S.base.short_description = $('#pe-short').val();
    S.base.description = $('#pe-desc').val();
    S.base.is_featured = $('#pe-featured').is(':checked');
  }

  /* ---------- 销售属性 / SKU ---------- */
  function currentSkus() {
    return cartesian(S.attrs).map(function (values) {
      var k = skuKey(values);
      var old = S.skuMap[k] || {};
      var row = {
        values: values, code: old.code || '', price: old.price != null ? old.price : '',
        moq: old.moq != null ? old.moq : '', image: old.image || '', enabled: old.enabled !== false
      };
      S.skuMap[k] = row;
      return row;
    });
  }

  function renderSales() {
    var attrsHtml = S.attrs.map(function (a, ai) {
      return '<div class="border rounded-lg p-4 mb-3 bg-gray-50">' +
        '<div class="flex items-center gap-3 mb-3">' +
        '<label class="text-sm font-medium w-20">' + L('属性名', 'Name') + '</label>' +
        '<input class="pe-attr-name ' + inputCls + ' max-w-xs" data-ai="' + ai + '" value="' + esc(a.name) + '" placeholder="Shell Color">' +
        '<button type="button" class="pe-attr-del ml-auto text-red-600 text-sm hover:underline" data-ai="' + ai + '">' + L('删除此属性', 'Remove') + '</button>' +
        '</div>' +
        '<div class="flex items-start gap-3">' +
        '<label class="text-sm font-medium w-20 pt-1">' + L('属性值', 'Values') + '</label>' +
        '<div class="flex-1"><div class="flex flex-wrap gap-2 mb-2">' +
        a.values.map(function (v, vi) {
          return '<span class="inline-flex items-center gap-1 bg-white border border-blue-300 text-blue-700 rounded px-2 py-1 text-sm">' + esc(v) +
            '<button type="button" class="pe-val-del text-gray-400 hover:text-red-600" data-ai="' + ai + '" data-vi="' + vi + '" title="' + L('删除', 'Remove') + '">&times;</button></span>';
        }).join('') +
        '</div>' +
        '<div class="flex gap-2"><input class="pe-val-input ' + inputCls + ' max-w-xs" data-ai="' + ai + '" placeholder="' + L('输入后按回车，可用逗号一次加多个', 'Type and press Enter; comma for multiple') + '">' +
        '<button type="button" class="pe-val-add btn btn-outline btn-sm" data-ai="' + ai + '">' + L('添加', 'Add') + '</button></div>' +
        '</div></div></div>';
    }).join('');

    var attrCard = card(L('销售属性', 'Variant Attributes'),
      L('例如：Shell Color = Black / Brown / White，Light Color = White / Warm / RGB。属性名和属性值会显示给海外客户，请填英文。最多 3 个属性。',
        'e.g. Shell Color = Black / Brown / White. Max 3 attributes.'),
      (attrsHtml || '<p class="text-sm text-gray-500 mb-3">' + L('还没有销售属性。没有多款式的产品可以不填。', 'No variants yet.') + '</p>') +
      (S.attrs.length < MAX_ATTRS ? '<button type="button" id="pe-attr-add" class="btn btn-outline btn-sm">+ ' + L('添加销售属性', 'Add attribute') + '</button>' : ''));

    var skus = currentSkus();
    var skuCard = '';
    if (skus.length) {
      var named = S.attrs.filter(function (a) { return a.values.length; });
      var imgOptions = function (sel) {
        return '<option value="">' + L('无', 'None') + '</option>' + S.images.map(function (u, i) {
          return '<option value="' + esc(u) + '"' + (u === sel ? ' selected' : '') + '>' + L('图', 'Img ') + (i + 1) + '</option>';
        }).join('');
      };
      skuCard = card(L('SKU 列表', 'SKU List') + ' <span class="text-sm font-normal text-gray-500">(' + skus.length + ')</span>',
        L('价格和起订量留空则使用基本信息里的起价和起订量。图片从「产品图片」里选择，客户选中该款式时会切换到这张图。',
          'Empty price/MOQ falls back to the base values. Pick an image from the Images tab.'),
        '<div class="flex flex-wrap items-center gap-2 mb-4 p-3 bg-blue-50 rounded text-sm">' +
        '<span class="font-medium">' + L('批量填写', 'Batch fill') + '：</span>' +
        '<input id="pe-batch-price" type="number" step="0.01" min="0" class="px-2 py-1 border rounded w-28" placeholder="' + L('价格', 'Price') + '">' +
        '<input id="pe-batch-moq" type="number" min="1" class="px-2 py-1 border rounded w-28" placeholder="' + L('起订量', 'MOQ') + '">' +
        '<button type="button" id="pe-batch-apply" class="btn btn-sm">' + L('应用到全部', 'Apply to all') + '</button>' +
        '</div>' +
        '<div class="overflow-x-auto"><table class="w-full text-sm border">' +
        '<thead class="bg-gray-50"><tr>' +
        named.map(function (a) { return '<th class="border px-3 py-2 text-left">' + esc(a.name || L('未命名', 'Unnamed')) + '</th>'; }).join('') +
        '<th class="border px-3 py-2 text-left">' + L('SKU 编码', 'SKU Code') + '</th>' +
        '<th class="border px-3 py-2 text-left">' + L('价格 (USD)', 'Price (USD)') + '</th>' +
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
        '</tbody></table></div>');
    }
    $('[data-panel="sales"]').html(attrCard + skuCard);
  }

  function addValues(ai, raw) {
    var a = S.attrs[ai];
    if (!a) return;
    String(raw || '').split(/[,，\n]/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (v) {
      if (a.values.indexOf(v) === -1) a.values.push(v);
    });
  }

  /* ---------- 产品属性 ---------- */
  function renderAttrs() {
    var rows = S.specs.map(function (r, i) {
      return '<tr>' +
        '<td class="border px-2 py-1"><input class="pe-spec ' + inputCls + '" data-i="' + i + '" data-c="0" value="' + esc(r[0]) + '" placeholder="Battery Capacity"></td>' +
        '<td class="border px-2 py-1"><input class="pe-spec ' + inputCls + '" data-i="' + i + '" data-c="1" value="' + esc(r[1]) + '" placeholder="600mAh"></td>' +
        '<td class="border px-2 py-1 text-center whitespace-nowrap">' +
        '<button type="button" class="pe-spec-up px-1 text-gray-500 hover:text-blue-600" data-i="' + i + '" title="' + L('上移', 'Up') + '">&uarr;</button>' +
        '<button type="button" class="pe-spec-down px-1 text-gray-500 hover:text-blue-600" data-i="' + i + '" title="' + L('下移', 'Down') + '">&darr;</button>' +
        '<button type="button" class="pe-spec-del px-1 text-red-500 hover:text-red-700" data-i="' + i + '" title="' + L('删除', 'Remove') + '">&times;</button>' +
        '</td></tr>';
    }).join('');
    var html = card(L('产品属性', 'Specifications'),
      L('会显示在详情页的规格表里，请填英文。也可以把「属性名: 属性值」一行一条粘贴到下面的批量框里。', 'Shown in the spec table on the product page.'),
      '<table class="w-full text-sm border mb-3"><thead class="bg-gray-50"><tr>' +
      '<th class="border px-3 py-2 text-left w-2/5">' + L('属性名', 'Name') + '</th>' +
      '<th class="border px-3 py-2 text-left">' + L('属性值', 'Value') + '</th>' +
      '<th class="border px-3 py-2 w-24"></th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<button type="button" id="pe-spec-add" class="btn btn-outline btn-sm mb-4">+ ' + L('添加一行', 'Add row') + '</button>' +
      '<details class="text-sm"><summary class="cursor-pointer text-blue-600">' + L('批量粘贴', 'Bulk paste') + '</summary>' +
      '<textarea id="pe-spec-bulk" rows="5" class="' + inputCls + ' mt-2 font-mono text-sm" placeholder="Light Source: LED&#10;Battery: 600mAh Ni-MH&#10;Waterproof: IP44"></textarea>' +
      '<button type="button" id="pe-spec-bulk-apply" class="btn btn-sm mt-2">' + L('追加到表格', 'Append') + '</button></details>');
    $('[data-panel="attrs"]').html(html);
  }

  /* ---------- 产品图片 ---------- */
  function renderImages() {
    var grid = S.images.map(function (u, i) {
      return '<div class="pe-img relative group border-2 ' + (i === 0 ? 'border-blue-500' : 'border-gray-200') + ' rounded-lg bg-white aspect-square flex items-center justify-center p-2 cursor-move" draggable="true" data-i="' + i + '">' +
        '<img src="' + esc(u) + '" class="max-w-full max-h-full object-contain pointer-events-none">' +
        (i === 0 ? '<span class="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">' + L('主图', 'Main') + '</span>' :
          '<span class="absolute top-1 left-1 bg-gray-700 bg-opacity-70 text-white text-xs px-2 py-0.5 rounded">' + (i + 1) + '</span>') +
        '<div class="absolute bottom-1 right-1 hidden group-hover:flex gap-1">' +
        (i > 0 ? '<button type="button" class="pe-img-main bg-white border rounded px-2 py-0.5 text-xs hover:bg-blue-50" data-i="' + i + '">' + L('设为主图', 'Set main') + '</button>' : '') +
        '<button type="button" class="pe-img-del bg-white border rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50" data-i="' + i + '">' + L('删除', 'Delete') + '</button>' +
        '</div></div>';
    }).join('');
    var html = card(L('产品图片', 'Product Images') + ' <span class="text-sm font-normal text-gray-500">(' + S.images.length + ')</span>',
      L('第一张是主图，显示在产品卡片上，建议用白底、没有中文字的正方形图。拖动图片可以调整顺序。单张不超过 5MB，支持 JPG / PNG / WebP。',
        'First image is the main image. Drag to reorder. Max 5MB each.'),
      '<div id="pe-drop" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">' +
      '<p class="font-medium">' + L('把图片拖到这里，或点击选择文件（可多选）', 'Drop images here or click to choose') + '</p>' +
      '<p id="pe-upload-msg" class="text-sm text-gray-500 mt-1"></p>' +
      '<input id="pe-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple class="hidden"></div>' +
      '<div class="flex gap-2 mb-4"><input id="pe-img-url" class="' + inputCls + '" placeholder="' + L('或粘贴图片网址，多个用逗号分隔', 'Or paste image URLs, comma separated') + '">' +
      '<button type="button" id="pe-img-url-add" class="btn btn-outline whitespace-nowrap">' + L('添加网址', 'Add URL') + '</button></div>' +
      (S.images.length ? '<div id="pe-grid" class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">' + grid + '</div>' :
        '<p class="text-sm text-gray-500">' + L('还没有图片', 'No images yet') + '</p>'));
    $('[data-panel="images"]').html(html);
  }

  function setUploadMsg(msg, isErr) {
    $('#pe-upload-msg').text(msg || '').toggleClass('text-red-600', !!isErr).toggleClass('text-gray-500', !isErr);
  }

  function uploadFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    var allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    var bad = files.filter(function (f) { return allowed.indexOf(f.type) === -1 || f.size > MAX_FILE; });
    files = files.filter(function (f) { return bad.indexOf(f) === -1; });
    if (bad.length) alert(L('以下文件格式不支持或超过 5MB，已跳过：\n', 'Skipped (type or >5MB):\n') + bad.map(function (f) { return f.name; }).join('\n'));
    if (!files.length) return;

    var total = files.length, done = 0, failed = 0;
    var slots = files.map(function () { return null; });
    S.uploading += total;
    setUploadMsg(L('上传中 0/', 'Uploading 0/') + total);

    // 逐张上传，保持选择顺序；网络慢时比并发更稳
    files.reduce(function (p, f, idx) {
      return p.then(function () {
        var fd = new FormData();
        fd.append('file', f);
        return fetch('/api/upload/image', { method: 'POST', headers: authHeader(), body: fd })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d && d.success && d.data && d.data.url) slots[idx] = d.data.url; else failed++;
          })
          .catch(function () { failed++; })
          .then(function () {
            done++;
            S.uploading--;
            setUploadMsg(L('上传中 ', 'Uploading ') + done + '/' + total);
          });
      });
    }, Promise.resolve()).then(function () {
      slots.forEach(function (u) { if (u) S.images.push(u); });
      renderImages();
      setUploadMsg(failed ? L('上传完成，失败 ', 'Done, failed: ') + failed + L(' 张', '') : L('上传完成', 'Upload complete'), failed > 0);
    });
  }

  /* ---------- 事件 ---------- */
  function bind() {
    var m = $('#pe-modal');

    m.on('click', '.pe-tab', function () {
      readBasic();
      S.tab = $(this).data('tab');
      m.find('.pe-tab').removeClass('border-blue-600 text-blue-600').addClass('border-transparent text-gray-600');
      $(this).addClass('border-blue-600 text-blue-600').removeClass('border-transparent text-gray-600');
      m.find('.pe-panel').addClass('hidden');
      m.find('[data-panel="' + S.tab + '"]').removeClass('hidden');
      if (S.tab === 'sales') renderSales(); // 图片可能有变化，刷新 SKU 图片下拉
    });
    m.on('input', '#pe-name', function () { $('#pe-name-count').text(this.value.length); });
    m.on('click', '#pe-cancel', function () {
      if (confirm(L('放弃未保存的修改？', 'Discard unsaved changes?'))) close();
    });
    m.on('click', '#pe-save', save);

    // 销售属性
    m.on('click', '#pe-attr-add', function () { if (S.attrs.length < MAX_ATTRS) { S.attrs.push({ name: '', values: [] }); renderSales(); } });
    m.on('click', '.pe-attr-del', function () {
      if (!confirm(L('删除这个属性会重新生成 SKU 列表，确定吗？', 'Remove this attribute?'))) return;
      S.attrs.splice(+$(this).data('ai'), 1); renderSales();
    });
    m.on('change', '.pe-attr-name', function () { S.attrs[+$(this).data('ai')].name = this.value.trim(); renderSales(); });
    m.on('keydown', '.pe-val-input', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addValues(+$(this).data('ai'), this.value); renderSales(); $('.pe-val-input[data-ai="' + $(this).data('ai') + '"]').focus(); }
    });
    m.on('click', '.pe-val-add', function () {
      var ai = +$(this).data('ai'); addValues(ai, $('.pe-val-input[data-ai="' + ai + '"]').val()); renderSales();
    });
    m.on('click', '.pe-val-del', function () { S.attrs[+$(this).data('ai')].values.splice(+$(this).data('vi'), 1); renderSales(); });
    m.on('change', '.pe-sku-f', function () {
      var row = S.skuMap[$(this).attr('data-k')], f = $(this).data('f');
      if (!row) return;
      row[f] = f === 'enabled' ? this.checked : this.value;
      if (f === 'enabled' || f === 'image') renderSales();
    });
    m.on('click', '#pe-batch-apply', function () {
      var p = $('#pe-batch-price').val(), q = $('#pe-batch-moq').val();
      currentSkus().forEach(function (s) { if (p !== '') s.price = p; if (q !== '') s.moq = q; });
      renderSales();
    });

    // 产品属性
    m.on('input', '.pe-spec', function () { S.specs[+$(this).data('i')][+$(this).data('c')] = this.value; });
    m.on('click', '#pe-spec-add', function () { S.specs.push(['', '']); renderAttrs(); });
    m.on('click', '.pe-spec-del', function () { S.specs.splice(+$(this).data('i'), 1); if (!S.specs.length) S.specs.push(['', '']); renderAttrs(); });
    m.on('click', '.pe-spec-up, .pe-spec-down', function () {
      var i = +$(this).data('i'), j = $(this).hasClass('pe-spec-up') ? i - 1 : i + 1;
      if (j < 0 || j >= S.specs.length) return;
      var t = S.specs[i]; S.specs[i] = S.specs[j]; S.specs[j] = t; renderAttrs();
    });
    m.on('click', '#pe-spec-bulk-apply', function () {
      var lines = String($('#pe-spec-bulk').val() || '').split('\n');
      S.specs = S.specs.filter(function (r) { return r[0] || r[1]; });
      lines.forEach(function (ln) {
        var mm = ln.match(/^\s*([^:：\t]+)[:：\t]\s*(.+?)\s*$/);
        if (mm) S.specs.push([mm[1].trim(), mm[2]]);
      });
      if (!S.specs.length) S.specs.push(['', '']);
      renderAttrs();
    });

    // 图片
    m.on('click', '#pe-drop', function (e) { if (e.target.id !== 'pe-file') $('#pe-file').trigger('click'); });
    m.on('change', '#pe-file', function () { uploadFiles(this.files); this.value = ''; });
    m.on('dragover', '#pe-drop', function (e) { e.preventDefault(); $(this).addClass('border-blue-400 bg-blue-50'); });
    m.on('dragleave', '#pe-drop', function () { $(this).removeClass('border-blue-400 bg-blue-50'); });
    m.on('drop', '#pe-drop', function (e) {
      e.preventDefault(); e.stopPropagation(); $(this).removeClass('border-blue-400 bg-blue-50');
      var dt = e.originalEvent.dataTransfer; if (dt && dt.files && dt.files.length) uploadFiles(dt.files);
    });
    m.on('click', '#pe-img-url-add', function () {
      String($('#pe-img-url').val() || '').split(/[,\s]+/).map(function (x) { return x.trim(); })
        .filter(function (x) { return /^(https?:\/\/|\/)/.test(x); })
        .forEach(function (u) { if (S.images.indexOf(u) === -1) S.images.push(u); });
      renderImages();
    });
    m.on('click', '.pe-img-del', function (e) { e.stopPropagation(); S.images.splice(+$(this).data('i'), 1); renderImages(); });
    m.on('click', '.pe-img-main', function (e) {
      e.stopPropagation(); var i = +$(this).data('i'); S.images.unshift(S.images.splice(i, 1)[0]); renderImages();
    });
    var dragFrom = null;
    m.on('dragstart', '.pe-img', function (e) {
      dragFrom = +$(this).data('i');
      var dt = e.originalEvent.dataTransfer;
      dt.effectAllowed = 'move';
      try { dt.setData('text/plain', String(dragFrom)); } catch (err) { /* Firefox 需要 setData 才能拖动 */ }
    });
    m.on('dragover', '.pe-img', function (e) { if (dragFrom !== null) { e.preventDefault(); $(this).addClass('ring-2 ring-blue-400'); } });
    m.on('dragleave', '.pe-img', function () { $(this).removeClass('ring-2 ring-blue-400'); });
    m.on('drop', '.pe-img', function (e) {
      if (dragFrom === null) return;
      e.preventDefault(); e.stopPropagation();
      var to = +$(this).data('i');
      if (to !== dragFrom) { var it = S.images.splice(dragFrom, 1)[0]; S.images.splice(to, 0, it); }
      dragFrom = null; renderImages();
    });
    m.on('dragend', '.pe-img', function () { dragFrom = null; });
    // 文件拖到编辑器其他位置时，不让浏览器直接打开图片，而是照常上传
    m.on('dragover', function (e) { e.preventDefault(); });
    m.on('drop', function (e) {
      e.preventDefault();
      var dt = e.originalEvent && e.originalEvent.dataTransfer;
      if (dragFrom === null && dt && dt.files && dt.files.length) {
        if (S.tab !== 'images') $('.pe-tab[data-tab="images"]').trigger('click');
        uploadFiles(dt.files);
      }
      dragFrom = null;
    });
  }

  /* ---------- 保存 ---------- */
  function buildPayload() {
    readBasic();
    S.base.is_active = $('#pe-active').is(':checked');
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
      name: b.name,
      slug: b.slug || slugify(b.name),
      category_id: b.category_id ? parseInt(b.category_id, 10) : null,
      short_description: b.short_description,
      description: b.description,
      price: isFinite(price) ? price : null,
      min_order_qty: parseInt(b.min_order_qty, 10) || 1,
      is_featured: b.is_featured ? 1 : 0,
      is_active: b.is_active ? 1 : 0,
      images: S.images.slice(),
      specifications: specs,
      variants: attrs.length ? { attrs: attrs, skus: skus } : null
    };
  }

  function validate(p) {
    if (!p.name) return L('请填写产品标题', 'Product name is required');
    if (!p.slug) return L('网址别名无法从标题生成，请手动填写英文别名', 'Please enter a slug');
    if (S.uploading > 0) return L('图片还在上传，请稍等', 'Images are still uploading');
    var unnamed = S.attrs.some(function (a) { return a.values.length && !a.name.trim(); });
    if (unnamed) return L('有销售属性没填属性名', 'A variant attribute has no name');
    return '';
  }

  function save() {
    var p = buildPayload();
    var err = validate(p);
    if (err) { alert(err); return; }
    var btn = $('#pe-save').prop('disabled', true).text(L('保存中…', 'Saving…'));
    fetch(S.id ? '/api/admin/products/' + S.id : '/api/admin/products', {
      method: S.id ? 'PUT' : 'POST',
      headers: $.extend({ 'Content-Type': 'application/json' }, authHeader()),
      body: JSON.stringify(p)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
    }).then(function (res) {
      if (!res.ok || res.d.success === false) throw new Error(res.d.error || ('HTTP error'));
      if (!S.id && res.d.data && res.d.data.id) S.id = res.d.data.id;
      $('#pe-status').text(L('已保存 ', 'Saved ') + new Date().toLocaleTimeString());
      if (typeof loadProducts === 'function') loadProducts();
    }).catch(function (e) {
      var msg = String(e && e.message || '');
      alert(L('保存失败：', 'Save failed: ') + (/UNIQUE/i.test(msg) ? L('网址别名已被其他产品使用，请换一个', 'slug already used') : msg));
    }).then(function () {
      btn.prop('disabled', false).text(L('保存', 'Save'));
    });
  }

  function close() {
    $('#pe-modal').remove();
    $('body').css('overflow', '');
  }

  function open(product) {
    initState(product);
    $('#pe-modal').remove();
    $('body').append(shell()).css('overflow', 'hidden');
    renderBasic(); renderSales(); renderAttrs(); renderImages();
    bind();
  }

  // 替换 admin.js 里的旧弹窗
  window.showAddProductModal = function () { open(null); };
  window.editProduct = function (id) {
    fetch('/api/admin/item/products/' + id, { headers: authHeader() })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.success) open(d.data); else alert(L('读取产品失败', 'Failed to load product')); })
      .catch(function () { alert(L('读取产品失败', 'Failed to load product')); });
  };
  window.ProductEditor = { open: open, _state: function () { return S; }, _buildPayload: buildPayload, _cartesian: cartesian };
})();
