# Poltergeist
Gnome extension adding more window management keyboard shortcuts.
Tested on a 3840x2160(16:9)(4K) display.
But coded generally, should work on any displays.
Originally cloned from [shiznatix's Bifocals](https://github.com/shiznatix/bifocals-gnome-extension).

# Installation via git-clone
```console
$ cd ~/.local/share/gnome-shell/extensions/
$ git clone https://github.com/carlosjhr64/poltergeist.git poltergeist@carlosjhr64
```

# Shortcuts

* `S-`: `<Super>`
* `M-`: `<Alt>`

| Name         | Keybinding | Description |
| :---         | :---       | :---        |
| mid-screen   | S-m        | Places window mid-centered |
| up-screen    | S-k        | Places window top-centered |
| down-screen  | S-j        | Places window bottom-centered |
| toggle-left  | S-h        | Places window mid-left (or anchored left depending on size)|
| toggle-right | S-l        | Places window mid-right (or anchored right depending on size)|

* Side anchored windows will have their widths toggled to different lengths
* Double tap mid-screen will toggle window size amount three standard sizes
* Double tap S-{hjkl} will place window at the chosen edge
* Display corners can be reach via S-{hl}S-{jk} in quick succession

# Helpful commands & links
* `gnome-extensions-app`: an application for configuring and removing GNOME Shell extensions
* `journalctl -f -o cat /usr/bin/gnome-shell`: follow logs
* `glib-compile-schemas schemas` Must be run after any changes to schema.xml
* Typescript Gnome types (incomplete) https://raw.githubusercontent.com/gTile/gTile/master/gnometypes.ts
