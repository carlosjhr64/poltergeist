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
    z: monitorWorkArea.x,
    a: Math.round(x*(2 - Phi)),
    b: Math.round(y*(Phi - 1)),
    p: Math.round(x*Third - (1 + Third)*Pad),
    q: Math.round(y*Half - (1 + Half)*Pad),
  };
}

function getResizeWidth(r) {
  const w = r.w;
  if (r.h < r.y) { return w; }
  const x = r.x;
  const w1 = Fourth*x;
  if (w + 1 < w1) { return w1; }
  const w2 = Third*x;
  if (w + 1 < w2) { return w2; }
  const w3 = x*(2 - Phi);
  if (w + 1 < w3) { return w3; }
  const w4 = Half*x;
  if (w + 1 < w4) { return w4; }
  const w5 = x*(Phi - 1);
  if (w + 1 < w5) { return w5; }
  return w1;
}

function toggleWidth(r) {
  if (r.w==r.a && r.h==r.b){ return r.p }
  if (r.w==r.p && r.h==r.q){ return r.a }
  return wide(r)? r.a : r.w;
}

function toggleHeight(r) {
  if (r.w==r.a && r.h==r.b){ return r.q }
  if (r.w==r.p && r.h==r.q){ return r.b }
  return tall(r)? r.b : r.h;
}

function centerWindow(window, r) {
  const w = toggleWidth(r);
  const h = toggleHeight(r);
  const x = r.z + Half*(r.x - w);
  const y = Half*(r.y - h);
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_frame(false, x, y);
  window.move_resize_frame(false, x, y, w, h);
}

function downWindow(window, r) {
  const h = tall(r)? r.q : r.h;
  if (wider(r)) {
    const y = r.y - h;
    window.unmaximize(Meta.MaximizeFlags.VERTICAL);
    window.move_frame(false, r.z, y);
    window.move_resize_frame(false, r.z, y, r.w, h);
    window.maximize(Meta.MaximizeFlags.HORIZONTAL);
  } else {
    const w = r.w;
    const x = r.z + Half*(r.x - w);
    const y = Half*(r.y + Pad);
    window.unmaximize(Meta.MaximizeFlags.BOTH);
    window.move_frame(false, x, y);
    window.move_resize_frame(false, x, y, w, h);
  }
}

function upWindow(window, r) {
  const h = tall(r)? r.q : r.h;
  if (wider(r)) {
    window.unmaximize(Meta.MaximizeFlags.VERTICAL);
    window.move_frame(false, r.z, 0);
    window.move_resize_frame(false, r.z, 0, r.w, h);
    window.maximize(Meta.MaximizeFlags.HORIZONTAL);
  } else {
    const w = r.w;
    const x = r.z + Half*(r.x - w);
    const y = Half*(r.y - Pad) - h;
    window.unmaximize(Meta.MaximizeFlags.BOTH);
    window.move_frame(false, x, y);
    window.move_resize_frame(false, x, y, w, h);
  }
}

function leftWindow(window, r) {
  if (wide(r) || taller(r)) {
    const w = getResizeWidth(r);
    window.unmaximize(Meta.MaximizeFlags.HORIZONTAL);
    window.move_frame(false, r.z, 0);
    window.move_resize_frame(false, r.z, 0, w, r.h);
    window.maximize(Meta.MaximizeFlags.VERTICAL);
  } else {
    const w = r.z + Half*(r.x - 3*r.w) - Pad;
    const h = Half*(r.y - r.h);
    window.move_frame(false, w, h);
  }
}

function rightWindow(window, r) {
  if (wide(r) || taller(r)) {
    const w = getResizeWidth(r);
    const z = r.z + r.x - w;
    window.unmaximize(Meta.MaximizeFlags.HORIZONTAL);
    window.move_frame(false, z, 0);
    window.move_resize_frame(false, z, 0, w, r.h);
    window.maximize(Meta.MaximizeFlags.VERTICAL);
  }else{
    const w = r.z + Half*(r.x + r.w) + Pad;
    const h = Half*(r.y - r.h);
    window.move_frame(false, w, h);
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
