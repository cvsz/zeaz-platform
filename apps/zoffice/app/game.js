let _lastSidebarState = null;
// Update ambient light cache once per frame
    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;
    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;
    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;
    if (!canvas) {
        canvas = document.getElementById('officeCanvas');
        if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    _weatherTick++;

    _updateAmbientCache();
    // Clear entire canvas
    ctx.fillStyle = '#263238';
    ctx.fillRect(0, 0, displayW, displayH);

    // Draw world objects with camera
    ctx.save();
    applyCameraTransform();
    // Clip to world bounds so nothing draws outside
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();
    _perfStart('environment'); drawEnvironment(); _perfEnd('environment');
    _rimFrame++;

    // ─── Z-ORDER FIX: Split desk char items into behind-wall vs normal ───
    // Desk char items for desks NOT behind walls are drawn here (before occluders,
    // they'll be covered if near a wall, but that's handled in the front-of-wall redraw).
    // Desk char items for desks BEHIND walls are drawn with the behind-wall agents.
    _perfStart('deskItems');
    var _behindWallDesks = []; // agents whose desks are behind a wall
    agents.forEach(a => {
        if (_isDeskBehindHorizontalWall(a.desk.x, a.desk.y)) {
            _behindWallDesks.push(a);
        } else {
            ctx.save();
            ctx.translate(a.desk.x, a.desk.y);
            a._drawDeskCharItem(ctx);
            ctx.restore();
        }
    });
    _perfEnd('deskItems');

    _perfStart('agents');
    agents.forEach(a => { a.update(); maybeThrowAirplane(a); maybeStartRPS(a); maybeStartSocial(a); maybeStartDarts(a); maybeStartPong(a); _maybePetInteraction(a); if (a._petCooldown > 0) a._petCooldown--; });
    updatePets();
    // Merge agents + pets into one list for proper Y-sorting
    var _allEntities = agents.concat(officePets);
    _allEntities.sort((a, b) => a.y - b.y);
    var _behindWalls = [];
    var _frontWalls = [];
    _allEntities.forEach(function(a) {
        if (_isAgentBehindHorizontalWall(a)) _behindWalls.push(a);
        else _frontWalls.push(a);
    });

    // ─── Draw behind-wall desk char items, then behind-wall agents ───
    // Both render BEFORE wall occluders, so they appear BEHIND the wall face.
    _behindWallDesks.forEach(function(a) {
        ctx.save();
        ctx.translate(a.desk.x, a.desk.y);
        a._drawDeskCharItem(ctx);
        ctx.restore();
    });
    _behindWalls.forEach(function(a) { a.draw(); });
    _perfEnd('agents');

    _perfStart('wallOccluders'); drawInteriorWallOccluders(); _perfEnd('wallOccluders');

    // Redraw vertical walls going down (they must stay on top of horizontal wall occluders)
    var _intWalls = (officeConfig.walls && officeConfig.walls.interior) || [];
    _intWalls.forEach(function(wall, idx) {
        if (wall.x1 === wall.x2 && _verticalWallGoesDown(wall, _intWalls)) {
            _drawSingleWall(wall, idx);
        }
    });

    // ─── Z-ORDER FIX: Only redraw furniture that is IN FRONT of walls ───
    // Furniture behind walls was already drawn in drawEnvironment() and stays
    // behind the wall occluder. Only furniture in front gets redrawn on top.
    officeConfig.furniture.forEach(function(item) {
        if (item.type === 'branchSign' || item.type === 'textLabel') return;
        if (item.type === 'wall' || item.type === 'door') return;
        if (_isFurnitureNearHorizontalWall(item) && _isFurnitureInFrontOfWall(item)) {
            drawFurnitureItem(item);
        }
    });

    // ─── Desk char items for IN-FRONT desks near walls also need redraw ───
    // (They were drawn before occluders, so they got covered by the wall face.
    // Redraw them now so they appear on top of the wall, matching their desk.)
    agents.forEach(function(a) {
        if (_behindWallDesks.indexOf(a) >= 0) return; // skip behind-wall desks
        // Find the furniture item for this desk
        var deskItem = officeConfig.furniture.find(function(f) {
            return (f.type === 'desk' || f.type === 'bossDesk') && f.x === a.desk.x && f.y === a.desk.y;
        });
        if (deskItem && _isFurnitureNearHorizontalWall(deskItem) && _isFurnitureInFrontOfWall(deskItem)) {
            ctx.save();
            ctx.translate(a.desk.x, a.desk.y);
            a._drawDeskCharItem(ctx);
            ctx.restore();
        }
    });

    // Labels on top of walls
    officeConfig.furniture.forEach(function(item) {
        if (item.type === 'branchSign' || item.type === 'textLabel') drawFurnitureItem(item);
    });
    // Ambient overlay AFTER wall occluders + redrawn furniture — everything gets uniform tint
    _perfStart('ambient'); drawAmbientOverlay(); _perfEnd('ambient');
    // (Legacy lamp/glow/neon functions removed — all now handled by furniture renderers)
    // Front agents drawn after ambient (they appear in front, un-tinted like before)
    _perfStart('agentsFront'); _frontWalls.forEach(function(a) { a.draw(); }); _perfEnd('agentsFront');
    // (drawAgentLampBounce removed — rim light now drawn inside agent draw())
    _perfStart('airplanes'); updateAirplanes(); drawAirplanes(); _perfEnd('airplanes');
    _perfStart('rps'); updateRPS(); drawRPS(); _perfEnd('rps');
    _perfStart('social'); updateSocialInteractions(); drawSocialInteractions(); _perfEnd('social');
    _perfStart('gatherings'); maybeStartGathering(); updateGatherings(); drawGatherings(); _perfEnd('gatherings');
    _perfStart('darts'); updateDartGames(); drawDartGames(); _perfEnd('darts');
    _perfStart('pong'); updatePongGames(); drawPongGames(); _perfEnd('pong');
    ctx.restore(); // close world clip
    ctx.restore(); // close camera transform

    ctx.save();
    applyCameraTransform();
    _perfStart('chatBubbles'); drawChatBubbles(); _perfEnd('chatBubbles');
    // Project work tooltip (rendered in world space, above chat bubble)
    if (_chatTooltip) {
        ctx.font = 'bold 8px Arial, sans-serif';
        var ttW = ctx.measureText(_chatTooltip.text).width + 8;
        var ttH = 14;
        var ttX = _chatTooltip.x - 2;
        var ttY = _chatTooltip.y;
        ctx.fillStyle = 'rgba(20,20,40,0.9)';
        ctx.fillRect(ttX, ttY, ttW, ttH);
        ctx.strokeStyle = 'rgba(100,140,255,0.6)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(ttX, ttY, ttW, ttH);
        ctx.fillStyle = '#dde';
        ctx.textAlign = 'left';
        ctx.fillText(_chatTooltip.text, ttX + 4, ttY + 10);
    }
    ctx.restore();

    // FPS counter
    _fpsFrames++;
    var _fpsNow = Date.now();
    if (_fpsNow - _fpsLast >= 1000) {
        _fpsDisplay = _fpsFrames;
        _fpsFrames = 0;
        _fpsLast = _fpsNow;
    }
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, 8, 52, 18);
    ctx.fillStyle = _fpsDisplay < 30 ? '#f44336' : (_fpsDisplay < 50 ? '#ffc107' : '#4caf50');
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(_fpsDisplay + ' fps', 12, 21);
    ctx.restore();

    // Draw zoom indicator (screen space, top-right, fades out)
    const zoomAge = Date.now() - _zoomIndicatorTimer;
    if (zoomAge < 2000) {
        const alpha = zoomAge < 1500 ? 0.8 : 0.8 * (1 - (zoomAge - 1500) / 500);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(displayW - 80, 8, 72, 22);
        ctx.fillStyle = '#ffd700';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'right';
        ctx.fillText(camera.zoom.toFixed(1) + 'x', displayW - 14, 23);
        ctx.restore();
    }

    // --- EDIT MODE OVERLAY ---
    if (editMode) {
        ctx.save();
        applyCameraTransform();
        drawEditOverlay();
        ctx.restore();

        // Edit mode HUD (screen space)
        drawEditHUD();
    }

    requestAnimationFrame(loop);
}

// ============================================================
// EDIT MODE — Canvas expansion/shrink with grid overlay
// ============================================================

const EDIT_BTN_SIZE = 30;
const EDIT_BTN_MARGIN = 8;
var _editButtons = []; // computed each frame for hit testing

function drawEditOverlay() {
    // Dim everything slightly
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += TILE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += TILE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Canvas boundary (thick highlight)
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, W, H);

    // Tile highlight on hover with 5 snap zones
    if (editHoverTile) {
        var _htx = editHoverTile.tx * TILE;
        var _hty = editHoverTile.ty * TILE;
        // Yellow tile outline
        ctx.fillStyle = 'rgba(255, 214, 0, 0.15)';
        ctx.fillRect(_htx, _hty, TILE, TILE);
        ctx.strokeStyle = 'rgba(255, 214, 0, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(_htx, _hty, TILE, TILE);
        // Quadrant divider lines
        ctx.strokeStyle = 'rgba(255, 214, 0, 0.25)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(_htx + TILE / 2, _hty); ctx.lineTo(_htx + TILE / 2, _hty + TILE);
        ctx.moveTo(_htx, _hty + TILE / 2); ctx.lineTo(_htx + TILE, _hty + TILE / 2);
        ctx.stroke();
        // Zone dots (active zone = green, others = gold)
        for (var _zn in SNAP_ZONES) {
            var _zd = SNAP_ZONES[_zn];
            var _zdx = _htx + _zd.ox * TILE;
            var _zdy = _hty + _zd.oy * TILE;
            var _isActive = _zn === activeSnapZone;
            ctx.fillStyle = _isActive ? 'rgba(0,255,150,0.8)' : 'rgba(255,215,0,0.4)';
            ctx.beginPath();
            ctx.arc(_zdx, _zdy, _isActive ? 4 : 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- WALL PLACEMENT GHOST PREVIEW ---
    if (placingType === 'wall') {
        // Show start tile highlight when in phase 1
        if (wallPlacingPhase === 1 && wallPlacingStart) {
            ctx.fillStyle = 'rgba(100, 180, 255, 0.4)';
            ctx.fillRect(wallPlacingStart.tx * TILE, wallPlacingStart.ty * TILE, TILE, TILE);
            // Ghost line to hover
            if (editHoverTile) {
                var _wdx = Math.abs(editHoverTile.tx - wallPlacingStart.tx);
                var _wdy = Math.abs(editHoverTile.ty - wallPlacingStart.ty);
                var _isHoriz = _wdx >= _wdy;
                ctx.strokeStyle = 'rgba(100, 180, 255, 0.7)';
                ctx.lineWidth = 6;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                if (_isHoriz) {
                    var _gx1 = Math.min(wallPlacingStart.tx, editHoverTile.tx) * TILE;
                    var _gx2 = Math.max(wallPlacingStart.tx, editHoverTile.tx) * TILE;
                    var _gy = wallPlacingStart.ty * TILE;
                    ctx.moveTo(_gx1, _gy); ctx.lineTo(_gx2, _gy);
                } else {
                    var _gx = wallPlacingStart.tx * TILE;
                    var _gy1 = Math.min(wallPlacingStart.ty, editHoverTile.ty) * TILE;
                    var _gy2 = Math.max(wallPlacingStart.ty, editHoverTile.ty) * TILE;
                    ctx.moveTo(_gx, _gy1); ctx.lineTo(_gx, _gy2);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
    }
    // Show selected wall with yellow dashed outline (extra thick)
    if (selectedWallIdx !== null && officeConfig.walls.interior && officeConfig.walls.interior[selectedWallIdx]) {
        var _sw = officeConfig.walls.interior[selectedWallIdx];
        ctx.setLineDash([6, 3]);
        ctx.strokeStyle = '#ffd600';
        ctx.lineWidth = 3;
        if (_sw.x1 === _sw.x2) {
            var _spx = _sw.x1 * TILE - 3;
            var _spy = Math.min(_sw.y1, _sw.y2) * TILE - 3;
            ctx.strokeRect(_spx, _spy, 12, Math.abs(_sw.y2 - _sw.y1) * TILE + 6);
        } else {
            var _spx = Math.min(_sw.x1, _sw.x2) * TILE - 3;
            var _spy = _sw.y1 * TILE - 3;
            ctx.strokeRect(_spx, _spy, Math.abs(_sw.x2 - _sw.x1) * TILE + 6, 12);
        }
        ctx.setLineDash([]);
    }

    // --- EXPAND/SHRINK BUTTONS (drawn in world space at edges) ---
    _editButtons = [];
    var bS = EDIT_BTN_SIZE;

    // RIGHT edge: + to expand right, - to shrink
    _drawEditBtn(W + EDIT_BTN_MARGIN, H / 2 - bS - 4, bS, '+', 'right', 'expand');
    _drawEditBtn(W + EDIT_BTN_MARGIN, H / 2 + 4, bS, '−', 'right', 'shrink');

    // BOTTOM edge: + to expand down, - to shrink
    _drawEditBtn(W / 2 - bS - 4, H + EDIT_BTN_MARGIN, bS, '+', 'bottom', 'expand');
    _drawEditBtn(W / 2 + 4, H + EDIT_BTN_MARGIN, bS, '−', 'bottom', 'shrink');

    // LEFT and TOP expansion disabled — shifts break agent positions

    // Size label near bottom-right
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(W - 120, H + 8, 120, 22);
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(W / TILE) + ' × ' + Math.round(H / TILE) + ' tiles', W - 60, H + 23);

    // --- GHOST PREVIEW ---
    if (placingType && _ghostPos) {
        // Snap kitchen appliances to counter tops for ghost preview
        if (COUNTER_ONLY_ITEMS.indexOf(placingType) >= 0) {
            var snapped = _snapToCounterTop(placingType, _ghostPos.x, _ghostPos.y);
            if (snapped) { _ghostPos.x = snapped.x; _ghostPos.y = snapped.y; }
        }
        _placementValid = _isValidPlacement(placingType, _ghostPos.x, _ghostPos.y);
        // Build ghost item — carry rotation from the source item when dragging
        var ghostItem = { type: placingType, x: _ghostPos.x, y: _ghostPos.y };
        if (isDragging && selectedItemId) {
            var _dragSrc = officeConfig.furniture.find(function(f){ return f.id === selectedItemId; });
            if (_dragSrc && _dragSrc.rotation) ghostItem.rotation = _dragSrc.rotation;
            if (_dragSrc && _dragSrc.couchColor) ghostItem.couchColor = _dragSrc.couchColor;
        }
        var _ghostWR = _getItemWorldRect(ghostItem);
        var _visX = _ghostWR.x;
        var _visY = _ghostWR.y;
        var _visW = _ghostWR.w;
        var _visH = _ghostWR.h;

        // Highlight ALL tiles the item's visual area covers
        var _gStartTX = Math.max(0, Math.floor(_visX / TILE));
        var _gStartTY = Math.max(0, Math.floor(_visY / TILE));
        var _gEndTX = Math.floor((_visX + _visW - 1) / TILE);
        var _gEndTY = Math.floor((_visY + _visH - 1) / TILE);
        ctx.fillStyle = _placementValid ? 'rgba(0, 255, 150, 0.18)' : 'rgba(244, 67, 54, 0.15)';
        ctx.strokeStyle = _placementValid ? 'rgba(0, 255, 150, 0.5)' : 'rgba(244, 67, 54, 0.5)';
        ctx.lineWidth = 1.5;
        for (var _gtx = _gStartTX; _gtx <= _gEndTX; _gtx++) {
            for (var _gty = _gStartTY; _gty <= _gEndTY; _gty++) {
                ctx.fillRect(_gtx * TILE, _gty * TILE, TILE, TILE);
                ctx.strokeRect(_gtx * TILE, _gty * TILE, TILE, TILE);
            }
        }

        // Draw ghost item
        ctx.globalAlpha = _placementValid ? 0.5 : 0.3;
        drawFurnitureItem(ghostItem);
        ctx.globalAlpha = 1;

        // Bounding box outline around visual area
        ctx.setLineDash([]);
        ctx.strokeStyle = _placementValid ? '#00e676' : '#f44336';
        ctx.lineWidth = 2;
        ctx.strokeRect(_visX, _visY, _visW, _visH);

        // Show red X if invalid
        if (!_placementValid) {
            ctx.fillStyle = 'rgba(244, 67, 54, 0.6)';
            ctx.fillRect(_visX, _visY, _visW, _visH);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✕', _visX + _visW / 2, _visY + _visH / 2 + 5);
        }
    }

    // --- SELECTION HIGHLIGHT (all occupied tiles + bounding box) ---
    if (selectedItemId) {
        var selItem = null;
        for (var _si = 0; _si < officeConfig.furniture.length; _si++) {
            if (officeConfig.furniture[_si].id === selectedItemId) { selItem = officeConfig.furniture[_si]; break; }
        }
        if (selItem) {
            var _selWR = _getItemWorldRect(selItem);
            // Highlight ALL tiles
            var _sTX1 = Math.max(0, Math.floor(_selWR.x / TILE));
            var _sTY1 = Math.max(0, Math.floor(_selWR.y / TILE));
            var _sTX2 = Math.floor((_selWR.x + _selWR.w - 1) / TILE);
            var _sTY2 = Math.floor((_selWR.y + _selWR.h - 1) / TILE);
            ctx.fillStyle = 'rgba(255, 214, 0, 0.1)';
            ctx.strokeStyle = 'rgba(255, 214, 0, 0.4)';
            ctx.lineWidth = 1;
            for (var _stx = _sTX1; _stx <= _sTX2; _stx++) {
                for (var _sty = _sTY1; _sty <= _sTY2; _sty++) {
                    ctx.fillRect(_stx * TILE, _sty * TILE, TILE, TILE);
                    ctx.strokeRect(_stx * TILE, _sty * TILE, TILE, TILE);
                }
            }
            // Dashed bounding box around visual area
            ctx.setLineDash([5, 3]);
            ctx.strokeStyle = '#ffd600';
            ctx.lineWidth = 2;
            ctx.strokeRect(_selWR.x - 3, _selWR.y - 3, _selWR.w + 6, _selWR.h + 6);
            ctx.setLineDash([]);
        }
    }

    // --- MULTI-SELECT highlights ---
    _multiSelected.forEach(function(fid) {
        var fi = null;
        for (var _mi = 0; _mi < officeConfig.furniture.length; _mi++) {
            if (officeConfig.furniture[_mi].id === fid) { fi = officeConfig.furniture[_mi]; break; }
        }
        if (!fi) return;
        var fb = FURNITURE_BOUNDS[fi.type] || { w: TILE, h: TILE, ox: 0, oy: 0 };
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        var _mox = fb.ox || 0, _moy = fb.oy || 0;
        ctx.strokeRect(fi.x - _mox * fb.w - 2, fi.y - _moy * fb.h - 2, fb.w + 4, fb.h + 4);
        ctx.setLineDash([]);
    });

    // --- MARQUEE RECT ---
    if (_marqueeStart && _marqueeEnd) {
        var mx = Math.min(_marqueeStart.x, _marqueeEnd.x);
        var my = Math.min(_marqueeStart.y, _marqueeEnd.y);
        var mw = Math.abs(_marqueeEnd.x - _marqueeStart.x);
        var mh = Math.abs(_marqueeEnd.y - _marqueeStart.y);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.fillRect(mx, my, mw, mh);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(mx, my, mw, mh);
        ctx.setLineDash([]);
    }

    // --- DRAG TILE HIGHLIGHT (shows target tile during drag) ---
    if (_editDragTileHighlight) {
        var dth = _editDragTileHighlight;
        if (dth.valid) {
            // Green glow for valid position
            ctx.fillStyle = 'rgba(76, 175, 80, 0.15)';
            ctx.fillRect(dth.x, dth.y, dth.w, dth.h);
            ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(dth.x, dth.y, dth.w, dth.h);
            // Draw half-tile grid within the highlight area
            ctx.lineWidth = 1;
            for (var _thx = dth.x + HALF_TILE; _thx < dth.x + dth.w; _thx += HALF_TILE) {
                ctx.strokeStyle = (_thx - dth.x) % TILE === 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.15)';
                ctx.beginPath(); ctx.moveTo(_thx, dth.y); ctx.lineTo(_thx, dth.y + dth.h); ctx.stroke();
            }
            for (var _thy = dth.y + HALF_TILE; _thy < dth.y + dth.h; _thy += HALF_TILE) {
                ctx.strokeStyle = (_thy - dth.y) % TILE === 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.15)';
                ctx.beginPath(); ctx.moveTo(dth.x, _thy); ctx.lineTo(dth.x + dth.w, _thy); ctx.stroke();
            }
        } else {
            // Red glow for invalid position
            ctx.fillStyle = 'rgba(244, 67, 54, 0.12)';
            ctx.fillRect(dth.x, dth.y, dth.w, dth.h);
            ctx.strokeStyle = 'rgba(244, 67, 54, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(dth.x, dth.y, dth.w, dth.h);
        }
    }
}

function _drawEditBtn(x, y, size, label, edge, action) {
    var isExpand = action === 'expand';
    var canShrink = (edge === 'left' || edge === 'right') ? (W / TILE > MIN_TILES_X) : (H / TILE > MIN_TILES_Y);

    if (!isExpand && !canShrink) {
        // Draw disabled button
        ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = 'rgba(150, 150, 150, 0.4)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + size / 2, y + size / 2 + 6);
        return;
    }

    // Active button
    ctx.fillStyle = isExpand ? 'rgba(76, 175, 80, 0.85)' : 'rgba(244, 67, 54, 0.85)';
    ctx.fillRect(x, y, size, size);

    // Border
    ctx.strokeStyle = isExpand ? '#66bb6a' : '#ef5350';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + size / 2, y + size / 2 + 7);

    // Store for hit testing
    _editButtons.push({ x: x, y: y, w: size, h: size, edge: edge, action: action });
}

function drawEditHUD() {
    // Top bar with edit mode indicator
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(displayW / 2 - 140, 6, 280, 28);
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 1;
    ctx.strokeRect(displayW / 2 - 140, 6, 280, 28);
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 10px "Press Start 2P"';
    ctx.textAlign = 'center';
    var hudText;
    if (placingType === 'wall') {
        hudText = wallPlacingPhase === 0 ? '🧱 WALL — Click start tile' : '🧱 WALL — Click end tile (Esc cancel)';
    } else if (placingType === 'door') {
        hudText = '🚪 DOOR — Click wall tile to add opening (Esc cancel)';
    } else if (placingType) {
        hudText = '📦 PLACING: ' + placingType.toUpperCase() + ' — Esc cancel';
    } else {
        hudText = '✏️ EDIT MODE — ' + Math.round(W / TILE) + '×' + Math.round(H / TILE);
    }
    ctx.fillText(hudText, displayW / 2, 24);
    ctx.restore();

    // Update floating toolbar position every frame
    _updateFloatingToolbarPosition();

    // Tile coord on hover (screen space, bottom-left)
    if (editHoverTile) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(8, displayH - 28, 90, 20);
        ctx.fillStyle = '#ccc';
        ctx.font = '9px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('(' + editHoverTile.tx + ',' + editHoverTile.ty + ')', 14, displayH - 14);
        ctx.restore();
    }
}

