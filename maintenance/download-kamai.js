/*
This script downloads song data from Kamaitachi.

=== Downloading using a table ===
A Table is a premade collection of songs. Tables are separated into folders, which are then separated into charts.
Tables happen to be an efficient way of gathering a lot of song information at once.
Note that, tables are not guaranteed to give you every song, or even all charts for a given song.
The only way of doing that is to check each individual song.

 - Determine the name of the table you want to load first by browsing the Kamaitachi table
 - Paste this script into the Developer Console
 - run `songs = await download()`
 - The script will fetch the list of all tables and ask you to choose one. Pick the one you chose above.
 - Wait a bit for it to go through the table and folder information.
 - After it's done it will prompt you to save the updated file.

=== Download an individual folder ===

 - run `songs = await load()` to load songs from an existing data file
 - run `loadFolder(..., songs)` with the folder id you want to load
 - run `openDownload(songs, "songs-kamai.json")` to save the file

=== Download individual songs ===

 - run `songs = await load()` to load songs from an existing data file
 - run `loadIds([...], songs)` with the list of song ids you want to check/update
 - run `openDownload(songs, "songs-kamai.json")` to save the file

*/

const KAMAI_API = `${window.location.origin}/api/v1`;

//-------------------------------
// Load from table
//-------------------------------
async function chooseTable() {
    let response = await fetch(`${KAMAI_API}/games/popn/9B/tables`);
    let tables = await response.json();

    string = [];
    for (let [i,t] of tables.body.entries()) {
        string.push(`${i} - ${t.title}`);
    }

    let c = prompt(string.join('\n'));
    let chosenTable = tables.body[c];

    return chosenTable;
}

async function loadFolder(folderId, songs) {
    let response = await fetch(`${KAMAI_API}/games/popn/9B/folders/${folderId}`);
    let folder = await response.json();

    for (let s of folder.body.songs) {
        if (!(s.id in songs)) {
            songs[s.id] = {title: s.title, artist: s.artist, charts: {}};
        }
    }
    for (let c of folder.body.charts) {
        songs[c.songID].charts[c.difficulty] = c.levelNum;
    }
    return folder.body.folder;
}

//-------------------------------
// Load from ids
//-------------------------------
async function loadIds(ids, songs) {
    for (let id of ids) {
        let response = await fetch(`${KAMAI_API}/games/popn/9B/songs/${id}`);
        let data = await response.json();

        let s = data.body.song;
        if (!(s.id in songs)) {
            songs[s.id] = {title: s.title, artist: s.artist, charts: {}};
        }
        for (let c of data.body.charts) {
            songs[c.songID].charts[c.difficulty] = c.levelNum;
        }
    }
    return songs;
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

async function load() {
    let file = await selectFile();
    let songs;
    if (file == null) {
        songs = {};
    } else {
        let text = await file.text();
        songs = JSON.parse(text);
    }
    return songs;
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
function getMissingIds(songs) {
    let maxId = Math.max(...Object.keys(songs));
    let missingIds = [];
    for (let i=1; i<=maxId; i++) {
        if (!(i.toString() in songs)) {
            missingIds.push(i);
        }
    }
    return missingIds;
}

async function download() {
    let table = await chooseTable();
    let songs = {};
    for (let folderId of table.folders) {
        let folder = await loadFolder(folderId, songs);
        let totalSongs = Object.keys(songs).length;
        let maxId = Math.max(...Object.keys(songs));
        console.log(`${folder.title} || Progress: ${totalSongs}/${maxId} (${Math.round(totalSongs/maxId * 1000) / 10}%)`);
    }

    let missingIds = getMissingIds(songs);    
    console.log("Missing ids", missingIds);
    if (missingIds.length < 50) {
        await loadIds(missingIds, songs);
    } else {
        console.log("A lot of missing ids, something went wrong? Not fetching missing ids automatically")
    }    

    openDownload(songs, "songs-kamai.json");
    return songs;
}

