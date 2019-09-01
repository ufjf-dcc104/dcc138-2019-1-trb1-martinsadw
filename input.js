var keyboardState = {};
var trackedKeys = ["w", "a", "s", "d", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
var inputConfig = {
    "vertical": {
        type: "axis",
        positiveKeys: ["w", "ArrowUp"],
        negativeKeys: ["s", "ArrowDown"],
    },
    "horizontal": {
        type: "axis",
        positiveKeys: ["d", "ArrowRight"],
        negativeKeys: ["a", "ArrowLeft"],
    },
}

document.addEventListener('keyup', function(event) {
    var key = event.key;
    if (trackedKeys.includes(key))
        keyboardState[key] = false;

    updateInput(inputConfig);
});

document.addEventListener('keydown', function(event) {
    if (event.repeat) return;

    var key = event.key;
    if (trackedKeys.includes(key))
        keyboardState[key] = true;

    // console.log("Pressed key: " + event.key)
    updateInput(inputConfig);
});

function checkKeys(keys, keyboardState) {
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];

        if (key in keyboardState && keyboardState[key])
            return true;
    }

    return false;
}

function updateInput(inputConfig) {
    input = {};

    for (var inputName in inputConfig) {
        var description = inputConfig[inputName];

        switch (description.type) {
            case "axis":
                input[inputName] = 0;

                if (checkKeys(description.positiveKeys, keyboardState))
                    input[inputName] += 1;

                if (checkKeys(description.negativeKeys, keyboardState))
                    input[inputName] -= 1;

                break;
            default:
                console.warn("Unknown input type");
        }
    }

    return input;
}

updateInput(inputConfig);
