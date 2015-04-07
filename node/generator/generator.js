var argv = require('yargs')
    .usage('Parse json file and generate types.\nUsage: $0')
    .example('$0 --file clientserver_1', 'start a server')
    .describe('file', 'File to load types from')
    .describe('output', 'Output dir')
    .argv
var fs = require('fs');
var path = require('path');
var Generator = require('./src/GeneratorFSharp');

var _ = require('underscore');


var base = {
    loadFile: function (file) {
        try {
            var contents = fs.readFileSync(file, 'utf8');
            var data = JSON.parse(contents);
            return data;
        } catch (e) {
            return false;
        }
    },
    validateFormat: function (data) {
        var errors = [];

        var checkProperty = function (prop) {
            if (!data.hasOwnProperty(prop)) {
                errors.push('property "' + prop + '" missing');
            }
        };

        checkProperty('module');
        checkProperty('events');
        checkProperty('valueObjects');
        checkProperty('commands');


        return errors;

    },
    printErrors: function (errs) {
        _.each(errs, function (err) {
            console.error(err);
        });
    }
}


var data = base.loadFile(argv.file);

if (!data) {
    console.log('file not found: ' + argv.file);
    process.exit(1);
}

var errors = base.validateFormat(data);

if (errors.length > 0) {
    base.printErrors(errors);
    process.exit(1);
}

var TypeGenerator = new Generator(data.module);

_.each(data.commands, function (cmd) {
    TypeGenerator.addCommand(cmd);
});

_.each(data.valueObjects, function (cmd) {
    TypeGenerator.addValueObject(cmd);
});

_.each(data.events, function (cmd) {
    TypeGenerator.addEvent(cmd);
});

console.log(TypeGenerator.generate());




