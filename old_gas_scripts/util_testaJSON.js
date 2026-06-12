function isJSONObject(value) {
    try {
        JSON.parse(value)
    } catch {
        return false;
    }
    return true;
}