import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll use a regex that matches the function and the increment
    pattern = re.compile(r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;', re.DOTALL)
    content = pattern.sub(r'function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {', content)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    # 4. Optimize updateSidebar() DOM rebuilds
    # We'll use a dirty check.
    # First, let's define the variable at the top of the file.
    content = "let _lastSidebarState = null;\n" + content

    # Then, wrap the body of updateSidebar in a check.
    # updateSidebar is at 4456.
    # It looks like:
    # function updateSidebar() {
    #    const container = document.getElementById('branch-sections-container');
    #    if (!container) return;
    #    container.innerHTML = '';
    #    ...
    
    # We want to:
    # function updateSidebar() {
    #    const container = document.getElementById('branch-sections-container');
    #    if (!container) return;
    #    
    #    // ... calculate counts and byBranch ...
    #    const currentState = JSON.stringify({ counts, byBranch });
    #    if (_lastSidebarState === currentState) {
    #        // Still need to update the counts at the bottom!
    #        document.getElementById('count-working').textContent = counts.working;
    #        ...
    #        return;
    #    }
    #    _lastSidebarState = currentState;
    #    container.innerHTML = '';
    #    ...
    # }

    # This is getting complicated for a simple replace.
    # Let's try to find the function and wrap it.
    
    # Actually, the simplest way to avoid the flicker is to only clear container.innerHTML
    # if the content is actually different.
    # But we need the counts for the bottom part regardless.

    # I'll rewrite the function by finding it and replacing it.
    # I'll use the existing implementation and add the state check.

    # Let's find the function start.
    func_pattern = re.compile(r'function updateSidebar\(\) \{', re.DOTALL)
    match = func_pattern.search(content)
    if match:
        start_idx = match.start()
        # Find the end of the function by matching closing brace
        # This is tricky because of nested braces.
        # Let's find the matching brace.
        
        brace_count = 0
        end_idx = -1
        for i in range(start_idx, len(content)):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_idx = i + 1
                    break
        
        if end_idx != -1:
            func_body = content[start_idx:end_idx]
            
            # We'll insert the state check at the beginning of the function.
            # But we need to make sure counts and byBranch are available.
            # They are calculated inside the function.
            
            # Original:
            # function updateSidebar() {
            #    const container = document.getElementById('branch-sections-container');
            #    if (!container) return;
            #    container.innerHTML = '';
            #    ensureValidAgentBranches();
            #
            #    let counts = { working: 0, idle: 0, meeting: 0, break: 0 };
            #    const byBranch = {};
            #    getBranchList().forEach(function(branch) { byBranch[branch.id] = []; });
            #
            #    agents.forEach(agent => { ... });
            #
            #    getBranchList().forEach(function(branch) { ... });
            #
            #    document.getElementById('count-working').textContent = counts.working;
            #    ...
            # }
            
            # Improved:
            # function updateSidebar() {
            #    const container = document.getElementById('branch-sections-container');
            #    if (!container) return;
            #
            #    let counts = { working: 0, idle: 0, meeting: 0, break: 0 };
            #    const byBranch = {};
            #    getBranchList().forEach(function(branch) { byBranch[branch.id] = []; });
            #
            #    agents.forEach(agent => { ... });
            #
            #    const currentState = JSON.stringify({ counts, byBranch });
            #    const wasChanged = _lastSidebarState !== currentState;
            #    _lastSidebarState = currentState;
            #
            #    if (wasChanged) {
            #        container.innerHTML = '';
            #        getBranchList().forEach(function(branch) { ... });
            #    }
            #
            #    document.getElementById('count-working').textContent = counts.working;
            #    ...
            # }
            
            # This is still complex. Let's try a simpler "dirty" approach.
            # I'll replace the whole function.
            
            new_func = """function updateSidebar() {
    const container = document.getElementById('branch-sections-container');
    if (!container) return;

    let counts = { working: 0, idle: 0, meeting: 0, break: 0 };
    const byBranch = {};
    getBranchList().forEach(function(branch) { byBranch[branch.id] = []; });

    agents.forEach(agent => {
        const isMoving = Math.abs(agent.targetX - agent.x) > agent.speed || Math.abs(agent.targetY - agent.y) > agent.speed;
        let displayState = isMoving ? 'moving' : agent.state;
        if (agent.state === 'visiting') displayState = 'meeting';
        if (agent.idleAction === 'lounge') displayState = 'lounge';
        if (agent.idleAction === 'break') displayState = 'break';
        if (agent.idleAction === 'visit') displayState = 'chatting';
        if (agent.idleAction === 'stretch') displayState = 'stretching';
        if (agent.idleAction === 'wander') displayState = 'walking';
        if (agent.idleAction === 'couch') displayState = 'lounging';
        if (agent.idleAction === 'read_book') displayState = 'reading';
        if (agent.idleAction === 'look_window') displayState = 'gazing';
        if (agent.idleAction === 'break_browse') displayState = 'browsing';
        if (agent.idleAction === 'get_snack') displayState = 'snacking';
        if (agent.idleAction === 'make_food') displayState = 'cooking';
        if (agent.idleAction === 'gathering') displayState = 'socializing';
        if (agent.idleAction === 'darts') displayState = 'playing darts 🎯';
        if (agent.idleAction === 'pong') displayState = 'playing ping pong 🏓';
        if (agent.idleAction === 'pong_wait') displayState = 'at ping pong table 🏓';
        if (agent.idleAction === 'pong_spectator') displayState = 'watching ping pong 👀';
        if (agent.idleAction === 'make_coffee') displayState = 'coffee break';
        if (agent.idleAction === 'get_water') displayState = 'hydrating';
        if (agent.idleAction === 'watch_tv') displayState = 'watching TV';
        if (agent.carryItem && !agent.idleAction) displayState = agent.carryItem === 'coffee' ? 'sipping ☕' : agent.carryItem === 'water' ? 'hydrating 💧' : agent.carryItem === 'food' ? 'eating 🍕' : 'snacking 🍫';

        if (agent.state === 'meeting' || agent.state === 'visiting') counts.meeting++;
        else if (agent.state === 'working') counts.working++;
        else if (agent.state === 'lounge' || agent.idleAction === 'lounge') counts.break++;
        else if (agent.state === 'break' || agent.idleAction === 'break') counts.break++;
        else counts.idle++;

        const div = document.createElement('div');
        div.className = 'agent-entry';
        div.innerHTML = `<span class="dot ${displayState}"></span><span class="name">${agent.emoji} ${agent.name}</span><span class="state">${displayState}</span>`;
        div.onclick = () => openModal(agent);
        const branchId = byBranch[agent.branch] ? agent.branch : 'UNASSIGNED';
        byBranch[branchId].push(div);
    });

    const currentState = JSON.stringify({ counts, byBranch });
    const wasChanged = _lastSidebarState !== currentState;
    _lastSidebarState = currentState;

    if (wasChanged) {
        container.innerHTML = '';
        ensureValidAgentBranches();
        getBranchList().forEach(function(branch) {
            const section = document.createElement('div');
            section.className = 'branch-section collapsible ' + getBranchTheme(branch.id);
            if (branch.color) {
                section.style.borderColor = branch.color;
            }

            const header = document.createElement('h4');
            header.className = 'branch-header-row';
            if (branch.color) header.style.color = branch.color;
            header.innerHTML = `<span class="section-arrow">▼</span> ${branch.emoji} ${branch.name}`;
            header.onclick = function(e) { if (e.target.closest('.branch-actions')) return; toggleSection(header); };

            const actions = document.createElement('span');
            actions.className = 'branch-actions';
            if (branch.id !== 'UNASSIGNED') {
                const editBtn = document.createElement('button');
                editBtn.textContent = '✏️';
                editBtn.title = 'Edit branch';
                editBtn.onclick = function(e) { e.stopPropagation(); branchEditPrompt(branch.id); };
                const delBtn = document.createElement('button');
                delBtn.textContent = '🗑️';
                delBtn.title = 'Delete branch';
                delBtn.onclick = function(e) { e.stopPropagation(); branchDeletePrompt(branch.id); };
                actions.appendChild(editBtn);
                actions.appendChild(delBtn);
            }
            header.appendChild(actions);
            section.appendChild(header);

            const body = document.createElement('div');
            body.className = 'section-body';
            body.style.display = 'block';
            const list = document.createElement('div');
            list.className = 'agent-list';
            (byBranch[branch.id] || []).forEach(function(node) { list.appendChild(node); });
            body.appendChild(list);
            if (branch.id === 'UNASSIGNED') {
                const note = document.createElement('div');
                note.className = 'branch-unassigned-note';
                note.textContent = 'Deleting a branch moves agents here.';
                body.appendChild(note);
            }
            section.appendChild(body);
            container.appendChild(section);
        });
    }

    document.getElementById('count-working').textContent = counts.working;
    document.getElementById('count-idle').textContent = counts.idle;
    document.getElementById('count-meeting').textContent = counts.meeting;
    document.getElementById('count-break').textContent = counts.break;
}
"""
            content = content[:start_idx] + new_func + content[end_idx:]

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()
