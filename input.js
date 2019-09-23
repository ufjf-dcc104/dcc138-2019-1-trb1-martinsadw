var keyboardState = {};
var trackedKeys = ["mouse0", "mouse2", "w", "a", "s", "d", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
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
    "debug1": {
        type: "button",
        keys: ["mouse0"],
    },
    "debug2": {
        type: "button",
        keys: ["mouse2"],
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

document.addEventListener('contextmenu', function(event) { event.preventDefault(); });

document.addEventListener('mouseup', function(event) {
    var key = "mouse" + event.button;
    if (trackedKeys.includes(key))
        keyboardState[key] = false;

    // console.log("Pressed key: " + event.key)
    updateInput(inputConfig);
});

document.addEventListener('mousedown', function(event) {
    var key = "mouse" + event.button;
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
            case "button":
                input[inputName] = checkKeys(description.keys, keyboardState);

                break;
            default:
                console.warn("Unknown input type");
        }
    }

    return input;
}

updateInput(inputConfig);