function expandCanvas(edge) {
    // Only allow expanding right and bottom (top/left shifts break agent positions)
    if (edge === 'left' || edge === 'top') return;
    _pushUndo();
    if (edge === 'right') {
        W += TILE;
    } else if (edge === 'bottom') {
        H += TILE;
    }
    saveOfficeConfig();
}

function shrinkCanvas(edge) {
    if (edge === 'left' || edge === 'top') return;
    _pushUndo();
    if (edge === 'right' && W / TILE > MIN_TILES_X) {
        W -= TILE;
    } else if (edge === 'bottom' && H / TILE > MIN_TILES_Y) {
        H -= TILE;
    }
    saveOfficeConfig();
}

function _shiftAllPositions(dx, dy) {
    // Shift all agent positions and targets
    agents.forEach(function(a) {
        a.x += dx; a.y += dy;
        a.targetX += dx; a.targetY += dy;
        if (a.desk) { a.desk.x += dx; a.desk.y += dy; }
    });
    // Shift LOCATIONS
    LOCATIONS.pqDesks.forEach(function(d) { d.x += dx; d.y += dy; });
    LOCATIONS.engDesks.forEach(function(d) { d.x += dx; d.y += dy; });
    LOCATIONS.bossDesk.x += dx; LOCATIONS.bossDesk.y += dy;
    LOCATIONS.centerDesk.x += dx; LOCATIONS.centerDesk.y += dy;
    LOCATIONS.centerDesk2.x += dx; LOCATIONS.centerDesk2.y += dy;
    LOCATIONS.centerDesk3.x += dx; LOCATIONS.centerDesk3.y += dy;
    if (LOCATIONS.forgeDesk) { LOCATIONS.forgeDesk.x += dx; LOCATIONS.forgeDesk.y += dy; }
    LOCATIONS.meeting.x += dx; LOCATIONS.meeting.y += dy;
    LOCATIONS.lounge.x += dx; LOCATIONS.lounge.y += dy;
    LOCATIONS.cooler.x += dx; LOCATIONS.cooler.y += dy;
    LOCATIONS.wanderSpots.forEach(function(s) { s.x += dx; s.y += dy; });
    var inter = LOCATIONS.interactions;
    inter.windows.forEach(function(w) { w.x += dx; w.y += dy; });
    inter.couchSeats.forEach(function(s) { s.x += dx; s.y += dy; });
    if (inter.bookshelf)     { inter.bookshelf.x     += dx; inter.bookshelf.y     += dy; }
    if (inter.tvSpot)        { inter.tvSpot.x         += dx; inter.tvSpot.y         += dy; }
    if (inter.vendingMachine){ inter.vendingMachine.x += dx; inter.vendingMachine.y += dy; }
    if (inter.coffeeMaker)   { inter.coffeeMaker.x    += dx; inter.coffeeMaker.y    += dy; }
    if (inter.waterCooler)   { inter.waterCooler.x    += dx; inter.waterCooler.y    += dy; }
    if (inter.microwave)     { inter.microwave.x      += dx; inter.microwave.y      += dy; }
    if (inter.toaster)       { inter.toaster.x        += dx; inter.toaster.y        += dy; }
    if (inter.dartBoard)     { inter.dartBoard.x      += dx; inter.dartBoard.y      += dy; }
    inter.engCouchSeats.forEach(function(s) { s.x += dx; s.y += dy; });
    // Re-derive meeting slots from the (now shifted) meeting table furniture position
    MEETING_SLOTS = getMeetingSlots();
    // Shift officeConfig furniture items to stay in sync
    officeConfig.furniture.forEach(function(item) { item.x += dx; item.y += dy; });
    // Re-sync interaction spots from shifted furniture
    getInteractionSpots();
}

// --- COLLISION DETECTION ---
// Get visual top-left from draw position + bounds
function _visualTopLeft(type, x, y) {
    var b = FURNITURE_BOUNDS[type] || { w: TILE, h: TILE, ox: 0, oy: 0 };
    return { x: x - (b.ox || 0) * b.w, y: y - (b.oy || 0) * b.h, w: b.w, h: b.h };
}

function _itemOverlaps(type, x, y, excludeId) {
    var b1 = FURNITURE_BOUNDS[type] || { w: TILE, h: TILE };
    // Items with noCollision never block or get blocked
    if (b1.noCollision) return false;
    var v1 = _visualTopLeft(type, x, y);
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        var item = officeConfig.furniture[i];
        if (excludeId && item.id === excludeId) continue;
        var b2 = FURNITURE_BOUNDS[item.type] || { w: TILE, h: TILE };
        if (b2.noCollision) continue; // skip non-blocking items
        // Use rotation-aware world rect for placed items
        var v2 = _getItemWorldRect(item);
        if (v1.x < v2.x + v2.w && v1.x + v1.w > v2.x &&
            v1.y < v2.y + v2.h && v1.y + v1.h > v2.y) {
            return true;
        }
    }
    return false;
}

// --- SYNC AGENT DESK ASSIGNMENTS ---
// When a desk has an assignedTo, move that agent's desk reference to this furniture item's position
function _syncAgentToDesk(deskItem) {
    if (!deskItem.assignedTo) return;
    for (var i = 0; i < agents.length; i++) {
        if (agents[i].name === deskItem.assignedTo) {
            var agent = agents[i];
            // Update the agent's desk position
            if (agent.desk.x !== deskItem.x || agent.desk.y !== deskItem.y) {
                agent.desk = { x: deskItem.x, y: deskItem.y };
                // If agent is idle at their old desk, move them to new one
                if (agent.state === 'idle' || agent.state === 'working') {
                    agent.targetX = deskItem.x;
                    agent.targetY = deskItem.y;
                }
            }
            break;
        }
    }
}

// Run desk sync on config load and after any furniture change
function _syncAllDeskAssignments() {
    officeConfig.furniture.forEach(function(item) {
        if (item.assignedTo && (item.type === 'desk' || item.type === 'bossDesk')) {
            _syncAgentToDesk(item);
        }
    });
}

// Kitchen appliance types that must be placed on counters
var COUNTER_ONLY_ITEMS = ['coffeeMaker', 'microwave', 'toaster'];

// Check if a position sits on top of a kitchen counter
function _isOnCounter(type, x, y) {
    var itemB = FURNITURE_BOUNDS[type] || { w: TILE, h: TILE };
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        var f = officeConfig.furniture[i];
        if (f.type !== 'kitchenCounter') continue;
        var cb = FURNITURE_BOUNDS['kitchenCounter']; // w:72, h:34
        // Appliance must be within counter's horizontal span
        // and at the snapped Y position (counter.y - itemHeight + 2, with tolerance)
        var expectedY = f.y - itemB.h + 2;
        if (x >= f.x - 2 && x + itemB.w <= f.x + cb.w + 2 &&
            Math.abs(y - expectedY) < 8) {
            return true;
        }
    }
    // Also check breakArea items (they have built-in counters)
    for (var j = 0; j < officeConfig.furniture.length; j++) {
        var ba = officeConfig.furniture[j];
        if (ba.type !== 'breakArea') continue;
        var counters = [
            { x: ba.x + 80, y: ba.y + 78, w: 72 },
            { x: ba.x + 170, y: ba.y + 78, w: 72 }
        ];
        for (var c = 0; c < counters.length; c++) {
            var ct = counters[c];
            var expectedY2 = ct.y - itemB.h + 2;
            if (x >= ct.x - 2 && x + itemB.w <= ct.x + ct.w + 2 &&
                Math.abs(y - expectedY2) < 8) {
                return true;
            }
        }
    }
    return false;
}

// Snap a kitchen appliance to the nearest counter top surface
function _snapToCounterTop(type, worldX, worldY) {
    var itemB = FURNITURE_BOUNDS[type] || { w: TILE, h: TILE };
    var best = null;
    var bestDist = 999999;

    // Check standalone kitchen counters
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        var f = officeConfig.furniture[i];
        if (f.type !== 'kitchenCounter') continue;
        var cb = FURNITURE_BOUNDS['kitchenCounter']; // w:72, h:34
        // Appliance sits on counter surface: Y = counter.y - itemHeight (on top)
        var snapY = f.y - itemB.h + 2; // +2 so it visually rests on surface
        var snapX = Math.round((worldX - f.x) / 4) * 4 + f.x; // fine snap within counter
        snapX = Math.max(f.x, Math.min(f.x + cb.w - itemB.w, snapX)); // clamp to counter width
        var dist = Math.abs(worldX - snapX) + Math.abs(worldY - snapY);
        if (dist < bestDist) { bestDist = dist; best = { x: snapX, y: snapY }; }
    }

    // Check breakArea built-in counters
    for (var j = 0; j < officeConfig.furniture.length; j++) {
        var ba = officeConfig.furniture[j];
        if (ba.type !== 'breakArea') continue;
        var counters = [
            { x: ba.x + 80, y: ba.y + 78, w: 72 },
            { x: ba.x + 170, y: ba.y + 78, w: 72 }
        ];
        for (var c = 0; c < counters.length; c++) {
            var ct = counters[c];
            var snapY2 = ct.y - itemB.h + 2;
            var snapX2 = Math.round((worldX - ct.x) / 4) * 4 + ct.x;
            snapX2 = Math.max(ct.x, Math.min(ct.x + ct.w - itemB.w, snapX2));
            var dist2 = Math.abs(worldX - snapX2) + Math.abs(worldY - snapY2);
            if (dist2 < bestDist) { bestDist = dist2; best = { x: snapX2, y: snapY2 }; }
        }
    }

    // Only snap if reasonably close (within 120px)
    if (best && bestDist < 120) return best;
    return null;
}

// Check if a position is valid for a given furniture type
function _isValidPlacement(type, x, y) {
    // Windows can only be placed on the top wall
    if (type === 'window' || type === 'interactiveWindow') {
        var wallH = officeConfig.walls.height || 70;
        if (y > wallH - 10 || y < 0) return false;
        if (x < 0 || x + (FURNITURE_BOUNDS[type] || {w:40}).w > W) return false;
    }
    // Kitchen appliances can only be placed on kitchen counters
    if (COUNTER_ONLY_ITEMS.indexOf(type) >= 0) {
        if (!_isOnCounter(type, x, y)) return false;
        // Skip overlap check for counter items — they sit ON the counter
        return true;
    }
    // General: visual area must be within canvas bounds
    var _vp = _visualTopLeft(type, x, y);
    if (_vp.x < 0 || _vp.y < 0 || _vp.x + _vp.w > W || _vp.y + _vp.h > H) return false;
    // Check overlap
    if (_itemOverlaps(type, x, y, null)) return false;
    return true;
}

var _placementValid = true; // updated each frame for ghost preview color

// --- EDIT MODE CLICK HANDLING ---
function handleEditClick(worldX, worldY, screenX, screenY, event) {
    // 1. If in placement mode → place item
    if (placingType === 'wall') {
        var _clickTx = Math.floor(worldX / TILE);
        var _clickTy = Math.floor(worldY / TILE);
        if (wallPlacingPhase === 0) {
            wallPlacingStart = { tx: _clickTx, ty: _clickTy };
            wallPlacingPhase = 1;
        } else {
            // Second click - create wall
            var _x1 = wallPlacingStart.tx, _y1 = wallPlacingStart.ty;
            var _x2 = _clickTx, _y2 = _clickTy;
            var _wdx = Math.abs(_x2 - _x1), _wdy = Math.abs(_y2 - _y1);
            if (_wdx > 0 || _wdy > 0) {
                var newWall;
                if (_wdx >= _wdy) {
                    // Horizontal: snap to same Y as start
                    newWall = { x1: Math.min(_x1, _x2), y1: _y1, x2: Math.max(_x1, _x2), y2: _y1, color: '#5d6271', accentColor: '#5d6271', trimColor: '#d2d4da', trim2Color: '#989ca8' };
                } else {
                    // Vertical: snap to same X as start
                    newWall = { x1: _x1, y1: Math.min(_y1, _y2), x2: _x1, y2: Math.max(_y1, _y2), color: '#5d6271', accentColor: '#5d6271', trimColor: '#d2d4da', trim2Color: '#989ca8' };
                }
                _pushUndo();
                if (!officeConfig.walls.interior) officeConfig.walls.interior = [];
                officeConfig.walls.interior.push(newWall);
                buildCollisionGrid();
            }
            wallPlacingPhase = 0;
            wallPlacingStart = null;
        }
        return true;
    }
    if (placingType === 'door') {
        // Click on a wall to add a door (1-tile gap)
        var _dTx = Math.floor(worldX / TILE);
        var _dTy = Math.floor(worldY / TILE);
        var interior = officeConfig.walls.interior || [];
        for (var _di = 0; _di < interior.length; _di++) {
            var _dw = interior[_di];
            if (_dw.x1 === _dw.x2) {
                // Vertical wall - check if click tile row is within it
                var _minY = Math.min(_dw.y1, _dw.y2), _maxY = Math.max(_dw.y1, _dw.y2);
                if (_dTx === _dw.x1 && _dTy >= _minY && _dTy < _maxY) {
                    _pushUndo();
                    officeConfig.walls.interior.splice(_di, 1);
                    // Add two segments split by 1-tile door
                    if (_dTy > _minY) officeConfig.walls.interior.push({ x1: _dw.x1, y1: _minY, x2: _dw.x1, y2: _dTy, color: _dw.color, accentColor: _dw.accentColor, trimColor: _dw.trimColor, trim2Color: _dw.trim2Color });
                    if (_dTy + 1 < _maxY) officeConfig.walls.interior.push({ x1: _dw.x1, y1: _dTy + 1, x2: _dw.x1, y2: _maxY, color: _dw.color, accentColor: _dw.accentColor, trimColor: _dw.trimColor, trim2Color: _dw.trim2Color });
                    buildCollisionGrid();
                    break;
                }
            } else {
                // Horizontal wall
                var _minX = Math.min(_dw.x1, _dw.x2), _maxX = Math.max(_dw.x1, _dw.x2);
                if (_dTy === _dw.y1 && _dTx >= _minX && _dTx < _maxX) {
                    _pushUndo();
                    officeConfig.walls.interior.splice(_di, 1);
                    if (_dTx > _minX) officeConfig.walls.interior.push({ x1: _minX, y1: _dw.y1, x2: _dTx, y2: _dw.y1, color: _dw.color, accentColor: _dw.accentColor, trimColor: _dw.trimColor, trim2Color: _dw.trim2Color });
                    if (_dTx + 1 < _maxX) officeConfig.walls.interior.push({ x1: _dTx + 1, y1: _dw.y1, x2: _maxX, y2: _dw.y1, color: _dw.color, accentColor: _dw.accentColor, trimColor: _dw.trimColor, trim2Color: _dw.trim2Color });
                    buildCollisionGrid();
                    break;
                }
            }
        }
        return true;
    }
    if (placingType) {
        // Check if clicking near a zone dot — switch zone instead of placing
        var _clickTX = Math.floor(worldX / TILE);
        var _clickTY = Math.floor(worldY / TILE);
        for (var _czName in SNAP_ZONES) {
            var _cz = SNAP_ZONES[_czName];
            var _czX = _clickTX * TILE + _cz.ox * TILE;
            var _czY = _clickTY * TILE + _cz.oy * TILE;
            var _czDist = Math.sqrt((worldX - _czX) * (worldX - _czX) + (worldY - _czY) * (worldY - _czY));
            if (_czDist < 10 && _czName !== activeSnapZone) {
                activeSnapZone = _czName;
                var _snapSel = document.getElementById('snap-zone-select');
                if (_snapSel) _snapSel.value = activeSnapZone;
                return true; // consumed click, don't place
            }
        }
        // Snap to active zone center within the hovered tile (origin-aware)
        var _placeZone = SNAP_ZONES[activeSnapZone] || SNAP_ZONES['center'];
        var _placeTX = Math.floor(worldX / TILE);
        var _placeTY = Math.floor(worldY / TILE);
        var _placeZCX = _placeTX * TILE + _placeZone.ox * TILE;
        var _placeZCY = _placeTY * TILE + _placeZone.oy * TILE;
        var _placeBounds = FURNITURE_BOUNDS[placingType] || { w: TILE, h: TILE, ox: 0, oy: 0 };
        var _pox = _placeBounds.ox || 0;
        var _poy = _placeBounds.oy || 0;
        var sx = Math.round(_placeZCX - (0.5 - _pox) * _placeBounds.w);
        var sy = Math.round(_placeZCY - (0.5 - _poy) * _placeBounds.h);
        // Kitchen appliances: snap to counter top surface
        if (COUNTER_ONLY_ITEMS.indexOf(placingType) >= 0) {
            var snapped = _snapToCounterTop(placingType, worldX, worldY);
            if (!snapped) return true; // no valid counter nearby
            sx = snapped.x;
            sy = snapped.y;
        }
        // Validate placement
        if (!_isValidPlacement(placingType, sx, sy)) return true; // block but stay in placement mode
        var newItem = { id: _generateFurnitureId(), type: placingType, x: sx, y: sy };
        // Custom text label — prompt for text on placement
        if (placingType === 'textLabel') {
            var labelText = prompt('Enter label text:', 'Label');
            if (!labelText) return true; // cancelled
            newItem.text = labelText;
            newItem.labelColor = '#ffffff';
            newItem.fontSize = 12;
        }
        _pushUndo();
        officeConfig.furniture.push(newItem);
        getInteractionSpots();
        return true;
    }

    // 2. Check expand/shrink buttons
    for (var i = 0; i < _editButtons.length; i++) {
        var b = _editButtons[i];
        if (worldX >= b.x && worldX <= b.x + b.w && worldY >= b.y && worldY <= b.y + b.h) {
            if (b.action === 'expand') expandCanvas(b.edge);
            else shrinkCanvas(b.edge);
            return true;
        }
    }

    // 3. Hit-test furniture — skip if mousedown already handled it (drag)
    var hit = _findFurnitureAt(worldX, worldY);
    if (hit) {
        // Meeting table click → open dashboard (only outside edit mode)
        if (_meetingTableClickCheck(hit)) return true;
        // Furniture selection is handled by mousedown now.
        // Only reach here if it was a quick click (no drag).
        // Selection was already set in mousedown, just return.
        return true;
    }

    // 3d. Hit-test interior walls for selection
    var _hitWallIdx = _findWallAt(worldX, worldY);
    if (_hitWallIdx >= 0) {
        selectedWallIdx = _hitWallIdx;
        selectedItemId = null;
        _multiSelected = [];
        _hideColorPicker();
        return true;
    }

    // 4. Click on floor → floor color picker (only in floor edit mode)
    var wallH = officeConfig.walls.height;
    if (_floorEditMode && worldY >= wallH && worldY < H && worldX >= 0 && worldX < W) {
        _showFloorColorPicker(screenX || 200, screenY || 200);
        return true;
    }

    // 5. Click top wall → top wall color picker
    if (worldY >= 0 && worldY < wallH && worldX >= 0 && worldX < W) {
        _showTopWallColorPicker(screenX || 200, screenY || 60);
        return true;
    }

    // 6. Empty space click — selection clearing handled by mousedown
    return false;
}

