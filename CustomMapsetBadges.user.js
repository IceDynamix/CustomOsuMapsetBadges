// ==UserScript==
// @name         Custom osu! mapset badges
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       IceDynamix
// @match        https://osu.ppy.sh/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ppy.shSS
// @grant        none
// ==/UserScript==

/*
    Enter badge sources urls below
*/

const customBadgeSources = [
    "https://raw.githubusercontent.com/IceDynamix/CustomOsuMapsetBadges/main/badge_sets/world_cup_maps/world_cup_maps.json"
];

// ---------------- ACTUAL CODE BELOW -------------------

async function fetchCustomBadges(sources) {
    let allBadges = [];

    for (const source of sources) {
        let response = await fetch(source);
        if (response.ok) {
            let badges = await response.json();
            console.log(`Fetched ${badges.length} badges for custom badge source ${source}`)
            allBadges.push(...badges);
        } else {
            console.error(`Could not fetch data for custom badge source ${source}`);
        }
    }

    return allBadges;
}

function constructReverseDictionary(badges) {
    let reverseDictionary = {};

    for (const {name, color, mapsets, slot} of badges) {
        const badge = {name, color, slot};
        for (const mapset of mapsets) {
            if (mapset in reverseDictionary) {
                reverseDictionary[mapset].push(badge);
            } else {
                reverseDictionary[mapset] = [badge];
            }
        }
    }

    return reverseDictionary;
}

const parseMapsetIdFromUrl = (url) => parseInt(/(\d+)$/s.exec(url)[1]);

const createBadgeNode = (name, color) => {
    let span = document.createElement("span");
    span.classList.add("beatmapset-badge", "beatmapset-badge--panel");
    span.style.color = color;
    span.innerText = name;
    return span;
}

function addBadgesToMapsetElement(mapsetElement, mapBadgeDictionary) {
    // See bottom of function
    const loadedFlagClass = "beatmapset-panel__custom-badges-loaded";
    if (mapsetElement.classList.contains(loadedFlagClass)) return;

    const url = mapsetElement.querySelector(".beatmapset-panel__main-link").href;
    const mapsetId = parseMapsetIdFromUrl(url);

    const badges = mapBadgeDictionary[mapsetId] || [];

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

function refreshAllMapsets(mapBadgeDictionary) {
    const mapsetElements = document.querySelectorAll(".beatmapset-panel");
    for (const mapsetElement of mapsetElements) {
        addBadgesToMapsetElement(mapsetElement, mapBadgeDictionary);
    }
}

function setupObservers(mapBadgeDictionary) {
    const observer = new MutationObserver(() => refreshAllMapsets(mapBadgeDictionary));

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

    // waits until the website has finished loading because osu loads data incrementally
    window.addEventListener("load", function () {
        fetchCustomBadges(customBadgeSources).then(badges => {
            console.log(badges);
            const mapBadgeDictionary = constructReverseDictionary(badges);

            // initial pass over all mapset elements
            refreshAllMapsets(mapBadgeDictionary);
            // add badges to new mapset elements loaded by smooth pagination
            setupObservers(mapBadgeDictionary);
        }).catch(console.error);
    });
})();