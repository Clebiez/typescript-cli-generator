#!/usr/bin/env node
const inquirer = require('inquirer');
const inquirerRecursive = require('inquirer-recursive');
const fs = require('fs');

const toCamelCase = str => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
}
const toPascalCase = str => {
    return str.match(/[a-z]+/gi)
        .map(function (word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
        })
        .join('')
}

inquirer.registerPrompt('recursive', inquirerRecursive);

inquirer
    .prompt([{
            type: 'input',
            name: 'fileName',
            default: 'Default',
            message: 'Specify a name of your file (.ts by default)'
        },
        {
            type: 'input',
            name: 'className',
            default: 'Default',
            message: 'Specify the class name'
        },
        {
            type: 'recursive',
            message: 'Add a new property ?',
            name: 'properties',
            prompts: [{
                    type: 'input',
                    name: 'name',
                    default: 'id',
                    message: 'Property\'s name'
                },
                {
                    type: 'input',
                    default: 'string',
                    name: 'type',
                    message: 'Which type ?'
                },
                {
                    type: 'list',
                    name: 'modifier',
                    message: 'Which access modifier ?',
                    choices: [{
                        name: 'private',
                        checked: true
                    }, 'protected', 'public']
                },
                {
                    type: 'checkbox',
                    name: 'accessors',
                    message: 'Accessors ?',
                    choices: [{
                            name: 'getter',
                            checked: true,
                        },
                        {
                            name: 'setter',
                            checked: true
                        }
                    ]
                }
            ]
        }
    ])
    .then(answers => {
        let fileName = answers.fileName;
        if (!(/\.(ts)$/i).test(fileName)) {
            fileName += '.ts';
        }

        let str = `export class ${toPascalCase(answers.className)} {
`;
        answers.properties.forEach(property => {
            str += `
    ${property.modifier} ${property.type !== 'public'? '_': ''}${toCamelCase(property.name)}: ${property.type};`;
        });

        str += `

    // ======================
    // |      ACCESSORS     |
    // ======================
`;
        if (answers.properties && answers.properties.length > 0) {
            answers.properties.forEach(property => {
                if (property.accessors.indexOf('getter') !== -1) {
                    str += `
    public get ${toCamelCase(property.name)}(): ${property.type} {
        return this._${toCamelCase(property.name)}
    }`;
                }

                if (property.accessors.indexOf('setter') !== -1) {
                    str += `
    public set ${toCamelCase(property.name)}(value: ${property.type}) {
        this._${toCamelCase(property.name)} = value;
    }`;
                }
            });
            str += `
}
`;
            fs.writeFileSync(`./${fileName}`, str, {
                encoding: 'utf8'
            });
            console.log(`
    =============================
    | File created with success |
    =============================
    `);
        }
    });