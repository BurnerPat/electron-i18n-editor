const Bundle = require("./lib/i18n/bundle");
const Formatter = require("./lib/i18n/formatter");

async function test() {
    const bundle = await new Bundle().load("C:\\Git\\gicom_NWB\\WebContent\\org\\gicom\\suite\\res\\i18n\\i18n.properties");

    const test = bundle.buildTree(bundle.getAllKeys());

    debugger;
}

test();