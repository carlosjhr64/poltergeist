const { Gio, Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const Me   = imports.misc.extensionUtils.getCurrentExtension();

const Phi    = 1.618033988749895;
const Half   = 1.0/2.0;
const Third  = 1.0/3.0;
const Fourth = 1.0/4.0;
const Fifth  = 1.0/5.0;

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
    // Window
    w: rect.width,
    h: rect.height,
    // Work area
    x: x,
    y: y,
    // Work area origin
    u: monitorWorkArea.x,
    v: monitorWorkArea.y,
    // Big
    a: Math.round(x*(2 - Phi)),
    b: Math.round(y*(Phi - 1)),
    // Medium
    p: Math.round(x*Third - (1 + Third)*Pad),
    q: Math.round(y*Half - (1 + Half)*Pad),
    // Small
    s: Math.round(x*Fifth - (1 + Fifth)*Pad),
    t: Math.round(y*Fourth - (1 + Fourth)*Pad),
  };
}

function getResizeWidth(r) {
  switch(Count%5) {
    case 0:
      return r.x*Fourth;
    case 1:
      return r.x*Third;
    case 2:
      return r.x*(2-Phi);
    case 3:
      return r.x*Half;
    case 4:
      return r.x*(Phi-1);
    default:
      break; // :-??
  }
}

var Timestamp = 0;
var Elapsed   = 0;
var Count     = 0;
var Caller    = 'Z';
var Previous  = 'Z';

function setCount(caller) {
  const now = Date.now();
  Elapsed = now - Timestamp;
  Timestamp = now;
  if (Elapsed < 1000) {
    if (Caller==caller) {
      Previous = 'Z';
      Count    = Count + 1;
    } else {
      Previous = Caller;
      Caller   = caller;
      Count    = 0;
    }
  } else {
    Previous = 'Z';
    Caller   = caller;
    Count    = 0;
  }
}

function isBig(r) {
  return r.w==r.a && r.h==r.b;
}

function toggleWidth(r) {
  if (Count>0){
    if (isBig(r)) { Count = 2; }
    switch(Count%3) {
      case 0:
        return r.s;
      case 1:
        return r.a;
      case 2:
        return r.p;
      default:
        break; // :-??
    }
  }
  return wide(r)? r.a : r.w;
}

function toggleHeight(r) {
  if (Count>0){
    if (isBig(r)) { Count = 2; }
    switch(Count%3) {
      case 0:
        return r.t;
      case 1:
        return r.b;
      case 2:
        return r.q;
      default:
        break; // :-??
    }
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

function down1(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = Half*(r.x - w);
  const y = r.y - h - Pad;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.u+y, w, h);
}

function down0(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = Half*(r.x - w);
  const y = Half*(r.y + Pad);
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.u+y, w, h);
}

function downSwitch(window, r) {
  switch(Count%2) {
    case 0:
      down0(window, r);
      break;
    case 1:
      down1(window, r);
      break;
    default:
      break; // :-??
  }
}

function downRight(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = r.x - r.w - Pad;
  const y = r.y - r.h - Pad;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function downLeft(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = Pad;
  const y = r.y - r.h - Pad;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function downWindow(window, r) {
  setCount('D');
  switch(Previous) {
    case 'l':
      downLeft(window, r);
      break;
    case 'r':
      downRight(window, r);
      break;
    default:
      downSwitch(window, r);
      break;
  }
}

function up2(window, r) {
  const w = r.w;
  const h = r.y - 2*Pad;
  const x = Half*(r.x - w);
  const y = Pad;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function up1(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = Half*(r.x - w);
  const y = Pad;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function up0(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = Half*(r.x - w);
  const y = Half*(r.y - Pad) - h;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function upSwitch(window, r) {
  switch(Count%3) {
    case 0:
      up0(window, r);
      break;
    case 1:
      up1(window, r);
      break;
    case 2:
      up2(window, r);
      break;
    default:
      break; // :-??
  }
}

function upRight(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = r.x - r.w - Pad;
  const y = Pad;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function upLeft(window, r) {
  const w = r.w;
  const h = tall(r)? r.q : r.h;
  const x = Pad;
  const y = Pad;
  window.unmaximize(Meta.MaximizeFlags.BOTH);
  window.move_resize_frame(false, r.u+x, r.v+y, w, h);
}

function upWindow(window, r) {
  setCount('U');
  switch(Previous) {
    case 'l':
      upLeft(window, r);
      break;
    case 'r':
      upRight(window, r);
      break;
    default:
      upSwitch(window, r);
      break;
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
