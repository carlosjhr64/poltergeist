const { Gio, Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const Me   = imports.misc.extensionUtils.getCurrentExtension();

const Phi    = 1.618033988749895;
const Fourth = 1.0/4.0;
const Third  = 1.0/3.0;
const Half   = 1.0/2.0;

const Pad = 20;

function getSettings() {
  const GioSSS = Gio.SettingsSchemaSource;
  const schemaSource = GioSSS.new_from_directory(
    Me.dir.get_child('schemas').get_path(),
    GioSSS.get_default(),
    false,
  );
  const schemaObj = schemaSource.lookup('org.gnome.shell.extensions.evil-gnome', true);

  if (!schemaObj) {
    throw new Error('cannot find schemas');
  }

  return new Gio.Settings({ settings_schema: schemaObj });
}

function getActiveWindow() {
  return global.workspace_manager.get_active_workspace().list_windows().find(window => window.has_focus());
}

function getRectangles(window) {
  const rect      = window.get_frame_rect();
  const monitor   = window.get_monitor();
  const workspace = window.get_workspace();

  const monitorWorkArea = workspace.get_work_area_for_monitor(monitor);
  const x = monitorWorkArea.width;
  const y = monitorWorkArea.height;

  return {
    w: rect.width,
    h: rect.height,
    x: x,
    y: y,
    u: monitorWorkArea.x,
    v: monitorWorkArea.y,
    a: Math.round(x*(2 - Phi)),
    b: Math.round(y*(Phi - 1)),
    p: Math.round(x*Third - (1 + Third)*Pad),
    q: Math.round(y*Half - (1 + Half)*Pad),
  };
}

function getResizeWidth(r) {
  const count = Count%5;
  if (count==0) { return r.x*Fourth; }
  if (count==1) { return r.x*Third; }
  if (count==2) { return r.x*(2-Phi); }
  if (count==3) { return r.x*Half; }
  return r.x*(Phi-1);
}

var Timestamp = 0;
var Elapsed   = 0;
var Count     = 0;
var Caller    = 'Z';

function setCount(caller) {
  const now = Date.now();
  Elapsed = now - Timestamp;
  Timestamp = now;
  if (Elapsed < 1000) {
    if (Caller==caller) {
      Count = Count + 1;
    } else {
      Caller = caller;
      Count = 0;
    }
  } else {
    Caller = caller;
    Count = 0;
  }
}

function toggleWidth(r) {
  if (Count>0){
    if (r.w==r.a && r.h==r.b){ return r.p; }
    if (r.w==r.p && r.h==r.q){ return r.a; }
    return r.a;
  }
  return wide(r)? r.a : r.w;
}

function toggleHeight(r) {
  if (Count>0){
    if (r.w==r.a && r.h==r.b){ return r.q; }
    if (r.w==r.p && r.h==r.q){ return r.b; }
    return r.b;
  }
  return tall(r)? r.b : r.h;
}

function centerWindow(window, r) {
  setCount('C');
  const w = toggleWidth(r);
  const h = toggleHeight(r);
  const x = Half*(r.x - w);
  const y = Half*(r.y - h);
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function downWindow(window, r) {
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  if (wider(r)) {
    setCount('D');
    const w = r.x;
    const h = tall(r)? r.q : r.h;
    const x = 0;
    const y = r.y - h;
    window.move_resize_frame(false, r.u+x, r.v+y, w, h);
  } else {
    setCount('d');
    const w = r.w;
    const h = tall(r)? r.q : r.h;
    const x = Half*(r.x - w);
    const y = (Count%2==1)? r.y - h - Pad : Half*(r.y + Pad);
    window.move_frame(false, x, y);
    window.move_resize_frame(false, r.u+x, r.u+y, w, h);
  }
}

function upWindow(window, r) {
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  if (wider(r)) {
    setCount('U');
    const w = r.x;
    const h = tall(r)? r.q : r.h;
    const x = 0;
    const y = 0;
    window.move_resize_frame(false, r.u+x, r.v+y, w, h);
  } else {
    setCount('u');
    const w = r.w;
    const h = tall(r)? r.q : r.h;
    const x = Half*(r.x - w);
    const y = (Count%2==1)? Pad : Half*(r.y - Pad) - h;
    window.move_resize_frame(false, r.u+x, r.v+y, w, h);
  }
}

function leftWindow(window, r) {
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  if (wide(r) || taller(r)) {
    setCount('L');
    const w = getResizeWidth(r);
    const h = r.y;
    const x = 0;
    const y = 0;
    window.move_resize_frame(false, r.u+x, r.v+y, w, h);
  } else {
    setCount('l');
    const x = (Count%2==1)? Pad : Half*(r.x - 3*r.w) - Pad;
    const y = Half*(r.y - r.h);
    window.move_frame(false, r.u+x, r.v+y);
  }
}

function rightWindow(window, r) {
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  if (wide(r) || taller(r)) {
    setCount('R');
    const w = getResizeWidth(r);
    const h = r.y;
    const x = r.x - w;
    const y = 0;
    window.move_resize_frame(false, r.u+x, r.v+y, w, h);
  }else{
    setCount('r');
    const x = (Count%2==1)? r.x - r.w - Pad : Half*(r.x + r.w) + Pad;
    const y = Half*(r.y - r.h);
    window.move_frame(false, r.u+x, r.v+y);
  }
}

function wide(r) {
  return r.w > r.p;
}

function wider(r) {
  return r.w > r.a;
}

function tall(r) {
  return r.h > r.q;
}

function taller(r) {
  return r.h > r.b;
}

// eslint-disable-next-line no-unused-vars
function init() {
}

// eslint-disable-next-line no-unused-vars
function enable() {
  const mode = Shell.ActionMode.NORMAL;
  const flag = Meta.KeyBindingFlags.IGNORE_AUTOREPEAT;
  const settings = getSettings();

  Main.wm.addKeybinding('mid-screen', settings, flag, mode, () => {
    const window = getActiveWindow();
    const r = getRectangles(window);
    centerWindow(window, r);
  });

  Main.wm.addKeybinding('down-screen', settings, flag, mode, () => {
    const window = getActiveWindow();
    const r = getRectangles(window);
    downWindow(window, r);
  });

  Main.wm.addKeybinding('up-screen', settings, flag, mode, () => {
    const window = getActiveWindow();
    const r = getRectangles(window);
    upWindow(window, r);
  });

  Main.wm.addKeybinding('toggle-left', settings, flag, mode, () => {
    const window = getActiveWindow();
    const r = getRectangles(window);
    leftWindow(window, r);
  });

  Main.wm.addKeybinding('toggle-right', settings, flag, mode, () => {
    const window = getActiveWindow();
    const r = getRectangles(window);
    rightWindow(window, r);
  });
}

// eslint-disable-next-line no-unused-vars
function disable() {
  Main.wm.removeKeybinding('mid-screen');
  Main.wm.removeKeybinding('down-screen');
  Main.wm.removeKeybinding('up-screen');
  Main.wm.removeKeybinding('toggle-left');
  Main.wm.removeKeybinding('toggle-right');
}
