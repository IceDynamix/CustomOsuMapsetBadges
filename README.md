# Custom mapset badges on the osu! website

This is a userscript born from the idea that maps used in the osu! world cups could have a badge on the website.
The script can fetch other badge sets from external sources defined at the top of the userscript.
The default install comes with badges for the osu! world cups.
The script is active on all pages that use beatmap panels, most notably the beatmap listing and the userpage.

## Install

1. Requires a userscript manager of your choice (Tampermonkey for Chrome or Greasemonkey for Firefox)
2. Install the script by
   clicking [here](https://github.com/IceDynamix/CustomOsuMapsetBadges/raw/main/CustomMapsetBadges.user.js)
3. Add more custom badges by adding another custom source at the top of the userscript

## List of custom badge sets

- osu! World Cup
  badges [Source](https://github.com/IceDynamix/CustomOsuMapsetBadges/blob/main/badge_sets/world_cup_maps) `https://github.com/IceDynamix/CustomOsuMapsetBadges/raw/main/badge_sets/world_cup_maps/world_cup_maps.json`

## Create your own badge sets

Host raw .json text accessible via a URL that contains a list of objects in this format:

```json
[
  {
    "name": "CWC 1",
    "color": "#DE49A1",
    "slot": "title",
    "mapsets": [
      42694,
      43027,
      31297
    ]
  },
  {
    "name": "CWC 2013",
    "color": "#DE49A1",
    "slot": "title",
    "mapsets": [
      43801,
      13320
    ]
  }
]
```

Feel free to submit a pull request to add the .json in the `badge_sets` directory and/or add an entry to the README.