// Get effective width/height for an item, accounting for rotation
function _getRotatedBounds(item) {
    var b = FURNITURE_BOUNDS[item.type] || { w: TILE, h: TILE, ox: 0, oy: 0 };
    var rot = item.rotation || 0;
    if (rot === 90 || rot === 270) return { w: b.h, h: b.w, ox: b.oy, oy: b.ox };
    return b;
}

// Get the world-space bounding rect for a possibly-rotated item.
// Accounts for origin offsets (ox/oy) and rotation.
// Drawing uses translate(x,y) then rotate(rot), where (x,y) is the origin
// point defined by (ox,oy) as a fraction of (w,h).
function _getItemWorldRect(item) {
    var b = FURNITURE_BOUNDS[item.type] || { w: TILE, h: TILE, ox: 0, oy: 0 };
    var rot = item.rotation || 0;
    var w = b.w, h = b.h;
    var ox = b.ox || 0, oy = b.oy || 0;
    var ix = item.x, iy = item.y;
    // Visual top-left without rotation
    var vlx = ix - ox * w;
    var vly = iy - oy * h;
    if (!rot) return { x: vlx, y: vly, w: w, h: h };
    // With rotation: the origin (ix,iy) is the pivot.
    // Local corners relative to origin: (-ox*w, -oy*h) to ((1-ox)*w, (1-oy)*h)
    // After rotation, find the new bounding box
    var lx0 = -ox * w, ly0 = -oy * h;
    var lx1 = (1 - ox) * w, ly1 = (1 - oy) * h;
    var corners = [[lx0,ly0],[lx1,ly0],[lx1,ly1],[lx0,ly1]];
    var cosR = Math.round(Math.cos(rot * Math.PI / 180));
    var sinR = Math.round(Math.sin(rot * Math.PI / 180));
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var ci = 0; ci < 4; ci++) {
        var rx = corners[ci][0] * cosR - corners[ci][1] * sinR;
        var ry = corners[ci][0] * sinR + corners[ci][1] * cosR;
        if (rx < minX) minX = rx;
        if (ry < minY) minY = ry;
        if (rx > maxX) maxX = rx;
        if (ry > maxY) maxY = ry;
    }
    return { x: ix + minX, y: iy + minY, w: maxX - minX, h: maxY - minY };
}

function _findFurnitureAt(wx, wy) {
    // Search in reverse so top-drawn items get priority
    for (var i = officeConfig.furniture.length - 1; i >= 0; i--) {
        var item = officeConfig.furniture[i];
        var r = _getItemWorldRect(item);
        if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) {
            return item;
        }
    }
    return null;
}

function _findWallAt(wx, wy) {
    var interior = officeConfig.walls && officeConfig.walls.interior;
    if (!interior) return -1;
    var thresh = 8; // pixels
    for (var i = 0; i < interior.length; i++) {
        var wall = interior[i];
        if (wall.x1 === wall.x2) {
            // Vertical wall
            var wallPx = wall.x1 * TILE;
            var minPy = Math.min(wall.y1, wall.y2) * TILE;
            var maxPy = Math.max(wall.y1, wall.y2) * TILE;
            if (Math.abs(wx - wallPx) < thresh && wy >= minPy && wy <= maxPy) return i;
        } else {
            // Horizontal wall
            var wallPy = wall.y1 * TILE;
            var minPx = Math.min(wall.x1, wall.x2) * TILE;
            var maxPx = Math.max(wall.x1, wall.x2) * TILE;
            if (Math.abs(wy - wallPy) < thresh && wx >= minPx && wx <= maxPx) return i;
        }
    }
    return -1;
}

function _generateFurnitureId() {
    return 'f_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
}

function _updateFloatingToolbarPosition() {
    if (!_floatingToolbar) return;

    // Show toolbar for selected wall
    if (selectedWallIdx !== null && officeConfig.walls.interior && officeConfig.walls.interior[selectedWallIdx]) {
        var _sw = officeConfig.walls.interior[selectedWallIdx];
        var base = getBaseScale();
        var totalZoom = base * camera.zoom;
        var rect = canvas.getBoundingClientRect();
        var wx, wy;
        if (_sw.x1 === _sw.x2) {
            wx = _sw.x1 * TILE;
            wy = (Math.min(_sw.y1, _sw.y2) * TILE + Math.max(_sw.y1, _sw.y2) * TILE) / 2;
        } else {
            wx = (Math.min(_sw.x1, _sw.x2) * TILE + Math.max(_sw.x1, _sw.x2) * TILE) / 2;
            wy = _sw.y1 * TILE;
        }
        var dx = (wx - W / 2 - camera.x) * totalZoom + displayW / 2;
        var dy = (wy - H / 2 - camera.y) * totalZoom + displayH / 2;
        var sx = dx * (rect.width / displayW) + rect.left;
        var sy = dy * (rect.height / displayH) + rect.top;
        _floatingToolbar.style.display = 'flex';
        _floatingToolbar.style.left = (sx - 30) + 'px';
        _floatingToolbar.style.top = (sy - 46) + 'px';
        // Wall toolbar: delete + color + close only
        var assignBtn = document.getElementById('ftb-assign-btn');
        var branchBtn = document.getElementById('ftb-branch-btn');
        var colorBtn = document.getElementById('ftb-color-btn');
        if (assignBtn) assignBtn.style.display = 'none';
        if (branchBtn) branchBtn.style.display = 'none';
        if (colorBtn) colorBtn.style.display = '';
        return;
    }

    if (!selectedItemId) { _floatingToolbar.style.display = 'none'; return; }
    var selItem = null;
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        if (officeConfig.furniture[i].id === selectedItemId) { selItem = officeConfig.furniture[i]; break; }
    }
    if (!selItem) { _floatingToolbar.style.display = 'none'; return; }

    var _wr = _getItemWorldRect(selItem);
    var base = getBaseScale();
    var totalZoom = base * camera.zoom;
    var rect = canvas.getBoundingClientRect();
    // World center-top → display coords
    var wx = _wr.x + _wr.w / 2;
    var wy = _wr.y;
    var dx = (wx - W / 2 - camera.x) * totalZoom + displayW / 2;
    var dy = (wy - H / 2 - camera.y) * totalZoom + displayH / 2;
    // Display → screen CSS
    var sx = dx * (rect.width / displayW) + rect.left;
    var sy = dy * (rect.height / displayH) + rect.top;

    _floatingToolbar.style.display = 'flex';
    _floatingToolbar.style.left = (sx - 52) + 'px';
    _floatingToolbar.style.top  = (sy - 46) + 'px';
    // Show assign button only for desks
    var assignBtn = document.getElementById('ftb-assign-btn');
    if (assignBtn) {
        var isDesk = selItem.type === 'desk' || selItem.type === 'bossDesk';
        assignBtn.style.display = isDesk ? '' : 'none';
        if (isDesk && selItem.assignedTo) {
            assignBtn.title = 'Assigned to: ' + selItem.assignedTo + ' (click to change)';
            assignBtn.textContent = '👤✓';
        } else if (isDesk) {
            assignBtn.title = 'Assign agent to this desk';
            assignBtn.textContent = '👤';
        }
    }
    // Show branch button only for branch signs
    var branchBtn = document.getElementById('ftb-branch-btn');
    if (branchBtn) {
        var isSign = selItem.type === 'branchSign';
        branchBtn.style.display = isSign ? '' : 'none';
        if (isSign && selItem.branchId) {
            var _bInfo = getBranchById(selItem.branchId);
            branchBtn.title = 'Branch: ' + _bInfo.name + ' (click to change)';
            branchBtn.textContent = '🏷️✓';
        } else if (isSign) {
            branchBtn.title = 'Assign branch to this sign';
            branchBtn.textContent = '🏷️';
        }
    }
    var colorBtn = document.getElementById('ftb-color-btn');
    if (colorBtn) colorBtn.style.display = 'none';

    // Show label edit buttons for textLabel items
    var labelEditBtn = document.getElementById('ftb-label-edit-btn');
    if (!labelEditBtn) {
        // Create the label edit button dynamically on first use
        labelEditBtn = document.createElement('button');
        labelEditBtn.id = 'ftb-label-edit-btn';
        labelEditBtn.textContent = '✏️';
        labelEditBtn.title = 'Edit label';
        labelEditBtn.style.cssText = 'padding:4px 6px;background:#2a2a4e;border:1px solid #3a3a5e;border-radius:4px;cursor:pointer;font-size:12px;';
        labelEditBtn.onclick = function() {
            if (!selectedItemId) return;
            var item = officeConfig.furniture.find(function(f){ return f.id === selectedItemId; });
            if (!item || item.type !== 'textLabel') return;
            _showTextLabelEditor(item);
        };
        _floatingToolbar.appendChild(labelEditBtn);
    }
    labelEditBtn.style.display = (selItem.type === 'textLabel') ? '' : 'none';

    // Show settings button for interactiveWindow items
    var iwSettingsBtn = document.getElementById('ftb-iw-settings-btn');
    if (!iwSettingsBtn) {
        iwSettingsBtn = document.createElement('button');
        iwSettingsBtn.id = 'ftb-iw-settings-btn';
        iwSettingsBtn.textContent = '⚙️';
        iwSettingsBtn.title = 'Window settings (weather/sun)';
        iwSettingsBtn.style.cssText = 'padding:4px 6px;background:#2a2a4e;border:1px solid #3a3a5e;border-radius:4px;cursor:pointer;font-size:12px;';
        iwSettingsBtn.onclick = function() {
            if (!selectedItemId) return;
            var item = officeConfig.furniture.find(function(f){ return f.id === selectedItemId; });
            if (!item || item.type !== 'interactiveWindow') return;
            _showInteractiveWindowEditor(item);
        };
        _floatingToolbar.appendChild(iwSettingsBtn);
    }
    iwSettingsBtn.style.display = (selItem.type === 'interactiveWindow') ? '' : 'none';

    // Show color button for couch items
    var couchColorBtn = document.getElementById('ftb-couch-color-btn');
    if (!couchColorBtn) {
        couchColorBtn = document.createElement('button');
        couchColorBtn.id = 'ftb-couch-color-btn';
        couchColorBtn.textContent = '🎨';
        couchColorBtn.title = 'Change couch color';
        couchColorBtn.style.cssText = 'padding:4px 6px;background:#2a2a4e;border:1px solid #3a3a5e;border-radius:4px;cursor:pointer;font-size:12px;';
        couchColorBtn.onclick = function() {
            if (!selectedItemId) return;
            var item = officeConfig.furniture.find(function(f){ return f.id === selectedItemId; });
            if (!item || item.type !== 'couch') return;
            _showCouchColorEditor(item);
        };
        _floatingToolbar.appendChild(couchColorBtn);
    }
    couchColorBtn.style.display = (selItem.type === 'couch') ? '' : 'none';

    // Show rotate button for rotatable items (couch)
    var rotateBtn = document.getElementById('ftb-rotate-btn');
    if (!rotateBtn) {
        rotateBtn = document.createElement('button');
        rotateBtn.id = 'ftb-rotate-btn';
        rotateBtn.textContent = '🔄';
        rotateBtn.title = 'Rotate 90°';
        rotateBtn.style.cssText = 'padding:4px 6px;background:#2a2a4e;border:1px solid #3a3a5e;border-radius:4px;cursor:pointer;font-size:12px;';
        rotateBtn.onclick = function() {
            if (!selectedItemId) return;
            var item = officeConfig.furniture.find(function(f){ return f.id === selectedItemId; });
            if (!item) return;
            var fa = FURNITURE_ACTIONS[item.type];
            if (!fa || !fa.rotatable) return;
            _pushUndo();
            item.rotation = ((item.rotation || 0) + 90) % 360;
            getInteractionSpots();
            _saveOfficeConfig();
        };
        _floatingToolbar.appendChild(rotateBtn);
    }
    var isRotatable = false;
    var selFa = FURNITURE_ACTIONS[selItem.type];
    if (selFa && selFa.rotatable) isRotatable = true;
    rotateBtn.style.display = isRotatable ? '' : 'none';
}

// --- EDIT MODE MOUSE TRACKING ---
canvas.addEventListener('mousemove', function(e) {
    if (!editMode) { editHoverTile = null; _ghostPos = null; return; }
    var world = screenToWorld(e.clientX, e.clientY);
    if (world.x >= 0 && world.x < W && world.y >= 0 && world.y < H) {
        editHoverTile = { tx: Math.floor(world.x / TILE), ty: Math.floor(world.y / TILE) };
        // Snap ghost to active zone center within the hovered tile
        var _snapZone = SNAP_ZONES[activeSnapZone] || SNAP_ZONES['center'];
        var _snapTX = editHoverTile.tx;
        var _snapTY = editHoverTile.ty;
        var _zoneCenterX = _snapTX * TILE + _snapZone.ox * TILE;
        var _zoneCenterY = _snapTY * TILE + _snapZone.oy * TILE;
        // Position ghost so item's visual center lands on the zone center,
        // accounting for where the draw function expects (x,y) to be
        var _ghostBounds = placingType ? (FURNITURE_BOUNDS[placingType] || { w: TILE, h: TILE, ox: 0, oy: 0 }) : { w: TILE, h: TILE, ox: 0, oy: 0 };
        var _gox = _ghostBounds.ox || 0;
        var _goy = _ghostBounds.oy || 0;
        // Zone center = visual center of item → drawX = zoneX - (0.5 - ox) * w
        _ghostPos = { x: Math.round(_zoneCenterX - (0.5 - _gox) * _ghostBounds.w), y: Math.round(_zoneCenterY - (0.5 - _goy) * _ghostBounds.h) };
        // Marquee extend
        if (_marqueeStart && !isDragging && !_multiDragging) {
            _marqueeEnd = { x: world.x, y: world.y };
        }
        // Multi-drag
        if (_multiDragging && _multiDragStart && _multiSelected.length > 0) {
            var mdx = Math.round((world.x - _multiDragStart.x) / HALF_TILE) * HALF_TILE;
            var mdy = Math.round((world.y - _multiDragStart.y) / HALF_TILE) * HALF_TILE;
            if (mdx !== 0 || mdy !== 0) {
                _multiSelected.forEach(function(fid) {
                    var fi = officeConfig.furniture.find(function(f){ return f.id === fid; });
                    if (fi) { fi.x += mdx; fi.y += mdy; }
                });
                _multiDragStart = { x: _multiDragStart.x + mdx, y: _multiDragStart.y + mdy };
            }
        }
        // Drag selected item (tile-snap with highlight)
        if (isDragging && selectedItemId && !placingType) {
            _editMouseMoved = true;
            for (var _di = 0; _di < officeConfig.furniture.length; _di++) {
                if (officeConfig.furniture[_di].id === selectedItemId) {
                    var dragItem = officeConfig.furniture[_di];
                    var dBounds = FURNITURE_BOUNDS[dragItem.type] || {w:TILE, h:TILE, ox:0, oy:0};
                    var snapX = Math.round((world.x - dragOffset.x) / HALF_TILE) * HALF_TILE;
                    var snapY = Math.round((world.y - dragOffset.y) / HALF_TILE) * HALF_TILE;
                    // Highlight matches item's visual footprint (rotation-aware)
                    var _dragTestItem = { type: dragItem.type, x: snapX, y: snapY, rotation: dragItem.rotation || 0 };
                    var _dragWR = _getItemWorldRect(_dragTestItem);
                    _editDragTileHighlight = {
                        x: _dragWR.x, y: _dragWR.y,
                        w: _dragWR.w, h: _dragWR.h
                    };
                    // Only move if valid position
                    if (!_itemOverlaps(dragItem.type, snapX, snapY, selectedItemId) &&
                        _dragWR.x >= 0 && _dragWR.y >= 0 &&
                        _dragWR.x + _dragWR.w <= W &&
                        _dragWR.y + _dragWR.h <= H) {
                        if (dragItem.type === 'window' || dragItem.type === 'interactiveWindow') {
                            var wallH = officeConfig.walls.height || 70;
                            if (snapY <= wallH - 10) {
                                dragItem.x = snapX;
                                dragItem.y = snapY;
                            }
                        } else {
                            dragItem.x = snapX;
                            dragItem.y = snapY;
                        }
                        _editDragTileHighlight.valid = true;
                    } else {
                        _editDragTileHighlight.valid = false;
                    }
                    break;
                }
            }
        }
        // Multi-drag tile highlight
        if (_multiDragging) {
            _editMouseMoved = true;
        }
    } else {
        editHoverTile = null;
        _ghostPos = null;
    }
});

// --- EDIT MODE TOGGLE (called from toolbar button) ---
function toggleEditMode() {
    if (window._voLicense && window._voLicense.demo) {
        alert('Edit Office is a premium feature. Get a license key at myvirtualoffice.ai to unlock.');
        return;
    }
    editMode = !editMode;
    var btn = document.getElementById('btn-edit-office');
    var saveBtn = document.getElementById('btn-save-edits');
    var undoBtn = document.getElementById('btn-undo-edit');
    if (editMode) {
        btn.textContent = '✅ Done Editing';
        btn.classList.add('active-edit');
        if (saveBtn) saveBtn.style.display = '';
        if (undoBtn) undoBtn.style.display = '';
        _showCatalogPanel();
        _undoStack = [];
        _hasUnsavedChanges = false;
        _updateSaveUndoButtons();
    } else {
        btn.textContent = '✏️ Edit Office';
        btn.classList.remove('active-edit');
        if (saveBtn) saveBtn.style.display = 'none';
        if (undoBtn) undoBtn.style.display = 'none';
        editHoverTile = null;
        _floorEditMode = false;
        _hideCatalogPanel();
        if (_hasUnsavedChanges) {
            saveOfficeConfig();
        }
        _undoStack = [];
        _hasUnsavedChanges = false;
    }
}

// --- AGENT CREATOR PANEL ---
var _agentPanel = null;
var _agentPanelSelectedId = null;
var _agentPanelPreviewCanvas = null;
var _agentPanelPreviewCtx = null;
var _agentPanelEditState = null; // working copy of appearance being edited
var _acpUndoStack = [];
var _acpUnsaved = false;

// ============================================================
// MAIN MENU
// ============================================================
var _mainMenuOpen = false;

function toggleMainMenu() {
    var panel = document.getElementById('main-menu-panel');
    if (!panel) return;
    _mainMenuOpen = !_mainMenuOpen;
    panel.classList.toggle('open', _mainMenuOpen);
    var btn = document.getElementById('btn-main-menu');
    if (btn) btn.classList.toggle('active-edit', _mainMenuOpen);
    if (_mainMenuOpen) _mmLoadCurrentSettings();
}

function _mmLoadCurrentSettings() {
    // Populate fields from current server config
    fetch('/vo-config').then(function(r){ return r.json(); }).then(function(cfg) {
        var gwInput = document.getElementById('mm-gateway-url');
        var nameInput = document.getElementById('mm-office-name');
        var weatherCityInput = document.getElementById('mm-weather-city');
        var weatherStateInput = document.getElementById('mm-weather-state');
        var pathInput = document.getElementById('mm-oc-path');
        var tokenInput = document.getElementById('mm-gateway-token');
        var hermesCb = document.getElementById('mm-hermes-enable');
        var hermesFields = document.getElementById('mm-hermes-fields');
        var hermesHome = document.getElementById('mm-hermes-home');
        var hermesBin = document.getElementById('mm-hermes-bin');
        if (gwInput) gwInput.value = (cfg.openclaw || {}).gatewayUrl || '';
        if (nameInput) nameInput.value = (cfg.office || {}).name || '';
        // Parse "City,State" or "City+Name,State" back into separate fields
        var _wloc = (cfg.weather || {}).location || '';
        var _wparts = _wloc.split(',');
        if (weatherCityInput) weatherCityInput.value = (_wparts[0] || '').replace(/\+/g, ' ');
        if (weatherStateInput) weatherStateInput.value = (_wparts[1] || '').replace(/\+/g, ' ');
        if (pathInput) pathInput.value = (cfg.openclaw || {}).homePath || '';
        var hermesCfg = cfg.hermes || {};
        var hermesEnabled = hermesCfg.enabled !== false;
        if (hermesCb) hermesCb.checked = hermesEnabled;
        if (hermesFields) hermesFields.style.display = hermesEnabled ? 'block' : 'none';
        if (hermesHome) hermesHome.value = hermesCfg.homePath || '';
        if (hermesBin) hermesBin.value = hermesCfg.binary || '';
        // Auto-populate token from /gateway-info (shows current effective token)
        if (tokenInput) {
            fetch('/gateway-info').then(function(r) { return r.json(); }).then(function(gi) {
                if (gi.token && !tokenInput.value) tokenInput.value = gi.token;
            }).catch(function(){});
        }
        // PC Metrics
        var pcmEnabled = ((cfg.features || {}).pcMetrics) || false;
        var pcmUrl = ((cfg.pcMetrics || {}).url) || "";
        var pcmCb = document.getElementById("mm-pcmetrics-enable");
        var pcmUrlEl = document.getElementById("mm-pcmetrics-url");
        var pcmFields = document.getElementById("mm-pcmetrics-fields");
        if (pcmCb) pcmCb.checked = pcmEnabled;
        if (pcmUrlEl) pcmUrlEl.value = pcmUrl;
        if (pcmFields) pcmFields.style.display = pcmEnabled ? "block" : "none";
        // API Usage
        var apiUsageCb = document.getElementById("mm-apiusage-enable");
        if (apiUsageCb) apiUsageCb.checked = (cfg.features || {}).apiUsage !== false;
        // Browser
        var brEnabled = ((cfg.features || {}).browserPanel) || false;
        var brCdp = ((cfg.browser || {}).cdpUrl) || "";
        var brViewer = ((cfg.browser || {}).viewerUrl) || "";
        var brCb = document.getElementById("mm-browser-enable");
        var brCdpEl = document.getElementById("mm-cdp-url");
        var brViewerEl = document.getElementById("mm-viewer-url");
        var brFields = document.getElementById("mm-browser-fields");
        if (brCb) brCb.checked = brEnabled;
        if (brCdpEl) brCdpEl.value = brCdp;
        if (brViewerEl) brViewerEl.value = brViewer;
        if (brFields) brFields.style.display = brEnabled ? "block" : "none";
    }).catch(function(){});
    // Load display prefs from localStorage
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem('vo-display-prefs') || '{}'); } catch(e){}
    var cb1 = document.getElementById('mm-show-bubbles');
    var cb2 = document.getElementById('mm-show-weather');
    var cb3 = document.getElementById('mm-show-names');
    if (cb1) cb1.checked = prefs.showBubbles !== false;
    if (cb2) cb2.checked = prefs.showWeather !== false;
    if (cb3) cb3.checked = prefs.showNames !== false;
}


