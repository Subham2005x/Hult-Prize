try {
    console.log("Resolved:", require.resolve("class-variance-authority"));
} catch (e) {
    console.error("Error:", e.message);
}
