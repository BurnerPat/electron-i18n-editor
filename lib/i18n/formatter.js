export default class Formatter {
    static align(lines) {
        const max = lines.reduce((acc, e) => Math.max(acc, e[0].length), 0);
        const pad = Array.apply(null, {length: max}).map(e => " ").join("");

        return lines.map(e => [(e[0] + pad).substring(0, max), e[1]])
    }

    static sort(lines) {
        return lines.sort((e1, e2) => e1[0].localeCompare(e2[0]));
    }
}