// PC Metrics toggle in settings
(function() {
    var _pcmCb = document.getElementById('mm-pcmetrics-enable');
    if (_pcmCb) _pcmCb.addEventListener('change', function() {
        var f = document.getElementById('mm-pcmetrics-fields');
        if (f) f.style.display = this.checked ? 'block' : 'none';
    });
})();

// Browser toggle in settings
(function() {
    var _brCb = document.getElementById('mm-browser-enable');
    if (_brCb) _brCb.addEventListener('change', function() {
        var f = document.getElementById('mm-browser-fields');
        if (f) f.style.display = this.checked ? 'block' : 'none';
    });
})();

// Hermes toggle in settings
(function() {
    var _hCb = document.getElementById('mm-hermes-enable');
    if (_hCb) _hCb.addEventListener('change', function() {
        var f = document.getElementById('mm-hermes-fields');
        if (f) f.style.display = this.checked ? 'block' : 'none';
    });
})();

function mmTestHermes() {
    var statusEl = document.getElementById('mm-hermes-status');
    var enabled = !!(document.getElementById('mm-hermes-enable') || {}).checked;
    var homePath = (document.getElementById('mm-hermes-home') || {}).value || '';
    var binary = (document.getElementById('mm-hermes-bin') || {}).value || '';
    if (!enabled) {
        statusEl.innerHTML = '<div class="mm-status info">Hermes auto-detect is disabled.</div>';
        return;
    }
    statusEl.innerHTML = '<div class="mm-status info">Saving and testing Hermes...</div>';
    fetch('/setup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hermes: { enabled: enabled, homePath: homePath || null, binary: binary || null } })
    }).then(function() {
        return fetch('/api/hermes/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ homePath: homePath || null, binary: binary || null })
        });
    }).then(function(r) { return r.json().then(function(d){ d._httpOk = r.ok; return d; }); }).then(function(d) {
        if (d.ok) {
            var count = (d.agents || []).length;
            var names = (d.agents || []).slice(0, 5).map(function(a){ return (a.emoji || '⚕️') + ' ' + a.name + (a.model ? ' · ' + a.model : ''); }).join('<br>');
            statusEl.innerHTML = '<div class="mm-status ok">✅ Hermes connected — ' + count + ' profile' + (count === 1 ? '' : 's') + ' found' + (names ? '<br>' + names : '') + '</div>';
        } else {
            statusEl.innerHTML = '<div class="mm-status err">❌ Hermes not reachable: ' + (d.error || 'unknown error') + '</div>';
        }
    }).catch(function(e) {
        statusEl.innerHTML = '<div class="mm-status err">❌ Hermes test failed: ' + e.message + '</div>';
    });
}

function mmTestCdp() {
    var cdpUrl = document.getElementById('mm-cdp-url').value.trim();
    var viewerUrl = document.getElementById('mm-viewer-url').value.trim();
    var statusEl = document.getElementById('mm-cdp-status');
    if (!cdpUrl) { statusEl.innerHTML = '<div class="mm-status err">Enter a CDP URL first</div>'; return; }
    statusEl.innerHTML = '<div class="mm-status">Saving & testing...</div>';
    // Save first, then test
    fetch('/setup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            features: { browserPanel: true },
            browser: { cdpUrl: cdpUrl, viewerUrl: viewerUrl || null }
        })
    }).then(function() {
        return fetch('/browser-status');
    }).then(function(r) { return r.json(); }).then(function(status) {
        if (status.cdpAvailable) {
            fetch('/browser-tabs').then(function(r) { return r.json(); }).then(function(tabs) {
                var count = Array.isArray(tabs) ? tabs.length : 0;
                statusEl.innerHTML = '<div class="mm-status ok">\u2705 CDP connected! ' + count + ' tab(s) open</div>';
            }).catch(function() {
                statusEl.innerHTML = '<div class="mm-status ok">\u2705 CDP reachable</div>';
            });
        } else {
            statusEl.innerHTML = '<div class="mm-status err">\u274c CDP not reachable. Check the URL and make sure the browser container is running.</div>';
        }
    }).catch(function(e) {
        statusEl.innerHTML = '<div class="mm-status err">\u274c Error: ' + e.message + '</div>';
    });
}

function mmTestViewer() {
    var cdpUrl = document.getElementById('mm-cdp-url').value.trim();
    var viewerUrl = document.getElementById('mm-viewer-url').value.trim();
    var statusEl = document.getElementById('mm-viewer-status');
    if (!viewerUrl) { statusEl.innerHTML = '<div class="mm-status err">Enter a Viewer URL first</div>'; return; }
    statusEl.innerHTML = '<div class="mm-status">Saving & testing...</div>';
    // Save first, then test
    fetch('/setup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            features: { browserPanel: true },
            browser: { cdpUrl: cdpUrl || null, viewerUrl: viewerUrl }
        })
    }).then(function() {
        return fetch(viewerUrl.replace(/\/$/, ''), { mode: 'no-cors', cache: 'no-store' });
    }).then(function() {
        statusEl.innerHTML = '<div class="mm-status ok">\u2705 Viewer reachable. Open the browser panel to see the live view.</div>';
    }).catch(function(e) {
        statusEl.innerHTML = '<div class="mm-status err">\u274c Viewer not reachable from your browser. Make sure the URL is accessible from this device. Error: ' + e.message + '</div>';
    });
}

function mmTestPcMetrics() {
    var url = document.getElementById('mm-pcmetrics-url').value.trim();
    var statusEl = document.getElementById('mm-pcmetrics-status');
    if (!url) { statusEl.innerHTML = '<div class="mm-status err">Enter a Metrics Server URL</div>'; return; }
    statusEl.innerHTML = '<div class="mm-status info">Saving and testing...</div>';
    fetch('/setup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: { pcMetrics: true }, pcMetrics: { url: url } })
    }).then(function() { return fetch('/pc-metrics'); })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.error) {
            statusEl.innerHTML = '<div class="mm-status err">❌ ' + data.error + '</div>';
        } else if (data.cpu) {
            var info = 'CPU: ' + (data.cpu.percent||0).toFixed(0) + '% (' + (data.cpu.threads||'?') + ' threads)';
            info += ' · RAM: ' + (data.memory.percent||0).toFixed(0) + '%';
            if (data.gpus && data.gpus.length > 0) info += ' · GPU: ' + data.gpus[0].name;
            statusEl.innerHTML = '<div class="mm-status ok">✅ Connected!<br>' + info + '</div>';
        } else {
            statusEl.innerHTML = '<div class="mm-status err">❌ Unexpected response format</div>';
        }
    }).catch(function(e) {
        statusEl.innerHTML = '<div class="mm-status err">❌ ' + e.message + '</div>';
    });
}

function mmTestConnection() {
    var statusEl = document.getElementById('mm-conn-status');
    statusEl.innerHTML = '<div class="mm-status info">Testing...</div>';
    // Save current settings first so the server tests with the new values
    var gwUrl = document.getElementById('mm-gateway-url').value;
    var ocPath = document.getElementById('mm-oc-path').value;
    var gwToken = (document.getElementById('mm-gateway-token') || {}).value || '';
    var saveBody = { openclaw: {} };
    if (gwUrl) {
        saveBody.openclaw.gatewayUrl = gwUrl;
        saveBody.openclaw.gatewayHttp = gwUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace(/\/ws.*$/, '');
    }
    if (ocPath) saveBody.openclaw.homePath = ocPath;
    if (gwToken) saveBody.openclaw.gatewayToken = gwToken;

    fetch('/setup/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saveBody) })
    .then(function() {
        // Test agents (OpenClaw path)
        return fetch('/api/agents').then(function(r){ return r.json(); });
    }).then(function(d) {
        var lines = [];
        if (d.agents && d.agents.length > 0) {
            lines.push('✅ OpenClaw: ' + d.agents.length + ' agent' + (d.agents.length === 1 ? '' : 's') + ' found');
        } else {
            lines.push('⚠️ OpenClaw: connected but no agents found');
        }
        // Test gateway WS
        return fetch('/api/gateway/test').then(function(r){ return r.json(); }).then(function(t) {
            if (t.gateway === 'reachable') {
                lines.push('✅ Gateway: reachable');
                if (t.token) lines.push('✅ Token: valid');
                else lines.push('⚠️ Token: not found or invalid');
            } else {
                lines.push('❌ Gateway: ' + (t.error || 'unreachable'));
            }
            var allOk = lines.every(function(l){ return l.indexOf('✅') === 0; });
            statusEl.innerHTML = '<div class="mm-status ' + (allOk ? 'ok' : 'err') + '">' + lines.join('<br>') + '</div>';
        });
    }).catch(function(e) {
        statusEl.innerHTML = '<div class="mm-status err">❌ Failed: ' + e.message + '</div>';
    });
}

function _buildWeatherLocation(city, state) {
    city = (city || '').trim();
    state = (state || '').trim();
    if (!city) return null;
    return state ? city.replace(/ /g, '+') + ',' + state.replace(/ /g, '+') : city.replace(/ /g, '+');
}

function mmSaveSettings() {
    var gwUrl = document.getElementById('mm-gateway-url').value;
    var officeName = document.getElementById('mm-office-name').value;
    var weather = _buildWeatherLocation(
        document.getElementById('mm-weather-city').value,
        document.getElementById('mm-weather-state').value
    );

    // Save display prefs locally
    var _elBubbles = document.getElementById('mm-show-bubbles');
    var _elWeather = document.getElementById('mm-show-weather');
    var _elNames = document.getElementById('mm-show-names');
    var displayPrefs = {
        showBubbles: _elBubbles ? _elBubbles.checked : true,
        showWeather: _elWeather ? _elWeather.checked : true,
        showNames: _elNames ? _elNames.checked : true,
    };
    localStorage.setItem('vo-display-prefs', JSON.stringify(displayPrefs));
    _displayPrefs = displayPrefs;

    // Build server config
    var ocPath = document.getElementById('mm-oc-path').value;
    var gwToken = (document.getElementById('mm-gateway-token') || {}).value || '';
    var config = {};
    config.openclaw = { gatewayUrl: gwUrl || 'ws://127.0.0.1:18789' };
    if (gwUrl) {
        config.openclaw.gatewayHttp = gwUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace(/\/ws.*$/, '');
    }
    if (ocPath) config.openclaw.homePath = ocPath;
    if (gwToken) config.openclaw.gatewayToken = gwToken;
    var _hCb = document.getElementById('mm-hermes-enable');
    var _hHome = document.getElementById('mm-hermes-home');
    var _hBin = document.getElementById('mm-hermes-bin');
    if (_hCb) {
        config.hermes = {
            enabled: _hCb.checked,
            homePath: (_hHome ? _hHome.value.trim() : '') || null,
            binary: (_hBin ? _hBin.value.trim() : '') || null
        };
    }
    config.office = { name: officeName || 'Virtual Office' };
    config.weather = { location: weather || null };
    // PC Metrics
    var _pcmCb = document.getElementById("mm-pcmetrics-enable");
    var _pcmUrl = document.getElementById("mm-pcmetrics-url");
    if (_pcmCb) {
        if (!config.features) config.features = {};
        config.features.pcMetrics = _pcmCb.checked;
        config.pcMetrics = { url: (_pcmUrl ? _pcmUrl.value.trim() : "") || null };
    }
    // API Usage
    var _apiCb = document.getElementById("mm-apiusage-enable");
    if (_apiCb) {
        if (!config.features) config.features = {};
        config.features.apiUsage = _apiCb.checked;
    }
    // Browser
    var _brCb = document.getElementById("mm-browser-enable");
    var _brCdp = document.getElementById("mm-cdp-url");
    var _brViewer = document.getElementById("mm-viewer-url");
    if (_brCb) {
        if (!config.features) config.features = {};
        config.features.browserPanel = _brCb.checked;
        config.browser = {
            cdpUrl: (_brCdp ? _brCdp.value.trim() : "") || null,
            viewerUrl: (_brViewer ? _brViewer.value.trim() : "") || null
        };
    }

    fetch('/setup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    }).then(function(r){ return r.json(); }).then(function(d) {
        if (d.ok) {
            _acpShowToast('💾 Settings saved! Hard refresh (Ctrl+Shift+R) to apply all changes.');
            // Update brand title live
            var brandEl = document.getElementById('brand-title');
            if (brandEl && officeName) brandEl.textContent = officeName.toUpperCase();
            if (officeName) document.title = officeName;
        } else {
            _acpShowToast('❌ Save failed');
        }
    }).catch(function(e) {
        _acpShowToast('❌ Save failed: ' + e.message);
    });
}

