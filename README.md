# Evil Gnome Extension
Gnome extension adding more window management keyboard shortcuts.
Tested on Wayland/Gnome 40.10.
Originally cloned from [shiznatix's Bifocals](https://github.com/shiznatix/bifocals-gnome-extension).

# Installation via git-clone
```shell
$ cd ~/.local/share/gnome-shell/extensions/
$ git clone https://github.com/carlosjhr64/evil-gnome-extension.git evil-gnome@carlosjhr64
```

# Shortcuts

* `S-`: `<Super>`
* `M-`: `<Alt>`

| Name         | Keybinding | Description |
| :---         | :---       | :---        |
| mid-screen   | S-M-m      | Places window mid-centered |
| up-screen    | S-M-k      | Places window top-centered (h-maxed depending on width)|
| down-screen  | S-M-j      | Places window botom-centered (h-maxed depending on width)|
| toggle-left  | S-M-h      | Places window mid-left (or anchored left depeding on size)|
| toggle-right | S-M-l      | Places window mid-right (or anchored right depending on size)|

* Side anchored windows will have their widths toggled to different lengths
* Double tap mid-screen will toggle window size between two standard sizes.

# Helpful commands & links
* `gnome-extensions-app`: an application for configuring and removing GNOME Shell extensions
* `journalctl -f -o cat /usr/bin/gnome-shell`: follow logs
* `glib-compile-schemas schemas` Must be run after any changes to gchema.xml
* Typescript Gnome types (incomplete) https://raw.githubusercontent.com/gTile/gTile/master/gnometypes.ts
