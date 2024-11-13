// Sometimes the local version likes to just not request jQuery on startup?
// No, I couldn't figure out why
// Yes, this is awful
if (!window.jQuery) {
    location.reload();
}