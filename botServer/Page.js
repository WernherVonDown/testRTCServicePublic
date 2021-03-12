class Page {
    constructor({page, url, pageParams}) {
        this.page = page;
        this.url = url;
        this.pageParams = pageParams;
    }

    async clickIfNotActive({activeStateSelector, notActiveStateSelector}) {
        try {
            const elementActive = await this.getElementBySelector(activeStateSelector);
            if (!elementActive) {
                await this.clickBySelector(notActiveStateSelector);
            }
        } catch (err) {
            console.log(err);
        }
    }

    getAllElementsBySelector(selector) {
        return this.page.$$(selector);
    }

    getElementBySelector(selector) {
        return this.page.$(selector);
    }

    clickBySelector(selector) {
        return this.page.mainFrame().click(selector);
    }

    getClickableNotActiveButtons() {
        const audioButton = {
            activeStateSelector: '#settingsContainer > div > button.iconButton.userListMicButton.toolSelected',
            notActiveStateSelector: '#settingsContainer > div > button.iconButton.userListMicButton'
        }
        const videoButton = {
            activeStateSelector: '#settingsContainer > div > button.iconButton.userListCameraButton.toolSelected',
            notActiveStateSelector: '#settingsContainer > div > button.iconButton.userListCameraButton'
        }
        return [audioButton, videoButton];
    }

    async getNumberOfVideosEnabled() {
        const videoSelector = this.getVideosSelector();
        const res = await this.getAllElementsBySelector(videoSelector);
        return {pageParams: this.pageParams, numberOfVideos: res.length};
    }

    getVideosSelector() {
        return '.videoElementContainer > video';
    }

    turnMicAndCameraOn() {
        return Promise.all(this.getClickableNotActiveButtons().map(this.clickIfNotActive.bind(this)));
    }

    goToUrl() {
        console.log('goToUrl',this.url)
        return this.page.goto(this.url);
    }

    async makeScreenshot(path) {
        const imgData = await this.page.screenshot({encoding:'base64'});
        return {pageParams: this.pageParams, imgData}
    }
}

module.exports = Page;