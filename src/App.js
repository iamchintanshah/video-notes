import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import "./App.css";
import data from "./transcript_sbv_1.json";
let player;

function App() {
    // State and setters for ...
    // Search term
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState(data);
    const [searchResults, setSearchResults] = useState([]);

    const [ctime, setCtime] = useState(0);
    const [currentsearch, setCurrentsearch] = useState(0);
    const [totalResult, setTotalResult] = useState(0);
    const [isProtected, setProtected] = useState(false);

    useEffect(() => {
        if (isProtected == true) {
            player = new window.YT.Player("player", {
                // height: "390",
                // width: "100%",
                videoId: "sj9pf0Idamw",
                events: {
                    "onStateChange": onPlayerStateChange
                }
            });
        }
    }, []);

    useEffect(() => {
        if (ctime > 0) {
            const i = data.findIndex(d =>
                ctime >= convertTime(d.startTime) && ctime <= convertTime(d.endTime)
            );
            if (i > -1) {
                document.getElementById("line" + i).scrollIntoView({ block: "center" });
            }
        }
    }, [ctime]);

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
        //console.log(e.target.value.length);
        setSearch(e.target.value);
    }

    function handleSearchPrev(e) {
        e.preventDefault();
        player.pauseVideo();
        let index = (currentsearch == -1 || currentsearch == 0) ? 0 : currentsearch - 1;
        if (searchResults[index]) {
            setTimeout(function () {
                searchResults[index].parentNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
                setCurrentsearch(index);
            }, 500)
        }
    }

    function handleSearchNext(e) {
        e.preventDefault();
        player.pauseVideo();
        let index = (currentsearch == -1) ? 0 : currentsearch + 1;
        if (searchResults[index]) {
            setTimeout(function () {
                searchResults[index].parentNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
                setCurrentsearch(index);
            }, 500)
        }
    }

    function handleSearchForm(e) {
        e.preventDefault();
        if (search.length > 0) {
            player.pauseVideo();
            setTimeout(function () {
                let wrapText = '<span class="highlight-word">' + search + '</span>';
                var myRegExp = new RegExp(search.toLowerCase(), 'g');
                var filteredDataNew = data.map(d => {
                    return {
                        ...d,
                        highlight: d.text.toLowerCase().includes(search.toLowerCase()),
                        text: d.text.toLowerCase().replace(myRegExp, wrapText)
                    };
                });
                setFilteredData(filteredDataNew);

                let searchResultsNew = document.getElementsByClassName('highlight-word');
                setSearchResults(searchResultsNew);
                setTotalResult(searchResultsNew.length);

                if (search) {
                    const index = data.findIndex(d =>
                        d.text.toLowerCase().includes(search.toLowerCase())
                    );
                    if (index > -1 && searchResults.length == 0) {
                        document.getElementById("line" + index).scrollIntoView({ block: 'start', behavior: 'smooth' });
                    }
                    if (searchResults.length > 0) {
                        searchResults[0].parentNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
                        setCurrentsearch(0);
                    }
                }
            }, 300)
        }
    }

    function handlePasswordSubmit(e) {
        e.preventDefault();
        var password = document.getElementById('password').value;
        if (password === 'prydan') {
            setProtected(true);
            setTimeout(function () {
                player = new window.YT.Player("player", {
                    // height: "390",
                    // width: "100%",
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

    return (
        <div className="app">
            {
                (isProtected === false) ?
                    <div className="authentication-container">
                        <div className="password_window">
                            <h1>Private Video</h1>
                            <p>
                                This is private video. Do you have permission to watch it? If so please provide the correct password.
                            </p>
                            <form onSubmit={handlePasswordSubmit} className="form-group">
                                <input id="password" type="password" name="password" className="form-control" />
                                <button type="submit" className="btn btn-primary">Access</button>
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
                            <div className="embed-responsive embed-responsive-16by9">
                                <div id="player" className="embed-responsive-item" />
                            </div>
                        </div>
                        <div className="transcript">
                            <div className="transcript-title">
                                <h2>
                                    Search transcript
                                </h2>
                                {
                                    (totalResult > 0) ?
                                        <div className="search-results">
                                            <p>{totalResult} Matches in this video</p>
                                            <div className="navigation-icons">
                                                <a href="#" onClick={handleSearchPrev}><i className="fa fa-caret-left" aria-hidden="true"></i></a>
                                                <span>{currentsearch + 1} of {totalResult}</span>
                                                <a href="#" onClick={handleSearchNext}><i className="fa fa-caret-right" aria-hidden="true"></i></a>
                                            </div>
                                        </div> : null
                                }
                            </div>
                            <form className="input-search" onSubmit={handleSearchForm}>
                                <i className="fa fa-search"></i>
                                <input type="text" placeholder="Search" onChange={handleSearch} />
                            </form>
                            <div id="scroller" className="scroller">
                                {filteredData.map((d, i) => (
                                    <div
                                        //className="line"
                                        className={(ctime >= convertTime(d.startTime) && ctime <= convertTime(d.endTime)) ? "line line--current" : "line"}
                                        key={i}
                                        onClick={() => play(d.startTime)}
                                        id={"line" + i}
                                    >
                                        <div className="start">{d.startTime.substring(3, d.startTime.indexOf('.'))}</div>
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
