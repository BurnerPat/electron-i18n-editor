import path from "path";

import XLSX from "xlsx";

export default class Export {
    static async toXLSX(bundle, file) {
        const aoa = [["Key"]];
        const codes = bundle.getLanguageCodes();

        for (const l of codes) {
            aoa[0].push(l ? l : "<default>");
        }

        for (const key of bundle.getAllKeys()) {
            aoa.push([key].concat(codes.map(e => bundle.getProperty(e, key) || "")));
        }

        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet(aoa);

        XLSX.utils.book_append_sheet(workbook, sheet, "i18n");
        XLSX.writeFile(workbook, path.resolve(file));
    }
}