function mmExportConfig() {
    var blob = new Blob([JSON.stringify(officeConfig, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'virtual-office-config.json';
    a.click();
    URL.revokeObjectURL(url);
    _acpShowToast('📤 Config exported');
}

function mmImportConfig() {
    var fileInput = document.getElementById('mm-import-file');
    fileInput.onchange = function() {
        var file = fileInput.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var imported = JSON.parse(e.target.result);
                if (!imported.canvasWidth && !imported.furniture) {
                    _acpShowToast('❌ Invalid config file');
                    return;
                }
                if (!confirm('Import this config? This will replace your current office layout.')) return;
                // Merge imported config
                if (imported.canvasWidth) { W = imported.canvasWidth; officeConfig.canvasWidth = W; }
                if (imported.canvasHeight) { H = imported.canvasHeight; officeConfig.canvasHeight = H; }
                if (imported.walls) officeConfig.walls = imported.walls;
                if (imported.floor) officeConfig.floor = imported.floor;
                if (imported.furniture) officeConfig.furniture = imported.furniture;
                if (imported.agents) officeConfig.agents = imported.agents;
                if (imported.branches) officeConfig.branches = imported.branches;
                saveOfficeConfig();
                resizeCanvas(true);
                if (typeof buildCollisionGrid === 'function') buildCollisionGrid();
                if (typeof getInteractionSpots === 'function') getInteractionSpots();
                if (typeof _initAgentsFromDefs === 'function' && _rosterLoaded) _initAgentsFromDefs();
                _acpShowToast('📥 Config imported!');
            } catch (err) {
                _acpShowToast('❌ Invalid JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    };
    fileInput.click();
}

function mmFullReset() {
    if (!confirm('⚠️ FULL RESET\n\nThis will delete ALL your office customizations:\n• Furniture layout\n• Agent appearances\n• Branch definitions\n• Wall configurations\n\nAre you sure?')) return;
    if (!confirm('This cannot be undone. Type "RESET" in the next prompt to confirm.')) return;
    var input = prompt('Type RESET to confirm:');
    if (input !== 'RESET') { _acpShowToast('Reset cancelled'); return; }

    // Clear everything
    localStorage.removeItem(OFFICE_CONFIG_KEY);
    fetch('/api/office-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
    }).then(function() {
        _acpShowToast('🗑️ Office reset. Reloading...');
        setTimeout(function() { window.location.reload(); }, 1000);
    });
}

function toggleAgentPanel() {
    if (window._voLicense && window._voLicense.demo) {
        alert('Agent Editor is a premium feature. Get a license key at myvirtualoffice.ai to unlock.');
        return;
    }
    if (!_agentPanel) _buildAgentPanel();
    if (_agentPanel.classList.contains('visible')) {
        _agentPanel.classList.remove('visible');
    } else {
        _agentPanel.classList.add('visible');
        _acpRefreshList();
        if (!_agentPanelSelectedId && agents.length > 0) {
            _acpSelectAgent(agents[0].id);
        }
    }
}

function _buildAgentPanel() {
    if (_agentPanel) return;

    var panel = document.createElement('div');
    panel.id = 'agent-creator-panel';
    panel.className = 'agent-panel';

    // Header
    var header = document.createElement('div');
    header.className = 'agent-panel-header';
    var title = document.createElement('span');
    title.className = 'agent-panel-title';
    title.textContent = '👤 AGENTS';
    header.appendChild(title);
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.className = 'catalog-close-btn';
    closeBtn.onclick = toggleAgentPanel;
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Scrollable body
    var body = document.createElement('div');
    body.className = 'agent-panel-body';

    var addBtn = document.createElement('button');
    addBtn.textContent = '➕ New Agent';
    addBtn.className = 'agent-add-btn';
    addBtn.onclick = _acpCreateNewAgent;
    body.appendChild(addBtn);

    var listEl = document.createElement('div');
    listEl.id = 'acp-agent-list';
    body.appendChild(listEl);

    var sep = document.createElement('div');
    sep.className = 'agent-panel-sep';
    body.appendChild(sep);

    var editorEl = document.createElement('div');
    editorEl.id = 'acp-editor';
    body.appendChild(editorEl);

    panel.appendChild(body);
    var _agentWrapper = document.querySelector('.game-wrapper');
    (_agentWrapper || document.body).appendChild(panel);
    _agentPanel = panel;
}

function _acpRefreshList() {
    var container = document.getElementById('acp-agent-list');
    if (!container) return;
    container.innerHTML = '';
    agents.forEach(function(agent) {
        var card = document.createElement('div');
        card.className = 'agent-card' + (agent.id === _agentPanelSelectedId ? ' selected' : '');
        card.innerHTML =
            '<span class="agent-card-emoji">' + agent.emoji + '</span>' +
            '<span class="agent-card-info">' +
                '<span class="agent-card-name">' + agent.name + '</span>' +
                '<span class="agent-card-role">' + agent.role + '</span>' +
            '</span>';
        card.onclick = function() { _acpSelectAgent(agent.id); };
        container.appendChild(card);
    });
}

function _acpSelectAgent(agentId) {
    _agentPanelSelectedId = agentId;
    _acpRefreshList();
    var agent = agents.find(function(a){ return a.id === agentId; });
    if (!agent) return;
    _agentPanelEditState = JSON.parse(JSON.stringify({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        color: agent.color,
        gender: agent.gender,
        branch: agent.branch || 'UNASSIGNED',
        statusKey: agent.statusKey || '',
        appearance: agent.getAppearance()
    }));
    _acpBuildEditor(agent);
}

function _acpBuildEditor(agent) {
    var col = document.getElementById('acp-editor');
    if (!col) return;
    col.innerHTML = '';
    var es = _agentPanelEditState;

    // Preview area
    var previewWrap = document.createElement('div');
    previewWrap.className = 'agent-preview-wrap';
    var previewCanvas = document.createElement('canvas');
    previewCanvas.width = 80; previewCanvas.height = 100;
    previewCanvas.className = 'agent-preview-canvas';
    _agentPanelPreviewCanvas = previewCanvas;
    _agentPanelPreviewCtx = previewCanvas.getContext('2d');
    previewWrap.appendChild(previewCanvas);
    var previewInfo = document.createElement('div');
    previewInfo.className = 'agent-preview-info';
    previewInfo.innerHTML =
        '<div class="agent-preview-name" id="acp-preview-name">' + es.name + '</div>' +
        '<div class="agent-preview-role" id="acp-preview-role">' + es.role + '</div>' +
        '<div class="agent-preview-role" id="acp-preview-branch">Branch: ' + getBranchDisplayName(es.branch) + '</div>' +
        '<div class="agent-preview-emoji" id="acp-preview-emoji">' + es.emoji + '</div>';
    previewWrap.appendChild(previewInfo);
    col.appendChild(previewWrap);

    // Save / Undo bar for agent edits
    var editBar = document.createElement('div');
    editBar.style.cssText = 'display:flex;gap:6px;padding:4px 8px;justify-content:center;';
    var agentSaveBtn = document.createElement('button');
    agentSaveBtn.textContent = '💾 Save';
    agentSaveBtn.id = 'acp-save-btn';
    agentSaveBtn.style.cssText = 'padding:4px 12px;background:#1b5e20;color:#66bb6a;border:1px solid #66bb6a;border-radius:4px;cursor:pointer;font-size:11px;';
    agentSaveBtn.addEventListener('click', function() {
        _acpSave();
        _acpUnsaved = false;
        _acpShowToast('💾 Agent saved!');
    });
    var agentUndoBtn = document.createElement('button');
    agentUndoBtn.textContent = '↩️ Undo';
    agentUndoBtn.id = 'acp-undo-btn';
    agentUndoBtn.style.cssText = 'padding:4px 12px;background:#b71c1c;color:#ef5350;border:1px solid #ef5350;border-radius:4px;cursor:pointer;font-size:11px;';
    agentUndoBtn.addEventListener('click', function() {
        if (_acpUndoStack.length === 0) { _acpShowToast('Nothing to undo'); return; }
        var prev = _acpUndoStack.pop();
        // Restore agent appearance
        Object.assign(agent, JSON.parse(prev));
        agent.appearance = JSON.parse(prev).appearance;
        _acpSelectAgent(agent.id);
    });
    editBar.appendChild(agentSaveBtn);
    editBar.appendChild(agentUndoBtn);

    var sectionsWrap = document.createElement('div');
    sectionsWrap.className = 'agent-sections-wrap';

    function makeSection(title) {
        var s = document.createElement('div');
        s.className = 'agent-edit-section';
        var h = document.createElement('div');
        h.className = 'agent-section-header';
        h.textContent = '─── ' + title + ' ───';
        s.appendChild(h);
        return s;
    }
    function makeField(label, control) {
        var row = document.createElement('div');
        row.className = 'agent-field-row';
        var lbl = document.createElement('span');
        lbl.className = 'agent-field-label';
        lbl.textContent = label + ':';
        row.appendChild(lbl);
        row.appendChild(control);
        return row;
    }

    // --- Identity ---
    var idSec = makeSection('Identity');
    idSec.appendChild(makeField('Name', _acpText(es.name, function(v){ es.name=v; _acpUpdatePreviewInfo(); _acpAutoSave(); })));
    idSec.appendChild(makeField('Role', _acpText(es.role, function(v){ es.role=v; _acpUpdatePreviewInfo(); _acpAutoSave(); })));
    idSec.appendChild(makeField('Emoji', _acpText(es.emoji, function(v){ es.emoji=v; _acpUpdatePreviewInfo(); _acpAutoSave(); })));
    idSec.appendChild(makeField('Gender', _acpToggle(['M','F'], es.gender, function(v){
        es.gender=v; _acpAutoSave(); _acpBuildEditor(agent);
    })));
    sectionsWrap.appendChild(idSec);

    // --- Colors ---
    var clrSec = makeSection('Colors');
    clrSec.appendChild(makeField('Shirt', _acpColor(es.color, function(v){ es.color=v; _acpAutoSave(); })));
    var skinPresets = ['#fddcb5','#ffcc80','#e8b88a','#d4a574','#c68642','#8d5524'];
    clrSec.appendChild(makeField('Skin', _acpSwatchRow(skinPresets, es.appearance.skinTone, function(v){ es.appearance.skinTone=v; _acpAutoSave(); }, true)));
    sectionsWrap.appendChild(clrSec);

    // --- Hair ---
    var hairSec = makeSection('Hair');
    var hairStyles = ['bald','buzz','short','medium','long','curly','wavy','spiky','bun','ponytail','mohawk'];
    hairSec.appendChild(makeField('Style', _acpGridSelect(hairStyles, es.appearance.hairStyle, function(v){ es.appearance.hairStyle=v; _acpAutoSave(); })));
    var hairColorPresets = ['#1a1a1a','#3e2723','#5d4037','#8d6e63','#dcc282','#bf360c','#616161','#e0e0e0'];
    hairSec.appendChild(makeField('Color', _acpSwatchRow(hairColorPresets, es.appearance.hairColor, function(v){ es.appearance.hairColor=v; _acpAutoSave(); }, true)));
    hairSec.appendChild(makeField('Highlight', _acpColorNullable(es.appearance.hairHighlight, function(v){ es.appearance.hairHighlight=v; _acpAutoSave(); })));
    sectionsWrap.appendChild(hairSec);

    // --- Face ---
    var faceSec = makeSection('Face');
    var ebStyles = ['thin','thick','angular','arched'];
    faceSec.appendChild(makeField('Eyebrows', _acpGridSelect(ebStyles, es.appearance.eyebrowStyle, function(v){ es.appearance.eyebrowStyle=v; _acpAutoSave(); })));
    var eyePresets = ['#212121','#1565c0','#2e7d32','#5d4037','#6a1b9a','#37474f'];
    faceSec.appendChild(makeField('Eye Color', _acpSwatchRow(eyePresets, es.appearance.eyeColor, function(v){ es.appearance.eyeColor=v; _acpAutoSave(); }, true)));
    if (es.gender === 'M') {
        var fhStyles = ['none','stubble','beard','goatee','mustache'];
        faceSec.appendChild(makeField('Facial Hair', _acpGridSelect(fhStyles, es.appearance.facialHair || 'none', function(v){ es.appearance.facialHair=v==='none'?null:v; _acpAutoSave(); })));
        faceSec.appendChild(makeField('Beard Color', _acpColorNullable(es.appearance.facialHairColor, function(v){ es.appearance.facialHairColor=v; _acpAutoSave(); })));
    }
    sectionsWrap.appendChild(faceSec);

    // --- Costumes ---
    var costSec = makeSection('Costumes');
    var costumeTypes = ['none','lobster','chicken'];
    costSec.appendChild(makeField('Costume', _acpGridSelect(costumeTypes, es.appearance.costume||'none', function(v){ es.appearance.costume=v==='none'?null:v; if(v!=='none') { es.appearance.headwear=null; } _costumeCache={}; _acpAutoSave(); })));
    var costumeNote = document.createElement('div');
    costumeNote.style.cssText = 'font-size:10px;color:#888;margin-top:4px;padding:0 2px;';
    costumeNote.textContent = 'Costumes replace headwear. 🦞 Lobster  🐔 Chicken';
    costSec.appendChild(costumeNote);
    sectionsWrap.appendChild(costSec);

    // --- Accessories ---
    var accSec = makeSection('Accessories');
    var hwTypes = ['none','hardhat','cap','crown','tiara','headband','goggles','headset','beanie'];
    accSec.appendChild(makeField('Headwear', _acpGridSelect(hwTypes, es.appearance.headwear||'none', function(v){ es.appearance.headwear=v==='none'?null:v; _acpAutoSave(); })));
    accSec.appendChild(makeField('Hat Color', _acpColor(es.appearance.headwearColor||'#888888', function(v){ es.appearance.headwearColor=v; _acpAutoSave(); })));
    var glTypes = ['none','round','square','sunglasses'];
    accSec.appendChild(makeField('Glasses', _acpGridSelect(glTypes, es.appearance.glasses||'none', function(v){ es.appearance.glasses=v==='none'?null:v; _acpAutoSave(); })));
    accSec.appendChild(makeField('Lens Color', _acpColor(es.appearance.glassesColor||'#333333', function(v){ es.appearance.glassesColor=v; _acpAutoSave(); })));
    sectionsWrap.appendChild(accSec);

    // --- Items ---
    var itemSec = makeSection('Items');
    var heldItems = ['none','tablet','wrench','coffee','clipboard','pen','hammer','testTube','book'];
    itemSec.appendChild(makeField('Held Item', _acpGridSelect(heldItems, es.appearance.heldItem||'none', function(v){ es.appearance.heldItem=v==='none'?null:v; _acpAutoSave(); })));
    var deskItems = ['none','anvil','trophy','calendar','envelope','money','ruler','marker','chart','plans','checklist','microscope','shield','phone','files'];
    itemSec.appendChild(makeField('Desk Item', _acpGridSelect(deskItems, es.appearance.deskItem||'none', function(v){ es.appearance.deskItem=v==='none'?null:v; _acpAutoSave(); })));
    sectionsWrap.appendChild(itemSec);

    // --- Assignment ---
    var asnSec = makeSection('Assignment');
    var branchSelect = document.createElement('select');
    branchSelect.style.cssText = 'width:100%;padding:4px 6px;background:#2a2a4e;color:#ccc;border:1px solid #3a3a5e;border-radius:4px;font-size:12px;margin-top:4px;';
    getBranchList().forEach(function(branch) {
        var opt = document.createElement('option');
        opt.value = branch.id;
        opt.textContent = branch.emoji + ' ' + branch.name;
        branchSelect.appendChild(opt);
    });
    branchSelect.value = es.branch || 'UNASSIGNED';
    branchSelect.addEventListener('change', function() {
        es.branch = this.value;
        _acpUpdatePreviewInfo();
        _acpAutoSave();
    });
    asnSec.appendChild(makeField('Branch', branchSelect));
    var ocSelect = document.createElement('select');
    ocSelect.style.cssText = 'width:100%;padding:4px 6px;background:#2a2a4e;color:#ccc;border:1px solid #3a3a5e;border-radius:4px;font-size:12px;margin-top:4px;';
    // Default option
    var defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = '— None —';
    ocSelect.appendChild(defOpt);
    // Loading placeholder
    var loadOpt = document.createElement('option');
    loadOpt.value = '_loading';
    loadOpt.textContent = 'Loading agents...';
    loadOpt.disabled = true;
    ocSelect.appendChild(loadOpt);
    ocSelect.value = es.statusKey || '';
    // Fetch agent list from server
    fetch('/agents-list').then(function(res) { return res.json(); }).then(function(data) {
        // Remove loading placeholder
        if (loadOpt.parentNode) loadOpt.remove();
        // Get already-assigned agent IDs (exclude current agent)
        var assignedIds = {};
        agents.forEach(function(a) {
            if (a.statusKey && a.id !== agent.id) assignedIds[a.statusKey] = a.name;
        });
        (data.agents || []).forEach(function(oc) {
            var opt = document.createElement('option');
            opt.value = oc.key;
            var label = (oc.emoji || '') + ' ' + oc.name + ' (' + oc.agentId + ')';
            if (assignedIds[oc.key]) label += ' — assigned to ' + assignedIds[oc.key];
            opt.textContent = label;
            if (assignedIds[oc.key]) { opt.style.color = '#666'; }
            ocSelect.appendChild(opt);
        });
        ocSelect.value = es.statusKey || '';
    }).catch(function() {
        if (loadOpt.parentNode) { loadOpt.textContent = 'Failed to load'; }
    });
    ocSelect.addEventListener('change', function() {
        es.statusKey = ocSelect.value;
        // Also update the agent's statusKey for status polling
        agent.statusKey = ocSelect.value;
        _acpAutoSave();
    });
    asnSec.appendChild(makeField('OpenClaw Agent', ocSelect));
    sectionsWrap.appendChild(asnSec);

    col.appendChild(sectionsWrap);

    // Delete button (any agent except main)
    if (agent.id !== 'main') {
        var delWrap = document.createElement('div');
        delWrap.className = 'agent-delete-wrap';
        var delBtn = document.createElement('button');
        delBtn.innerHTML = '🗑️ Delete Agent';
        delBtn.className = 'agent-delete-btn';
        delBtn.onclick = function() { _acpDeleteAgent(agent.id); };
        delWrap.appendChild(delBtn);
        col.appendChild(delWrap);
    }

    // Save / Undo bar at the bottom
    col.appendChild(editBar);

    _acpUpdatePreview();
}


function _acpText(value, onChange) {
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value || '';
    inp.style.cssText = 'background:#1a1a3e;border:1px solid #2a2a4e;color:#e8e8f0;padding:4px 6px;font-size:11px;flex:1;border-radius:2px';
    inp.oninput = function(){ onChange(inp.value); };
    return inp;
}

function _acpColor(value, onChange) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px';
    var inp = document.createElement('input');
    inp.type = 'color';
    inp.value = value || '#888888';
    inp.style.cssText = 'width:36px;height:24px;border:1px solid #2a2a4e;background:none;cursor:pointer;padding:1px';
    inp.oninput = function(){ onChange(inp.value); };
    wrap.appendChild(inp);
    return wrap;
}

function _acpColorNullable(value, onChange) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:6px';
    var chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = !!value;
    chk.style.cssText = 'cursor:pointer';
    var inp = document.createElement('input');
    inp.type = 'color';
    inp.value = value || '#888888';
    inp.disabled = !value;
    inp.style.cssText = 'width:36px;height:24px;border:1px solid #2a2a4e;background:none;cursor:pointer;padding:1px;opacity:' + (value ? '1' : '0.3');
    chk.onchange = function(){
        inp.disabled = !chk.checked;
        inp.style.opacity = chk.checked ? '1' : '0.3';
        onChange(chk.checked ? inp.value : null);
    };
    inp.oninput = function(){ if (chk.checked) onChange(inp.value); };
    wrap.appendChild(chk);
    wrap.appendChild(inp);
    return wrap;
}

function _acpToggle(options, value, onChange) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:4px';
    options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.textContent = opt;
        var active = opt === value;
        btn.style.cssText = 'padding:3px 10px;border:1px solid ' + (active ? '#ffd600' : '#2a2a4e') + ';background:' + (active ? '#3a3a10' : '#1a1a3e') + ';color:' + (active ? '#ffd600' : '#aaa') + ';cursor:pointer;font-size:11px;border-radius:2px';
        btn.onclick = function(){
            wrap.querySelectorAll('button').forEach(function(b){ b.style.borderColor='#2a2a4e'; b.style.background='#1a1a3e'; b.style.color='#aaa'; });
            btn.style.borderColor='#ffd600'; btn.style.background='#3a3a10'; btn.style.color='#ffd600';
            onChange(opt);
        };
        wrap.appendChild(btn);
    });
    return wrap;
}

function _acpSwatchRow(presets, value, onChange, allowCustom) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;align-items:center';
    presets.forEach(function(c) {
        var sw = document.createElement('div');
        var isSelected = c.toLowerCase() === (value||'').toLowerCase();
        sw.className = 'swatch' + (isSelected ? ' selected' : '');
        sw.style.background = c;
        sw.title = c;
        sw.onclick = function(){
            wrap.querySelectorAll('.swatch').forEach(function(s){ s.classList.remove('selected'); });
            sw.classList.add('selected');
            onChange(c);
        };
        wrap.appendChild(sw);
    });
    if (allowCustom) {
        var inp = document.createElement('input');
        inp.type = 'color';
        inp.value = value || '#888888';
        inp.title = 'Custom color';
        inp.style.cssText = 'width:22px;height:22px;border:1px solid #444;background:none;cursor:pointer;padding:1px';
        inp.oninput = function(){
            wrap.querySelectorAll('.swatch').forEach(function(s){ s.classList.remove('selected'); });
            onChange(inp.value);
        };
        wrap.appendChild(inp);
    }
    return wrap;
}

function _acpGridSelect(options, value, onChange) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px';
    options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.textContent = opt;
        btn.className = 'option-btn' + (opt === (value || 'none') ? ' selected' : '');
        btn.onclick = function(){
            wrap.querySelectorAll('.option-btn').forEach(function(b){ b.classList.remove('selected'); });
            btn.classList.add('selected');
            onChange(opt);
        };
        wrap.appendChild(btn);
    });
    return wrap;
}

function _acpUpdatePreviewInfo() {
    var es = _agentPanelEditState;
    if (!es) return;
    var nameEl = document.getElementById('acp-preview-name');
    var roleEl = document.getElementById('acp-preview-role');
    var branchEl = document.getElementById('acp-preview-branch');
    var emojiEl = document.getElementById('acp-preview-emoji');
    if (nameEl) nameEl.textContent = es.name;
    if (roleEl) roleEl.textContent = es.role;
    if (branchEl) branchEl.textContent = 'Branch: ' + getBranchDisplayName(es.branch);
    if (emojiEl) emojiEl.textContent = es.emoji;
    _acpUpdatePreview();
}

function _acpUpdatePreview() {
    var pCtx = _agentPanelPreviewCtx;
    var pCanvas = _agentPanelPreviewCanvas;
    if (!pCtx || !pCanvas) return;
    var es = _agentPanelEditState;
    if (!es) return;

    // Clear
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    pCtx.fillStyle = '#1a1a2e';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);

    // Draw mini agent at center
    pCtx.save();
    pCtx.translate(40, 75);
    pCtx.scale(1.5, 1.5);

    var app = es.appearance;
    var isFem = es.gender === 'F';

    // Shadow
    pCtx.fillStyle = 'rgba(0,0,0,0.2)';
    pCtx.beginPath(); pCtx.ellipse(0, 4, 12, 5, 0, 0, Math.PI * 2); pCtx.fill();

    // Legs
    pCtx.fillStyle = '#1a1a2e';
    pCtx.fillRect(-10, -2, 8, 8); pCtx.fillRect(2, -2, 8, 8);

    // Body
    pCtx.fillStyle = es.color || '#888';
    if (isFem) {
        pCtx.fillRect(-9, -22, 18, 6); pCtx.fillRect(-8, -16, 16, 9);
    } else {
        pCtx.fillRect(-10, -22, 20, 15);
    }

    // Arms
    pCtx.fillRect(isFem ? -11 : -12, -20, 3, 10);
    pCtx.fillRect(9, -20, 3, 10);

    // Head
    pCtx.fillStyle = app.skinTone || '#ffcc80';
    pCtx.fillRect(-12, -38, 24, 18);

    // Hair
    _drawHairByConfig(pCtx, app.hairStyle, app.hairColor, app.hairHighlight);

    // Eyebrows
    var ebStyle = app.eyebrowStyle || (isFem ? 'thin' : 'thick');
    if (ebStyle === 'thin' || ebStyle === 'arched') {
        pCtx.fillStyle = '#5d4037';
        pCtx.fillRect(-5, -33, 4, 1); pCtx.fillRect(4, -33, 4, 1);
        pCtx.fillRect(-6, -34, 2, 1); pCtx.fillRect(7, -34, 2, 1);
    } else {
        pCtx.fillStyle = '#3e2723';
        pCtx.fillRect(-5, -34, 5, 2); pCtx.fillRect(4, -34, 5, 2);
    }

    // Eyes
    pCtx.fillStyle = '#fff';
    pCtx.fillRect(-6, -31, 6, 5); pCtx.fillRect(3, -31, 6, 5);
    pCtx.fillStyle = app.eyeColor || '#212121';
    pCtx.fillRect(-4, -30, 3, 4); pCtx.fillRect(5, -30, 3, 4);
    pCtx.fillStyle = '#fff';
    pCtx.fillRect(-3, -30, 1, 1); pCtx.fillRect(6, -30, 1, 1);
    if (isFem) {
        pCtx.fillStyle = '#212121';
        pCtx.fillRect(-7, -32, 1, 2); pCtx.fillRect(-6, -33, 1, 2);
        pCtx.fillRect(8, -32, 1, 2); pCtx.fillRect(9, -33, 1, 2);
    }

    // Nose
    var skinVal = app.skinTone || '#ffcc80';
    pCtx.fillStyle = darken(skinVal, 0.15);
    pCtx.fillRect(0, -27, 2, 2);

    // Mouth
    if (isFem) {
        pCtx.fillStyle = '#c4626a'; pCtx.fillRect(-2, -24, 5, 2);
        pCtx.fillStyle = '#d47a82'; pCtx.fillRect(-1, -24, 3, 1);
    } else {
        pCtx.fillStyle = darken(skinVal, 0.25); pCtx.fillRect(-2, -24, 4, 1);
    }

    // Facial hair
    if (app.facialHair) {
        pCtx.fillStyle = app.facialHairColor || darken(skinVal, 0.4);
        if (app.facialHair === 'stubble') { pCtx.globalAlpha=0.4; pCtx.fillRect(-8,-26,16,4); pCtx.globalAlpha=1; }
        else if (app.facialHair === 'beard') { pCtx.fillRect(-8,-27,16,8); pCtx.fillStyle=skinVal; pCtx.fillRect(-3,-26,6,3); }
        else if (app.facialHair === 'goatee') { pCtx.fillRect(-4,-25,8,4); }
        else if (app.facialHair === 'mustache') { pCtx.fillRect(-5,-27,10,2); }
    }

    // Headwear
    _drawHeadwear(pCtx, app.headwear, app.headwearColor, false);

    // Glasses
    _drawGlasses(pCtx, app.glasses, app.glassesColor, 0);

    // Held item
    _drawHeldItem(pCtx, app.heldItem, false);

    // Emoji
    pCtx.font = '8px sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText(es.emoji || '😊', 0, -12);

    pCtx.restore();
}

