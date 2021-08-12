function sketchFromString(string) {
    this.baseLength = 62;
    this.encodingResolution = 480; // divisions of width
    this.maxEncodedTime = 300;
    this.maxPenWidthFactor = 31; // precision of 0.5!

    var paths = [];
    var time = 0;

    var versionAndPathStrings = string.split(":");
    var version = versionAndPathStrings[0];

    if (versionAndPathStrings.length != 2) {
        return paths;
    }

    var colorLength = 0;
    var widthFactorLength = 0;

    switch (version) {
        case "2":
            colorLength = 6;
            break;
        case "3":
            colorLength = 8;
            break;
        default:
            colorLength = 8;
            widthFactorLength = 1;
            break;
    }

    var colorString;
    var lastColorString = "#000000ff";
    var widthFactorString;
    var remainingPathString;

    versionAndPathStrings[1].split("|").forEach(pathString => {

        if (colorLength == 0) { // Colour not supported
            colorString = "#000000";
            remainingPathString = pathString;
        } else {
            if (pathString.substring(0, 1) == "#") { // Repeated colour (version 3 and up)
                colorString = lastColorString;
                remainingPathString = pathString.substring(1);
            } else
                if (pathString.substring(0, 1) == "@") { // Repeated colour with differing alpha (version 3 and up)
                    colorString = lastColorString.substring(0, 7) + pathString.substring(1, 3); // 7 because includes #; 3 because includes @
                    remainingPathString = pathString.substring(3);
                } else { // Expecting colour of exact length
                    colorString = "#" + pathString.substring(0, colorLength);
                    remainingPathString = pathString.substring(colorLength);
                }

            lastColorString = colorString;
        }

        var widthFactor;

        if (widthFactorLength != 0) {
            widthFactorString = remainingPathString.substr(0, widthFactorLength);
            widthFactor = (Base62.decode(widthFactorString) / this.baseLength) * this.maxPenWidthFactor;
            remainingPathString = remainingPathString.substr(widthFactorLength);
        } else {
            widthFactor = 1;
        }

        var coordStrings = remainingPathString.match(/.{1,4}/g)

        if ((coordStrings == null) || (coordStrings.length == 0)) {
            return;
        }

        var coords = [];

        for (var i = 0; i < coordStrings.length; i += 1) {
            var xy = Base62.decode(coordStrings[i].substring(0, 3));
            var y = xy % this.encodingResolution;
            var x = Math.floor(xy / this.encodingResolution);
            var timeDelta = Math.ceil((Base62.decode(coordStrings[i][3]) / this.baseLength) * this.maxEncodedTime);
            coords.push({
                "time": time += timeDelta,
                "x": x / this.encodingResolution,
                "y": y / this.encodingResolution
            });
        }

        paths.push({
            "color": colorString,
            "points": coords,
            "widthFactor": widthFactor
        });
    });

    return paths;
}