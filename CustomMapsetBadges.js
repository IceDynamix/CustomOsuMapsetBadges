// ==UserScript==
// @name         Custom mapset badges
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       IceDynamix
// @match        https://osu.ppy.sh/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ppy.shSS
// @grant        none
// ==/UserScript==

const customBadges = [
    {
        name: "Tournament",
        color: "#DE49A1",
        mapsets: [923488,1790641, 1733246,1886586,1609920,1879420,1835578,1355025,1154288,1739478,1894296,1790912,1897353,1738121,1822213,1872124,1868797,1683645,1891040,1817125,1803122,1461060,1812360,1896952,1897323,1869628,1890060,1812755,1883219,1880007,1846313,1851016,1877965,1843780,1887982,1811044,1602254,1888901,1819057,1386859,1145548,1842792,1864157,1808052,1766665,1846926,1863866,1889166,1873779,1884565,1842481,1847997,1868244,1882292,1795649,1894662,1680764,1411131,1892233,1897404,1813822,1870057,1865696,1853971,1420479,1848285,1737435],
        slot: "title"
    }
];

let reverseDictionary = {};

for (const {name, color, mapsets, slot} of customBadges) {
    const badge = {name, color, slot};
    for (const mapset of mapsets) {
        if (mapset in reverseDictionary) {
            reverseDictionary[mapset].push(badge);
        } else {
            reverseDictionary[mapset] = [badge];
        }
    }
}

const getBadgesForMapset = (id) => reverseDictionary[id] || [];

const parseMapsetIdFromUrl = (url) => parseInt(/(\d+)$/s.exec(url)[1]);

const createBadgeNode = (name, color) => {
    let span = document.createElement("span");
    span.classList.add("beatmapset-badge", "beatmapset-badge--panel");
    span.style.color = color;
    span.innerText = name;
    return span;
}

function addBadgesToMapsetElement(mapsetElement) {
    // See bottom of function
    const loadedFlagClass = "beatmapset-panel__custom-badges-loaded";
    if (mapsetElement.classList.contains(loadedFlagClass)) return;

    const url = mapsetElement.querySelector(".beatmapset-panel__main-link").href;
    const mapsetId = parseMapsetIdFromUrl(url);

    const badges = getBadgesForMapset(mapsetId);

    for (const {name, color, slot} of badges) {
        const rowElement = mapsetElement.querySelector(`.beatmapset-panel__info-row--${slot}`);

        let badgeContainerElement = rowElement.querySelector(".beatmapset-panel__badge-container");

        if (badgeContainerElement == null) {
            badgeContainerElement = document.createElement("div");
            badgeContainerElement.classList.add("beatmapset-panel__badge-container");
            rowElement.appendChild(badgeContainerElement);
        }

        badgeContainerElement.appendChild(createBadgeNode(name, color));
    }

    if (badges.length > 0) {
        console.log(`Found mapset ID ${mapsetId} w/ ${badges.length} custom badges`);
    }

    // Scuffed way to save the badge state so badges won't be added multiple times
    // Required because osu! loads the mapsets by smooth pagination
    mapsetElement.classList.add(loadedFlagClass);
}

function refreshAllMapsets(mutationList, observer) {
    const mapsetElements = document.querySelectorAll(".beatmapset-panel");
    for (const mapsetElement of mapsetElements) {
        addBadgesToMapsetElement(mapsetElement);
    }
}

function setupObservers() {
    const observer = new MutationObserver(refreshAllMapsets);

    const addObserver = (selector, config) => {
        const el = document.querySelector(selector);
        if (el == null) return;
        observer.observe(el, config);
    };

    //beatmapsets*
    addObserver(".beatmapsets__items", {childList: true});

    //users*
    addObserver('[data-page-id*="beatmaps"]', {childList: true, subtree: true});
}

(function () {
    'use strict';

    // waits until the website has finished loading
    window.addEventListener("load", function () {
        // initial pass over all mapset elements
        refreshAllMapsets();
        // add badges to new mapset elements loaded by smooth pagination
        setupObservers();
    });
})();