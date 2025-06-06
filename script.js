console.log("Hey now it's begin"); 

let songs = [];
let currFolder; 
let currentSongIndex = 0;
const currentSong = new Audio();

const play = document.querySelector("#play"); // or use querySelector
const next = document.querySelector("#next"); // or querySelector
const previous = document.querySelector("#previous");
const seekbar = document.querySelector('.seekbar');
const circle = document.querySelector('.circle');


function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    // Fetch the songs directory
    const response = await fetch(`http://127.0.0.1:3000/${folder}/`);
    const html = await response.text();
    
    // Create a temporary div to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get all links
    const links = doc.getElementsByTagName("a");
    songs = [];
    
    // Filter and store MP3 files
    for (let link of links) {
        const href = link.getAttribute("href");
        if (href && href.endsWith(".mp3")) {
            const filename = href.split("/").pop();
            const songPath = `http://127.0.0.1:3000/${folder}/${filename}`;
            songs.push(songPath);
        }
    }

    // displaying songs in the playlist
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        const songName = song.split('/').pop().replace('.mp3', '');
        songUL.innerHTML = songUL.innerHTML + `
            <li>
                <img class="invert playicon" src="/assets/music.svg" alt="">
                <div class="info">
                    <div class="songName">${songName}</div>
                    <div class="artisName">${songName}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="/assets/play.svg" alt="">
                </div>
            </li>`;
    }

    // attach event listener to each song
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {
            const songIndex = Array.from(songUL.children).indexOf(e);
            if (songIndex !== -1 && songs[songIndex]) {
                currentSongIndex = songIndex;
                playMusic(songs[songIndex]);
                updateCurrentSongHighlight();
            }
        });
    });

    // console.log("Found songs:", songs);
}


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


function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const playMusic = (track, pause = false) => {
    if (!track || typeof track !== "string") {
        console.error("❌ Invalid track passed to playMusic():", track);
        return;
    }

    let finalSrc;
    
    if (track.startsWith("http")) {
        finalSrc = track;
    } else if (track.startsWith("/songs/")) {
        finalSrc = track;
    } else if (track.includes("/")) {
        // If it's a relative path, make sure it starts with /songs/
        finalSrc = track.startsWith("/") ? track : `/songs/${track}`;
    } else {
        // If it's just a filename, use the current folder
        finalSrc = `/songs/${currFolder}/${track}`;
    }

    // Remove any duplicate 'songs' in the path
    finalSrc = finalSrc.replace(/\/songs\/songs\//, '/songs/');

    // Ensure the path is properly encoded
    finalSrc = encodeURI(finalSrc);

    // Logging for debug
    // console.log("🎵 Playing:", finalSrc);

    currentSong.src = finalSrc;

    const fileName = decodeURIComponent(finalSrc.split("/").pop().replace(".mp3", ""));
    updateSongTitle(fileName);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
    });

    if (!pause) {
        currentSong.play().catch(e => {
            console.error("Audio play error:", e);
        });
        if (play) {
            play.src = "/assets/pause.svg";
        }
    }

    // Update the current song highlight
    updateCurrentSongHighlight();
};



// display album function
async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement('div') ;
    div.innerHTML = response

    let anchors = div.querySelectorAll("a");
    let cardcontainer = document.querySelector('.cardcontainer')
    // let anchors = document.querySelectorAll('a')
    // console.log("Album is showing!!!!", anchors);
   let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        
        if (e.href.includes('/songs/')) {
        let parts = e.href.split('/');
        let folder = parts[parts.length - 2]; // Get second-to-last element
        
        // If the folder is 'songs', it means it's an incorrect path, so skip
        if (folder === 'songs') {
            return;
        }
            try {
                let res = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let metadata = await res.json();
                // console.log(metadata);
            
        
    
                // Create album card
                cardcontainer.innerHTML = cardcontainer.innerHTML + `
                  <div data-folder="${folder}" class="card cursor">
                    <div class="play">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                           width="24" height="24" fill="#000000">
                        <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                              stroke="#000000" stroke-width="1.5" stroke-linejoin="round"></path>
                      </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="" />
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                  </div>
                `;
            } catch (err) {
                console.warn(`❌ Error fetching metadata for folder "${folder}":`, err);
            }

            
        }
    // load playlist whenever card is clicked 

    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener('click', async (event) => {
            const folder = card.dataset.folder;
            await getSongs(`songs/${folder}`);
            if (songs && songs.length > 0) {
                currentSongIndex = 0;
                // Store the current song path for next/previous functionality
                currentSong.src = songs[currentSongIndex];
                playMusic(songs[currentSongIndex]);
            }
        });
    });
            
}
}