function _acpSave() {
    var es = _agentPanelEditState;
    if (!es) return;

    // Ensure agents array in officeConfig
    if (!officeConfig.agents) officeConfig.agents = [];

    // Find or create config entry
    var idx = officeConfig.agents.findIndex(function(a){ return a.id === es.id; });
    if (idx >= 0) {
        officeConfig.agents[idx].appearance = es.appearance;
        officeConfig.agents[idx].name = es.name;
        officeConfig.agents[idx].role = es.role;
        officeConfig.agents[idx].emoji = es.emoji;
        officeConfig.agents[idx].color = es.color;
        officeConfig.agents[idx].gender = es.gender;
        officeConfig.agents[idx].branch = es.branch;
    } else {
        officeConfig.agents.push({ id: es.id, name: es.name, role: es.role, emoji: es.emoji, color: es.color, gender: es.gender, branch: es.branch, appearance: es.appearance });
    }

    // Update live agent object
    var agent = agents.find(function(a){ return a.id === es.id; });
    if (agent) {
        agent.name = es.name;
        agent.role = es.role;
        agent.emoji = es.emoji;
        agent.color = es.color;
        agent.gender = es.gender;
        agent.branch = es.branch;
    }

    saveOfficeConfig();
    _acpRefreshList();

    // Show saved toast
    _acpShowToast('✅ Saved!');
}

function _acpAutoSave() {
    var es = _agentPanelEditState;
    if (!es) return;

    // Push undo state before applying
    var agent = agents.find(function(a){ return a.id === es.id; });
    if (agent) {
        _acpUndoStack.push(JSON.stringify({ name: agent.name, role: agent.role, emoji: agent.emoji, color: agent.color, gender: agent.gender, branch: agent.branch, statusKey: agent.statusKey, appearance: JSON.parse(JSON.stringify(agent.appearance || {})) }));
        if (_acpUndoStack.length > 20) _acpUndoStack.shift();
    }

    if (!officeConfig.agents) officeConfig.agents = [];
    var idx = officeConfig.agents.findIndex(function(a){ return a.id === es.id; });
    var agentData = { id: es.id, name: es.name, role: es.role, emoji: es.emoji, color: es.color, gender: es.gender, branch: es.branch, statusKey: es.statusKey, appearance: es.appearance };
    if (idx >= 0) {
        Object.assign(officeConfig.agents[idx], agentData);
    } else {
        officeConfig.agents.push(agentData);
    }
    if (agent) {
        agent.name = es.name;
        agent.role = es.role;
        agent.emoji = es.emoji;
        agent.color = es.color;
        agent.gender = es.gender;
        agent.branch = es.branch;
        agent.appearance = JSON.parse(JSON.stringify(es.appearance));
        if (es.statusKey) agent.statusKey = es.statusKey;
    }

    _acpUnsaved = true;
    // Update Save/Undo button states
    var saveBtn = document.getElementById('acp-save-btn');
    var undoBtn = document.getElementById('acp-undo-btn');
    if (saveBtn) { saveBtn.style.opacity = '1'; saveBtn.disabled = false; }
    if (undoBtn) { undoBtn.style.opacity = '1'; undoBtn.disabled = false; }

    _acpUpdatePreview();
    // Don't auto-save to localStorage — user must click Save
}

function _acpShowToast(msg) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e3a1e;border:1px solid #4caf50;color:#4caf50;padding:8px 20px;border-radius:4px;font-size:12px;z-index:9999;pointer-events:none';
    document.body.appendChild(toast);
    setTimeout(function(){ if (toast.parentNode) toast.parentNode.removeChild(toast); }, 4000);
}

function _isCustomAgent(agentId) {
    // Built-in agents come from AGENT_DEFS
    return !AGENT_DEFS.find(function(d){ return d.id === agentId; });
}

function _acpCreateNewAgent() {
    fetch('/api/agent-platforms').then(function(res) {
        return res.json();
    }).catch(function() {
        return { platforms: [{ id: 'openclaw', label: 'OpenClaw', available: true }] };
    }).then(function(platformData) {
        var platforms = (platformData.platforms || []).filter(function(p){ return p.available && p.create; });
        if (!platforms.length) {
            alert('No agent platforms are available.');
            return null;
        }
        var platformPrompt = 'Agent Platform:\n' + platforms.map(function(p, i){
            return (i + 1) + '. ' + p.label;
        }).join('\n');
        var platformChoice = prompt(platformPrompt, platforms[0].label);
        if (platformChoice === null) return null;
        platformChoice = platformChoice.trim().toLowerCase();
        var selectedPlatform = platforms.find(function(p, i){
            return platformChoice === p.id.toLowerCase() ||
                   platformChoice === p.label.toLowerCase() ||
                   platformChoice === String(i + 1);
        }) || platforms[0];

        var agentName = prompt('Agent name:', 'New Agent');
        if (!agentName || !agentName.trim()) return null;
        agentName = agentName.trim();

        var agentRole = prompt('Role (e.g., "Email specialist", "QA engineer"):', selectedPlatform.id === 'hermes' ? 'Hermes Agent' : 'AI assistant');
        if (agentRole === null) return null;
        agentRole = agentRole.trim() || (selectedPlatform.id === 'hermes' ? 'Hermes Agent' : 'AI assistant');

        var agentEmoji = prompt('Emoji:', selectedPlatform.id === 'hermes' ? '⚕️' : '🤖');
        if (agentEmoji === null) return null;
        agentEmoji = agentEmoji.trim() || (selectedPlatform.id === 'hermes' ? '⚕️' : '🤖');

        _acpShowToast('Creating agent in ' + selectedPlatform.label + '...');
        return fetch('/api/agent/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: selectedPlatform.id, name: agentName, role: agentRole, emoji: agentEmoji })
        }).then(function(res) { return res.json(); }).then(function(data) {
            return { data: data, platform: selectedPlatform, name: agentName, role: agentRole, emoji: agentEmoji };
        });
    }).then(function(result) {
        if (!result) return;
        var data = result.data;
        if (data.error) {
            alert('Failed to create agent: ' + data.error);
            return;
        }
        var newId = data.agentId;
        var newAgent = {
            id: newId,
            name: result.name,
            role: result.role,
            emoji: result.emoji,
            gender: 'M',
            color: '#607d8b',
            statusKey: newId,
            providerKind: data.providerKind || result.platform.id || 'openclaw',
            providerAgentId: data.providerAgentId || data.profile || newId,
            branch: 'UNASSIGNED',
            deskType: 'center',
        };

        var appearance = getDefaultAppearance(newId, 'M');
        if (!officeConfig.agents) officeConfig.agents = [];
        officeConfig.agents.push(Object.assign({}, newAgent, { appearance: appearance }));

        var startX = 500 + (agents.length * 20) % 100;
        var startY = 350;
        var agentInst = new Agent(newAgent);
        agentInst.desk = { x: startX, y: startY };
        agentInst.x = startX;
        agentInst.y = startY;
        agentInst.targetX = startX;
        agentInst.targetY = startY;
        agents.push(agentInst);
        agentMap[newId] = agentInst;

        saveOfficeConfig();
        _acpRefreshList();
        _acpSelectAgent(newId);
        _acpShowToast('✅ Agent "' + result.name + '" created in ' + result.platform.label + '!');
    }).catch(function(e) {
        alert('Error creating agent: ' + e.message);
    });
}

function _acpDeleteAgent(agentId) {
    var agentName = agentId;
    var agentCfg = (officeConfig.agents || []).find(function(a) { return a.id === agentId; });
    if (agentCfg) agentName = agentCfg.name || agentId;

    var providerKind = (agentCfg && agentCfg.providerKind) || (agentId.indexOf('hermes-') === 0 ? 'hermes' : 'OpenClaw');
    if (!confirm('Delete agent "' + agentName + '"?\n\nThis will permanently remove the agent from ' + providerKind + ', including its workspace/profile files, memory, and session history.\n\nThis cannot be undone.')) return;

    // Call server to delete from the backing agent platform.
    fetch('/api/agent/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agentId })
    }).then(function(res) { return res.json(); }).then(function(data) {
        if (data.error) {
            alert('Failed to delete agent: ' + data.error);
            return;
        }

        // Remove from local state
        var idx = agents.findIndex(function(a){ return a.id === agentId; });
        if (idx >= 0) agents.splice(idx, 1);
        delete agentMap[agentId];

        if (officeConfig.agents) {
            var cidx = officeConfig.agents.findIndex(function(a){ return a.id === agentId; });
            if (cidx >= 0) officeConfig.agents.splice(cidx, 1);
        }

        saveOfficeConfig();
        _acpRefreshList();

        if (agents.length > 0) {
            _acpSelectAgent(agents[0].id);
        } else {
            var col = document.getElementById('acp-editor-col');
            if (col) col.innerHTML = '<div style="padding:20px;color:#666;font-size:11px">No agents. Click ➕ New Agent to create one.</div>';
        }

        _acpShowToast('🗑️ Agent "' + agentName + '" deleted');
    }).catch(function(e) {
        alert('Error deleting agent: ' + e.message);
    });
}

// --- INTERCEPT CLICKS IN EDIT MODE ---
// Patch into existing mouseup/touchend handlers
var _origHandleClick = typeof handleCanvasClick === 'function' ? handleCanvasClick : null;

canvas.addEventListener('click', function(e) {
    if (!editMode) return;
    if (_isPanning) return;
    if (_skipNextEditClick) { _skipNextEditClick = false; return; }
    var world = screenToWorld(e.clientX, e.clientY);
    handleEditClick(world.x, world.y, e.clientX, e.clientY, e);
});

// --- EDIT MODE DRAG: mousedown to start dragging selected item or multi-drag ---
var _editMouseDownPos = null; // track start position to detect drag vs click
var _editMouseMoved = false;
var _editDragTileHighlight = null; // {tx, ty} for glowing tile during drag

canvas.addEventListener('mousedown', function(e) {
    if (!editMode || e.button !== 0 || placingType) return;
    var world = screenToWorld(e.clientX, e.clientY);
    var hit = _findFurnitureAt(world.x, world.y);
    var isCtrl = e.ctrlKey || e.metaKey;
    _editMouseDownPos = { x: world.x, y: world.y, sx: e.clientX, sy: e.clientY };
    _editMouseMoved = false;
    _editDragTileHighlight = null;

    if (hit) {
        _isPanning = false;
        e.stopPropagation();

        if (isCtrl) {
            // Ctrl+click: toggle item in multi-selection
            var _mIdx = _multiSelected.indexOf(hit.id);
            if (_mIdx >= 0) {
                _multiSelected.splice(_mIdx, 1);
            } else {
                _multiSelected.push(hit.id);
            }
            selectedItemId = null;
            return;
        }

        // If hit is in multi-selection → start multi-drag
        if (_multiSelected.length > 0 && _multiSelected.indexOf(hit.id) >= 0) {
            _multiDragging = true;
            _multiDragStart = { x: world.x, y: world.y };
            _pushUndo();
            return;
        }

        // Hit is NOT in multi-selection → clear multi, single-select + start drag
        _multiSelected = [];
        selectedItemId = hit.id;
        isDragging = true;
        _pushUndo();
        dragOffset = { x: world.x - hit.x, y: world.y - hit.y };
    } else {
        // Click on empty space
        if (_marqueeMode) {
            // In marquee mode: start drawing the selection box
            _marqueeStart = { x: world.x, y: world.y };
            _marqueeEnd = null;
            _isPanning = false;
            e.stopPropagation();
            return;
        }
        if (!isCtrl) {
            // Normal click on empty: clear selections
            selectedItemId = null;
            selectedWallIdx = null;
            _multiSelected = [];
            if (_floatingToolbar) _floatingToolbar.style.display = 'none';
            _hideColorPicker();
        }
    }
});

// Double-click on empty space → activate marquee mode (click+drag to select area)
var _marqueeMode = false; // true = next mousedown starts marquee drawing
canvas.addEventListener('dblclick', function(e) {
    if (!editMode || placingType) return;
    var world = screenToWorld(e.clientX, e.clientY);
    var hit = _findFurnitureAt(world.x, world.y);
    if (!hit) {
        _marqueeMode = true;
        _isPanning = false;
        selectedItemId = null;
        selectedWallIdx = null;
        _multiSelected = [];
        // Show visual hint
        canvas.style.cursor = 'crosshair';
    }
});

// Stop dragging on mouseup (window-level to catch releases outside canvas)
window.addEventListener('mouseup', function() {
    _editDragTileHighlight = null;
    if (isDragging) {
        isDragging = false;
        _skipNextEditClick = true;
        saveOfficeConfig();
        getInteractionSpots();
        _syncAllDeskAssignments();
    }
    // Finalize marquee selection
    if (_marqueeStart) {
        if (_marqueeEnd) {
            var mx1 = Math.min(_marqueeStart.x, _marqueeEnd.x);
            var my1 = Math.min(_marqueeStart.y, _marqueeEnd.y);
            var mx2 = Math.max(_marqueeStart.x, _marqueeEnd.x);
            var my2 = Math.max(_marqueeStart.y, _marqueeEnd.y);
            // Only select if marquee is bigger than 10px world (not just a click)
            if (mx2 - mx1 > 10 && my2 - my1 > 10) {
                _multiSelected = [];
                officeConfig.furniture.forEach(function(f) {
                    var fb = FURNITURE_BOUNDS[f.type] || { w: TILE, h: TILE, ox: 0, oy: 0 };
                    var fox = fb.ox || 0, foy = fb.oy || 0;
                    var fx1 = f.x - fox * fb.w, fy1 = f.y - foy * fb.h;
                    var fx2 = fx1 + fb.w, fy2 = fy1 + fb.h;
                    if (fx1 < mx2 && fx2 > mx1 && fy1 < my2 && fy2 > my1) {
                        _multiSelected.push(f.id);
                    }
                });
            }
        }
        _marqueeStart = null;
        _marqueeEnd = null;
        _marqueeMode = false;
        canvas.style.cursor = '';
    }
    // End multi-drag
    if (_multiDragging) {
        _multiDragging = false;
        _multiDragStart = null;
        saveOfficeConfig();
        getInteractionSpots();
        _syncAllDeskAssignments();
    }
    _editMouseDownPos = null;
    _editMouseMoved = false;
});

// Right-click in edit mode → cancel placement
canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (editMode) {
        _cancelPlacement();
        return;
    }
    var desk = _findDeskAtScreen(e.clientX, e.clientY);
    if (desk) _showAgentWorkspaceMenu(desk, e.clientX, e.clientY);
});

// Mobile equivalent: long-press a desk to reveal the same workspace affordance.
var _agentWorkspaceLongPressTimer = null;
canvas.addEventListener('touchstart', function(e) {
    if (editMode || e.touches.length !== 1) return;
    var t = e.touches[0];
    var desk = _findDeskAtScreen(t.clientX, t.clientY);
    if (!desk) return;
    clearTimeout(_agentWorkspaceLongPressTimer);
    _agentWorkspaceLongPressTimer = setTimeout(function() {
        _showAgentWorkspaceMenu(desk, t.clientX, t.clientY);
    }, 520);
}, { passive: true });
canvas.addEventListener('touchmove', function() {
    clearTimeout(_agentWorkspaceLongPressTimer);
}, { passive: true });
canvas.addEventListener('touchend', function() {
    clearTimeout(_agentWorkspaceLongPressTimer);
}, { passive: true });

// Keyboard shortcuts in edit mode
document.addEventListener('keydown', function(e) {
    if (!editMode) return;
    if (e.key === 'Escape') {
        if (_marqueeMode) {
            _marqueeMode = false;
            _marqueeStart = null;
            _marqueeEnd = null;
            canvas.style.cursor = '';
        } else if (placingType) {
            _cancelPlacement();
        } else if (selectedItemId) {
            _deselectItem();
        } else {
            toggleEditMode();
        }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement === document.body || document.activeElement === canvas) {
            if (selectedItemId) _deleteSelectedItem();
            else if (selectedWallIdx !== null) _deleteSelectedWall();
        }
    }
});

// ─── CATALOG PANEL ────────────────────────────────────────────

function _createCatalogPanel() {
    if (_catalogPanel) return;

    var panel = document.createElement('div');
    panel.id = 'furniture-catalog';
    panel.className = 'furniture-catalog';

    // Header
    var header = document.createElement('div');
    header.className = 'catalog-header';
    var titleSpan = document.createElement('span');
    titleSpan.textContent = '🪑 FURNITURE';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'catalog-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close panel';
    closeBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleEditMode(); });
    header.appendChild(titleSpan);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Body
    var body = document.createElement('div');
    body.className = 'catalog-body';

    CATALOG_CATEGORIES.forEach(function(cat) {
        var section = document.createElement('div');
        section.className = 'catalog-section';

        var catHeader = document.createElement('div');
        catHeader.className = 'catalog-cat-header';
        var arrow = document.createElement('span');
        arrow.className = 'cat-arrow';
        arrow.textContent = '▼';
        catHeader.appendChild(arrow);
        catHeader.appendChild(document.createTextNode(' ' + cat.name));
        catHeader.addEventListener('click', function() {
            var itemsDiv = section.querySelector('.catalog-items');
            var collapsed = itemsDiv.style.display === 'none';
            itemsDiv.style.display = collapsed ? '' : 'none';
            arrow.textContent = collapsed ? '▼' : '▶';
        });
        section.appendChild(catHeader);

        var itemsDiv = document.createElement('div');
        itemsDiv.className = 'catalog-items';

        cat.items.forEach(function(item) {
            var btn = document.createElement('div');
            btn.className = 'catalog-item';
            btn.dataset.type = item.type;

            var iconSpan = document.createElement('span');
            iconSpan.className = 'catalog-icon';
            iconSpan.textContent = item.icon;

            var labelSpan = document.createElement('span');
            labelSpan.className = 'catalog-label';
            labelSpan.textContent = item.label;

            btn.appendChild(iconSpan);
            btn.appendChild(labelSpan);
            btn.addEventListener('click', function() { _selectCatalogItem(item.type); });
            itemsDiv.appendChild(btn);
        });

        section.appendChild(itemsDiv);
        body.appendChild(section);
    });

    panel.appendChild(body);

    // Snap zone selector
    var snapSection = document.createElement('div');
    snapSection.className = 'catalog-snap-section';
    var snapLabel = document.createElement('div');
    snapLabel.className = 'catalog-cat-header';
    snapLabel.textContent = '📍 SNAP ZONE';
    snapSection.appendChild(snapLabel);
    var snapSelect = document.createElement('select');
    snapSelect.id = 'snap-zone-select';
    snapSelect.className = 'snap-zone-select';
    for (var _zKey in SNAP_ZONES) {
        var opt = document.createElement('option');
        opt.value = _zKey;
        opt.textContent = SNAP_ZONES[_zKey].label;
        if (_zKey === activeSnapZone) opt.selected = true;
        snapSelect.appendChild(opt);
    }
    snapSelect.addEventListener('change', function() { activeSnapZone = this.value; });
    snapSection.appendChild(snapSelect);
    panel.appendChild(snapSection);

    // Floor edit toggle
    var floorSection = document.createElement('div');
    floorSection.className = 'catalog-snap-section';
    var floorBtn = document.createElement('button');
    floorBtn.id = 'floor-edit-btn';
    floorBtn.style.cssText = 'width:100%;padding:6px 8px;background:#2a2a4e;color:#ccc;border:1px solid #3a3a5e;border-radius:4px;cursor:pointer;font-size:7px;font-family:"Press Start 2P",cursive;';
    floorBtn.textContent = '🎨 Edit Floor Tiles';
    floorBtn.addEventListener('click', function() {
        _floorEditMode = !_floorEditMode;
        floorBtn.style.borderColor = _floorEditMode ? '#ffd700' : '#3a3a5e';
        floorBtn.style.color = _floorEditMode ? '#ffd700' : '#ccc';
        floorBtn.textContent = _floorEditMode ? '✅ Done Floor Edit' : '🎨 Edit Floor Tiles';
    });
    floorSection.appendChild(floorBtn);
    panel.appendChild(floorSection);

    // === PET SECTION ===
    var petSection = document.createElement('div');
    petSection.className = 'catalog-snap-section';
    var petHeader = document.createElement('div');
    petHeader.className = 'catalog-cat-header';
    petHeader.textContent = '🐾 Office Pet';
    petSection.appendChild(petHeader);

    var petCfg = officeConfig.pet || { enabled: false, species: 'cat', name: '' };

    // Enable toggle
    var petEnableRow = document.createElement('div');
    petEnableRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin:4px 0;';
    var petCheck = document.createElement('input');
    petCheck.type = 'checkbox';
    petCheck.checked = petCfg.enabled || false;
    petCheck.id = 'pet-enable-check';
    var petCheckLabel = document.createElement('label');
    petCheckLabel.htmlFor = 'pet-enable-check';
    petCheckLabel.textContent = 'Enable pet';
    petCheckLabel.style.cssText = 'color:#ccc;font-size:11px;cursor:pointer;';
    petEnableRow.appendChild(petCheck);
    petEnableRow.appendChild(petCheckLabel);
    petSection.appendChild(petEnableRow);

    // Species selector
    var petSpeciesRow = document.createElement('div');
    petSpeciesRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin:4px 0;';
    var petSpeciesLabel = document.createElement('span');
    petSpeciesLabel.textContent = 'Type:';
    petSpeciesLabel.style.cssText = 'color:#aaa;font-size:11px;';
    var petSpeciesSelect = document.createElement('select');
    petSpeciesSelect.style.cssText = 'background:#2a2a4e;color:#ccc;border:1px solid #3a3a5e;border-radius:4px;padding:2px 4px;font-size:11px;';
    [{ v: 'cat', l: '🐱 Cat' }, { v: 'pug', l: '🐶 Pug' }, { v: 'lobster', l: '🦞 Lobster' }].forEach(function(opt) {
        var o = document.createElement('option');
        o.value = opt.v; o.textContent = opt.l;
        if (petCfg.species === opt.v) o.selected = true;
        petSpeciesSelect.appendChild(o);
    });
    petSpeciesRow.appendChild(petSpeciesLabel);
    petSpeciesRow.appendChild(petSpeciesSelect);
    petSection.appendChild(petSpeciesRow);

    // Name input
    var petNameRow = document.createElement('div');
    petNameRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin:4px 0;';
    var petNameLabel = document.createElement('span');
    petNameLabel.textContent = 'Name:';
    petNameLabel.style.cssText = 'color:#aaa;font-size:11px;';
    var petNameInput = document.createElement('input');
    petNameInput.type = 'text';
    petNameInput.value = petCfg.name || '';
    petNameInput.placeholder = 'Clawy';
    petNameInput.maxLength = 20;
    petNameInput.style.cssText = 'background:#2a2a4e;color:#ccc;border:1px solid #3a3a5e;border-radius:4px;padding:2px 6px;font-size:11px;width:80px;';
    petNameRow.appendChild(petNameLabel);
    petNameRow.appendChild(petNameInput);
    petSection.appendChild(petNameRow);

    // Apply changes
    function _applyPetConfig() {
        officeConfig.pet = {
            enabled: petCheck.checked,
            species: petSpeciesSelect.value,
            name: petNameInput.value || 'Clawy',
            x: (officeConfig.pet && officeConfig.pet.x) || Math.floor(W / 2),
            y: (officeConfig.pet && officeConfig.pet.y) || Math.floor(H / 2),
        };
        initPets();
        saveOfficeConfig();
    }
    petCheck.addEventListener('change', _applyPetConfig);
    petSpeciesSelect.addEventListener('change', _applyPetConfig);
    petNameInput.addEventListener('change', _applyPetConfig);

    panel.appendChild(petSection);

    // Instructions
    var instr = document.createElement('div');
    instr.className = 'catalog-instructions';
    instr.id = 'catalog-instr';
    instr.innerHTML = 'Click item to place<br>Right-click / Esc to cancel';
    panel.appendChild(instr);

    var wrapper = document.querySelector('.game-wrapper');
    wrapper.appendChild(panel);
    _catalogPanel = panel;

    // Create floating toolbar
    _createFloatingToolbar();
}

