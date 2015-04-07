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
    email: 'email'
};


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

Generator.prototype.generateProp = function (spec, def, prop) {
    var tests = [],
        tab = '   ',
        isNullable = def.nullable && def.nullable === true,
        isBaseType = ChangeCase.isLowerCase(def.type);

    var name = ChangeCase.camelCase(prop);

    if (name !== prop) {
        this.specError(spec, 'Property name not camel case:' + name + '/' + prop);
    }

    var addLine = function (line) {
        tests.push(tab + line);
    };

    var generateError = function (error) {
        return 'this.error("' + error + '","' + prop + '","' + spec.name + '");';
    };

    addLine('if(!input.hasOwnProperty("' + prop + '")){ ' + generateError('missing') + '}');

    if (!isNullable) {
        addLine('if(!input.' + prop + '){' + generateError('cannot be null') + '}');
    } else {
        addLine('if(input.' + prop + '===null){ this.' + prop + '=null;} else {');
    }

    if (isBaseType) {


        switch (def.type) {
            case BASE_TYPES.string:
                addLine('this.' + prop + '=input.' + prop);
                break;
            case BASE_TYPES.integer:
                addLine('var integer=parseInt(input.' + prop + ');if(isNaN(integer)){' + generateError('not an integer') + '}');
                addLine('this.' + prop + '=integer;');
                break;
            case BASE_TYPES.float:
            case BASE_TYPES.double:
                addLine('var float=parseFloat(input.' + prop + ');if(isNaN(float)){' + generateError('not a float') + '}');
                addLine('this.' + prop + '=float;');
                break;
            case BASE_TYPES.date:
            case BASE_TYPES.dateTime:
                addLine('var date=moment(input.' + prop + ');if(!date.isValid()){' + generateError('not a valid date') + '}');
                addLine('this.' + prop + '=date;');
                break;
            case BASE_TYPES.boolean:
                addLine('var bool=input.' + prop + ';if(bool !== false || bool!==true){' + generateError('not a boolean') + '}');
                addLine('this.' + prop + '=bool;');
                break;
            case BASE_TYPES.uuid:
                addLine('if(!validator.isUUID(input.' + prop + ')){' + generateError('invalid uuid') + '}');
                addLine('this.' + prop + '=input.' + prop + ';');
                break;

            case BASE_TYPES.email:
                addLine('if(!validator.isEmail(input.' + prop + ')){' + generateError('invalid email') + '}');
                addLine('this.' + prop + '=input.' + prop + ';');
                break;

            default:
                this.specError(spec, 'unknown base type:' + def.type + ' for prop:' + prop);
        }
    } else {
        var propName = ChangeCase.pascalCase(def.type);

        if (propName !== def.type) {
            this.specError(spec, 'Property type not pascal case:' + def.type + '/' + prop);
        }

        addLine('this.' + prop + '= new ' + def.type + '(input.' + prop + ');');
    }

    if (isNullable) {
        addLine('}');
    }

    return tests;
};

