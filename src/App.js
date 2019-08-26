import React, { useState, useEffect } from "react";
import "./App.css";
import data from "./transcript_sbv_1.json";

let player;

function App() {
    const [search, setSearch] = useState("");
    const [ctime, setCtime] = useState(0);
    const [currentsearch, setCurrentsearch] = useState(-1);
    const [isProtected, setProtected] = useState(false);

    let filteredData = data;
    let searchResults = [];

    useEffect(() => {
        if (search) {
            const index = data.findIndex(d =>
                d.text.toLowerCase().includes(search.toLowerCase())
            );
            setCurrentsearch(-1);
            if (index > -1) {
                document.getElementById("line" + index).scrollIntoView({ block: 'start', behavior: 'smooth' });
            }
        }
        if (ctime > 0) {
            const i = data.findIndex(d =>
                ctime >= convertTime(d.startTime) && ctime <= convertTime(d.endTime)
            );
            if (i > -1) {
                document.getElementById("line" + i).scrollIntoView(true);
            }
        }
    }, [search, ctime]);

    function convertTime(time) {
        const tokens = time.split(":");
        const minutes = parseInt(tokens[1]);
        let seconds = parseInt(tokens[2]);
        seconds = minutes * 60 + seconds;
        return seconds;
    }

    function onPlayerStateChange(event) {
        var Update;
        if (event.data == window.YT.PlayerState.PLAYING) {
            Update = setInterval(function () {
                UpdateMarkers()
            }, 100);
        } else if (event.data == window.YT.PlayerState.PAUSED) {
            clearInterval(Update);
        } else {
            clearInterval(Update);
        }
    }

    function UpdateMarkers() {
        var current_time = player.getCurrentTime();
        setCtime(current_time)
    }

    function play(startTime) {
        const tokens = startTime.split(":");
        const minutes = parseInt(tokens[1]);
        let seconds = parseInt(tokens[2]);
        seconds = minutes * 60 + seconds;
        player.seekTo(seconds);
        player.playVideo();
    }

    function handleSearch(e) {
        setSearch(e.target.value);
    }

    function handleSearchPrev(e) {
        e.preventDefault();
        player.pauseVideo();
        let index = (currentsearch == -1 || currentsearch == 0) ? 0 : currentsearch - 1;
        if (searchResults[index]) {
            searchResults[index].parentNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
            setCurrentsearch(index);
        }
    }

    function handleSearchNext(e) {
        e.preventDefault();
        player.pauseVideo();
        let index = (currentsearch == -1) ? 0 : currentsearch + 1;
        if (searchResults[index]) {
            searchResults[index].parentNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
            setCurrentsearch(index);
        }
    }

    function handlePasswordSubmit(e) {
        e.preventDefault();
        var password = document.getElementById('password').value;
        if (password == 'prydan') {
            setProtected(true);
            setTimeout(function () {
                player = new window.YT.Player("player", {
                    height: "390",
                    width: "100%",
                    videoId: "sj9pf0Idamw",
                    events: {
                        "onStateChange": onPlayerStateChange
                    }
                });
            }, 200)

        } else {
            alert('Incorrect Password!');
            return;
        }
    }

    if (search) {
        let wrapText = '<span>' + search + '</span>';
        filteredData = data.map(d => {
            return {
                ...d,
                isCurrent: (ctime >= convertTime(d.startTime) && ctime <= convertTime(d.endTime)),
                highlight: d.text.toLowerCase().includes(search.toLowerCase()),
                text: d.text.toLowerCase().replace(search.toLowerCase(), wrapText)
            };
        });
        searchResults = document.getElementsByClassName('text--highlight');
        
    }

    if (ctime > 0) {
        let wrapText = '<span>' + search + '</span>';
        filteredData = data.map(d => {
            return {
                ...d,
                isCurrent: (ctime >= convertTime(d.startTime) && ctime <= convertTime(d.endTime)),
                highlight: (search) ? d.text.toLowerCase().includes(search.toLowerCase()) : false,
                text: (search) ? d.text.toLowerCase().replace(search.toLowerCase(), wrapText) : d.text
            };
        });
    }

    return (
        <div className="app">
            {
                (isProtected === false) ?
                    <div className="authentication-container">
                        <div className="modal">
                            <h1>Private Video</h1>
                            <p>
                                This is private video. Do you have permission to watch it? If so please provide the correct password.
                            </p>
                            <form onSubmit={handlePasswordSubmit} className="form-input">
                                <input id="password" type="password" name="password" />
                                <button type="submit" className="btn">Access</button>
                            </form>
                        </div>
                    </div>
                    : null
            }
            {
                (isProtected === true) ?
                    <div>
                        <div className="player">
                            <h1>Youtube Demo</h1>
                            <div id="player" />
                        </div>
                        <div className="transcript">
                            <div className="transcript-title">
                                <h2>
                                    Transcript
                                </h2>
                                {
                                    (searchResults.length > 0) ?
                                        <div className="search-results">
                                            <p>{searchResults.length} Matches in this video</p>
                                            <div className="navigation-icons">
                                                <a href="#" onClick={handleSearchPrev}><i className="fa fa-caret-left" aria-hidden="true"></i></a>
                                                <span>{currentsearch + 1} of {searchResults.length}</span>
                                                <a href="#" onClick={handleSearchNext}><i className="fa fa-caret-right" aria-hidden="true"></i></a>
                                            </div>
                                        </div> : null
                                }
                            </div>
                            <input type="text" placeholder="Search" onChange={handleSearch} />
                            <div id="scroller" className="scroller">
                                {filteredData.map((d, i) => (
                                    <div
                                        className="line"
                                        className={d.isCurrent ? "line line--current" : "line"}
                                        key={i}
                                        onClick={() => play(d.startTime)}
                                        id={"line" + i}
                                    >
                                        <div className="start">{d.startTime}</div>
                                        <div className={d.highlight ? "text text--highlight" : "text"} dangerouslySetInnerHTML={{ __html: d.text }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    : null
            }

        </div>
    );
}

export default App;
