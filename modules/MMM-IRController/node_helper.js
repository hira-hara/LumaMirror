const NodeHelper = require("node_helper");
const { spawn } = require("child_process");
const exec = require("child_process").exec;

module.exports = NodeHelper.create({
  start() {
    this.started = false;
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "START_IR" && !this.started) {
      this.started = true;
      this.startIRWatcher();
    }
    if (notification === "SCREEN_TOGGLE") {
        // 1 = ON, 0 = OFF
        const mode = payload ? "1" : "0";
        exec(`vcgencmd display_power ${mode}`, (err, stdout, stderr) => {
            if (err) console.error("Error toggling screen:", stderr);
        });
    }
  },

  startIRWatcher() {
    console.log("Starting IR Listener...");
    // We spawn 'irw' to listen to the socket
    const ir = spawn("irw", ["/var/run/lirc/lircd"]);

    ir.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      lines.forEach(line => {
          if (line.length > 5) {
              const parts = line.trim().split(" ");
              // parts[2] is the key name (e.g., KEY_UP)
              const button = parts[2]; 
              if (button) {
                this.sendSocketNotification("BUTTON_PRESSED", button);
              }
          }
      });
    });
    
    ir.stderr.on("data", (data) => {
      console.error(`IR Error: ${data}`);
    });
  }
});
