const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
const idx = c.indexOf('  _pushLive(x, y) {');
if (idx < 0) { console.error('not found'); process.exit(1); }
const end = c.indexOf('\n  },\n\n  _pushLiveIA', idx) + 4;
const rep = `  _pushLive(x, y) {
    if (this._liveThrottle) return;
    this._liveThrottle = setTimeout(() => { this._liveThrottle = null; }, 60);
    let drawPreview = null;
    if (MAP.isDrawing && MAP.drawStart) {
      if (MAP.tool === 'draw' && MAP.drawPoints?.length > 1)
        drawPreview = { type: 'draw', points: MAP.drawPoints.slice(-80) };
      else if (MAP.drawCurrent)
        drawPreview = { type: MAP.tool, start: MAP.drawStart, end: MAP.drawCurrent };
    }
    let liveObjects = null;
    if ((MAP.isDragging || MAP.isResizing || MAP.isGroupResizing) && MAP.selectedIds.size) {
      liveObjects = [];
      MAP.selectedIds.forEach(id => {
        const o = MAP.objects.find(obj => obj.id === id);
        if (o) liveObjects.push({ id:o.id, type:o.type, x:o.x, y:o.y, w:o.w, h:o.h,
          r:o.r, x2:o.x2, y2:o.y2, points:o.points, fill:o.fill, stroke:o.stroke,
          opacity:o.opacity, text:o.text, fontSize:o.fontSize, name:o.name });
      });
    }
    const payload = { x, y, mapId: MAP.currentMapId,
      name: this.userName, flag: this._userInfo.flag || '\u{1F310}',
      color: localStorage.getItem('igs_color') || null,
      sessionId: this.sessionId, ts: Date.now(),
      drawPreview, liveObjects };
    fetch(this._myLiveUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
  },`;
c = c.slice(0, idx) + rep + c.slice(end);
fs.writeFileSync('index.html', c, 'utf8');
console.log('OK, chars replaced:', end - idx);
