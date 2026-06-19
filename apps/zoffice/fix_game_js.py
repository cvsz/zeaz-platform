import sys

def replace_lines(file_path, start_line, end_line, new_content):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    # lines are 0-indexed, start_line is 1-indexed
    new_lines = lines[:start_line-1] + [new_content + '\n'] + lines[end_line:]
    
    with open(file_path, 'w') as f:
        f.writelines(new_lines)

def main():
    file_path = 'app/game.js'
    
    branch_content = """function _showBranchAssignMenu() {
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
            removeMenu();
        });
        menu.appendChild(btn);
    });

    // Close on click outside
    setTimeout(function() {
        const controller = new AbortController();
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { removeMenu(); }
        }, { signal: controller.signal });
    }, 100);
}"""
    
    desk_content = """function _showDeskAssignMenu() {
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

    const controller = new AbortController();
    const removeMenu = () => {
        menu.remove();
        controller.abort();
    };

    unBtn.addEventListener('click', function() {
        _pushUndo();
        delete selItem.assignedTo;
        _syncAllDeskAssignments();
        removeMenu();
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
                removeMenu();
            });
        }
        menu.appendChild(btn);
    });

    // Close on click outside
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { removeMenu(); }
        }, { signal: controller.signal });
    }, 100);
}
"""
    
    replace_lines(file_path, 14000, 14059, branch_content)
    replace_lines(file_path, 14061, 14154, desk_content)

if __name__ == "__main__":
    main()
