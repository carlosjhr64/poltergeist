# Evil Gnome Extension
Gnome extension adding more window management keyboard shortcuts.
Tested on Fedora-34/Gnome-40.10/Wayland with Hide Panel extension on a 3840x2160(16:9)(4K) display.
But coded generally, should work on any displays.
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
| mid-screen   | S-m        | Places window mid-centered |
| up-screen    | S-k        | Places window top-centered (h-maxed depending on width)|
| down-screen  | S-j        | Places window botom-centered (h-maxed depending on width)|
| toggle-left  | S-h        | Places window mid-left (or anchored left depeding on size)|
| toggle-right | S-l        | Places window mid-right (or anchored right depending on size)|

* Side anchored windows will have their widths toggled to different lengths
* Double tap mid-screen will toggle window size amount three standard sizes
* Double tap S-{hjkl} will place window at the chosen edge
* Display corners can be reach via S-{hl}S-{jk} in quick succesion

# Helpful commands & links
* `gnome-extensions-app`: an application for configuring and removing GNOME Shell extensions
* `journalctl -f -o cat /usr/bin/gnome-shell`: follow logs
* `glib-compile-schemas schemas` Must be run after any changes to gchema.xml
* Typescript Gnome types (incomplete) https://raw.githubusercontent.com/gTile/gTile/master/gnometypes.ts
