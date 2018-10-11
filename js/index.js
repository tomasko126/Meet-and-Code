const ONE_HOUR_IN_PIXELS = 200;
const ONE_MINUTE_IN_PIXELS = ONE_HOUR_IN_PIXELS / 60;
const TOP_NAME_IN_PIXELS = 100;

function setTimemarker() {
    const now = new Date();

    const hours = now.getHours() - 10;

    if (hours < 0 || hours > 7) {
        $("#time").hide();
        return;
    }

    const minutes = now.getMinutes();

    const topPosition = hours * ONE_HOUR_IN_PIXELS + minutes * ONE_MINUTE_IN_PIXELS + TOP_NAME_IN_PIXELS;

    $("#time").css("top", topPosition);
}

setTimemarker();

setInterval(() => {
    setTimemarker();
}, 60 * 1000);

// Disable scrolling after clicking on an event
$(".single-event").click(() => {
    $("body").css("overflow", "hidden");
});

// Enable body-scrolling after clicking on close button
$(".close").click(() => {
    $("body").css("overflow", "auto");
});