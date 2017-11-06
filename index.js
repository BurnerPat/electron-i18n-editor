"use strict";

import {app, BrowserWindow, Menu} from "electron";
import path from "path";
import url from "url";

let window;

process.on("uncaughtException", err => {
    console.error(err);
});

function createWindow() {
    window = new BrowserWindow({
        width: 1024,
        height: 768
    });

    window.toggleDevTools();

    window.setMenu(new Menu());

    window.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.on("closed", () => {
        window = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (!window) {
        createWindow();
    }
});