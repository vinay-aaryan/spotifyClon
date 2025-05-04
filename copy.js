console.log("Hey now it's begin"); 

let songs;

let currentSong = new Audio();


function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs() {
    try {
        // Fetch the songs directory
        const response = await fetch("http://127.0.0.1:3000/songs/");
        const html = await response.text();
        
        // Create a temporary div to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get all links
        const links = doc.getElementsByTagName("a");
        const songs = [];
        
        // Filter and store MP3 files
        for (let link of links) {
            const href = link.getAttribute("href");
            if (href && href.endsWith(".mp3")) {
                // console.log("Found href:", href);  // Debug
        
                // Use only the filename (safest)
                const filename = href.split("/").pop();  // gets just the last part
                songs.push("http://127.0.0.1:3000/songs/" + filename);
            }
        }

        
        // console.log("Found songs:", songs);
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}








function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const playMusic = (track, pause = false) => {
    let finalSrc;

    // Determine the audio source
    if (track.startsWith("http")) {
        finalSrc = track;
    } else {
        finalSrc = "/songs/" + track;
    }

    currentSong.src = finalSrc;

    // ✅ Get just the filename, remove ".mp3", and decode
    let fileName = decodeURI(finalSrc.split("/").pop().replace(".mp3", ""));

    // Show only song name (no extension)
    document.querySelector(".songinfo").innerHTML = fileName;

    // Set initial time display
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    // Update total duration when metadata loads
    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
        
    });

    // Play if not paused
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
};



async function main() {

        songs = await getSongs();
        // console.log("Songs array:", songs);
     playMusic(songs[0], true)
     
        
            // displaying songs in the playlist
            let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0]
                for (const song of songs) {
                    songUL.innerHTML = songUL.innerHTML + `<li>
                    <img class="invert playicon" src="music.svg" alt="">
                    <div class="info">
                        <div class="songName" >${song.replaceAll("http://127.0.0.1:3000/songs/", " "  )}</div>
                        <div class="artisName" >${song.replaceAll("http://127.0.0.1:3000/songs/", " "  )}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div>
                </li>`;
                    
                    // <li> ${song.replaceAll("http://127.0.0.1:3000/songs/", " "  )} </li>
                }
            
                // creating ssekbar
// attach a event listerner to each song
                    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
                            e.addEventListener("click", element =>{
                                // console.log(e.querySelector('.info').firstElementChild.innerHTML)
                                playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim())

                            })
                            })
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

// Click icon to mute/unmute
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