Generator.prototype.validator = function (spec, def, prop) {
    var tests = [],
        tab = '   ',
        isNullable = def.nullable && def.nullable === true,
        isBaseType = ChangeCase.isLowerCase(def.type);

    var name = ChangeCase.camelCase(prop);

    if (name !== prop) {
        this.specError(spec, 'Property name not camel case:' + name + '/' + prop);
    }

    var addLine = function (line) {
        tests.push(tab + line);
    };

    var generateError = function (error) {
        return 'this.error("' + error + '","' + prop + '","' + spec.name + '");';
    };

    addLine('if(!input.hasOwnProperty("' + prop + '")){ ' + generateError('missing') + '}');

    if (!isNullable) {
        addLine('if(!input.' + prop + '){' + generateError('cannot be null') + '}');
    } else {
        addLine('if(input.' + prop + '===null){ this.' + prop + '=null;} else {');
    }

    if (isBaseType) {


        switch (def.type) {
            case BASE_TYPES.string:
                addLine('this.' + prop + '=input.' + prop);
                break;
            case BASE_TYPES.integer:
                addLine('var integer=parseInt(input.' + prop + ');if(isNaN(integer)){' + generateError('not an integer') + '}');
                addLine('this.' + prop + '=integer;');
                break;
            case BASE_TYPES.float:
            case BASE_TYPES.double:
                addLine('var float=parseFloat(input.' + prop + ');if(isNaN(float)){' + generateError('not a float') + '}');
                addLine('this.' + prop + '=float;');
                break;
            case BASE_TYPES.date:
            case BASE_TYPES.dateTime:
                addLine('var date=moment(input.' + prop + ');if(!date.isValid()){' + generateError('not a valid date') + '}');
                addLine('this.' + prop + '=date;');
                break;
            case BASE_TYPES.boolean:
                addLine('var bool=input.' + prop + ';if(bool !== false || bool!==true){' + generateError('not a boolean') + '}');
                addLine('this.' + prop + '=bool;');
                break;
            case BASE_TYPES.uuid:
                addLine('if(!validator.isUUID(input.' + prop + ')){' + generateError('invalid uuid') + '}');
                addLine('this.' + prop + '=input.' + prop + ';');
                break;

            case BASE_TYPES.email:
                addLine('if(!validator.isEmail(input.' + prop + ')){' + generateError('invalid email') + '}');
                addLine('this.' + prop + '=input.' + prop + ';');
                break;

            default:
                this.specError(spec, 'unknown base type:' + def.type + ' for prop:' + prop);
        }
    } else {
        var propName = ChangeCase.pascalCase(def.type);

        if (propName !== def.type) {
            this.specError(spec, 'Property type not pascal case:' + def.type + '/' + prop);
        }

        addLine('this.' + prop + '= new ' + def.type + '(input.' + prop + ');');
    }

    if (isNullable) {
        addLine('}');
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


    }
    var fnkName = spec.name;

    jsSpec.push(fnkName + ' = function(input){');
    jsSpec.push('   this._name = "' + spec.name + '"');

    _.each(spec.def, function (def, prop) {
        _.each(self.validator(spec, def, prop), function (newSpec) {
            jsSpec.push(newSpec);
        });
    });

    jsSpec.push('}');

    jsSpec.push(fnkName + '.prototype.getName = function(){ return this.name}');

    jsSpec.push(fnkName + '.prototype.error = function(error,prop,specName){');
    jsSpec.push('   throw specName+ " "+prop+" "+error;');
    jsSpec.push('}');

    jsSpec.push(fnkName + '.prototype.toJson = function(){');
    jsSpec.push('   return {');
    _.each(spec.def, function (def, prop) {
        var isBaseType = ChangeCase.isLowerCase(def.type);

        if (isBaseType) {
            switch (def.type) {
                case BASE_TYPES.boolean:
                case BASE_TYPES.float:
                case BASE_TYPES.double:
                case BASE_TYPES.integer:
                case BASE_TYPES.string:
                case BASE_TYPES.uuid:
                case BASE_TYPES.email:
                    jsSpec.push('   ' + prop + ':this.' + prop + ",");
                    break;
                case BASE_TYPES.date:
                case BASE_TYPES.dateTime:
                    jsSpec.push('   ' + prop + ':this.' + prop + '===null ? null:this.' + prop + '.format()');
                    break;
                default:
            }
        } else {
            jsSpec.push('   ' + prop + ':_.isFunction(this.' + prop + '.toJson) ? this.' + prop + '.toJson():this.' + prop + ",");
        }


    });
    jsSpec[jsSpec.length - 1] = jsSpec[jsSpec.length - 1].slice(0, -1);

    jsSpec.push('   };');
    jsSpec.push('}');

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
        lines = "var validator = require('validator)';\n" +
            "var moment = require('moment')\n" +
            "var _ = require('underscore')\n\n";
    var exports = {
        commands: {},
        events: {},
        valueObjects: {}
    };

    _.each(this.commands, function (command, name) {
        exports.commands[name] = name;
        lines += self.specToString(command);
    });

    _.each(this.events, function (command, name) {
        exports.events[name] = name;
        lines += self.specToString(command);
    });

    _.each(this.valueObjects, function (command, name) {
        exports.valueObjects[name] = name;
        lines += self.specToString(command);
    });

    lines += "module.exports = " + JSON.stringify(exports);

    return lines;
};


module.exports = Generator;