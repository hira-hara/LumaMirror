Module.register("MMM-IRController", {
  defaults: {
    stepSize: 20, // How many pixels to move
    opacityStep: 0.1, // How much to dim per click
  },

  start() {
    this.sendSocketNotification("START_IR");
    this.currentTop = 0;
    this.currentLeft = 0;
    this.currentOpacity = 1.0;
    this.screenOn = true;
  },

  getDom() {
    // This module is invisible, it just handles logic
    const wrapper = document.createElement("div");
    wrapper.style.display = "none";
    return wrapper;
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "BUTTON_PRESSED") {
      this.handleButton(payload);
    }
  },

handleButton(key) {
    const body = document.body;
    const map = this.config.buttonMap; // Shortcut to your config

    switch (key) {
      // --- MOVING THE SCREEN ---
      case map.UP:
        this.currentTop -= this.defaults.stepSize;
        break;
      case map.DOWN:
        this.currentTop += this.defaults.stepSize;
        break;
      case map.LEFT:
        this.currentLeft -= this.defaults.stepSize;
        break;
      case map.RIGHT:
        this.currentLeft += this.defaults.stepSize;
        break;

      // --- BRIGHTNESS / OPACITY ---
      case map.BRIGHT_DOWN: 
        if (this.currentOpacity > 0.1) this.currentOpacity -= this.defaults.opacityStep;
        break;
      case map.BRIGHT_UP: 
        if (this.currentOpacity < 1.0) this.currentOpacity += this.defaults.opacityStep;
        break;

      // --- POWER (HDMI Toggle) ---
      case map.POWER:
        this.screenOn = !this.screenOn;
        this.sendSocketNotification("SCREEN_TOGGLE", this.screenOn);
        break;
      
      // --- ENTER (Refresh) ---
      case map.OK:
         window.location.reload();
         break;
    }

    // Apply changes to the MagicMirror body
    body.style.transition = "all 0.3s ease";
    body.style.transform = `translate(${this.currentLeft}px, ${this.currentTop}px)`;
    body.style.opacity = this.currentOpacity;
  }
});