function _createFloatingToolbar() {
    if (_floatingToolbar) return;
    var tb = document.createElement('div');
    tb.id = 'furniture-toolbar';
    tb.className = 'furniture-floating-toolbar';
    tb.style.display = 'none';

    var delBtn = document.createElement('button');
    delBtn.className = 'ftb-btn delete-btn';
    delBtn.title = 'Delete (Del)';
    delBtn.textContent = '🗑️';
    delBtn.addEventListener('click', function() {
        if (selectedWallIdx !== null) _deleteSelectedWall();
        else _deleteSelectedItem();
    });

    var deselectBtn = document.createElement('button');
    deselectBtn.className = 'ftb-btn';
    deselectBtn.title = 'Deselect (Esc)';
    deselectBtn.textContent = '✕';
    deselectBtn.addEventListener('click', function() { _deselectItem(); });

    var colorBtn = document.createElement('button');
    colorBtn.className = 'ftb-btn';
    colorBtn.id = 'ftb-color-btn';
    colorBtn.title = 'Edit wall color';
    colorBtn.textContent = '🎨';
    colorBtn.style.display = 'none';
    colorBtn.addEventListener('click', function() {
        if (selectedWallIdx === null) return;
        var rect = _floatingToolbar ? _floatingToolbar.getBoundingClientRect() : { left: 200, bottom: 60 };
        _showWallColorPicker(selectedWallIdx, rect.left, rect.bottom);
    });

    var assignBtn = document.createElement('button');
    assignBtn.className = 'ftb-btn assign-btn';
    assignBtn.id = 'ftb-assign-btn';
    assignBtn.title = 'Assign agent to this desk';
    assignBtn.textContent = '👤';
    assignBtn.addEventListener('click', function() { _showDeskAssignMenu(); });

    var branchBtn = document.createElement('button');
    branchBtn.className = 'ftb-btn';
    branchBtn.id = 'ftb-branch-btn';
    branchBtn.title = 'Assign branch to this sign';
    branchBtn.textContent = '🏷️';
    branchBtn.style.display = 'none';
    branchBtn.addEventListener('click', function() { _showBranchAssignMenu(); });

    tb.appendChild(delBtn);
    tb.appendChild(colorBtn);
    tb.appendChild(assignBtn);
    tb.appendChild(branchBtn);
    tb.appendChild(deselectBtn);
    document.querySelector('.game-wrapper').appendChild(tb);
    _floatingToolbar = tb;
}

function _showCatalogPanel() {
    if (!_catalogPanel) _createCatalogPanel();
    _catalogPanel.classList.add('visible');
}

function _hideCatalogPanel() {
    if (_catalogPanel) _catalogPanel.classList.remove('visible');
    if (_floatingToolbar) _floatingToolbar.style.display = 'none';
    placingType = null;
    selectedItemId = null;
    isDragging = false;
    _ghostPos = null;
    _updateCatalogSelection();
}

function _selectCatalogItem(type) {
    placingType = type;
    wallPlacingPhase = 0;
    wallPlacingStart = null;
    selectedWallIdx = null;
    selectedItemId = null;
    isDragging = false;
    if (_floatingToolbar) _floatingToolbar.style.display = 'none';
    _updateCatalogSelection();
    var instr = document.getElementById('catalog-instr');
    if (instr) instr.innerHTML = 'Click canvas to place<br>Right-click / Esc to cancel';
}

function _cancelPlacement() {
    placingType = null;
    wallPlacingPhase = 0;
    wallPlacingStart = null;
    _ghostPos = null;
    _updateCatalogSelection();
    var instr = document.getElementById('catalog-instr');
    if (instr) instr.innerHTML = 'Click item to place<br>Right-click / Esc to cancel';
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
}
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
    _positionColorPicker(sx, sy);
}

function _showFloorColorPicker(sx, sy) {
    _ensureColorPicker();
    _colorPickerTarget = { type: 'floor' };
    document.getElementById('edit-cp-title').textContent = 'FLOOR COLOR';
    document.getElementById('edit-cp-lbl1').textContent = 'Tile A:';
    document.getElementById('edit-cp-lbl2').textContent = 'Tile B:';
    document.getElementById('edit-cp-color1').value = officeConfig.floor.color1;
    document.getElementById('edit-cp-color2').value = officeConfig.floor.color2;
    document.getElementById('edit-cp-color2').parentElement.style.display = 'flex';
    document.getElementById('edit-cp-row3').style.display = 'none';
    _setActiveColorInput('edit-cp-color1');
    _refreshColorFavoritesUI();
    _positionColorPicker(sx, sy);
}

function _positionColorPicker(sx, sy) {
    var el = _colorPickerEl;
    el.style.display = 'flex';
    // Position below click, clamped to viewport
    var w = 220, h = _colorPickerTarget && _colorPickerTarget.type === 'interior-wall' ? 168 : 130;
    var vw = window.innerWidth, vh = window.innerHeight;
    var left = Math.min(sx, vw - w - 10);
    var top  = Math.min(sy + 10, vh - h - 10);
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
}

function _applyColorPicker() {
    if (!_colorPickerTarget) return;
    _pushUndo();
    var c1 = document.getElementById('edit-cp-color1').value;
    var c2 = document.getElementById('edit-cp-color2').value;
    var c3 = document.getElementById('edit-cp-color3') ? document.getElementById('edit-cp-color3').value : null;
    if (_colorPickerTarget.type === 'interior-wall') {
        var wall = officeConfig.walls.interior[_colorPickerTarget.idx];
        if (wall) {
            wall.color = c1;
            wall.accentColor = c1;
            wall.trimColor = c2;
            wall.trim2Color = c3 || wall.trim2Color || '#37474f';
        }
    } else if (_colorPickerTarget.type === 'top-wall') {
        if (!officeConfig.walls.topWall) officeConfig.walls.topWall = {};
        officeConfig.walls.topWall.color = c1;
        officeConfig.walls.topWall.accentColor = c2;
        officeConfig.walls.topWall.trimColor = c2;
        officeConfig.walls.trimColor = c2;
        if (officeConfig.walls.sections && officeConfig.walls.sections[0]) {
            officeConfig.walls.sections[0].color = c1;
            officeConfig.walls.sections[0].accentColor = c2;
        }
        officeConfig.walls.trimColor = c2;
    } else if (_colorPickerTarget.type === 'floor') {
        officeConfig.floor.color1 = c1;
        officeConfig.floor.color2 = c2;
    } else if (_colorPickerTarget.type === 'couch') {
        var cItem = officeConfig.furniture.find(function(f){ return f.id === _colorPickerTarget.itemId; });
        if (cItem) {
            cItem.couchColor = c1;
            _saveOfficeConfig();
        }
    }
}

function _showCouchColorEditor(item) {
    _ensureColorPicker();
    _colorPickerTarget = { type: 'couch', itemId: item.id };
    document.getElementById('edit-cp-title').textContent = 'COUCH COLOR';
    document.getElementById('edit-cp-lbl1').textContent = 'Color:';
    document.getElementById('edit-cp-color1').value = item.couchColor || '#3f51b5';
    document.getElementById('edit-cp-color2').parentElement.style.display = 'none';
    document.getElementById('edit-cp-row3').style.display = 'none';
    _setActiveColorInput('edit-cp-color1');
    _refreshColorFavoritesUI();
    // Position near the toolbar
    var tb = _floatingToolbar.getBoundingClientRect();
    _positionColorPicker(tb.left, tb.bottom);
}

function _hideColorPicker() {
    if (_colorPickerEl) _colorPickerEl.style.display = 'none';
    _colorPickerTarget = null;
}

// ─── SKILLS MANAGEMENT ──────────────────────────────────────────────────────
var _currentSkillAgent = null; // statusKey of agent whose skills are shown
var _editingSkillName = null;

function loadAgentSkills(agentKey) {
    _currentSkillAgent = agentKey;
    var listEl = document.getElementById('skills-list');
    if (!listEl) return;
    listEl.innerHTML = '<span style="color:#666;font-size:11px;">Loading skills...</span>';
    fetch('/api/agent/' + encodeURIComponent(agentKey) + '/skills')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            listEl.innerHTML = '';
            if (!data.skills || data.skills.length === 0) {
                listEl.innerHTML = '<span style="color:#666;font-size:11px;">No skills configured</span>';
                return;
            }
            data.skills.forEach(function(skill) {
                var row = document.createElement('div');
                row.className = 'skill-row';
                var info = document.createElement('div');
                info.className = 'skill-row-info';
                info.innerHTML = '<span style="font-weight:bold;">' + escHtml(skill.name) + '</span>' +
                    (skill.description ? '<br><span style="color:#888;font-size:10px;">' + escHtml(skill.description).substring(0, 80) + '</span>' : '');
                var btns = document.createElement('div');
                btns.className = 'skill-row-btns';
                var editBtn = document.createElement('button');
                editBtn.textContent = '✏️';
                editBtn.title = 'Edit skill';
                editBtn.onclick = (function(sName) { return function() { editSkill(sName); }; })(skill.name);
                var delBtn = document.createElement('button');
                delBtn.textContent = '🗑️';
                delBtn.title = 'Remove skill';
                delBtn.onclick = (function(sName) { return function() { deleteSkill(sName); }; })(skill.name);
                btns.appendChild(editBtn);
                btns.appendChild(delBtn);
                row.appendChild(info);
                row.appendChild(btns);
                listEl.appendChild(row);
            });
        })
        .catch(function(e) {
            listEl.innerHTML = '<span style="color:#f44336;font-size:11px;">Error loading skills</span>';
        });
}

function showAddSkillForm() {
    document.getElementById('skill-add-form').style.display = 'block';
    document.getElementById('skill-edit-form').style.display = 'none';
    document.getElementById('skill-new-name').value = '';
    document.getElementById('skill-new-content').value = '';
    document.getElementById('skill-new-name').focus();
}

function hideAddSkillForm() {
    document.getElementById('skill-add-form').style.display = 'none';
}

async function showLibraryPicker() {
    var picker = document.getElementById('skill-library-picker');
    var select = document.getElementById('skill-library-select');
    document.getElementById('skill-add-form').style.display = 'none';
    document.getElementById('skill-edit-form').style.display = 'none';
    picker.style.display = 'block';
    select.innerHTML = '<option value="">Loading...</option>';
    try {
        var res = await fetch('/api/skills-library');
        var data = await res.json();
        var skills = Array.isArray(data) ? data : (data.skills || []);
        if (skills.length === 0) {
            select.innerHTML = '<option value="">No skills in library</option>';
            return;
        }
        skills.sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });
        select.innerHTML = skills.map(function(s) {
            return '<option value="' + escHtml(s.name) + '">' + escHtml(s.name) + (s.description ? ' — ' + escHtml(s.description).substring(0, 50) : '') + '</option>';
        }).join('');
    } catch (e) {
        select.innerHTML = '<option value="">Failed to load library</option>';
    }
}

function hideLibraryPicker() {
    document.getElementById('skill-library-picker').style.display = 'none';
}

async function applyLibrarySkill() {
    if (!_currentSkillAgent) return;
    var select = document.getElementById('skill-library-select');
    var skillName = select.value;
    if (!skillName) return;
    try {
        var res = await fetch('/api/skills-library/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skillName, agentId: _currentSkillAgent, overwrite: false })
        });
        var data = await res.json();
        if (data.ok) {
            if (typeof _acpShowToast === 'function') _acpShowToast('✅ Applied "' + skillName + '" to agent');
            hideLibraryPicker();
            loadAgentSkills(_currentSkillAgent);
        } else if (data.exists) {
            if (confirm('"' + skillName + '" already exists on this agent. Overwrite?')) {
                var res2 = await fetch('/api/skills-library/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ skill: skillName, agentId: _currentSkillAgent, overwrite: true })
                });
                var data2 = await res2.json();
                if (data2.ok) {
                    if (typeof _acpShowToast === 'function') _acpShowToast('✅ Overwrote "' + skillName + '" on agent');
                    hideLibraryPicker();
                    loadAgentSkills(_currentSkillAgent);
                }
            }
        } else {
            if (typeof _acpShowToast === 'function') _acpShowToast('❌ ' + (data.error || 'Failed to apply'));
        }
    } catch (e) {
        if (typeof _acpShowToast === 'function') _acpShowToast('❌ Error: ' + e.message);
    }
}

function saveNewSkill() {
    if (!_currentSkillAgent) return;
    var name = document.getElementById('skill-new-name').value.trim();
    var content = document.getElementById('skill-new-content').value;
    if (!name) { alert('Skill name is required'); return; }
    fetch('/api/agent/' + encodeURIComponent(_currentSkillAgent) + '/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, content: content })
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.error) { alert('Error: ' + data.error); return; }
        hideAddSkillForm();
        loadAgentSkills(_currentSkillAgent);
        _acpShowToast('✅ Skill "' + name + '" added');
    }).catch(function(e) { alert('Error saving skill: ' + e.message); });
}

function editSkill(skillName) {
    if (!_currentSkillAgent) return;
    _editingSkillName = skillName;
    document.getElementById('skill-add-form').style.display = 'none';
    document.getElementById('skill-edit-form').style.display = 'block';
    document.getElementById('skill-edit-title').textContent = '✏️ Editing: ' + skillName;
    document.getElementById('skill-edit-content').value = 'Loading...';
    // Fetch skills list which includes content
    fetch('/api/agent/' + encodeURIComponent(_currentSkillAgent) + '/skills')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var skill = (data.skills || []).find(function(s) { return s.name === skillName; });
            document.getElementById('skill-edit-content').value = (skill && skill.content) || '# ' + skillName + '\n\n_No content yet._';
        })
        .catch(function(e) {
            document.getElementById('skill-edit-content').value = '# ' + skillName + '\n\n_Could not load content. Edit and save to create._';
        });
}

function hideEditSkillForm() {
    document.getElementById('skill-edit-form').style.display = 'none';
    _editingSkillName = null;
}

function saveEditedSkill() {
    if (!_currentSkillAgent || !_editingSkillName) return;
    var content = document.getElementById('skill-edit-content').value;
    fetch('/api/agent/' + encodeURIComponent(_currentSkillAgent) + '/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: _editingSkillName, content: content })
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.error) { alert('Error: ' + data.error); return; }
        hideEditSkillForm();
        loadAgentSkills(_currentSkillAgent);
        _acpShowToast('✅ Skill "' + _editingSkillName + '" updated');
    }).catch(function(e) { alert('Error saving skill: ' + e.message); });
}

function deleteSkill(skillName) {
    if (!_currentSkillAgent) return;
    if (!confirm('Remove skill "' + skillName + '" from this agent?')) return;
    fetch('/api/agent/' + encodeURIComponent(_currentSkillAgent) + '/skills/' + encodeURIComponent(skillName), {
        method: 'DELETE'
    }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.error) { alert('Error: ' + data.error); return; }
        loadAgentSkills(_currentSkillAgent);
        _acpShowToast('🗑️ Skill "' + skillName + '" removed');
    }).catch(function(e) { alert('Error deleting skill: ' + e.message); });
}

// ─── MEETINGS DASHBOARD ──────────────────────────────────────────
var _mtgAgentMap = {};  // key → {name, emoji, role}
var _mtgCurrentTab = 'active';
var _mtgData = { active: [], history: [] };

function openMeetingsDashboard() {
    document.getElementById('meetingsModal').classList.remove('hidden');
    _mtgRefresh();
}

function closeMeetingsModal() {
    document.getElementById('meetingsModal').classList.add('hidden');
}

