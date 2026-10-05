const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};

function formatTime() {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

module.exports = {
    info(msg) {
        console.log(`${colors.cyan}[${formatTime()}] [INFO]${colors.reset} ${msg}`);
    },
    success(msg) {
        console.log(`${colors.green}[${formatTime()}] [SUCCESS]${colors.reset} ${msg}`);
    },
    warn(msg) {
        console.log(`${colors.yellow}[${formatTime()}] [WARN]${colors.reset} ${msg}`);
    },
    error(msg, err = null) {
        console.error(`${colors.red}[${formatTime()}] [ERROR]${colors.reset} ${msg}`);
        if (err) console.error(err);
    },
    mod(msg) {
        console.log(`${colors.magenta}[${formatTime()}] [MOD]${colors.reset} ${msg}`);
    }
};
