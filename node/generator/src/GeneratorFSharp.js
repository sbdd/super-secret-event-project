var _ = require('underscore');
var ChangeCase = require('change-case');

const EVENT = 'Event';
const COMMAND = 'Command';
const VALUE_OBJECT = 'ValueObject';
const BASE_TYPES = {
    string: 'string',
    integer: 'integer',
    boolean: 'boolean',
    float: 'float',
    double: 'double',
    date: 'date',
    dateTime: 'dateTime',
    uuid: 'uuid',
    email: 'email',
    list: 'list'
};

const RESERVED_PROP_NAMES = [
    'type'
]


var Generator = function (moduleName) {

    var name = ChangeCase.pascalCase(moduleName);

    if (name !== moduleName) {
        throw 'Module not pascal case:' + name + '/' + moduleName;
    }


    this.module = moduleName;
    this.commands = {};
    this.events = {};
    this.valueObjects = {};
    this.consts = {};

};


Generator.prototype.specError = function (spec, error) {
    throw spec.name + ":" + error;
};

Generator.prototype.validator = function (spec, def, prop) {
    var tests = [],
        self = this,
        isNullable = def.nullable && def.nullable === true,
        type = def.type.split(' ');

    var name = ChangeCase.pascalCase(prop);

    if (name !== prop) {
        this.specError(spec, 'Property name not pascal case:' + name + '/' + prop);
    }

    var defTypeToName = function (inputType) {

        var isBaseType = ChangeCase.isLowerCase(inputType);

        if (isBaseType) {
            switch (inputType) {
                case BASE_TYPES.string:
                    return 'string';
                    break;
                case BASE_TYPES.integer:
                    return 'int';
                    break;
                case BASE_TYPES.float:
                    return 'float';
                    break;
                case BASE_TYPES.double:
                    return 'double';
                    break;
                case BASE_TYPES.date:
                case BASE_TYPES.dateTime:
                    return 'System.DateTime';
                    break;
                case BASE_TYPES.boolean:
                    return 'bool';
                    break;
                case BASE_TYPES.uuid:
                    return 'System.Guid';
                    break;

                case BASE_TYPES.email:
                    return 'Base.Email';
                    break;

                default:
                    self.specError(spec, 'unknown base type:' + inputType + ' for prop:' + prop);
            }
        } else {
            var propName = ChangeCase.pascalCase(inputType);

            if (propName !== inputType) {
                self.specError(spec, 'Property type not pascal case prop:' + prop + " " + inputType + '/' + propName);
            }

            return inputType;

        }
    };

    var addProp = function (prop, def) {
        tests.push(prop + ": " + def + (isNullable ? ' option' : ''));
    };


    switch (type[0]) {


        case BASE_TYPES.list:
            addProp(prop, '(' + defTypeToName(type[1]) + ' list' + ')');
            break;

        default:
            addProp(prop, defTypeToName(type[0]));
    }

    return tests;
}

Generator.prototype.parseSpec = function (type, spec) {
    var jsSpec = [],
        self = this;

    var name = ChangeCase.pascalCase(spec.name);

    if (name !== spec.name) {
        this.specError(spec, 'Name not pascal case:' + name + '/' + spec.name);
    }

    switch (type) {

        case EVENT:
            if (spec.name.indexOf('Event') === -1) {
                this.specError(spec, 'Events must have "Event" in name');
            }
            break;

        case COMMAND:
            if (spec.name.indexOf('Command') === -1) {
                this.specError(spec, 'Commands must have "Command" in name');
            }
            break;

        case VALUE_OBJECT:

            break;

        default:
            this.specError(spec, 'Unknown type ' + type);


    }
    var fnkName = spec.name;
    var props = []
    _.each(spec.def, function (def, prop) {
        _.each(self.validator(spec, def, prop), function (propDef) {
            props.push(propDef);
        });
    });

    jsSpec.push('type ' + fnkName + ' = {' + props.join('; ') + '}');

    return jsSpec;

}
;

Generator.prototype.addConst = function (type, name) {
    this.consts[(type + "_" + ChangeCase.snakeCase(name)).toUpperCase()] = name;
};

Generator.prototype.addValueObject = function (spec) {
    this.valueObjects[spec.name] = this.parseSpec(VALUE_OBJECT, spec);
    this.addConst(VALUE_OBJECT, spec.name);
};

Generator.prototype.addEvent = function (spec) {
    this.events[spec.name] = this.parseSpec(EVENT, spec);
    this.addConst(EVENT, spec.name);
};

Generator.prototype.addCommand = function (spec) {
    this.commands[spec.name] = this.parseSpec(COMMAND, spec);
    this.addConst(COMMAND, spec.name);
};


Generator.prototype.specToString = function (spec) {

    var lines = "";
    _.each(spec, function (line) {
        lines += line + "\n";
    });
    return lines;
};


Generator.prototype.generate = function () {
    var self = this,
        lines = "module " + this.module + "\n\n";

    _.each(this.valueObjects, function (command, name) {
        lines += self.specToString(command);
    });

    lines += "\n";

    _.each(this.commands, function (command, name) {
        lines += self.specToString(command);
    });

    lines += "\n";

    _.each(this.events, function (command, name) {
        lines += self.specToString(command);
    });

    lines += "\n";

    lines += 'type Command = ' + "\n";
    _.each(this.commands, function (command, name) {
        lines += ' | ' + name + " of " + name + "\n";

    });

    lines += "\n" + 'type Event = ' + "\n";
    _.each(this.events, function (command, name) {
        lines += ' | ' + name + " of " + name + "\n";

    });


    return lines;
};


module.exports = Generator;