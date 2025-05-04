let songs = [];
let currentSongIndex = 0;
let currentSong = new Audio();
let currFolder = "";

// Format time helper
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

// Play music
const playMusic = (track, pause = false) => {
    let finalSrc;

    if (track.startsWith("http")) {
        finalSrc = track;
    } else {
        const safeTrack = track.endsWith(".mp3") ? track : track + ".mp3";
        finalSrc = `http://127.0.0.1:3000/${songs}`;
    }

    currentSong.src = finalSrc;

    let fileName = decodeURI(finalSrc.split("/").pop().replace(".mp3", ""));
    document.querySelector(".songinfo").innerHTML = fileName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
    });

    if (!pause) {
        currentSong.play();
        document.querySelector('#play').src = "pause.svg";
    }
};

// Get songs from folder
async function getSongs(folderPath) {
    let response = await fetch(`http://127.0.0.1:3000/${folderPath}`);
    let text = await response.text();
    let div = document.createElement('div');
    div.innerHTML = text;

    let links = Array.from(div.getElementsByTagName('a'));
    return links
        .map(link => link.href)
        .filter(href => href.endsWith('.mp3') || href.endsWith('.wav'));
}

// Display album cards
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let htmlText = await a.text();
    let div = document.createElement('div');
    div.innerHTML = htmlText;

    let anchors = div.getElementsByTagName('a');
    let cardcontainer = document.querySelector('.cardcontainer');

    for (let anchor of anchors) {
        if (anchor.href.includes('/songs/')) {
            let folder = anchor.href.split('/').slice(-2)[0];
            if (folder.toLowerCase() === 'songs') continue;

            let res = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            if (!res.ok) {
                console.log(`Metadata not found for folder: ${folder}`);
                continue;
            }

            let metadata = await res.json();

            // Create album card
            let card = document.createElement('div');
            card.className = 'card cursor';
            card.setAttribute('data-folder', folder);
            card.innerHTML = `
                <div class="play">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       width="24" height="24" fill="#000000">
                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138
                             13.5257 17.0361C10.296 18.8709 8.6812 19.7884
                             7.37983 19.4196C6.8418 19.2671 6.35159 18.9776
                             5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574
                             5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418
                             4.73288 7.37983 4.58042C8.6812 4.21165 10.296
                             5.12907 13.5257 6.96393C16.8667 8.86197 18.5371
                             9.811 18.8906 11.154C19.0365 11.7084 19.0365
                             12.2916 18.8906 12.846Z"
                          stroke="#000000" stroke-width="1.5"
                          stroke-linejoin="round"></path>
                  </svg>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="" />
                <h2>${metadata.title}</h2>
                <p>${metadata.description}</p>
            `;

            // Add click event to play first song of album
            card.addEventListener('click', async () => {
                currFolder = `songs/${folder}`;
                songs = await getSongs(currFolder);
                if (songs.length > 0) {
                    currentSongIndex = 0;
                    playMusic(songs[currentSongIndex]); // ✅ autoplay first song
                } else {
                    console.warn(`No songs found in ${folder}`);
                }
            });

            cardcontainer.appendChild(card);
        }
    }
}

// Auto-play next song when current ends
currentSong.addEventListener('ended', () => {
    currentSongIndex++;
    if (currentSongIndex < songs.length) {
        playMusic(songs[currentSongIndex]);
    } else {
        console.log("Reached end of playlist.");
    }
});

// Load albums on page load
window.addEventListener('DOMContentLoaded', () => {
    displayAlbums();
});





async function main() {

    await getSongs("songs/nfak");

 playMusic(songs[0], true)
 
    // display all the albums on the page  Function calling
    displayAlbums();

       

                        
        // attach event lister to play next and previous song

play.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src = "pause.svg";
    }else{
        currentSong.pause()
        play.src = "play.svg";
    }
})

// listen for timeupdate event lister



currentSong.addEventListener("timeupdate", () => {
    const percent = (currentSong.currentTime / currentSong.duration) * 100;
    circle.style.left = `${percent}%`;
    seekbar.style.background = `linear-gradient(to right, #1DB954 ${percent}%, #ccc ${percent}%)`;

    document.querySelector('.songtime').innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
});

// event listen to seek bar to move it by hand

