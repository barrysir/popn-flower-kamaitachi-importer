/*
This script downloads song data from various pages on the Flower website.

=== Downloading from the player score listing page ===
The complete score listing for a player lets us find lots of song title <-> id mappings at once.
 - Navigate to the player score listing page you want to analyze
       e.g. /game/pnm/scores/92979054
 - Paste this script into the Developer Console
 - It will prompt you to load your current version of the song database, if you have one (if you don't then hit Cancel).
 - After it's done it will prompt you to save the updated file.
 - The script will print out a list of song ids it couldn't find. 
   You can plug this list into the next part of the script to download the remaining songs.

Repeat on different player pages until satisfied.

=== Downloading individual songs from their individual song pages ===

 - Paste this script into the Developer Console
 - run `downloadIds([...])` with the list of song ids you want to check/update
 - It will prompt you to load your current version of the song database, if you have one (if you don't then hit Cancel).
 - After it's done it will prompt you to save the updated file.
*/

const FLOWER_URL = window.location.origin;

//-------------------------------
// Reading player score listing
//-------------------------------
function getSongs(table, songs = null) {
    if (songs === null) {
        songs = {};
    }

    let tbody = table.querySelector("tbody");

    for (let tr of tbody.querySelectorAll("tr")) {
        let a = tr.children[0].querySelector("div > a");

        let title = a.innerText.trim();

        let songUrl = a.href;
        let urlParts = new URL(songUrl).pathname.split('/');
        let songId = urlParts[urlParts.length - 2];

        if (songId in songs) {
            if (songs[songId].title != title) {
                throw new Error("Duplicate found");
            }
        }
        songs[songId] = { title: title };
    }
    return songs;
}

function findTable(doc = document) {
    return [...doc.querySelectorAll("th")].filter(a => a.textContent.includes("Song Title"))[0].closest('table');
}

//-------------------------------
// Reading song page
//-------------------------------
function getTextWithoutChildren(element) {
    let textContent = '';
    element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) { // Node.TEXT_NODE is 3
            textContent += node.nodeValue.trim(); // Trim to remove any extra whitespace
        }
    });
    return textContent;
}

let parser = new DOMParser();
function parseFlowerSongPage(doc = document) {
    let allTh = [...doc.querySelectorAll("th")];
    function info(text) {
        let th = allTh.filter(a => a.textContent.includes(text))[0];
        let td = th.nextElementSibling;
        return td.innerText.trim();
    }
    let title = info("Song Title");
    let artist = info("Song Artist");

    let elTopRankers = [...doc.querySelectorAll("h4")].filter(a => a.textContent.includes("Top Rankers"))[0];
    let elCharts = elTopRankers.closest('ul').querySelectorAll('a');

    let charts = Object.fromEntries([...elCharts].map(el => {
        let difficultyRaw = getTextWithoutChildren(el);
        let difficulty = ({'EASY': 'Easy', 'NORMAL': 'Normal', 'HYPER': 'Hyper', 'EX': 'EX'})[difficultyRaw];
        if (difficulty === undefined) {
            throw new Error(`Unknown difficulty ${difficultyRaw}`);
        }
        let number = parseInt(el.querySelector('b').innerText);
        return [difficulty, number];
    }));

    return {
        title: title,
        artist: artist,
        charts: charts,
    };
}

async function searchFlowerId(id) {
    async function findGoodResponse() {
        // Some songs get removed from later versions, so we might have to check older versions to find the song page
        for (let version of [27, 23, 25, 26, 24]) {
            let url = `${FLOWER_URL}/game/pnm/music/${version}/${id}/1`;
            let response = await fetch(url);
            if (response.ok) {
                console.log(`Fetch ${url} success`);
                return response;
            }
            console.log(`Fetch ${url} failed`);
        }
        return null;
    }
    
    let response = await findGoodResponse();
    if (response === null) {
        return null;
    }
    let html = await response.text();
    let doc = parser.parseFromString(html, "text/html");

    return parseFlowerSongPage(doc);
}


//-------------------------------
// Utilities
//-------------------------------
// https://stackoverflow.com/questions/71435515/how-can-i-detect-that-the-cancel-button-has-been-clicked-on-a-input-type-file
function selectFile(accept = null) {
    return new Promise(async resolve => {
        const fileInputElement = document.createElement('input');
        fileInputElement.type = 'file';
        fileInputElement.style.opacity = '0';
        if (accept) fileInputElement.accept = accept;
        fileInputElement.addEventListener('change', () => {
            const file = fileInputElement.files[0];
            document.body.removeChild(fileInputElement);
            resolve(file);
        });
        document.body.appendChild(fileInputElement);
        setTimeout(_ => {
            fileInputElement.click()
            const onFocus = () => {
                window.removeEventListener('focus', onFocus);
                document.body.addEventListener('mousemove', onMouseMove);
            };
            const onMouseMove = () => {
                document.body.removeEventListener('mousemove', onMouseMove);
                if (!fileInputElement.files.length) {
                    document.body.removeChild(fileInputElement);
                    console.log('No file selected.');
                    resolve(null);
                }
            }
            window.addEventListener('focus', onFocus);
        }, 0);
    });
}

function openDownload(data, defaultName) {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultName;
    a.click();
    a.remove();
}

//-------------------------------
// Main
//-------------------------------
async function download() {
    let file = await selectFile();
    let songs;
    if (file == null) {
        songs = {};
    } else {
        let text = await file.text();
        songs = JSON.parse(text);
    }

    {
        let totalSongs = Object.keys(songs).length;
        let maxId = Math.max(...Object.keys(songs));
        console.log(`Before: ${totalSongs}/${maxId} (${Math.round(totalSongs/maxId * 1000) / 10}%)`);
    }

    songs = getSongs(findTable(), songs);

    {
        let totalSongs = Object.keys(songs).length;
        let maxId = Math.max(...Object.keys(songs));
        console.log(`After: ${totalSongs}/${maxId} (${Math.round(totalSongs/maxId * 1000) / 10}%)`);
    }

    openDownload(songs, "songs-flower.json");
    return songs;
}

async function downloadIds(ids) {
    let file = await selectFile();
    let songs;
    if (file == null) {
        songs = null;
    } else {
        let text = await file.text();
        songs = JSON.parse(text);
    }

    let failed = [];
    
    for (let [i,id] of ids.entries()) {
        console.log(`(${i+1}/${ids.length}) Searching id ${id}`);
        let data;
        let error = null;
        try {
            data = await searchFlowerId(id);
        } catch (e) {
            data = null;
            error = e;
        }

        if (data === null) {
            console.log(`Failed to find data for id ${id}`);
            if (error) {
                console.log(e);
            }
            failed.push(id);
            if (!(id in songs)) {
                songs[id] = null;
            }
            continue;
        }
        console.log(`New data:`, data);
        songs[id] = data;
    }
    console.log("Ids that failed:", failed);

    openDownload(songs, "songs-flower.json");
}