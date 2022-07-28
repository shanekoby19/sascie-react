const removeSensitiveKeys = (obj, ...keysToRemove) => {
    Object.keys(obj).forEach(key => keysToRemove.includes(key) ? delete obj[key] : undefined);
}

module.exports = removeSensitiveKeys;