function switchMtgTab(tab) {
    _mtgCurrentTab = tab;
    document.querySelectorAll('.mtg-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    _mtgRender();
}

async function _mtgRefresh() {
    try {
        var [activeRes, histRes, agentsRes] = await Promise.all([
            fetch('/api/meetings/active').then(function(r) { return r.json(); }),
            fetch('/api/meetings/history').then(function(r) { return r.json(); }),
            fetch('/agents-list').then(function(r) { return r.json(); })
        ]);
        _mtgData.active = activeRes.meetings || [];
        _mtgData.history = (histRes.history || []).reverse();
        _mtgAgentMap = {};
        var agentsList = agentsRes.agents || agentsRes || [];
        if (Array.isArray(agentsList)) {
            agentsList.forEach(function(a) {
                _mtgAgentMap[a.key || a.agentId || a.id] = {
                    name: a.name || a.key || 'Unknown',
                    emoji: a.emoji || '🤖',
                    role: a.role || ''
                };
            });
        }
        _mtgRender();
        _updateSidebarMeetings();
    } catch (e) {
        console.warn('[meetings] refresh error:', e);
    }
}

function _mtgRender() {
    var container = document.getElementById('mtg-cards');
    var meetings = [];
    if (_mtgCurrentTab === 'active') meetings = _mtgData.active;
    else if (_mtgCurrentTab === 'completed') meetings = _mtgData.history;
    else meetings = _mtgData.active.concat(_mtgData.history);

    if (!meetings.length) {
        container.innerHTML = '<div class="mtg-empty">No ' + _mtgCurrentTab + ' meetings</div>';
        return;
    }

    container.innerHTML = meetings.map(function(m) {
        var isActive = m.status === 'active';
        var participants = m.participants || m.agents || [];

        var cardId = 'mtg-card-' + m.id;
        var isOpen = false;  // all meetings start collapsed by default

        // Header (clickable to toggle)
        var html = '<div class="mtg-card">';
        html += '<div class="mtg-card-header" onclick="toggleMtgCard(\'' + _escMtg(m.id) + '\')">';
        html += '<div><div class="mtg-card-title"><span class="mtg-card-toggle' + (isOpen ? ' open' : '') + '" id="mtg-toggle-' + _escMtg(m.id) + '">▶</span>' + _escMtg(m.topic || 'Untitled Meeting') + '</div>';
        if (m.purpose && m.purpose !== m.topic) {
            html += '<div class="mtg-card-purpose">' + _escMtg(m.purpose) + '</div>';
        }
        html += '</div>';
        html += '<div>';
        html += '<span class="mtg-badge ' + (isActive ? 'mtg-badge-active' : 'mtg-badge-completed') + '">' + (isActive ? '● Active' : '✓ Completed') + '</span>';
        if (m.kind) html += '<span class="mtg-badge mtg-badge-kind">' + _escMtg(m.kind) + '</span>';
        html += '</div></div>';

        // Body (collapsible)
        html += '<div class="mtg-card-body' + (isOpen ? ' open' : '') + '" id="mtg-body-' + _escMtg(m.id) + '">';

        // Meta
        html += '<div class="mtg-meta">';
        var orgInfo = _mtgAgentMap[m.organizer] || { emoji: '🤖', name: m.organizer || 'Unknown' };
        html += '<div class="mtg-meta-item">👑 ' + orgInfo.emoji + ' ' + _escMtg(orgInfo.name) + '</div>';
        html += '<div class="mtg-meta-item">👥 ' + participants.length + ' participants</div>';
        if (m.type) html += '<div class="mtg-meta-item">📋 ' + _escMtg(m.type) + '</div>';
        if (m.endedAt) {
            var d = new Date(m.endedAt * 1000);
            html += '<div class="mtg-meta-item mtg-timestamp">🕐 ' + d.toLocaleString() + '</div>';
        }
        html += '</div>';

        // Participants
        html += '<div class="mtg-participants">';
        participants.forEach(function(pKey) {
            var info = _mtgAgentMap[pKey] || { emoji: '🤖', name: pKey, role: '' };
            html += '<div class="mtg-participant">';
            html += '<span class="mtg-participant-emoji">' + info.emoji + '</span>';
            html += '<div class="mtg-participant-info">';
            html += '<div class="mtg-participant-name">' + _escMtg(info.name) + '</div>';
            if (info.role) html += '<div class="mtg-participant-role">' + _escMtg(info.role) + '</div>';
            if (!isActive && m.actionItems && m.actionItems.length) {
                var agentActions = m.actionItems.filter(function(item) {
                    var text = _mtgActionText(item).toLowerCase();
                    return text.indexOf(info.name.toLowerCase()) >= 0 ||
                           text.indexOf(pKey.toLowerCase()) >= 0;
                });
                if (agentActions.length) {
                    html += '<div class="mtg-participant-actions">→ ' + agentActions.map(function(item) { return _escMtg(_mtgActionText(item)); }).join('<br>→ ') + '</div>';
                }
            }
            html += '</div></div>';
        });
        html += '</div>';

        // Per-agent responses
        var responses = m.responses || {};
        if (!isActive && Object.keys(responses).length > 0) {
            html += '<div class="mtg-section"><div class="mtg-section-title">Agent Responses</div>';
            html += '<div class="mtg-responses">';
            participants.forEach(function(pKey) {
                var info = _mtgAgentMap[pKey] || { emoji: '🤖', name: pKey, role: '' };
                var resp = responses[pKey] || '';
                html += '<div class="mtg-response">';
                html += '<div class="mtg-response-header">';
                html += '<span class="mtg-response-emoji">' + info.emoji + '</span>';
                html += '<span class="mtg-response-name">' + _escMtg(info.name) + '</span>';
                if (info.role) html += '<span class="mtg-response-role">' + _escMtg(info.role) + '</span>';
                html += '</div>';
                if (resp) {
                    var respId = 'mtg-resp-' + _escMtg(m.id) + '-' + _escMtg(pKey);
                    html += '<div class="mtg-response-text" id="' + respId + '">' + _escMtg(resp) + '</div>';
                    html += '<span class="mtg-response-expand" onclick="toggleMtgResponse(\'' + respId + '\', this)">▼ expand</span>';
                } else {
                    html += '<div class="mtg-response-none">No response recorded</div>';
                }
                html += '</div>';
            });
            html += '</div></div>';
        }

        // Completed details
        if (!isActive) {
            if (m.summary) {
                html += '<div class="mtg-section"><div class="mtg-section-title">Summary</div>';
                html += '<div class="mtg-section-text">' + _escMtg(m.summary) + '</div></div>';
            }
            if (m.resolution) {
                html += '<div class="mtg-section"><div class="mtg-section-title">Resolution</div>';
                html += '<div class="mtg-section-text">' + _escMtg(m.resolution) + '</div></div>';
            }
            if (m.actionItems && m.actionItems.length) {
                html += '<div class="mtg-section"><div class="mtg-section-title">Action Items</div>';
                html += '<div class="mtg-section-text">' + m.actionItems.map(function(a) { return '• ' + _escMtg(_mtgActionText(a)); }).join('\n') + '</div></div>';
            }
            if (m.endedBy) {
                var endInfo = _mtgAgentMap[m.endedBy] || { emoji: '🤖', name: m.endedBy };
                html += '<div class="mtg-section"><div class="mtg-section-title">Ended By</div>';
                html += '<div class="mtg-section-text">' + endInfo.emoji + ' ' + _escMtg(endInfo.name) + '</div></div>';
            }
        }

        // Actions bar
        html += '<div class="mtg-actions-bar">';
        if (isActive) {
            html += '<button class="mtg-btn mtg-btn-end" onclick="openEndMeetingForm(\'' + _escMtg(m.id) + '\')">✅ End Meeting</button>';
        } else {
            html += '<button class="mtg-btn mtg-btn-delete" onclick="deleteMeetingHistory(\'' + _escMtg(m.id) + '\')">🗑️ Delete</button>';
        }
        html += '</div>';

        html += '</div>';  // close mtg-card-body
        html += '</div>';  // close mtg-card
        return html;
    }).join('');
}

function _escMtg(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _mtgActionText(action) {
    if (!action) return '';
    if (typeof action === 'string') return action;
    if (typeof action === 'object') {
        var owner = action.owner || action.agent || action.assignee || '';
        var item = action.item || action.text || action.task || action.action || action.summary || '';
        if (owner && item) return owner + ': ' + item;
        if (item) return item;
        if (owner) return owner;
        try { return JSON.stringify(action); } catch (e) { return String(action); }
    }
    return String(action);
}

function mtgExpandAll() {
    document.querySelectorAll('.mtg-card-body').forEach(function(el) { el.classList.add('open'); });
    document.querySelectorAll('.mtg-card-toggle').forEach(function(el) { el.classList.add('open'); });
}

function mtgCollapseAll() {
    document.querySelectorAll('.mtg-card-body').forEach(function(el) { el.classList.remove('open'); });
    document.querySelectorAll('.mtg-card-toggle').forEach(function(el) { el.classList.remove('open'); });
}

function toggleMtgCard(meetingId) {
    var body = document.getElementById('mtg-body-' + meetingId);
    var toggle = document.getElementById('mtg-toggle-' + meetingId);
    if (body) {
        body.classList.toggle('open');
        if (toggle) toggle.classList.toggle('open');
    }
}

function toggleMtgResponse(respId, btn) {
    var el = document.getElementById(respId);
    if (!el) return;
    el.classList.toggle('expanded');
    if (el.classList.contains('expanded')) {
        btn.textContent = '▲ collapse';
    } else {
        btn.textContent = '▼ expand';
    }
}

function openEndMeetingForm(meetingId) {
    document.getElementById('end-mtg-id').value = meetingId;
    document.getElementById('end-mtg-summary').value = '';
    document.getElementById('end-mtg-resolution').value = '';
    document.getElementById('end-mtg-actions').value = '';
    document.getElementById('end-mtg-error').style.display = 'none';

    // Build per-agent response fields
    var respSection = document.getElementById('end-mtg-responses-section');
    respSection.innerHTML = '';
    var meeting = _mtgData.active.find(function(m) { return m.id === meetingId; });
    if (meeting) {
        var participants = meeting.participants || meeting.agents || [];
        if (participants.length) {
            respSection.innerHTML = '<label class="mtg-label" style="margin-top:6px">Agent Responses <span style="color:#666;font-size:9px">(what each agent said)</span></label>';
            participants.forEach(function(pKey) {
                var info = _mtgAgentMap[pKey] || { emoji: '🤖', name: pKey };
                var div = document.createElement('div');
                div.style.cssText = 'margin-bottom:6px;';
                div.innerHTML = '<div style="font-size:9px;color:#ccc;margin-bottom:2px;">' + info.emoji + ' ' + _escMtg(info.name) + '</div>' +
                    '<textarea class="mtg-textarea end-mtg-resp" data-agent="' + _escMtg(pKey) + '" rows="2" placeholder="What did ' + _escMtg(info.name) + ' contribute?"></textarea>';
                respSection.appendChild(div);
            });
        }
    }

    document.getElementById('endMeetingModal').classList.remove('hidden');
}

function closeEndMeetingModal() {
    document.getElementById('endMeetingModal').classList.add('hidden');
}

async function submitEndMeeting() {
    var meetId = document.getElementById('end-mtg-id').value;
    var summary = document.getElementById('end-mtg-summary').value.trim();
    var resolution = document.getElementById('end-mtg-resolution').value.trim();
    var actionsRaw = document.getElementById('end-mtg-actions').value.trim();
    var actionItems = actionsRaw ? actionsRaw.split('\n').map(function(l) { return l.trim(); }).filter(Boolean) : [];

    // Collect per-agent responses
    var responses = {};
    document.querySelectorAll('.end-mtg-resp').forEach(function(el) {
        var key = el.dataset.agent;
        var val = el.value.trim();
        if (key && val) responses[key] = val;
    });

    if (!summary) {
        var errEl = document.getElementById('end-mtg-error');
        errEl.textContent = 'Summary is required to end the meeting.';
        errEl.style.display = 'block';
        return;
    }

    try {
        var res = await fetch('/api/meetings/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: meetId, summary: summary, resolution: resolution, actionItems: actionItems, responses: responses, endedBy: 'user' })
        });
        var data = await res.json();
        if (data.ok) {
            closeEndMeetingModal();
            _mtgRefresh();
        } else {
            var errEl = document.getElementById('end-mtg-error');
            errEl.textContent = data.error || 'Failed to end meeting';
            errEl.style.display = 'block';
        }
    } catch (e) {
        var errEl = document.getElementById('end-mtg-error');
        errEl.textContent = 'Error: ' + e.message;
        errEl.style.display = 'block';
    }
}

async function deleteMeetingHistory(meetingId) {
    if (!confirm('Delete this meeting from history?')) return;
    try {
        var res = await fetch('/api/meetings/history/' + meetingId, { method: 'DELETE' });
        var data = await res.json();
        if (data.ok) _mtgRefresh();
        else alert(data.error || 'Failed to delete');
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

// --- Sidebar meetings widget ---
function _updateSidebarMeetings() {
    var container = document.getElementById('sidebar-mtg-active');
    if (!container) return;
    var active = _mtgData.active || [];
    if (!active.length) {
        container.innerHTML = '<div class="sidebar-mtg-none">No active meetings</div>';
        return;
    }
    container.innerHTML = active.map(function(m) {
        var participants = m.participants || m.agents || [];
        var pNames = participants.map(function(k) {
            var info = _mtgAgentMap[k];
            return info ? info.emoji + ' ' + info.name : k;
        }).join(', ');
        return '<div class="sidebar-mtg-item" onclick="openMeetingsDashboard()">' +
            '<div class="sidebar-mtg-item-title"><span class="sidebar-mtg-item-dot"></span>' + _escMtg(m.topic || 'Meeting') + '</div>' +
            '<div class="sidebar-mtg-item-meta">' + pNames + '</div>' +
            '</div>';
    }).join('');
}

// Refresh sidebar meetings periodically
setInterval(function() {
    fetch('/api/meetings/active').then(function(r) { return r.json(); }).then(function(data) {
        _mtgData.active = data.meetings || [];
        // Also refresh agent map if empty
        if (Object.keys(_mtgAgentMap).length === 0) {
            fetch('/agents-list').then(function(r) { return r.json(); }).then(function(d) {
                var list = d.agents || d || [];
                if (Array.isArray(list)) {
                    list.forEach(function(a) {
                        _mtgAgentMap[a.key || a.agentId || a.id] = { name: a.name || a.key, emoji: a.emoji || '🤖', role: a.role || '' };
                    });
                }
                _updateSidebarMeetings();
            }).catch(function() { _updateSidebarMeetings(); });
        } else {
            _updateSidebarMeetings();
        }
    }).catch(function() {});
}, 10000);

// Initial load
setTimeout(function() {
    fetch('/api/meetings/active').then(function(r) { return r.json(); }).then(function(data) {
        _mtgData.active = data.meetings || [];
        fetch('/agents-list').then(function(r) { return r.json(); }).then(function(d) {
            var list = d.agents || d || [];
            if (Array.isArray(list)) {
                list.forEach(function(a) {
                    _mtgAgentMap[a.key || a.agentId || a.id] = { name: a.name || a.key, emoji: a.emoji || '🤖', role: a.role || '' };
                });
            }
            _updateSidebarMeetings();
        }).catch(function() { _updateSidebarMeetings(); });
    }).catch(function() {});
}, 2000);

// --- Meeting table click handler ---
// Override the existing furniture click to detect meetingTable clicks
var _origHandleFurnitureClick = typeof handleFurnitureClick === 'function' ? handleFurnitureClick : null;
function _meetingTableClickCheck(item) {
    if (item && item.type === 'meetingTable' && !editMode) {
        openMeetingsDashboard();
        return true;
    }
    return false;
}

// Close meetings modal on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (!document.getElementById('endMeetingModal').classList.contains('hidden')) {
            closeEndMeetingModal();
        } else if (!document.getElementById('meetingsModal').classList.contains('hidden')) {
            closeMeetingsModal();
        }
    }
});

// Close meetings modal on backdrop click
document.getElementById('meetingsModal').addEventListener('click', function(e) {
    if (e.target === this) closeMeetingsModal();
});
document.getElementById('endMeetingModal').addEventListener('click', function(e) {
    if (e.target === this) closeEndMeetingModal();
});

// ============================================================
// SKILLS LIBRARY
// ============================================================

var _sklSkills = [];
var _sklEditingName = null; // null = new, string = editing existing

function openSkillsLibrary() {
    document.getElementById('skillsLibraryModal').classList.remove('hidden');
    refreshSkillsList();
}

function closeSkillsLibrary() {
    document.getElementById('skillsLibraryModal').classList.add('hidden');
}

async function refreshSkillsList() {
    try {
        var res = await fetch('/api/skills-library');
        var data = await res.json();
        _sklSkills = Array.isArray(data) ? data : (data.skills || []);
    } catch (e) {
        _sklSkills = [];
    }
    renderSkillCards();
}

function renderSkillCards() {
    var container = document.getElementById('skl-cards');
    if (!container) return;

    if (!_sklSkills.length) {
        container.innerHTML = '<div style="color:#666;font-size:11px;padding:20px;text-align:center;">No skills in library. Click ➕ Add Skill to create one.</div>';
        return;
    }

    var sorted = _sklSkills.slice().sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });

    container.innerHTML = sorted.map(function(skill) {
        var safeName = _sklEsc(skill.name);
        return '<div class="skl-card" id="skl-card-' + safeName + '">' +
            '<div class="skl-card-top">' +
                '<div class="skl-card-name">' + safeName + '</div>' +
                '<div class="skl-card-actions">' +
                    '<button onclick="toggleSkillApply(\'' + safeName + '\')" title="Apply to agent">📋</button>' +
                    '<button onclick="openSkillEditor(\'' + safeName + '\')" title="Edit">✏️</button>' +
                    '<button onclick="deleteLibrarySkill(\'' + safeName + '\')" title="Delete">🗑️</button>' +
                '</div>' +
            '</div>' +
            '<div class="skl-apply-dropdown" id="skl-apply-' + safeName + '" style="display:none"></div>' +
        '</div>';
    }).join('');
}

function _sklEsc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function toggleSkillApply(skillName) {
    var dropdown = document.getElementById('skl-apply-' + skillName);
    if (!dropdown) return;

    if (dropdown.style.display !== 'none') {
        dropdown.style.display = 'none';
        return;
    }

    // Fetch agent list
    try {
        var res = await fetch('/agents-list');
        var data = await res.json();
        var agentList = Array.isArray(data) ? data : (data.agents || []);

        var options = agentList.map(function(a) {
            var id = a.id || a.agentId || a.name;
            var name = a.name || id;
            return '<option value="' + _sklEsc(id) + '">' + _sklEsc(name) + '</option>';
        }).join('');

        dropdown.innerHTML =
            '<select id="skl-agent-select-' + skillName + '">' + options + '</select>' +
            '<button onclick="applySkillToAgent(\'' + _sklEsc(skillName) + '\')">Apply</button>';
        dropdown.style.display = 'flex';
    } catch (e) {
        _acpShowToast('❌ Failed to load agent list');
    }
}

async function applySkillToAgent(skillName) {
    var select = document.getElementById('skl-agent-select-' + skillName);
    if (!select) return;
    var agentId = select.value;
    if (!agentId) return;

    try {
        var res = await fetch('/api/skills-library/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skillName, agentId: agentId })
        });
        var data = await res.json();
        if (res.ok) {
            if (data.warning) {
                _acpShowToast('⚠️ ' + data.warning);
            } else {
                _acpShowToast('✅ Applied ' + skillName + ' to ' + agentId);
            }
        } else {
            _acpShowToast('❌ ' + (data.error || 'Apply failed'));
        }
    } catch (e) {
        _acpShowToast('❌ Apply failed: ' + e.message);
    }

    // Hide dropdown after apply
    var dropdown = document.getElementById('skl-apply-' + skillName);
    if (dropdown) dropdown.style.display = 'none';
}

async function openSkillEditor(skillName) {
    _sklEditingName = skillName;
    var titleEl = document.getElementById('skl-editor-title');
    var nameInput = document.getElementById('skl-editor-name');
    var contentArea = document.getElementById('skl-editor-content');

    if (skillName) {
        // Edit existing: fetch content
        titleEl.textContent = 'Edit Skill';
        nameInput.value = skillName;
        nameInput.disabled = true;
        try {
            var res = await fetch('/api/skills-library/' + encodeURIComponent(skillName));
            var data = await res.json();
            contentArea.value = data.content || '';
        } catch (e) {
            contentArea.value = '';
            _acpShowToast('❌ Failed to load skill');
        }
    } else {
        // New skill
        titleEl.textContent = 'Add Skill';
        nameInput.value = '';
        nameInput.disabled = false;
        contentArea.value = '---\nname: \ndescription: \n---\n\n# Skill Title\n\nInstructions here...\n';
    }

    document.getElementById('skillEditorModal').classList.remove('hidden');
}

function closeSkillEditor() {
    document.getElementById('skillEditorModal').classList.add('hidden');
    _sklEditingName = null;
}

async function saveSkill() {
    var nameInput = document.getElementById('skl-editor-name');
    var contentArea = document.getElementById('skl-editor-content');
    var name = (nameInput.value || '').trim();
    var content = contentArea.value || '';

    if (!name) {
        _acpShowToast('❌ Skill name is required');
        return;
    }

    try {
        var res = await fetch('/api/skills-library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, content: content })
        });
        var data = await res.json();
        if (res.ok) {
            _acpShowToast('✅ Skill "' + name + '" saved');
            closeSkillEditor();
            refreshSkillsList();
        } else {
            _acpShowToast('❌ ' + (data.error || 'Save failed'));
        }
    } catch (e) {
        _acpShowToast('❌ Save failed: ' + e.message);
    }
}

async function deleteLibrarySkill(skillName) {
    if (!confirm('Delete skill "' + skillName + '" from the library?\n\nThis removes the master copy. Agent copies are not affected.')) return;

    try {
        var res = await fetch('/api/skills-library/' + encodeURIComponent(skillName), { method: 'DELETE' });
        if (res.ok) {
            _acpShowToast('🗑️ Skill "' + skillName + '" deleted');
            refreshSkillsList();
        } else {
            var data = await res.json().catch(function() { return {}; });
            _acpShowToast('❌ ' + (data.error || 'Delete failed'));
        }
    } catch (e) {
        _acpShowToast('❌ Delete failed: ' + e.message);
    }
}

async function handleSkillUpload(input) {
    if (!input.files || !input.files.length) return;
    var file = input.files[0];
    var name = file.name.replace(/\.md$/i, '').replace(/[^a-zA-Z0-9_-]/g, '-');

    try {
        var text = await file.text();
        var res = await fetch('/api/skills-library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, content: text })
        });
        if (res.ok) {
            _acpShowToast('✅ Uploaded "' + name + '"');
            refreshSkillsList();
        } else {
            var data = await res.json().catch(function() { return {}; });
            _acpShowToast('❌ ' + (data.error || 'Upload failed'));
        }
    } catch (e) {
        _acpShowToast('❌ Upload failed: ' + e.message);
    }

    // Reset input so same file can be re-uploaded
    input.value = '';
}

// Close skills modals on backdrop click
document.getElementById('skillsLibraryModal').addEventListener('click', function(e) {
    if (e.target === this) closeSkillsLibrary();
});
document.getElementById('skillEditorModal').addEventListener('click', function(e) {
    if (e.target === this) closeSkillEditor();
});

// Close skills modals on Escape (extend existing keydown)
var _origKeydownHandler = document.onkeydown;
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (!document.getElementById('skillEditorModal').classList.contains('hidden')) {
            closeSkillEditor();
            e.stopPropagation();
        } else if (!document.getElementById('skillsLibraryModal').classList.contains('hidden')) {
            closeSkillsLibrary();
            e.stopPropagation();
        }
    }
});

loop();
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
}
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
}
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

