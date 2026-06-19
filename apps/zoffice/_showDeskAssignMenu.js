function _showDeskAssignMenu() {
    if (!selectedItemId) return;
    var selItem = null;
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        if (officeConfig.furniture[i].id === selectedItemId) { selItem = officeConfig.furniture[i]; break; }
    }
    if (!selItem || (selItem.type !== 'desk' && selItem.type !== 'bossDesk')) return;

    // Get list of agents
    var agentNames = AGENT_DEFS.map(function(a) { return a.name; });
    // Get already-assigned agents (exclude this desk)
    var assigned = {};
    officeConfig.furniture.forEach(function(f) {
        if (f.assignedTo && f.id !== selItem.id) assigned[f.assignedTo] = true;
    });

    // Build dropdown menu
    var existing = document.getElementById('desk-assign-menu');
    if (existing) existing.remove();

    var menu = document.createElement('div');
    menu.id = 'desk-assign-menu';
    menu.style.cssText = 'position:fixed;z-index:10001;background:#1a1a2e;border:2px solid #ffd600;border-radius:8px;padding:8px;min-width:160px;box-shadow:0 4px 16px rgba(0,0,0,0.5);';

    // Position near toolbar, clamped to viewport
    document.body.appendChild(menu);
    var tb = _floatingToolbar;
    if (tb) {
        var tbRect = tb.getBoundingClientRect();
        var menuH = menu.offsetHeight || (agentNames.length * 28 + 50);
        var menuW = menu.offsetWidth || 180;
        var left = tbRect.left;
        var top = tbRect.top - menuH - 10;
        // Clamp to viewport
        if (top < 8) top = tbRect.bottom + 8;
        if (left + menuW > window.innerWidth - 8) left = window.innerWidth - menuW - 8;
        if (left < 8) left = 8;
        if (top + menuH > window.innerHeight - 8) top = window.innerHeight - menuH - 8;
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    var title = document.createElement('div');
    title.style.cssText = 'color:#ffd600;font-size:10px;font-family:"Press Start 2P",monospace;margin-bottom:6px;text-align:center;';
    title.textContent = 'ASSIGN DESK';
    menu.appendChild(title);

    // Unassign option
    var unBtn = document.createElement('button');
    unBtn.style.cssText = 'display:block;width:100%;padding:4px 8px;margin:2px 0;background:#2a2a4e;color:#aaa;border:1px solid #3a3a5e;border-radius:4px;cursor:pointer;font-size:11px;text-align:left;';
    unBtn.textContent = '— None —';
    if (!selItem.assignedTo) { unBtn.style.borderColor = '#ffd600'; unBtn.style.color = '#ffd600'; }
    unBtn.addEventListener('click', function() {
        _pushUndo();
        delete selItem.assignedTo;
        _syncAllDeskAssignments();
        menu.remove();
    });
    menu.appendChild(unBtn);

    agentNames.forEach(function(name) {
        var btn = document.createElement('button');
        var isAssigned = assigned[name];
        var isCurrent = selItem.assignedTo === name;
        btn.style.cssText = 'display:block;width:100%;padding:4px 8px;margin:2px 0;background:#2a2a4e;color:' + (isAssigned ? '#555' : '#ccc') + ';border:1px solid ' + (isCurrent ? '#ffd600' : '#3a3a5e') + ';border-radius:4px;cursor:' + (isAssigned ? 'default' : 'pointer') + ';font-size:11px;text-align:left;';
        var agent = AGENT_DEFS.find(function(a) { return a.name === name; });
        btn.textContent = (agent ? agent.emoji + ' ' : '') + name + (isAssigned ? ' (assigned)' : '') + (isCurrent ? ' ✓' : '');
        if (!isAssigned) {
            btn.addEventListener('mouseenter', function() { if (!isCurrent) btn.style.background = '#3a3a5e'; });
            btn.addEventListener('mouseleave', function() { btn.style.background = '#2a2a4e'; });
            btn.addEventListener('click', function() {
                _pushUndo();
                selItem.assignedTo = name;
                _syncAgentToDesk(selItem);
                menu.remove();
            });
        }
        menu.appendChild(btn);
    });

    // Close on click outside
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function _deleteSelectedItem() {
    if (!selectedItemId) return;
    _pushUndo();
    // If deleting a desk, clear the assigned agent's desk reference
    var delItem = officeConfig.furniture.find(function(f) { return f.id === selectedItemId; });
    if (delItem && (delItem.type === 'desk' || delItem.type === 'bossDesk') && delItem.assignedTo) {
        agents.forEach(function(a) {
            if (a.name === delItem.assignedTo) {
                // Move agent to center as fallback
                a.desk = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
                a.targetX = a.desk.x;
                a.targetY = a.desk.y;
            }
        });
    }
    officeConfig.furniture = officeConfig.furniture.filter(function(f) { return f.id !== selectedItemId; });
    selectedItemId = null;
    isDragging = false;
    if (_floatingToolbar) _floatingToolbar.style.display = 'none';
    getInteractionSpots();
    saveOfficeConfig(); // persist deletion + re-derive meeting slots
}

function _updateCatalogSelection() {
    if (!_catalogPanel) return;
    var items = _catalogPanel.querySelectorAll('.catalog-item');
    items.forEach(function(el) {
        if (el.dataset.type === placingType) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
}

// ─── WALL / FLOOR COLOR PICKER ────────────────────────────────

var _colorPickerEl = null;
var _colorPickerTarget = null; // { type: 'wall'|'floor', idx }

function _ensureColorPicker() {
    if (_colorPickerEl) return;
    var el = document.createElement('div');
    el.id = 'edit-color-picker';
    el.style.cssText = [
        'position:fixed; z-index:400; background:#1a1a2e; border:1px solid #ffd600;',
        'border-radius:8px; padding:10px 14px; display:none; flex-direction:column; gap:8px;',
        'box-shadow:0 4px 20px rgba(0,0,0,0.7); font-family:"Press Start 2P",cursive; font-size:7px; color:#ccc;',
        'min-width:200px;'
    ].join('');

    var closeRow = document.createElement('div');
    closeRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
    var titleEl = document.createElement('span');
    titleEl.id = 'edit-cp-title';
    titleEl.style.color = '#ffd600';
    titleEl.textContent = 'COLOR';
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:none;border:1px solid #444;color:#aaa;cursor:pointer;padding:2px 6px;border-radius:3px;font-family:inherit;';
    closeBtn.addEventListener('click', _hideColorPicker);
    closeRow.appendChild(titleEl);
    closeRow.appendChild(closeBtn);
    el.appendChild(closeRow);

    // Row 1
    var row1 = document.createElement('div');
    row1.style.cssText = 'display:flex;align-items:center;gap:8px;';
    var lbl1 = document.createElement('span');
    lbl1.id = 'edit-cp-lbl1';
    lbl1.textContent = 'Main:';
    var inp1 = document.createElement('input');
    inp1.type = 'color'; inp1.id = 'edit-cp-color1';
    inp1.style.cssText = 'width:40px;height:28px;cursor:pointer;border:none;padding:0;border-radius:3px;';
    inp1.addEventListener('input', function() { _setActiveColorInput('edit-cp-color1'); _applyColorPicker(); });
    inp1.addEventListener('focus', function() { _setActiveColorInput('edit-cp-color1'); });
    inp1.addEventListener('click', function() { _setActiveColorInput('edit-cp-color1'); });
    row1.appendChild(lbl1); row1.appendChild(inp1);
    el.appendChild(row1);

    // Row 2
    var row2 = document.createElement('div');
    row2.style.cssText = 'display:flex;align-items:center;gap:8px;';
    var lbl2 = document.createElement('span');
    lbl2.id = 'edit-cp-lbl2';
    lbl2.textContent = 'Accent:';
    var inp2 = document.createElement('input');
    inp2.type = 'color'; inp2.id = 'edit-cp-color2';
    inp2.style.cssText = 'width:40px;height:28px;cursor:pointer;border:none;padding:0;border-radius:3px;';
    inp2.addEventListener('input', function() { _setActiveColorInput('edit-cp-color2'); _applyColorPicker(); });
    inp2.addEventListener('focus', function() { _setActiveColorInput('edit-cp-color2'); });
    inp2.addEventListener('click', function() { _setActiveColorInput('edit-cp-color2'); });
    row2.appendChild(lbl2); row2.appendChild(inp2);
    el.appendChild(row2);

    // Row 3
    var row3 = document.createElement('div');
    row3.id = 'edit-cp-row3';
    row3.style.cssText = 'display:none;align-items:center;gap:8px;';
    var lbl3 = document.createElement('span');
    lbl3.id = 'edit-cp-lbl3';
    lbl3.textContent = 'Trim 2:';
    var inp3 = document.createElement('input');
    inp3.type = 'color'; inp3.id = 'edit-cp-color3';
    inp3.style.cssText = 'width:40px;height:28px;cursor:pointer;border:none;padding:0;border-radius:3px;';
    inp3.addEventListener('input', function() { _setActiveColorInput('edit-cp-color3'); _applyColorPicker(); });
    inp3.addEventListener('focus', function() { _setActiveColorInput('edit-cp-color3'); });
    inp3.addEventListener('click', function() { _setActiveColorInput('edit-cp-color3'); });
    row3.appendChild(lbl3); row3.appendChild(inp3);
    el.appendChild(row3);

    // Favorites
    var favHeader = document.createElement('div');
    favHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:4px;gap:8px;';
    var favTitle = document.createElement('span');
    favTitle.textContent = 'Favorites';
    favTitle.style.cssText = 'color:#bbb;font-size:11px;';
    var favSaveBtn = document.createElement('button');
    favSaveBtn.id = 'edit-cp-save-favorite';
    favSaveBtn.textContent = '★ Save Current';
    favSaveBtn.style.cssText = 'background:#2a2a4e;border:1px solid #555;color:#ddd;cursor:pointer;padding:3px 6px;border-radius:3px;font-family:inherit;font-size:10px;';
    favSaveBtn.addEventListener('click', function() { _saveCurrentColorFavorite(); });
    favHeader.appendChild(favTitle);
    favHeader.appendChild(favSaveBtn);
    el.appendChild(favHeader);

    var favWrap = document.createElement('div');
    favWrap.id = 'edit-cp-favorites';
    favWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    el.appendChild(favWrap);

    document.body.appendChild(el);
    _colorPickerEl = el;
}

function _refreshColorFavoritesUI() {
    var wrap = document.getElementById('edit-cp-favorites');
    if (!wrap) return;
    wrap.innerHTML = '';
    colorFavorites.forEach(function(color, idx) {
        var btn = document.createElement('button');
        btn.className = 'cp-favorite-btn';
        btn.title = color;
        btn.style.cssText = 'width:24px;height:24px;border-radius:4px;border:1px solid rgba(255,255,255,0.35);cursor:pointer;background:' + color + ';';
        btn.addEventListener('click', function() { _applyFavoriteColor(color); });
        btn.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            colorFavorites.splice(idx, 1);
            saveColorFavorites();
            _refreshColorFavoritesUI();
        });
        wrap.appendChild(btn);
    });
}

function _activeColorInput() {
    if (_colorPickerTarget && _colorPickerTarget.activeInputId) {
        var active = document.getElementById(_colorPickerTarget.activeInputId);
        if (active) return active;
    }
    return document.getElementById('edit-cp-color1');
}

function _setActiveColorInput(inputId) {
    if (!_colorPickerTarget) _colorPickerTarget = {};
    _colorPickerTarget.activeInputId = inputId;
}

function _applyFavoriteColor(color) {
    var input = _activeColorInput();
    if (!input) return;
    input.value = color;
    _applyColorPicker();
}

function _saveCurrentColorFavorite() {
    var input = _activeColorInput();
    if (!input || !input.value) return;
    var color = input.value.toLowerCase();
    colorFavorites = colorFavorites.filter(function(c) { return c.toLowerCase() !== color; });
    colorFavorites.unshift(color);
    colorFavorites = colorFavorites.slice(0, 16);
    saveColorFavorites();
    _refreshColorFavoritesUI();
}

function _showWallColorPicker(wallIdx, sx, sy) {
    _ensureColorPicker();
    _colorPickerTarget = { type: 'interior-wall', idx: wallIdx };
    var wall = (officeConfig.walls.interior || [])[wallIdx] || {};
    document.getElementById('edit-cp-title').textContent = 'WALL COLOR';
    document.getElementById('edit-cp-lbl1').textContent = 'Main:';
    document.getElementById('edit-cp-lbl2').textContent = 'Trim:';
    document.getElementById('edit-cp-lbl3').textContent = 'Trim 2:';
    document.getElementById('edit-cp-color1').value = _wallMainColor(wall);
    document.getElementById('edit-cp-color2').value = _wallTrimColor(wall);
    document.getElementById('edit-cp-color3').value = _wallTrim2Color(wall);
    _setActiveColorInput('edit-cp-color1');
    _refreshColorFavoritesUI();
    document.getElementById('edit-cp-color2').parentElement.style.display = 'flex';
    document.getElementById('edit-cp-row3').style.display = 'flex';
    _positionColorPicker(sx, sy);
}

function _showTopWallColorPicker(sx, sy) {
    _ensureColorPicker();
    _colorPickerTarget = { type: 'top-wall' };
    var wall = getTopWallConfig();
    document.getElementById('edit-cp-title').textContent = 'TOP WALL COLOR';
    document.getElementById('edit-cp-lbl1').textContent = 'Main:';
    document.getElementById('edit-cp-lbl2').textContent = 'Trim:';
    document.getElementById('edit-cp-color1').value = wall.color;
    document.getElementById('edit-cp-color2').value = wall.trimColor || wall.accentColor;
    document.getElementById('edit-cp-color2').parentElement.style.display = 'flex';
    document.getElementById('edit-cp-row3').style.display = 'none';
    _setActiveColorInput('edit-cp-color1');
    _refreshColorFavoritesUI();
