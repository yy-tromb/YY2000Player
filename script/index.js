/*
Copyright 2022 yyhome-tromb
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    https://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const file_picker_input = document.getElementById("file_picker_input");
const add_files_btn = document.getElementById("add_files_btn");
const add_folder_btn = document.getElementById("add_folder_btn");
const folder_picker_input = document.getElementById("folder_picker_input");

const player = document.getElementById("player");
const play_btn = document.getElementById("play_btn");
const play_next_btn = document.getElementById("play_next_btn");

const playlist = document.getElementById("playlist");
const playlist_items = document.getElementById("playlist_items");
const playlist_data = [];

const audio = document.getElementById("audio");
audio.onended = () => {
  play_next();
};
let playing_track = -1;
let all_track = 0;
let play_ended = true;
let playing_mode = "order";

const exts = [
  "mp3",
  "mp4",
  "m4a",
  "m4s",
  "m4p",
  "aac",
  "3gp",
  "3g2",
  "mkv",
  "mka",
  "webm",
  "weba",
  "ogg",
  "oga",
  "ogx",
  "flac",
  "alac",
  "wav"
];

//temp
play_btn.onclick=()=>playStart();
play_next_btn.onclick=()=>play_next();
//temp end


add_files_btn.addEventListener("click", () => {
  file_picker_input.click();
});

add_folder_btn.addEventListener("click", () => {
  folder_picker_input.click();
});

file_picker_input.onchange = () => {
  const formatted_files = format_files(file_picker_input.files);
  playlist_add(formatted_files);
};

folder_picker_input.onchange = () => {
  const formatted_files = format_files(folder_picker_input.files);
  playlist_add(formatted_files);
};

function playlist_add(data) {
  if (data === undefined || data === null) {
    return false;
  } else {
    for (let i = 0, len = data.length; i < len; i++) {
      const item = data[i];
      playlist_data.push(item);
      all_track = playlist_data.length;
    }
    show_playlist(data);
    player.style.display="block";
    if(confirm("再生する")){
      playStart();
    }
  }
}

function format_files(files) {
  const output = [];
  for (let i = 0, len = files.length; i < len; i++) {
    const file = files[i];
    if (check_ext_name(file.name) === false) {
      console.log(file.name);
      continue;
    }
    const data_element = {};
    data_element.name = file.name;
    data_element.type = file.type;
    data_element.size = file.size;
    data_element.lastModified = file.lastModified;
    data_element.blob = file;
    data_element.url = URL.createObjectURL(file);
    output.push(data_element);
  }
  return output;
}

function show_playlist(data, mode) {
  playlist.style.display = "block";
  if (mode === undefined || mode === null) {
    for (let i = 0, len = data.length; i < len; i++) {
      const song = data[i];
      const item = document.createElement("div");
      item.classList.add("playlist_item");
      const title = document.createElement("p");
      title.classList.add("playlist_item_title");
      title.textContent = song.name;
      item.appendChild(title);
      playlist_items.appendChild(item);
    }
  } else if (mode === "all") {
    for (let i = 0, len = playlist_items.childNodes.length; i < len; i++) {
      playlist_items.childNodes[0].remove();
    }
    for (let i = 0, len = playlist_data.length; i < len; i++) {
      const song = data[i];
      const item = document.createElement("div");
      item.classList.add("playlist_item");
      const title = document.createElement("p");
      title.classList.add("playlist_item_title");
      title.textContent = song.name;
      item.appendChild(title);
      playlist_items.appendChild(item);
    }
  }
}

//play core below

function playStart(option) {
  if (option === undefined || option === null) {
    option = { mode: "order" };
  }
  if (playlist_data.length === 0) {
    console.warn("Playlist is 0 length");
    show_popup("再生リストに曲がありません");
    return false;
  } else {
    if (option.mode === "order") {
      if (!!option.target === true) {
        audio.src = playlist_data[option.target].url;
        audio.currentTime = 0;
        audio.play();
        return undefined;
      }
      play_ended = false;
      playing_mode = "order";
      playing_track = 0;
      audio.src = playlist_data[0].url;
      audio.currentTime = 0;
      audio.play();
      playlist_items.childNodes[playing_track].classList.add("playing")
    }
  }
}

function play_next() {
  if (playing_mode === "order") {
    if (playing_track + 1 === all_track) {
      console.log("Playlist Ended");
      show_popup("再生リストが終了しました");
      playlist_items.childNodes[playing_track].classList.remove("playing");
      play_ended = true;
      playing_track = -1;
      audio.src = "";
      audio.onend = null;
      return false;
    } else {
      playlist_items.childNodes[playing_track].classList.remove("playing");
      console.log(++playing_track);
      audio.src = playlist_data[playing_track].url;
      audio.currentTime = 0;
      audio.play();
      playlist_items.childNodes[playing_track].classList.add("playing");
    }
  }
}

function show_popup(content, mode) {
  const popup = document.createElement("div");
  popup.textContent = String(content);
  popup.classList.add("popup");
  if (mode === "error") {
    popup.classList.add("popup_error");
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.style.top = "3vh";
    }, 8);
    return undefined;
  }
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.style.top = "3vh";
  }, 8);
  setTimeout(() => {
    document.body.removeChild(popup);
  }, 3008);
}

function check_ext_name(name) {
  const splitted = name.split(".");
  const extname = splitted[splitted.length - 1];
  if(exts.includes(extname)){
    return true;
  }else{
    return false;
  }
}

document.onerror = (e) => show_popup("error : " + e, "error");
window.onbeforeunload=(e)=>{
  e.preventDefault();
  e.returnValue="本当に移動しますか？";
  return "本当に移動しますか？";
};
