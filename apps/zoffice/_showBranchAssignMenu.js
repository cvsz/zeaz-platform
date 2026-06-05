function _showBranchAssignMenu() {
    if (!selectedItemId) return;
    var selItem = null;
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        if (officeConfig.furniture[i].id === selectedItemId) { selItem = officeConfig.furniture[i]; break; }
    }
    if (!selItem || selItem.type !== 'branchSign') return;

    var existing = document.getElementById('branch-assign-menu');
    if (existing) existing.remove();

    var menu = document.createElement('div');
    menu.id = 'branch-assign-menu';
    menu.style.cssText = 'position:fixed;z-index:10001;background:#1a1a2e;border:2px solid #ffd600;border-radius:8px;padding:8px;min-width:180px;box-shadow:0 4px 16px rgba(0,0,0,0.5);';

    // Position near toolbar, clamped to viewport
    document.body.appendChild(menu);
    var tb = _floatingToolbar;
    if (tb) {
        var tbRect = tb.getBoundingClientRect();
        var menuH = menu.offsetHeight || 200;
        var left = tbRect.left;
        var top = tbRect.top - menuH - 10;
        if (top < 8) top = tbRect.bottom + 8;
        if (left + 200 > window.innerWidth - 8) left = window.innerWidth - 208;
        if (left < 8) left = 8;
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    var title = document.createElement('div');
    title.style.cssText = 'color:#ffd600;font-size:10px;font-family:"Press Start 2P",monospace;margin-bottom:6px;text-align:center;';
    title.textContent = 'ASSIGN BRANCH';
    menu.appendChild(title);

    var branches = getBranchList();
    branches.forEach(function(branch) {
        var btn = document.createElement('button');
        var isCurrent = selItem.branchId === branch.id;
        var neonColor = branch.color || _NEON_COLORS[branch.theme] || '#ccc';
        btn.style.cssText = 'display:block;width:100%;padding:5px 8px;margin:2px 0;background:#2a2a4e;color:' + neonColor + ';border:1px solid ' + (isCurrent ? '#ffd600' : '#3a3a5e') + ';border-radius:4px;cursor:pointer;font-size:11px;text-align:left;';
        btn.textContent = branch.emoji + ' ' + branch.name + (isCurrent ? ' ✓' : '');
        btn.addEventListener('mouseenter', function() { if (!isCurrent) btn.style.background = '#3a3a5e'; });
        btn.addEventListener('mouseleave', function() { btn.style.background = '#2a2a4e'; });
        btn.addEventListener('click', function() {
            _pushUndo();
            selItem.branchId = branch.id;
            saveOfficeConfig();
            menu.remove();
        });
        menu.appendChild(btn);
    });

    // Close on click outside
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
        });
    }, 100);
}

function _showDeskAssignMenu() {
    if (!selectedItemId) return;
    var selItem = null;
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        if (officeConfig.furniture[i].id === selectedItemId) { selItem = officeConfig.furniture[i]; break; }