document.querySelector('.seekbar').addEventListener("click", (e) => {
const seekbar = e.target.getBoundingClientRect();
const clickX = e.clientX - seekbar.left;
const width = seekbar.width;
const progressPercent = (clickX / width) * 100;

// Set the audio currentTime
currentSong.currentTime = (clickX / width) * currentSong.duration;

// Move the circle
document.querySelector('.circle').style.left = `${progressPercent}%`;

// Update the progress bar color
document.querySelector('.seekbar').style.background = 
    `linear-gradient(to right, #1DB954 ${progressPercent}%, #ccc ${progressPercent}%)`;
});

const seekbar = document.querySelector('.seekbar');
const circle = document.querySelector('.circle');

let isDragging = false;

circle.addEventListener("mousedown", () => {
isDragging = true;
});

document.addEventListener("mousemove", (e) => {
if (isDragging) {
    const rect = seekbar.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;

    // Clamp between 0 and width
    offsetX = Math.max(0, Math.min(offsetX, rect.width));

    const percent = (offsetX / rect.width) * 100;
    circle.style.left = `${percent}%`;
    seekbar.style.background = `linear-gradient(to right, #1DB954 ${percent}%, #ccc ${percent}%)`;
}
});

document.addEventListener("mouseup", (e) => {
if (isDragging) {
    const rect = seekbar.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;

    offsetX = Math.max(0, Math.min(offsetX, rect.width));
    const percent = (offsetX / rect.width);
    currentSong.currentTime = percent * currentSong.duration;

    isDragging = false;
}
});


document.querySelector('.hamburger').addEventListener('click', () =>{
document.querySelector('.left').style.left = '0'
})
document.querySelector('.close').addEventListener('click', () =>{
document.querySelector('.left').style.left = '-120%'
})


// adding event listener to previous and next 
// previous.addEventListener('click', ()=>{
//     console.log("prevous clicked");

//   })

previous.addEventListener('click', () => {
// console.log("Next clicked");

// Get just the filename from the current song
const currentFilename = decodeURIComponent(currentSong.src.split('/').pop());

// Find the song index using only filename match
let index = songs.findIndex(song => song.endsWith(currentFilename));

// console.log("Current filename:", currentFilename);
// console.log("Current index:", index);

if (index !== -1) {
    let previousindex = (index - 1 + songs.length) % songs.length; // wrap around
    playMusic(songs[previousindex]);
} else {
    console.warn("Current song not found in songs array.");
}
});


next.addEventListener('click', () => {
// console.log("Next clicked");

// Get just the filename from the current song
const currentFilename = decodeURIComponent(currentSong.src.split('/').pop());

// Find the song index using only filename match
let index = songs.findIndex(song => song.endsWith(currentFilename));

// console.log("Current filename:", currentFilename);
// console.log("Current index:", index);

if (index !== -1) {
    let nextIndex = (index + 1) % songs.length; // wrap around
    playMusic(songs[nextIndex]);
} else {
    console.warn("Current song not found in songs array.");
}
});


function updateSongTitle(title) {
const songTitle = document.getElementById("songTitle");

songTitle.textContent = decodeURI(title.trim());
songTitle.classList.remove("scroll");

// Delay ensures the browser recalculates width
setTimeout(() => {
    const wrapper = document.querySelector('.songinfo-wrapper');

    if (songTitle.scrollWidth > wrapper.offsetWidth) {
        songTitle.classList.add("scroll");
    }
}, 100); // slight delay to allow DOM update
}


// Add an event to volume

document.querySelector('input[type="range"]').addEventListener('input', (e) => {
// console.log(e.target.value); // value of slider
currentSong.volume = parseInt(e.target.value)/100
});


const volumeup = document.querySelector('.volumeup');
const volumeSlider = document.querySelector('input[type="range"]');

// Click volume icon to mute/unmute
volumeup.addEventListener('click', () => {
currentSong.muted = !currentSong.muted;

if (currentSong.muted || currentSong.volume === 0) {
    volumeup.src = "mute.svg";
} else if (currentSong.volume <= 0.5) {
    volumeup.src = "halfvol.svg";
} else {
    volumeup.src = "volume.svg";
}
});

// Volume slider live update
volumeSlider.addEventListener('input', (e) => {
const volume = parseInt(e.target.value) / 100;
currentSong.volume = volume;

if (volume === 0) {
    currentSong.muted = true;
    volumeup.src = "mute.svg";
} else {
    currentSong.muted = false;

    if (volume <= 0.5) {
        volumeup.src = "halfvol.svg";
    } else {
        volumeup.src = "volume.svg";
    }
}
});




} // main funcion parameter 



main()