async function main() {
    
        await getSongs("songs");
    // console.log("Songs array:", songs);

    playMusic(songs[0], true)
    
    // display Album calling 
    displayAlbum()
   
          
            // attach event lister to play next and previous song


// listen for timeupdate event lister
    // currentSong.addEventListener("timeupdate", ()=>{
    //     console.log(currentSong.currentTime, currentSong.duration);
    //     document.querySelector('.songtime').innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
    //     document.querySelector('.circle').style.left = (currentSong.currentTime/currentSong.duration)*100 + '%'
    // })


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
    // console.log("previous clicked");

    if (!songs || songs.length === 0) {
        console.warn("No songs in the playlist");
        return;
    }

    // Find current song index
    const currentSrc = decodeURIComponent(currentSong.src);
    let index = songs.findIndex(song => decodeURIComponent(song) === currentSrc);
    
    if (index === -1) {
        // Try to find by filename if full path match fails
        const currentFilename = currentSrc.split('/').pop();
        index = songs.findIndex(song => decodeURIComponent(song).endsWith(currentFilename));
    }

    // console.log("Current index:", index);
    // console.log("Songs:", songs);
    // console.log("Current src:", currentSrc);

    if (index !== -1) {
        // Loop to the end if at the beginning
        let previousindex = (index - 1 + songs.length) % songs.length;
        currentSongIndex = previousindex;
        playMusic(songs[previousindex]);
        updateCurrentSongHighlight();
    } else if (songs.length > 0) {
        // If we can't find the current song, play the last song
        currentSongIndex = songs.length - 1;
        playMusic(songs[songs.length - 1]);
    } else {
        console.warn("Current song not found in songs array.");
    }
});


  next.addEventListener('click', () => {
    // console.log("Next clicked");

    if (!songs || songs.length === 0) {
        console.warn("No songs in the playlist");
        return;
    }

    // Find current song index
    const currentSrc = decodeURIComponent(currentSong.src);
    let index = songs.findIndex(song => decodeURIComponent(song) === currentSrc);
    
    if (index === -1) {
        // Try to find by filename if full path match fails
        const currentFilename = currentSrc.split('/').pop();
        index = songs.findIndex(song => decodeURIComponent(song).endsWith(currentFilename));
    }

    // console.log("Current index:", index);
    // console.log("Songs:", songs);
    // console.log("Current src:", currentSrc);

    if (index !== -1) {
        // Loop to the beginning if at the end
        let nextIndex = (index + 1) % songs.length;
        currentSongIndex = nextIndex;
        playMusic(songs[nextIndex]);
        updateCurrentSongHighlight();
    } else if (songs.length > 0) {
        // If we can't find the current song, play the first song
        currentSongIndex = 0;
        playMusic(songs[0]);
    } else {
        console.warn("Current song not found in songs array.");
    }
});


// yaha update song titile thaa


 // Add an event to volume

 document.querySelector('input[type="range"]').addEventListener('input', (e) => {
    // console.log(e.target.value); // value of slider
    currentSong.volume = parseInt(e.target.value)/100
  });


const volumeup = document.querySelector('.volumeup');
const volumeSlider = document.querySelector('input[type="range"]');

// Click icon to mute/unmute
volumeup.addEventListener('click', () => {
    currentSong.muted = !currentSong.muted;

    if (currentSong.muted || currentSong.volume === 0) {
        volumeup.src = "/assets/mute.svg";
    } else if (currentSong.volume <= 0.5) {
        volumeup.src = "/assets/halfvol.svg";
    } else {
        volumeup.src = "/assets/volume.svg";
    }
});


// Volume slider live update
volumeSlider.addEventListener('input', (e) => {
    const volume = parseInt(e.target.value) / 100;
    currentSong.volume = volume;

    if (volume === 0) {
        currentSong.muted = true;
        volumeup.src = "/assets/mute.svg";
    } else {
        currentSong.muted = false;

        if (volume <= 0.5) {
            volumeup.src = "/assets/halfvol.svg";
        } else {
            volumeup.src = "/assets/volume.svg";
        }
    }
});


} // main funcion parameter 

main()

// Add play/pause button functionality
play.addEventListener('click', () => {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "/assets/pause.svg";
    } else {
        currentSong.pause();
        play.src = "/assets/play.svg";
    }
});

// Update play button state when song ends
currentSong.addEventListener('ended', () => {
    if (songs && songs.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playMusic(songs[currentSongIndex]);
    }
    play.src = "/assets/play.svg";
});

// Update play button state when song starts playing
currentSong.addEventListener('play', () => {
    if (play) {
        play.src = "/assets/pause.svg";
    }
});

// Update play button state when song is paused
currentSong.addEventListener('pause', () => {
    if (play) {
        play.src = "/assets/play.svg";
    }
});

// Add search functionality
const searchInput = document.querySelector('.search input');
const songList = document.querySelector('.songList ul');

if (searchInput && songList) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const songs = Array.from(songList.children);
        
        songs.forEach(song => {
            const songName = song.querySelector('.songName').textContent.toLowerCase();
            if (songName.includes(searchTerm)) {
                song.style.display = 'flex';
            } else {
                song.style.display = 'none';
            }
        });
    });
}

// Add current song highlighting
function updateCurrentSongHighlight() {
    // Remove highlight from all songs
    const allSongs = document.querySelectorAll('.songList li');
    allSongs.forEach(song => {
        song.classList.remove('current-song');
    });

    // Add highlight to current song
    if (currentSong.src) {
        const currentSrc = decodeURIComponent(currentSong.src);
        const currentSongElement = Array.from(allSongs).find(song => {
            const songName = song.querySelector('.songName').textContent;
            return currentSrc.includes(songName);
        });
        
        if (currentSongElement) {
            currentSongElement.classList.add('current-song');
        }
    }
}