const WavelengthToRgb = (w) => {
    let red, green, blue;

    if (w < 380 || w > 781) {
        [red, green, blue] = [0, 0, 0];
    } else if (w < 440) {
        [red, green, blue] = [(440 - w) / 60, 0, 1];
    } else if (w < 490) {
        [red, green, blue] = [0, (w - 440) / 50, 1];
    } else if (w < 510) {
        [red, green, blue] = [0, 1, (510 - w) / 20];
    } else if (w < 580) {
        [red, green, blue] = [(w - 510) / 70, 1, 0];
    } else if (w < 645) {
        [red, green, blue] = [1, (645 - w) / 65, 0];
    } else {
        [red, green, blue] = [1, 0, 0];
    }

    let factor;
    if (w < 380 || w > 781) {
        factor = 0;
    } else if (w < 420) {
        factor = 0.3 + 0.7 * (w - 380) / 40;
    } else if (w < 701) {
        factor = 1.0;
    } else {
        factor = 0.3 + 0.7 * (780 - w) / 80;
    }

    const gamma = 0.8;

    const R = red > 0 ? Math.round(255 * Math.pow(red * factor, gamma)) : 0;
    const G = green > 0 ? Math.round(255 * Math.pow(green * factor, gamma)) : 0;
    const B = blue > 0 ? Math.round(255 * Math.pow(blue * factor, gamma)) : 0;

    return `rgb(${R}, ${G}, ${B})`;
};

export default WavelengthToRgb;
